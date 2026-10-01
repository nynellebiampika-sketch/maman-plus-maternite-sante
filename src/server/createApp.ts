import express, { Request, Response } from 'express';
import { handleChatRequest } from './chatHandler';
import { executeServerAction } from './actions';
import {
  VAPID_PUBLIC_KEY,
  verifyFirebaseUser,
  registerUserSubscription,
  sendPushToUser,
  schedulePushNotification,
} from './notifications';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '5mb' }));

  // CORS and security headers for API endpoints
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Health check
  app.get(['/api/health', '/health'], (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'MAMAN+ API',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Action execution
  app.post(['/api/action/execute', '/action/execute'], async (req: Request, res: Response) => {
    try {
      const { userId, functionName, functionArgs } = req.body;
      if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
          success: false,
          error: 'Vous devez être connectée pour effectuer cette action.',
        });
      }
      if (!functionName || typeof functionName !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Nom d'action non spécifié.",
        });
      }

      const result = await executeServerAction(userId, functionName, functionArgs || {});
      return res.json(result);
    } catch (err: any) {
      console.error('Server error executing action:', err);
      return res.status(500).json({
        success: false,
        error: "Une difficulté est survenue lors de l'enregistrement de l'action.",
      });
    }
  });

  // Gemini Chat endpoint
  app.post(['/api/chat', '/chat'], async (req: Request, res: Response) => {
    return handleChatRequest(req, res);
  });

  // Notifications endpoints
  app.get(['/api/notifications/vapid-public-key', '/notifications/vapid-public-key'], (_req: Request, res: Response) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });

  app.post(['/api/notifications/subscribe', '/notifications/subscribe'], async (req: Request, res: Response) => {
    try {
      const { uid } = await verifyFirebaseUser(req);
      if (!uid) {
        return res.status(401).json({ error: 'Non authentifié. Token Firebase manquant ou invalide.' });
      }
      const { subscription, token, platform } = req.body;
      if (!subscription) {
        return res.status(400).json({ error: 'Subscription data required' });
      }
      const record = registerUserSubscription(uid, subscription, token, platform);
      res.json({ success: true, recordId: record.id });
    } catch (err: any) {
      console.error('[API Subscribe Error]:', err);
      res.status(500).json({ error: 'Internal subscription error' });
    }
  });

  app.post(['/api/notifications/send', '/notifications/send'], async (req: Request, res: Response) => {
    try {
      const { uid } = await verifyFirebaseUser(req);
      if (!uid) {
        return res.status(401).json({ error: 'Non authentifié' });
      }
      const { title, body, type, data } = req.body;
      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body required' });
      }
      const sentCount = await sendPushToUser(uid, { title, body, type, data });
      res.json({ success: true, sentCount });
    } catch (err: any) {
      console.error('[API Send Error]:', err);
      res.status(500).json({ error: 'Internal push send error' });
    }
  });

  app.post(['/api/notifications/schedule', '/notifications/schedule'], async (req: Request, res: Response) => {
    try {
      const { uid } = await verifyFirebaseUser(req);
      if (!uid) {
        return res.status(401).json({ error: 'Non authentifié' });
      }
      const { title, body, type, scheduledAt, data } = req.body;
      if (!title || !body || !scheduledAt) {
        return res.status(400).json({ error: 'Title, body and scheduledAt required' });
      }
      const scheduled = schedulePushNotification(uid, { title, body, type, scheduledAt, data });
      res.json({ success: true, scheduled });
    } catch (err: any) {
      console.error('[API Schedule Error]:', err);
      res.status(500).json({ error: 'Internal scheduling error' });
    }
  });

  return app;
}
