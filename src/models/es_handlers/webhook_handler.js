'use strict';

const webhookurl = require('../../helpers/webhookurl');

module.exports = {
  createInstance(serviceId, {
    parameters
  }) {
    return Promise.resolve({
      parameters: {},
      temporary_data: {
        url: webhookurl.getWebhookURL(serviceId, parameters)
      }
    });
  },

  updateInstance(serviceId, {
    parameters
  }) {
    if (parameters.auth_username && parameters.auth_password) {
      return Promise.resolve({
        parameters: {},
        temporary_data: {
          url: webhookurl.getWebhookURL(serviceId, parameters)
        }
      });
    }
    return Promise.resolve({
      parameters: {},
      temporary_data: {}
    });
  },

  deleteInstance() {
    // We don't hold any state for webhook integrations, so this is a no-op
  }
};
