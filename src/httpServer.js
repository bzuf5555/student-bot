import http from 'node:http';

export function startHttpServer({ port, logger }) {
  const server = http.createServer((request, response) => {
    if (request.url === '/health') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ ok: true, time: new Date().toISOString() }));
      return;
    }
    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: false, error: 'not_found' }));
  });

  server.listen(port, () => {
    logger.info({ port }, 'health server started');
  });

  return server;
}

