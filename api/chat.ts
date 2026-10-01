import { handleChatRequest } from '../src/server/chatHandler';

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      endpoint: '/api/chat',
      method: 'POST required',
      keyConfigured: Boolean(process.env.GEMINI_API_KEY),
      provider: 'Google Gemini API',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Méthode non autorisée. Utilisez POST.',
      diagnostic: 'L’endpoint /api/chat requiert une requête avec la méthode HTTP POST.',
      code: 'METHOD_NOT_ALLOWED',
      httpStatus: 405,
    });
  }

  return handleChatRequest(req, res);
}

