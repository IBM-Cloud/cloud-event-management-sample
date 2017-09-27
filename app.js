const express    = require('express');
const request    = require('superagent');
const bodyParser = require('body-parser');
const cfenv      = require('cfenv');
const config     = require('./config.js').readGlobalConfig();

const useContainer = process.argv.indexOf("--container") > -1;

const cemApiUrl = config.cloudeventmanagement.url + '/api/events/v1';
const cemApiCreds = [config.cloudeventmanagement.name, config.cloudeventmanagement.password];

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
    request
    .post(cemApiUrl)
    .auth(...cemApiCreds)
    .set('Content-Type', 'application/json')
    .send(getSampleEvent())
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
// and incoming events will be translated and forwarded to Cloud Event Management
// (https://prometheus.io/docs/alerting/configuration/#webhook_config)
app.post('/api/prometheus', (req, res) => {
    const pEvent = req.body;

    let cemEvent;
    try {
        cemEvent = translatePrometheusEvent(pEvent);
    } catch (e) {
        // The Prometheus event could not be translated
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


function getSampleEvent() {
    return {
      resource: {
        type: "service",
        name: "demo",
        displayName: "Demo",
        location: "wdc",
        application: "demo",
        hostname: "demoevent.example.com"
      },
      summary: "This is a demo event from the sample app",
      severity: "Warning",
      sender: {
        type: "synthetics",
        name: "db-synthetic-mon"
      },
      type: {
        statusOrThreshold: "> 200",
        eventType: "Date > " + Date.now()
      },
      resolution: false
    };
}

// Convert a Prometheus event to a Cloud Event Management event
function translatePrometheusEvent(pEvent) {
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
        case "warning":  mappedEvent.severity = "Warning";  break;
        default:         mappedEvent.severity = "Indeterminate";
    };

    return mappedEvent;
};
