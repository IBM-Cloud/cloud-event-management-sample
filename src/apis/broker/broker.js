'use strict';

const request                   = require('superagent');
const url                       = require('url');
const { catalog, eventSources } = require('../../catalog/eventSourceCatalog');
const handlers                  = require('../../models/es_handlers');
const config                    = require('../../etc/config.js');

function checkToken(req) {
  const token = req.swagger.params['X-Auth-Token'].value;
  const instanceId = req.swagger.params.instanceId.value;
  return new Promise((resolve, reject) => {
    let verifyUrl = url.parse(config.integrationcontroller);
    verifyUrl.pathname = '/api/tokens/v1';

    request
      .get(url.format(verifyUrl))
      .set('X-Auth-Token', token)
      .end((err, res) => {
        if (err && err.status === 404 || !res || !res.body) {
          console.log({err}, 'Unable to locate integration token');
          const brokerErr = new Error('Invalid integration token');
          brokerErr.statusCode = 401;
          return reject(brokerErr);
        } else if (err) {
          console.log({err}, 'Unable to validate integration token');
          const brokerErr = new Error('Internal server error');
          brokerErr.statusCode = 500;
          return reject(brokerErr);
        } else if (res.body.instance_id !== instanceId) {
          console.log({err}, 'Unable to validate integration token');
          const brokerErr = new Error('Invalid integration token');
          brokerErr.statusCode = 401;
          return reject(brokerErr);
        }

        return resolve();
      });
  });
}

function getHandler(serviceId) {
  const eventSource = eventSources.find(x => x.id === serviceId);

  if (!eventSource) {
    const rtrErr = new Error('Integration type not found');
    rtrErr.statusCode = 404;
    rtrErr.description = {
      availableTypes: eventSources.map(x => x.id),
      requestedType: serviceId
    };
    return Promise.reject(rtrErr);
  }

  const handlerId = eventSource.handler;
  const handler = handlers[handlerId];

  return Promise.resolve(handler);
}

module.exports = {
  getCatalog(req, res, next) {
    console.log('getCatalog()');
    if (!catalog) {
      console.log('Failed to retrieve catalog');
      let catalogErr = new Error('Failed to retrieve catalog');
      catalogErr.statusCode = 500;
      return next(catalogErr);
    }

    return res.send(catalog);
  },

  createInstance(req, res, next) {
    const serviceId = req.swagger.params.serviceId.value;
    const instanceId = req.swagger.params.instanceId.value;
    const integrationData = req.swagger.params.body.value;
    console.log({instanceId, serviceId, integrationData}, 'createInstance()');

    checkToken(req)
      .then(() => getHandler(serviceId))
      .then(handler => handler.createInstance(serviceId, integrationData))
      .then(retParams => res.status(200).send(retParams))
      .catch(err => next(err));
  },

  updateInstance(req, res, next) {
    const serviceId = req.swagger.params.serviceId.value;
    const instanceId = req.swagger.params.instanceId.value;
    const integrationData = req.swagger.params.body.value;
    console.log({instanceId, serviceId, integrationData}, 'updateInstance()');

    // Only update my credentials in file
    const updateFile = integrationData.parameters.auth_username && integrationData.parameters.auth_username;

    checkToken(req)
      .then(() => getHandler(serviceId))
      .then(handler => handler.updateInstance(serviceId, integrationData))
      .then(retParams => res.status(200).send(retParams))
      .catch(err => next(err));
  },

  deleteInstance(req, res, next) {
    const serviceId = req.swagger.params.serviceId.value;
    const instanceId = req.swagger.params.instanceId.value;
    const parameters = req.swagger.params;
    console.log({instanceId, serviceId}, 'deleteInstance()');

    checkToken(req)
      .then(() => getHandler(serviceId))
      .then(handler => handler.deleteInstance(serviceId, {parameters}))
      .then(() => res.sendStatus(204))
      .catch(err => next(err));
  }
};
