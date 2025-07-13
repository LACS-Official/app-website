// api/auth/callback.js
import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: '缺少授权码' });
    }

    // 交换访问令牌
    const octokit = new Octokit({
      auth: `client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`
    });

    const { data } = await octokit.request('POST /login/oauth/access_token', {
      headers: {
        accept: 'application/json'
      }
    });

    if (data.error) {
      return res.status(400).json({ error: data.error_description });
    }

    const accessToken = data.access_token;

    // 使用访问令牌获取用户信息
    const userOctokit = new Octokit({ auth: accessToken });
    const userData = await userOctokit.request('GET /user');

    // 返回用户信息和访问令牌
    res.json({
      user: userData.data,
      token: accessToken
    });
  } catch (error) {
    console.error('认证失败:', error);
    res.status(500).json({ error: '认证过程中发生错误' });
  }
}