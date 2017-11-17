'use strict';

/*
 * Register and support Swagger APIs.
 */
const express        = require('express');
const swaggerTools   = require('swagger-tools');
const async          = require('async');
const YAML           = require('yamljs');
const path           = require('path');
const fs             = require('fs');

const router         = require('express').Router();

const apiDefs        = YAML.load(path.join(__dirname, 'apis.yaml'));

var swaggerDocs = {};

async.eachOf(apiDefs.apis, (apiDef, apiKey, eachCB) => {
  let doc;
  try {
    if (apiDef.specType === 'json') {
      doc = require(apiDef.spec);
    } else {
      doc = YAML.load(path.resolve(__dirname, apiDef.spec));
    }
  } catch (ex) {
    console.log(`Unable to load API ${apiKey}, the spec was invalid`, ex);
    return;
  }

  swaggerTools.initializeMiddleware(doc, function inlineInit(swagger) {
    router.use(apiDef.docsApi, (req, res) => res.send(doc));
    router.get(new RegExp(apiDef.docsUrl + '$'), (req, res) => res.redirect(apiDef.docsUrl + '/'));
    swaggerDocs[apiKey] = swagger;
    eachCB(null);
  });
}, () => {
  async.eachOf(apiDefs.apis, (apiDef, apiKey, eachCB) => {
    // Interpret Swagger resources and attach metadata to request - must be
    // first in swagger-tools middleware chain
    router.use(swaggerDocs[apiKey].swaggerMetadata());

    // Validate Swagger requests
    router.use(swaggerDocs[apiKey].swaggerValidator({validateResponse: false}));

    // Route validated requests to appropriate controller
    router.use(swaggerDocs[apiKey].swaggerRouter({
      controllers: [path.resolve(__dirname, apiDef.controllers)]
    }));

    eachCB(null);
  }, (err) => {
    if (err) {
      return console.log('Error loading swagger APIs', err);
    }
  });
});

module.exports = router;
