const http = require('http');
const express = require('express');
const Router = require('@openovate/express-router');

const app = express();
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

//bind router to express
app.use(router);

//start http server
const server = http.createServer(app);
server.listen(3000);
