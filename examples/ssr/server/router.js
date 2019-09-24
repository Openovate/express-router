import { router } from './shims';

import Home from '../shared/views/Home.jsx';
import Product from '../shared/views/Product.jsx';

router.get('/', async(req, res) => {
  await router.routeTo('get', '/api/home', req, res);
  router.render(Home, res.rest.get('results'), res);
});

router.get('/product/:id', async(req, res) => {
  const id = req.stage.get('id');
  await router.routeTo('get', '/api/product/' + id, req, res);
  router.render(Product, res.rest.get('results'), res);
});

router.on('get id', (req, res) => {
  const id = req.stage.get('id');
  const title = 'Product ' + id;
  res.rest.set('results', { id, title });
});

router.get('/api/home', (req, res) => {
  res.rest.set('results', { title: 'Home Page' });
});

router.get('/api/product/:id', async(req, res) => {
  await router.emit('get id', req, res);
});

module.exports = router;
