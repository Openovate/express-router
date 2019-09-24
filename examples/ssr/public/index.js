import '@babel/polyfill';
import React from 'react'
import ReactDOM from 'react-dom'
import Router from '../shared/Router'

const { createBrowserHistory } = require('history');
const history = createBrowserHistory();

//Routes are relative to where the router is
//and router is in the `shared` folder ...
const routes = {
  '/': '../shared/views/Home.jsx',
  '/product/:id': '../shared/views/Product.jsx'
};

ReactDOM.render(
  Router(history, routes),
  document.getElementById('root')
)
