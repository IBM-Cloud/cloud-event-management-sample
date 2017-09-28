const express    = require('express');
const request    = require('superagent');
const bodyParser = require('body-parser');
const cfenv      = require('cfenv');
const config     = require('./config.js').readGlobalConfig();

const useContainer = process.argv.indexOf("--container") > -1;

let cemApiUrl, cemApiCreds;
if (config.cloudeventmanagement) {
    cemApiUrl = config.cloudeventmanagement.url + '/api/events/v1';
    cemApiCreds = [config.cloudeventmanagement.name, config.cloudeventmanagement.password];
}

let appEnv;
if (!useContainer) {
    // Get the app environment from Cloud Foundry
    appEnv = cfenv.getAppEnv();
    // cfenv provides access to your Cloud Foundry environment
    // for more info, see: https://www.npmjs.com/package/cfenv
} else {
    // running on container, can't use cfenv.getAppEnv()
    appEnv = {
         port: 8080,
         url:  ''
    };
}

// Create a new express server
let app = express();
app.use(bodyParser.json());

// Serve test button: press the button to send a predefined event to Cloud Event Management
app.get('/send', function (req, res) {
    let event = require('./sample-events/cem-event.json');
    // Update the eventType with the current date
    event.type.eventType += Date.now();

    request
    .post(cemApiUrl)
    .auth(...cemApiCreds)
    .set('Content-Type', 'application/json')
    .send(event)
    .end(function(err) {
        if (err) {
            console.log("Error sending event: " + err);
        } else {
            console.log("Successfully sent sample event to Cloud Event Management");
        }
    });
    res.sendStatus(204);
});

// Serve Prometheus normalizer endpoint:
// configure a webhook receiver in Prometheus that points to `<sample app URL>/api/prometheus`
// and incoming events will be mapped and forwarded to Cloud Event Management
// (https://prometheus.io/docs/alerting/configuration/#webhook_config)
app.post('/api/prometheus', (req, res) => {
    const pEvent = req.body;

    let cemEvent;
    try {
        cemEvent = mapPrometheusEvent(pEvent);
    } catch (e) {
        // The Prometheus event could not be mapped
        return res.sendStatus(400);
    }

    request
    .post(cemApiUrl)
    .auth(...cemApiCreds)
    .set('Content-Type', 'application/json')
    .send(cemEvent)
    .end(function(err) {
        if (err) {
            console.log("Error sending event: " + JSON.stringify(err, null, 2));
            res.sendStatus(400);
        } else {
            console.log("Successfully sent Prometheus event to Cloud Event Management");
            res.sendStatus(204);
        }
    });
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, function() {
    // containers won't have a bound URL yet
    console.log("Server starting on " + (appEnv.url ? appEnv.url : "port " + appEnv.port));
});

// Map a Prometheus event to a Cloud Event Management event
function mapPrometheusEvent(pEvent) {
    let mappedEvent = {
        resolution: pEvent.status === 'resolved',
        summary: pEvent.alerts[0].annotations.summary + ' ' + pEvent.alerts[0].annotations.description,
        resource: {
            name: pEvent.alerts[0].labels.instance,
            type: pEvent.alerts[0].labels.monitor,
            service: pEvent.alerts[0].labels.job
        },
        type: {
            statusOrThreshold: pEvent.commonLabels.alertname,
            eventType: pEvent.groupLabels.alertname
        },
        sender: {
            sourceId: pEvent.commonLabels.monitor,
            name: "CEM Sample App",
            type: "SampleApp"
        },
        urls: [
            {
                url: pEvent.alerts[0].generatorURL,
                description: "Generator URL"
            },
            {
                url: pEvent.externalURL,
                description: "External URL"
            }
        ]
    };

    switch (pEvent.commonLabels.severity) {
        case "critical": mappedEvent.severity = "Critical"; break;
        case "warning":  /* fallthrough */
        default:         mappedEvent.severity = "Warning";  break;
    };

    return mappedEvent;
};
