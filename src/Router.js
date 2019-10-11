const methods = require('methods');
const pathToRegexp = require('path-to-regexp');

const EventEmitter = require('./EventEmitter');
const Route = require('./Route');

const { reflect } = require("@openovate/jsm");

class Router extends EventEmitter {
  /**
   * Listens to the path and method
   *
   * @param {String} method
   * @param {String} path
   * @param {Function} callback
   * @param {Integer} [priority = 0]
   *
   * @return {Router}
   */
  route(method, path, callback, priority = 0) {
    if (arguments.length === 1) {
      //method is really path
      return new Route(this, method);
    }

    //if callback is an array
    if (Array.isArray(callback)) {
      //loop through each callback
      callback.forEach(callback => {
        //call it in a singular way
        this.route(method, path, callback, priority);
      })
    }

    //if priority is a function or there are more than 3 arguments
    if (typeof priority !== 'number' || arguments.length > 4) {
      //make sure we have a numerical priority
      priority = 0;
      //get the args
      const args = Array.from(arguments);
      //remove the method
      args.shift();
      //remove the path
      args.shift();
      //for each argument
      args.forEach(callback => {
        //if the callback is a number
        if (typeof callback === 'number') {
          //it's a priority
          priority = callback;
          return;
        }

        //call it in a singular way
        this.route(method, path, callback, priority);
      });
    }

    method = method.toUpperCase();

    //if callback is not a function
    if (typeof callback !== 'function' || reflect(callback).isClass()) {
      //we are not going to await for this...
      this.emit('resolve', method, path, callback, priority);
      return this;
    }

    //if we are here then we can assume that callback is a function

    if (method === 'ALL') {
      method = '[a-zA-Z0-9\-]+';
    }

    //so we have the method, path and the callback
    const keys = [];

    //event should be a regexp
    let event = null;
    //but if it's a string
    if (typeof path === 'string') {
      //convert to regexp then to string
      event = pathToRegexp(path, keys)
        .toString()
        .replace('/^', '/^' + method + "\\s");
    } else if (method) {
      //convert to string
      event = path.toString().replace('/^', '/^' + method + "\\s");
    }

    this.on(event, async(req, ...args) => {
      const route = this.event;
      const variables = [];
      const parameters = {};
      const name = route.event;

      //express expects params
      req.params = {};

      //sanitize the variables
      route.variables.forEach((variable, i) => {
        if (i >= keys.length) {
          variables.push(variable);
          return;
        }

        req.params[keys[i].name] = variable;

        if (typeof keys[i].name === 'number') {
          variables.push(variable);
        }

        parameters[keys[i].name] = variable;
      });

      req.route = {
        event: name,
        args: variables,
        parameters
      };

      //if there's a stage
      if (req.stage) {
        //add the URL parameters
        req.stage.set(parameters);
      }

      return await callback(req, ...args);
    }, priority);

    return this;
  }

  /**
   * Emits the path and method to the event emitter
   *
   * @param {String} method
   * @param {String} path
   * @param {*} [...args]
   *
   * @return {Integer}
   */
  async routeTo(method, path, ...args) {
    const event = method.toUpperCase() + ' ' + path;
    return await this.emit(event, ...args);
  }
}

function addMethod(method) {
  //make it lowercase
  method = method.toLowerCase();

  //bind the method to the instance
  Router.prototype[method] = function(path, ...callbacks) {
    return this.route(method, path, ...callbacks);
  };
}

//add the verbs
methods.map(addMethod);

module.exports = Router;
