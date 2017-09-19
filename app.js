var express = require('express')
  , request = require('superagent')
  , config = require('./config.js').readGlobalConfig();

var event = {
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

var useContainer = process.argv.indexOf("--container") > -1;

if (!useContainer) {
    // cfenv provides access to your Cloud Foundry environment
    // for more info, see: https://www.npmjs.com/package/cfenv
    var cfenv = require('cfenv');

    // get the app environment from Cloud Foundry
    var appEnv = cfenv.getAppEnv();
} else {
    // running on container, can't use cfenv.getAppEnv()
    var appEnv = { 
         port: 8080,
         url:  ''
    }
}

// create a new express server
var app = express();

// serve test button
app.get('/send', function (req, res) {
	request
    .post(config.cloudeventmanagement.url + '/api/events/v1')
    .auth(config.cloudeventmanagement.name, config.cloudeventmanagement.password)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(event))
    .end(function(err) {
        if (err) {
            console.log("Error sending event: " + err);
        } else {
            console.log("Successfully sent event");
        }
    });
	res.sendStatus(204);
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, function() {
        // containers won't have a bound URL yet
	console.log("Server starting on " + (appEnv.url ? appEnv.url : "port " + appEnv.port));
});


