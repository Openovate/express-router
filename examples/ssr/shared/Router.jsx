import path from 'path';
import React, { useState } from 'react';

const pathToRegexp = require('path-to-regexp');

class Router extends React.Component {
  constructor(props) {
    super(props);

    const { history, routes } = this.props;

    this.routes = routes;

    history.listen(this.handleRoute.bind(this));

    //initial state
    this.state = {};

    //handle the first route
    this.handleRoute(history.location, 'push');
  }

  handleComponent(route, component) {
    //import quirk
    if (component.default) {
      //get the component
      component = component.default;
    }

    //guarantee we have props
    let props = {};

    //if no getInitialProps
    if (typeof component.getInitialProps !== 'function') {
      //just change the state
      this.setState({ component, route, props });
      return;
    }

    //there is an initial props
    props = component.getInitialProps(route);

    //if it is not an async function
    if (typeof props.then !== 'function') {
      //now change the state
      this.setState({ component, route, props });
      return;
    }

    //call then
    props.then(props => {
      //finally change the state
      this.setState({ component, route, props });
    });
  }

  handleRoute(location, action) {
    //if no pathname
    if (!location.pathname) {
      //nothing we can do...
      return;
    }

    for(const path in this.routes) {
      const route = {
        path: null,
        pattern: null,
        results: null,
        keys: [],
        args: [],
        params: {}
      };

      route.pattern = pathToRegexp(path, route.keys);
      route.results = route.pattern.exec(location.pathname);

      if (!route.results || !route.results.length) {
        continue;
      }

      //full path
      route.path = route.results.shift();
      route.results.forEach((variable, i) => {
        if (!route.keys[i] || !route.keys[i].name) {
          return;
        }

        if (typeof route.keys[i].name === 'number') {
          route.args.push(variable);
          return;
        }

        route.params[route.keys[i].name] = variable;
      });

      //start resolving the route
      let resolved = this.routes[path];
      const context = '/shared';
      const index = resolved.indexOf(context);

      //if there is an index
      if (index !== -1) {
        //remove the phrase up to the context and replace with a .
        resolved = '.' + resolved.substr(index + context.length);
      }

      // use require.context instead of import() because there
      // are some quirks when using paths as variables
      const modules = require.context('.', true, /\.((js)|(jsx))$/, 'lazy');

      //if the route is part of the file system
      if (modules.keys().indexOf(resolved) !== -1) {
        // load the component
        modules(resolved).then(this.handleComponent.bind(this, route));
      }

      break;
    }
  }

  render() {
    //if no component
    if (!this.state.component) {
      //nothing we can do...
      return null;
    }

    const { component, route, props } = this.state;
    const { history } = this.props;

    props.route = route;
    props.history = history;

    return React.createElement(component, props);
  }
}

export default (history, routes) => {
  return React.createElement(Router, { history, routes })
}
