const EventEmitter = require('./EventEmitter');
const Route = require('./Route');
const Router = require('./Router');

const IncomingMessage = require('./http/IncomingMessage');
const ServerResponse = require('./http/ServerResponse');

const ContentTrait = require('./payload/content');
const RestTrait = require('./payload/rest');
const ServerTrait = require('./payload/server');
const StageTrait = require('./payload/stage');

function createRouter(config = {}) {
  const {
    helpers,
    Router,
    IncomingMessage,
    ServerResponse
  } = createRouter;

  //merge config with defaults
  config = Object.assign({
    content: true,
    server: true,
    stage: true,
    rest: true
  }, config);

  //configure the payloads
  helpers.configurePayload(
    config,
    IncomingMessage.prototype,
    ServerResponse.prototype
  );

  async function HttpRouter(req, res, next) {
    //configure the payloads
    await helpers.configurePayload(config, req, res);

    //next could be from express, but if not
    if (typeof next === 'undefined') {
      //make a next that handles errors
      next = (err) => {
        router.emit('error', err, req, res);
      }
    }

    //process router
    const url = new URL('http://localhost' + req.url);

    //LEGEND:
    // url.hash - #foo
    // url.host - 127.0.0.1:3000
    // url.hostname - 127.0.0.1
    // url.href - http://127.0.0.1:3000/some/path?lets=dothis
    // url.origin - http://127.0.0.1:3000
    // url.password - ??
    // url.pathname - /some/path
    // url.port - 3000
    // url.protocol - http:
    // url.search - ?lets=dothis

    const path = url.pathname;
    const method = req.method.toUpperCase();
    const event = method + ' ' + path;

    //trigger request
    if (!await helpers.step('request', router, req, res, next)) {
      //if the request exits, then stop
      return;
    }

    //trigger main event
    if (!await helpers.step(event, router, req, res, next)) {
      //if the request exits, then stop
      return;
    }

    //interpret

    //if response already sent
    if (res._headerSent) {
      await helpers.step('response', router, req, res, next);
      //do nothing else
      return;
    }

    //content > rest

    //if there is content
    if (res.content && res.content.has()) {
      //set the status code if not set
      res.statusCode = res.statusCode || 200;
      res.statusMessage = res.statusMessage || 'OK';
      //set the default content type to html
      if (!res.hasHeader('content-type')) {
        res.setHeader('Content-Type', 'text/html');
      }

      const content = res.content.get();

      //if streamable
      if (typeof content.pipe === 'function') {
        //pipe it through
        content.pipe(res);
      } else {
        res.write(content.toString());
        res.end();
      }

      await helpers.step('response', router, req, res, next);
      //do nothing else
      return;
    }

    //if there is rest
    if (res.rest && Object.keys(res.rest.get()).length) {
      const rest = res.rest.get();

      //set the status code if not set
      res.statusCode = res.statusCode || 200;
      res.statusMessage = res.statusMessage || 'OK';

      res.setHeader('Content-Type', 'text/json');
      res.write(JSON.stringify(rest, null, 2));
      res.end();

      await helpers.step('response', router, req, res, next);
      //do nothing else
      return;
    }

    //we are here?
    //then let it stall like how http works anyways
    // also dont trigger response since it did not actually respond.
  }

  //merge router methods
  const router = new Router;
  const methods = helpers.getMethods(router);

  Object.keys(methods).forEach(method => {
    HttpRouter[method] = router[method].bind(router);
  });

  HttpRouter.config = config;
  HttpRouter.router = router;

  return HttpRouter;
};

const helpers = {
  /**
   * Native JS methods we should ignore
   */
  nativeMethods: [
    'constructor',
    '__proto__',
    '__defineGetter__',
    '__defineSetter__',
    'hasOwnProperty',
    '__lookupGetter__',
    '__lookupSetter__',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toString',
    'valueOf',
    'toLocaleString'
  ],

  /**
   * Returns where the methods are defined
   *
   * @param {Object} definition
   *
   * @return {Object}
   */
  getMethods(definition) {
    const prototype = {};

    if (typeof definition === 'function') {
      definition = definition.prototype;
    }

    //for short hand functions ie. () => {}, there is no prototype
    if (!definition) {
      return prototype;
    }

    Object.getOwnPropertyNames(definition).forEach(property => {
      if(this.nativeMethods.indexOf(property) !== -1) {
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(definition, property);

      if (typeof descriptor.value === 'function') {
        prototype[property] = definition[property];
        return;
      }

      if (typeof descriptor.get === 'function'
        || typeof descriptor.set === 'function'
      ) {
        Object.defineProperty(prototype, property, descriptor);
      }
    });

    return Object.assign(prototype, this.getMethods(
      Object.getPrototypeOf(definition)
    ));
  },

  /**
   * Adds traits to Request and Response payloads
   *
   * @param {Object} config
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  async configurePayload(config, req, res) {
    //if they want content trait
    if (config.content) {
      //add content to res
      createRouter.ContentTrait(req, res)
    }

    //if they want rest trait
    if (config.rest) {
      //add rest to res
      createRouter.RestTrait(req, res)
    }

    //if they want server trait
    if (config.server) {
      //add server to req
      createRouter.ServerTrait(req, res)
    }

    //if they want stage trait
    if (config.stage) {
      //add stage to req
      await createRouter.StageTrait(req, res)
    }
  },

  /**
   * Runs step event and interprets
   *
   * @param {String} event
   * @param {Router} router
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @param {Function} next
   *
   * @return {Boolean} whether its okay to continue
   */
  async step(event, emitter, req, res, next) {
    let status = createRouter.EventEmitter.STATUS_OK;

    try {
      //emit a connect event
      status = await emitter.emit(event, req, res);
    } catch(err) {
      //if there is an error
      next(err);
      //dont continue
      return false;
    }

    //if the status was incomplete (308)
    return status !== createRouter.EventEmitter.STATUS_INCOMPLETE;
  }
};

createRouter.ContentTrait = ContentTrait;
createRouter.RestTrait = RestTrait;
createRouter.ServerTrait = ServerTrait;
createRouter.StageTrait = StageTrait;

createRouter.IncomingMessage = IncomingMessage;
createRouter.ServerResponse = ServerResponse;

createRouter.EventEmitter = EventEmitter;
createRouter.Route = Route;
createRouter.Router = Router;

createRouter.helpers = helpers;

//adapter
module.exports = createRouter;
