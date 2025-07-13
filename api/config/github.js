// api/config/github.js
export default function handler(req, res) {
  res.json({
    clientId: process.env.GITHUB_CLIENT_ID
  });
}