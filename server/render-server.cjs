const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();

const router = jsonServer.router(
  path.join(__dirname, 'db.json')
);

const middlewares = jsonServer.defaults();

const port =
  Number(process.env.PORT) || 3000;

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.use(router);

server.listen(
  port,
  '0.0.0.0',
  () => {
    console.log(
      `Setrya Fake API running on port ${port}`
    );
  }
);
