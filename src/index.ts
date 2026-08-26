import { Hono } from 'hono';

const app = new Hono();

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'x2nostr',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default app;
