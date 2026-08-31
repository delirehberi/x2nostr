import { Hono } from 'hono';

const app = new Hono();

// Health check API endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'x2nostr',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Hono route definitions for SPA pages
app.get('/getting-started', (c) => c.text('x2nostr — Getting Started Page'));
app.get('/importers', (c) => c.text('x2nostr — Migration Hub Page'));
app.get('/docs', (c) => c.text('x2nostr — Documentation Page'));

export default app;
