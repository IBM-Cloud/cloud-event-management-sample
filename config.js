//
// Default (localhost) settings
// Match name and password to credentials given from creating an API key
//
var defaults = {
      cloudeventmanagement: {
        url: 'https://ibmeventmgt-bm-eventpreprocessor.mybluemix.net',
        name: '',
        password: '',
    }
}

//
// If running inside Bluemix, reads the VCAP_SERVICES for the services listed under
// the defaults variable. If running outside Bluemix (localhost), will use the default
// settings.
//
exports.readGlobalConfig = function() {
  var config = {};
  if (process.env.VCAP_SERVICES) {
    var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
    var services = {};

    // Get into a more usable form
    for (var service_type in vcap_services) {
      var service_array = vcap_services[service_type];

      for (var i = 0; i < service_array.length; ++i) {
        services[service_type] = service_array[i].credentials;
      }
    }

    // Copy provided credentials from environment to configuration
    for (var service_name in defaults) {
      if (services[service_name]) {
        config[service_name] = {}
        for (var credential_name in defaults[service_name]) {
          if (services[service_name][credential_name]) {
            config[service_name][credential_name] = services[service_name][credential_name];
          }
        }
      }
    }
  } else {
    for (var service_name in defaults) {
      if (!config[service_name]) {
        config[service_name] = {}
      }
      for (var credential_name in defaults[service_name]) {
        if (!config[service_name][credential_name]) {
          config[service_name][credential_name] = defaults[service_name][credential_name];
        }
      }
    }
  }
  
  return config;
}
