'use strict';

const cfenv = require('cfenv');
let config = {};

const useContainer = process.argv.indexOf("--container") > -1;
config.port = cfenv.getAppEnv().port;
config.url = cfenv.getAppEnv().url;
config.integrationcontroller = process.env["INTEGRATION_CONTROLLER"] ?
    process.env["INTEGRATION_CONTROLLER"] : 'https://edge-integration-controller.stage1.mybluemix.net';

module.exports = config;
