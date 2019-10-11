const http = require('http')
const IncomingMessage = require('./http/IncomingMessage');
const ServerResponse = require('./http/ServerResponse');

const {
  reflect,
  Exception,
  EventEmitter: EventEmitterJsm
} = require('@openovate/jsm');

class EventEmitter extends EventEmitterJsm {
  /**
   * Shortcut for middleware
   *
   * @param {Function} [callback]
   * @param {Integer} [priority = 1]
   *
   * @return {Framework}
   */
  use(callback) {
    //if there are more than 2 arguments...
    if (arguments.length > 1) {
      //loop through each argument as callback
      Array.from(arguments).forEach((callback, index) => {
        this.use(callback);
      });

      return this;
    }

    //if the callback is an array
    if (Array.isArray(callback)) {
      this.use(...callback);
      return this;
    }

    //if the callback is an EventEmitter
    if (callback instanceof EventEmitterJsm) {
      Object.keys(callback.listeners).forEach(event => {
        //each event is an array of objects
        callback.listeners[event].queue.forEach(listener => {
          this.on(event, listener.callback, listener.priority);
        });

        //lastly link the metas
        callback.event = this.event;
      });

      return this;
    }

    //if the callback is a function
    if (typeof callback === 'function') {
      //if req, res, next (legacy)
      if (reflect(callback).getArgumentNames().length === 3) {
        const original = callback;
        callback = (req, res) => {
          //transform to async function
          return new Promise(resolve => {
            original(req, res, function(error = null) {
              if (error) {
                throw Exception.for(error);
              }

              resolve();
            });
          });
        };
      }

      this.on('request', callback);
    }

    return this;
  }

  async request(event, req = null, res = null) {
    //if its not a request
    if (!(req instanceof http.IncomingMessage)) {
      let data = {};
      if (typeof req === 'object' && req !== null) {
        data = req;
      }

      //make a request
      req = new IncomingMessage;
      if (req.stage) {
        req.stage.set(data);
      }
    }

    //if its not a response
    if (!(res instanceof http.ServerResponse)) {
      //make a response
      res = new ServerResponse(req);
    }

    await this.emit(event, req, res);

    //if no rest trait or there's an error
    if (!res.rest || res.rest.get('error')) {
      return false;
    }

    return res.rest.get('results');
  }
}

EventEmitter.STATUS_OK = EventEmitterJsm.STATUS_OK;
EventEmitter.STATUS_NOT_FOUND = EventEmitterJsm.STATUS_NOT_FOUND;
EventEmitter.STATUS_INCOMPLETE = EventEmitterJsm.STATUS_INCOMPLETE;

module.exports = EventEmitter;
