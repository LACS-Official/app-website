// api/publish/index.js
import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  try {
    const { content, slug, title } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }
    
    if (!content || !slug) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    const octokit = new Octokit({ auth: token });
    
    // 准备文件路径和内容
    const filePath = `content/posts/${slug}.md`;
    const encodedContent = Buffer.from(content, 'utf8').toString('base64');
    
    // 检查文件是否已存在
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path: filePath
      });
      sha = data.sha; // 如果文件存在，获取其 SHA 值
    } catch (error) {
      // 文件不存在，继续创建
    }
    
    // 创建或更新文件
    const commitMessage = sha ? `更新文章: ${title}` : `新增文章: ${title}`;
    
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: filePath,
      message: commitMessage,
      content: encodedContent,
      sha: sha,
      branch: 'main' // 更改为你的分支名
    });
    
    res.json({ success: true, message: '文章已成功发布到 GitHub' });
  } catch (error) {
    console.error('发布失败:', error);
    res.status(500).json({ error: '发布过程中发生错误', details: error.message });
  }
}