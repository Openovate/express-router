# express-router
Express routing with priority settings.

## Install

```bash
$ npm i --save @openovate/express-router
```

## Usage

It is generally similar to `express.Router`.

```js
const express = require('express');
const Router = require('@openovate/express-router');

const router = Router();

router.get('/some/path', (req, res) => {
  res.send('Hello World');
});

const app = express();
app.use(router);

app.listen(3000);
```

### Async/Await

You can use async callbacks now it will still properly order by when it was defined.

```js
router.get('/some/path', async(req, res) => {
  await something();
});

router.get('/some/path', (req, res) => {
  res.send('Done');
});
```

### Priority

You can specify higher priority routes *(negative priorities work too)*.

```js
router.get('/some/path', (req, res) => {
  console.log('Run After');
});

router.get('/some/path', (req, res) => {
  console.log('Run Before');
}, 100);
```

### No `next()`

With `async/await` there is no need for `next()` anymore. To pass an error to
the express handler, just throw it.

```js
router.get('/some/path', (req, res) => {
  throw new Error('Something happened...');
});

app.use(function (err, req, res) {
  res.status(500).send(err.message);
});
```

### RouteTo ...

Routes can now invoke other routes manually with `routeTo()`

```js
router.get('/some/path', async (req, res) => {
  await router.routeTo('get', '/some/other', req, res);
});

router.route('/some/other').get((req, res) => {
  res.send('Some other route');
});
```

### Introducing stage and rest

`stage` is a combination of the URL query, form post and URL path parameters.
`rest` is different than `res.json()` where it gives other routes an opporitunity
to add on to the `rest` data before sending it out. `stage` and `rest` use
`Registry` from the JSM library. For a quick study, see:
[@openovate/jsm#registry-usage](https://github.com/Openovate/jsm#registry-usage)

```js
// -> GET /some/path?foo[bar][]=zoo
router.get('/some/path', async (req, res) => {
  if (!req.stage.has('foo', 'bar', 0)) {
    req.stage.set('foo', 'bar', 0, 'zoo');
  }

  const foo = req.stage.get('foo', 'bar', 0);

  res.rest
    .set('error', false)
    .set('results', foo);
});
```

### Events with Priorities too ...

Router extends `EventEmitter` from the JSM library. For a quick study, see:
[@openovate/jsm#eventemitter-usage](https://github.com/Openovate/jsm#eventemitter-usage)

```js
router.on('do something', (req, res) => {
  console.log('Run After');
});

router.on('do something', (req, res) => {
  console.log('Run Before');
}, 100);

router.on('something else', (req, res) => {
  const foo = req.stage.get('foo');
  res.rest.set('results', foo);
});

router.get('/some/path', async (req, res) => {
  await router.emit('do something', req, res);
  const results = await router.request('something else', { foo: 'bar' });
  res.send(results); //-> bar
});
```
