import { createApp } from './app.js';
import { getEnv } from './config/env.js';

async function bootstrap(): Promise<void> {
  try {
    const env = getEnv();
    const { app, rateLimiter } = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🎉 GenAI Celebration & Event Planner Backend Running`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🚀 Port:        ${env.PORT}`);
      console.log(`🛡️ Rate Limit:  ${env.RATE_LIMIT_MAX_REQUESTS} req / ${env.RATE_LIMIT_WINDOW_MS / 1000}s`);
      console.log(`🤖 Gemini AI:   Model: ${env.GEMINI_MODEL}`);
      console.log(`🏥 Health Check: http://localhost:${env.PORT}/api/v1/health`);
      console.log(`=======================================================`);
    });

    const gracefulShutdown = (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      rateLimiter.destroy();
      server.close(() => {
        console.log('HTTP server closed. Exiting process.');
        process.exit(0);
      });

      // Force exit if hanging
      setTimeout(() => {
        console.error('Forcefully terminating process after timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error: any) {
    console.error('Failed to start application:', error.message);
    process.exit(1);
  }
}

void bootstrap();
