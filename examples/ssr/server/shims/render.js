const fs = require('fs')
const React = require('react');
const { renderToString } = require('react-dom/server');
const Page = require('../../shared/Page.jsx').default;
const { createMemoryHistory } = require('history');

module.exports = (component, props, res) => {
  props.history = createMemoryHistory();
  //if callback is a component
  if (isReactComponent(component)) {
    //convert the callback to a composite
    component = function componentToComposite(props) {
      return React.createElement(component, props);
    }
  }

  //component should be an element now
  //next, make a page
  const page = React.createElement(Page, props, component(props));
  //last set the content
  res.content.set('<!DOCTYPE html>' + renderToString(page));
};

/**
* Returns true if the callback is a React Component or Element
*/
function isReact(component) {
  return isReactComponent(component) || isReactElement(component);
}

/**
* Returns true if the callback is a React Component
*/
function isReactComponent(component) {
  return typeof component === 'function' && (
    !!component.prototype.isReactComponent
    || String(component).includes('return React.createElement')
  );
}

/**
* Returns true if the callback is a React Element
*/
function isReactElement(component) {
  return React.isValidElement(component);
}
