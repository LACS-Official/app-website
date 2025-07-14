// Vercel Serverless 函数：代理umami API获取页面访问量
export default async function handler(req, res) {
    const { page } = req.query;
    const websiteId = process.env.UMAMI_WEBSITE_ID; // 你需要在vercel环境变量中配置
    const apiToken = process.env.UMAMI_API_TOKEN;
    if (!websiteId || !apiToken) {
        return res.status(500).json({ error: 'Umami配置缺失' });
    }
    if (!page) {
        return res.status(400).json({ error: '缺少page参数' });
    }
    try {
        // 这里以umami v2 API为例，具体API路径请根据你的umami版本调整
        const url = `https://umami.lacs.cc/api/websites/${websiteId}/metrics?page=${encodeURIComponent(page)}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Umami API请求失败');
        }
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
} 