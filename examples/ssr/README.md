# Server Side React Example

## Install

```bash
$ npm i
$ npm start
```

In your browser, visit `http://localhost:3000/` and `http://localhost:3000/product/1`
to see what happens. This shows express router working using Express, React which
loads on server and client side.

Instead of `node server/index.js` we use `babel-node server/shims/babel.js` to
make sure babel transpiles jsx on the server side and without actually building
it and transpiles the server code separately from the client code. Client code
is transpiled using webpack. The client specific code can be found in `public`
while server code can be found in `server`.

Both the client and server can access the `shared` folder which should contain
assets needed by both the server and client *(for example React components)*.

### Server

Starting from `server/index.js`, express is initialize. The `public` directory
is openned up for static file serving *(try visiting http://localhost:3000/note.txt)*.
Next the `express-router` is included into express via `app.use(router)` followed
by the `webpack` middleware. Finally the HTTP server is openned for requests.

The router is found at `server/router.js` and contains typical route definitions
with the addition of `route.render()`. The definition of this can be found in
`server/shims/render.js` and explains that the component can be a
`React.Component` or a React [composite function](https://reactjs.org/docs/composition-vs-inheritance.html),
`props` is the component properties and `response` is the `ServerResponse` object
from the request.

```js
render(component, props, response)
```

Render wraps the component given with a page component found in `shared/Page.jsx`
then passes the stringified version to the response.

Instead of webpack running on its own port, the same express port is used to
render the bundle files. This logic can be found in `server/shims/webpack.js`.
Here given the `app`, we attach the `webpack-dev-middleware` to express. A
special route was used to serve the bundle files from the `webpack-dev-middleware`
file system.

### Client

Starting from `public/index.js`, a [history](https://www.npmjs.com/package/history)
package is used to create a browser history event interface. Server uses a server
version of history in `server/shims/render.js` to simply match what is expected.
Next, routes are manually defined.

> I didn't want to merge the server and client routes in this example, but there is a way that can be done. I leave it up to you to define.

Lastly we use `react-dom` to transpile the `Router` component to a string and
attach to `#root` in the `shared/Page.jsx` markup. `Router`, found in
`shared/Router.jsx` is a special component that determines which view should be
loaded and is an example on how to solve some of webpack's dynamic importing
issues *(using require.context instead)*. It also handles the generation of
initial props by looking in each component for a `getInitialProps()` function.

Since `history` is used, another special component called `Link` found in
`shared/components/Link.jsx` was used to redirect users to other views
without re-loading the page.
