//
// Default (localhost) settings
//
var defaults = {
    alertnotification: {
		url: 'https://notify-staging.stage1.mybluemix.net/api/alerts/v1',
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
		for (service_type in vcap_services) {
			var service_array = vcap_services[service_type];

			for (i = 0; i < service_array.length; ++i) {
				services[service_type] = service_array[i].credentials;
			}
		}

		// Copy provided credentials from environment to configuration
		for (service_name in defaults) {
			if (services[service_name]) {
				config[service_name] = {}
				for (credential_name in defaults[service_name]) {
					if (services[service_name][credential_name]) {
						config[service_name][credential_name] = services[service_name][credential_name];
					}
				}
			}
		}
	} else {
		for (service_name in defaults) {
			if (!config[service_name]) {
				config[service_name] = {}
			}

			for (credential_name in defaults[service_name]) {
				if (!config[service_name][credential_name]) {
					config[service_name][credential_name] = defaults[service_name][credential_name];
				}
			}
		}
	}
	return config;
}
