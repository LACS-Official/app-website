// Vercel Serverless 函数：换取 GitHub 访问令牌
export default async function handler(req, res) {
    const { code } = req.body;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    try {
        // 向 GitHub API 交换访问令牌
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(tokenData.error_description);
        }

        // 获取用户信息
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${tokenData.access_token}`
            }
        });

        const userData = await userResponse.json();

        res.status(200).json({
            access_token: tokenData.access_token,
            user: userData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}    