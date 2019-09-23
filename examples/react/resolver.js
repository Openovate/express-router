const React = require('react');
const { renderToNodeStream } = require('react-dom/server');

module.exports = (router) => {
  router.on('resolve', (method, path, callback, priority) => {
    //if callback is not a react thing...
    if (!callback.component || !isReact(callback.component)) {
      //do nothing
      return;
    }

    callback = callback.component;

    //add a proper route
    router.route(method, path, (req, res) => {

      //if callback is a component
      if (isReactComponent(callback)) {
        //determine the props
        let props = res.rest.get('results');
        if (typeof props !== 'object') {
          props = {};
        }

        //convert the callback to an element
        callback = React.createElement(callback, props)
      }

      //callback should be an element now
      //either way convert it to a stream
      res.content.set(renderToNodeStream(callback));
    }, priority);
  });
};

/**
* Returns true if the callback is a React Component or Element
*/
function isReact(callback) {
  return isReactComponent(callback) || isReactElement(callback);
}

/**
* Returns true if the callback is a React Component
*/
function isReactComponent(callback) {
  return typeof callback === 'function' && (
    !!callback.prototype.isReactComponent
    || String(callback).includes('return React.createElement')
  );
}

/**
* Returns true if the callback is a React Element
*/
function isReactElement(callback) {
  return React.isValidElement(callback);
}
