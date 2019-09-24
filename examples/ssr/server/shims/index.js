const express = require('express');
const Router = require('@openovate/express-router');
const router = Router();
router.render = require('./render');
const webpack = require('./webpack');

export {
  express,
  router,
  webpack
}
