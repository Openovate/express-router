const http = require('http');
const Router = require('@openovate/express-router');

const router = Router();

router.get('/', (req, res) => {
  res.content.set('Home Page');
});

router.get('/product/:id', async (req, res) => {
  await router.emit('get id', req, res);
});

router.on('get id', (req, res) => {
  const id = req.stage.get('id');
  res.rest.set('results', id);
});

//start http server
const server = http.createServer(router);
server.listen(3000);
