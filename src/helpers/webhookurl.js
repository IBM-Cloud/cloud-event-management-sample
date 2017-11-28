'use strict';

const url    = require('url');
const config = require('../etc/config.js');

module.exports = {
  getWebhookURL(serviceId, parameters) {
    const webhookUrl = url.parse(config.url);
    webhookUrl.pathname = `/webhook/${encodeURIComponent(serviceId)}/${parameters.auth_username}/${parameters.auth_password}`;

    return url.format(webhookUrl);
  }
};
