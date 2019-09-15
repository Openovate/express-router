const http = require('http')
const IncomingMessage = require('./http/IncomingMessage');
const ServerResponse = require('./http/ServerResponse');

const { EventEmitter: EventEmitterJsm } = require('@openovate/jsm');

class EventEmitter extends EventEmitterJsm {
  constructor() {
    super();
    this.QueueInterface = EventEmitter.QueueInterface;
    this.RequestInterface = EventEmitter.RequestInterface;
    this.ResponseInterface = EventEmitter.ResponseInterface;
  }

  async request(event, req = null, res = null) {
    //if its not a request
    if (!(req instanceof http.IncomingMessage)) {
      let data = {};
      if (typeof req === 'object' && req !== null) {
        data = req;
      }

      //make a request
      req = new this.RequestInterface;
      if (req.stage) {
        req.stage.set(data);
      }
    }

    //if its not a response
    if (!(res instanceof http.ServerResponse)) {
      //make a response
      res = new this.ResponseInterface(req);
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

EventEmitter.QueueInterface = EventEmitterJsm.QueueInterface;
EventEmitter.RequestInterface = IncomingMessage
EventEmitter.ResponseInterface = ServerResponse;

module.exports = EventEmitter;
