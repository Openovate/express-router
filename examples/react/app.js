require('@babel/register')({ presets: [ '@babel/preset-react' ] });

const http = require('http');
const express = require('express');
const Router = require('@openovate/express-router');

const resolver = require('./resolver');
const Home = require('./screens/Home.jsx');
const Product = require('./screens/Product.jsx');

const app = express();
const router = Router();

resolver(router);

router.get('/', (req, res) => {
  res.rest.set('results', 'title', 'Home Page');
});

router.get('/', { component: Home });

router.get('/product/:id', async (req, res) => {
  await router.emit('get id', req, res);
});

router.get('/product/:id', { component: Product });

router.on('get id', (req, res) => {
  const id = req.stage.get('id');
  res.rest.set('results', 'id', id);
});

//bind router to express
app.use(router);

//start http server
const server = http.createServer(app);
server.listen(3000);
