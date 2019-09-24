const http = require('http');
const fetch = require('node-fetch');

const Router = require('../src');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('http test', async() => {
  const router = Router();

  router.route('/some/path').on('post', (req, res) => {
    //server trait
    expect(req.server.get('REQUEST_URI')).toBe('/some/path?lets=dothis');

    //stage trait
    expect(req.stage.get('lets')).toBe('dothis');
    expect(req.stage.get('zoo', 1)).toBe('2');

    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.write('Hello World');
    res.end();
    server.close();
  });

  let used = false;
  router.use((req, res, next) => {
    used = true;
    next();
  });

  //start http server
  const server = http.createServer(router);
  server.listen(3000);

  const response = await fetch('http://127.0.0.1:3000/some/path?lets=dothis', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      //'Content-Type': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: 'foo=bar&zoo[]=1&zoo[]=2&zoo[]=3', // body data type must match "Content-Type" header
  });

  expect(await response.text()).toBe('Hello World');
  expect(used).toBe(true);
});

test('rest test', async() => {
  const router = Router();

  router.route('/some/path').on('post', (req, res) => {
    res.rest.set('error', false)
    res.rest.set('message', 'good')
    res.rest.set('results', [1, 2, 3])
  });

  router.on('response', (req, res) => {
    server.close();
  })

  //start http server
  const server = http.createServer(router);
  server.listen(3001);

  const response = await fetch('http://127.0.0.1:3001/some/path?lets=dothis', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      //'Content-Type': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: 'foo=bar&zoo[]=1&zoo[]=2&zoo[]=3', // body data type must match "Content-Type" header
  });

  const rest = JSON.parse(await response.text())

  expect(rest.error).toBe(false);
  expect(rest.message).toBe('good');
  expect(rest.results[0]).toBe(1);
  expect(rest.results[1]).toBe(2);
  expect(rest.results[2]).toBe(3);
});

test('content test', async() => {
  const router = Router();

  router.get('/some/path', (req, res) => {
    res.content.set('Hello World')
  });

  router.on('response', (req, res) => {
    server.close();
  })

  //start http server
  const server = http.createServer(router);
  server.listen(3002);

  const response = await fetch('http://127.0.0.1:3002/some/path');

  expect(await response.text()).toBe('Hello World');
});

test('error handling test', async() => {
  const router = Router();

  const triggered = [];

  router.route('/some/path').on('post', (req, res) => {
    triggered.push(1)
    throw new Error('Something Went Wrong')
  });

  router.route('/some/path').on('post', (req, res) => {
    //should not be ran
    triggered.push(2);
  });

  router.on('error', (err, req, res) => {
    res.statusCode = 500;
    res.statusMessage = 'Server Error';
    res.write(err.message);
    res.end();
    server.close();
  });

  //start server
  const server = http.createServer(router);
  server.listen(3003);

  const response = await fetch('http://127.0.0.1:3003/some/path?lets=dothis', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      //'Content-Type': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: 'foo=bar&zoo[]=1&zoo[]=2&zoo[]=3', // body data type must match "Content-Type" header
  });

  expect(await response.text()).toBe('Something Went Wrong');
  expect(triggered.length).toBe(1)
  expect(triggered[0]).toBe(1)
});

test('request test', async() => {
  const router = Router();

  router.on('do something', (req, res) => {
    res.rest.set('results', req.stage.get('something'));
  });

  router.get('/some/path', async(req, res) => {
    const results = await router.request('do something', req, res);
  });

  router.on('response', (req, res) => {
    server.close();
  })

  //start http server
  const server = http.createServer(router);
  server.listen(3004);

  const response = await fetch('http://127.0.0.1:3004/some/path?something=isdone');
  const rest = JSON.parse(await response.text());
  expect(rest.results).toBe('isdone');
});
