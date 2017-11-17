'use strict';

const express      = require('express');
const compression  = require('compression');

const app = express();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Enable gzip compression
app.use(compression());

// This is where we attach our routes to /
app.use('/', require('./controllers'));

module.exports = app;
