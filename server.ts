import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import { executeServerAction } from './src/server/actions';
import { handleChatRequest } from './src/server/chatHandler';
import {
  VAPID_PUBLIC_KEY,
  verifyFirebaseUser,
  registerUserSubscription,
  sendPushToUser,
  schedulePushNotification,
  startBackgroundPushScheduler,
} from './src/server/notifications';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  // Health check routes for container lifecycle and Cloud Run
  app.get(['/api/health', '/health'], (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      port: PORT,
      env: process.env.NODE_ENV || 'development',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Direct Server Action Execution Route (for secure backend mutations)
  app.post(['/api/action/execute', '/action/execute'], async (req: Request, res: Response) => {
    try {
      const { userId, functionName, functionArgs } = req.body || {};
      if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
          success: false,
          error: "Vous devez être connectée pour effectuer cette action.",
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

  // API Route: Google Gemini Assistant Chat with Action Execution & Full Diagnostics
  app.post(['/api/chat', '/chat'], async (req: Request, res: Response) => {
    return handleChatRequest(req, res);
  });

  // Health and config status route
  app.get(['/api/chat/status', '/api/chat'], (req: Request, res: Response) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      status: 'ok',
      endpoint: '/api/chat',
      method: 'POST required',
      configured: hasKey,
      models: ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'],
      provider: 'Google Gemini API',
      actionsSupported: true,
    });
  });

  // -------------------------------------------------------------
  // Firebase Cloud Messaging & Web Push Notification Routes
  // -------------------------------------------------------------

  // 1. Get Public VAPID Key
  app.get(['/api/notifications/vapid-public-key', '/notifications/vapid-public-key'], (req: Request, res: Response) => {
    return res.json({
      publicKey: VAPID_PUBLIC_KEY,
    });
  });

  // 2. Register / Subscribe Device Token
  app.post(['/api/notifications/subscribe', '/notifications/subscribe'], async (req: Request, res: Response) => {
    try {
      const authUser = await verifyFirebaseUser(req);
      const targetUserId = authUser.uid || req.body?.userId;
      if (!targetUserId) {
        return res.status(401).json({ success: false, error: 'Non authentifié' });
      }

      const { subscription, token, platform } = req.body || {};
      if (!subscription) {
        return res.status(400).json({ success: false, error: 'PushSubscription requise' });
      }

      const record = registerUserSubscription(targetUserId, subscription, token, platform);
      return res.json({
        success: true,
        message: 'Abonnement push enregistré',
        subscriptionId: record.id,
      });
    } catch (err: any) {
      console.error('[Server Push] Subscribe error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Erreur d’enregistrement push.' });
    }
  });

  // 3. Send Push Notification (Strictly authorized to own user or system)
  app.post(['/api/notifications/send', '/notifications/send'], async (req: Request, res: Response) => {
    try {
      const authUser = await verifyFirebaseUser(req);
      const targetUserId = authUser.uid || req.body?.userId;
      if (!targetUserId) {
        return res.status(401).json({ success: false, error: 'Non authentifié' });
      }

      // Security check: an authenticated user can only send to their own UID
      if (authUser.uid && req.body?.userId && req.body.userId !== authUser.uid) {
        return res.status(403).json({ success: false, error: 'Accès interdit : vous ne pouvez notifier que votre propre compte.' });
      }

      const { title, body, type, data, url, subscription, token, platform } = req.body || {};
      if (!title || !body) {
        return res.status(400).json({ success: false, error: 'Titre et message obligatoires.' });
      }

      // If subscription object is provided directly with send request, register it immediately
      if (subscription && typeof subscription === 'object' && subscription.endpoint) {
        registerUserSubscription(targetUserId, subscription, token, platform || 'desktop');
      }

      const result = await sendPushToUser(targetUserId, {
        title,
        body,
        type: type || 'clinical',
        data: data || {},
        url: url || data?.path || '/notifications',
      });

      return res.json({
        success: result.success,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        errors: result.errors,
        message:
          result.sentCount > 0
            ? 'Notification envoyée avec succès.'
            : 'Aucun appareil actif actuellement abonné pour cet utilisateur.',
      });
    } catch (err: any) {
      console.error('[Server Push] Send error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Erreur lors de l’envoi de la notification.' });
    }
  });

  // 4. Schedule Future Push Notification (Appointments, Reminders)
  app.post(['/api/notifications/schedule', '/notifications/schedule'], async (req: Request, res: Response) => {
    try {
      const authUser = await verifyFirebaseUser(req);
      const targetUserId = authUser.uid || req.body?.userId;
      if (!targetUserId) {
        return res.status(401).json({ success: false, error: 'Non authentifié' });
      }

      if (authUser.uid && req.body?.userId && req.body.userId !== authUser.uid) {
        return res.status(403).json({ success: false, error: 'Accès interdit.' });
      }

      const { title, body, scheduledAt, type, data } = req.body || {};
      if (!title || !body || !scheduledAt) {
        return res.status(400).json({ success: false, error: 'Champs obligatoires manquants (title, body, scheduledAt).' });
      }

      const scheduledItem = schedulePushNotification(targetUserId, {
        title,
        body,
        scheduledAt,
        type: type || 'reminder',
        data: data || {},
      });

      return res.json({
        success: true,
        message: 'Rappel programmé avec succès sur le serveur.',
        scheduledId: scheduledItem.id,
        scheduledAt: scheduledItem.scheduledAt,
      });
    } catch (err: any) {
      console.error('[Server Push] Schedule error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Erreur programmation rappel.' });
    }
  });

  // Start background push notification scheduler
  startBackgroundPushScheduler();

  // Helper to determine accurate public origin
  const getPublicBaseUrl = (req: Request): string => {
    if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    return `${proto}://${req.headers.host}`;
  };

  // SEO: Dynamic Robots.txt
  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = getPublicBaseUrl(req);
    const robots = `User-agent: *
Allow: /
Allow: /conseils-ressources
Allow: /ressources
Allow: /guide
Allow: /guide-utilisation
Allow: /login

Disallow: /dashboard
Disallow: /profil
Disallow: /profile
Disallow: /parametres
Disallow: /settings
Disallow: /admin
Disallow: /symptomes
Disallow: /suivi-poids
Disallow: /examens
Disallow: /mon-ordonnance
Disallow: /ordonnance
Disallow: /synthese-suivi
Disallow: /journal
Disallow: /checklist
Disallow: /rappels
Disallow: /notifications
Disallow: /ma-grossesse
Disallow: /bebe
Disallow: /calendrier
Disallow: /rendez-vous

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
  });

  // SEO: Dynamic Sitemap.xml
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const baseUrl = getPublicBaseUrl(req);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils-ressources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/guide</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Vite middleware setup (development) vs Static serving (production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur MAMAN+ démarré sur le port ${PORT}`);
    console.log(`Assistant Gemini actif avec support des actions sur /api/chat`);
  });
}

startServer().catch((err) => {
  console.error('Erreur lors du démarrage du serveur:', err);
});
