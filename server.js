import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonServer from 'json-server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'server', 'db.json'));
const middlewares = jsonServer.defaults();
const routes = JSON.parse(
  readFileSync(path.join(__dirname, 'server', 'routes.json'), 'utf-8')
);

server.use(middlewares);
server.use(jsonServer.rewriter(routes));
server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`json-server running on port ${port}`);
});
