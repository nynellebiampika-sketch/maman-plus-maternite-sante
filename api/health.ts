export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    service: 'MAMAN+ Vercel Serverless API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
}
