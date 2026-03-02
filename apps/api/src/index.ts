import * as http from 'http';
import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { initSockets } from './sockets';

const start = async (): Promise<void> => {
  await connectDb();
  const app = createApp();
  const server = http.createServer(app);
  initSockets(server);

  server.listen(env.port, () => {
    console.log(`[api] listening on ${env.port}`);
  });
};

start().catch((error) => {
  console.error('[api] failed to start', error);
  process.exit(1);
});
