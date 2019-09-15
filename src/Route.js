const methods = require('methods');

class Route {
  /**
   * Sets router and event
   *
   * @param {Router} router
   * @param {String} event
   *
   * @return {Route}
   */
  constructor(router, path) {
    this.router = router;
    this.path = path;
  }

  /**
   * Listens to the path and method
   *
   * @param {String} method
   * @param {Function} callback
   * @param {Integer} priority
   *
   * @return {Route}
   */
  on(method, callback, priority = 0) {
    this.router.route(method, this.path, callback, priority);
    return this;
  }
}

function addMethod(method) {
  //make it lowercase
  method = method.toLowerCase();

  //bind the method to the instance
  Route.prototype[method] = function(...callbacks) {
    return this.on(method, ...callbacks);
  };
}

//add the verbs
methods.map(addMethod);

//adapter
module.exports = Route;
