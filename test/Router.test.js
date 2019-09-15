const Router = require('../src');

test('callable test', () => {
  const router = Router();
  expect(typeof router.use).toBe('function');
});

test('path test', async() => {
  const router = Router();

  const triggered = [];
  router.route('/some/path/(.+)/:foo+').on('get', (req, res) => {
    triggered.push(1);
  });

  router.route('/some/path/(.+)/:foo+').get((req, res) => {
    triggered.push(2);
  });

  router.route(/^\/some\/path\/(.+)\/((?:[^\/]+?)(?:\/(?:[^\/]+?))*)(?:\/)?$/i).get((req, res) => {
    triggered.push(3);
  });

  router.get('/some/path/(.+)/:foo+', (req, res) => {
    triggered.push(4);
  });

  router.get(/^\/some\/path\/(.+)\/((?:[^\/]+?)(?:\/(?:[^\/]+?))*)(?:\/)?$/i, (req, res) => {
    triggered.push(5);
  });

  const req = { type: 'req' };
  const res = { type: 'res' };
  const actual = await router.routeTo('get', '/some/path/1/2', req, res);

  expect(actual).toBe(200);
  expect(triggered.length).toBe(5);
  expect(triggered[0]).toBe(1);
  expect(triggered[1]).toBe(2);
  expect(triggered[2]).toBe(3);
  expect(triggered[3]).toBe(4);
  expect(triggered[4]).toBe(5);
});

test('priority test', async() => {
  const router = Router();

  const triggered = [];
  router.get('/some/path/(.+)/:foo+', (req, res) => {
    triggered.push(1);
  });

  router.route('/some/path/(.+)/:foo+').get((req, res) => {
    triggered.push(2);
  });

  router.route(/^\/some\/path\/(.+)\/((?:[^\/]+?)(?:\/(?:[^\/]+?))*)(?:\/)?$/i).get((req, res) => {
    triggered.push(3);
  }, 1);

  const req = { type: 'req' };
  const res = { type: 'res' };
  const actual = await router.routeTo('get', '/some/path/1/2', req, res);

  expect(actual).toBe(200);
  expect(triggered.length).toBe(3);
  expect(triggered[0]).toBe(3);
  expect(triggered[1]).toBe(1);
  expect(triggered[2]).toBe(2);
});

test('route to test', async() => {
  const router = Router();

  const triggered = [];
  router.get('/some/path/(.+)/:foo+', async(req, res) => {
    triggered.push(1);
    await router.routeTo('get', '/some/other', req, res);
    triggered.push(3);
  });

  router.route('/some/other').get((req, res) => {
    triggered.push(2);
  });

  const req = { type: 'req' };
  const res = { type: 'res' };
  const actual = await router.routeTo('get', '/some/path/1/2', req, res);

  expect(actual).toBe(200);
  expect(triggered.length).toBe(3);
  expect(triggered[0]).toBe(1);
  expect(triggered[1]).toBe(2);
  expect(triggered[2]).toBe(3);
});

test('request test', async() => {
  const router = Router();

  router.on('do something', (req, res) => {
    res.rest.set('results', req.stage.get('something'));
  });

  let actual = await router.request('do something', { something: 'isdone' });

  expect(actual).toBe('isdone');
});
