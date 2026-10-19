import { Router, type Request, type Response } from 'express';

export function createHealthRouter(): Router {
  const router = Router();
  const startTime = Date.now();

  router.get('/', (_req: Request, res: Response) => {
    const memory = process.memoryUsage();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      environment: process.env['NODE_ENV'] || 'development',
      memory: {
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        rssMB: Math.round(memory.rss / 1024 / 1024),
      },
    });
  });

  return router;
}
