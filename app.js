var express = require('express')
  , request = require('superagent')
  , bodyParser = require('body-parser')
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

app.use(bodyParser.json());

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

app.post('/api/prometheus', (req, res) => {
    const kubEvent = req.body;
    const cemEvent = CreateEvent(kubEvent);    
    request
    .post(config.cloudeventmanagement.url + '/api/events/v1')
    .auth(config.cloudeventmanagement.name, config.cloudeventmanagement.password)
    .set('Content-Type', 'application/json')
    .send(cemEvent)
    .end(function(err) {
        if (err) {
            res.sendStatus(400);
        } else {
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


function CreateEvent(ke) {
	// Set resolution
	let mappedEvent = {
			resource: {},
			summary: '',
			severity: '',
			type: {},
			urls: {},
			resolution: ke.status === 'resolved'
	};
	
	
    // Set resource
    mappedEvent.resource.name = ke.alerts[0].labels.instance;
    mappedEvent.resource.type = ke.alerts[0].labels.monitor;
    mappedEvent.resource.service = ke.alerts[0].labels.job;
   
   
	// Set severity
	switch (ke.commonLabels.severity) {
		case "critical": mappedEvent.severity = "Critical"; break;
		case "warning": mappedEvent.severity = "Warning"; break;
		default: mappedEvent.severity = "Indeterminate";
	};
	
	// Set summary
	mappedEvent.summary = ke.alerts[0].annotations.summary+" "+ke.alerts[0].annotations.description;
	
	// Set type
	mappedEvent.type.statusOrThreshold = ke.commonLabels.alertname;
    mappedEvent.type.eventType = ke.grouplabels.alertname;
    
 // create sender source id = monitor name name CEM Sample Application type SampleApp
    
    // Set urls
    mappedEvent.urls[0].url = ke.alerts[0].generatorURL;
    mappedEvent.urls[0].description = "Generator URL";
    mappedEvent.urls[1].url = ke.externalURL;
    mappedEvent.urls[1].description = "External URL";	
	
	return mappedEvent;
};

//Mapping Prometheus Events from Cloud Private Kubernetes to Cloud Event Management
//Example Prometheus Events Node Exported [open/firing]
//	{
//		"receiver": "webhook",
//		"status": "firing",
//		"alerts": [{
//			"status": "firing",
//			"labels": {
//				"alertname": "monitor_service_down",
//				"instance": "nodeexporter:9100",
//				"job": "nodeexporter",
//				"monitor": "docker-host-alpha",
//				"severity": "critical"
//			},
//			"annotations": {
//				"description": "Service nodeexporter:9100 is down.",
//				"summary": "Monitor service non-operational"
//			},
//			"startsAt": "2017-08-23T11:26:20.84Z",
//			"endsAt": "0001-01-01T00:00:00Z",
//			"generatorURL": "http://a1638af4a3e2:9090/graph?g0.expr=up+%3D%3D+0&g0.tab=0"
//		}],
//		"groupLabels": {
//			"alertname": "monitor_service_down"
//		},
//		"commonLabels": {
//			"alertname": "monitor_service_down",
//			"instance": "nodeexporter:9100",
//			"job": "nodeexporter",
//			"monitor": "docker-host-alpha",
//			"severity": "critical"
//		},
//		"commonAnnotations": {
//			"description": "Service nodeexporter:9100 is down.",
//			"summary": "Monitor service non-operational"
//		},
//		"externalURL": "http://1ac7f53fffea:9093"
//	}

//Example Prometheus Events Node Exported [clear/resolved]
//	
//	"receiver": "webhook",
//	"status": "resolved",
//	"alerts": [
//	  {
//	    "status": "resolved",
//	    "labels": {
//	      "alertname": "monitor_service_down",
//	      "instance": "nodeexporter:9100",
//	      "job": "nodeexporter",
//	      "monitor": "docker-host-alpha",
//	      "severity": "critical"
//	    },
//	    "annotations": {
//	      "description": "Service nodeexporter:9100 is down.",
//	      "summary": "Monitor service non-operational"
//	    },
//	    "startsAt": "2017-08-23T11:41:05.84Z",
//	    "endsAt": "2017-08-23T11:43:15.839Z",
//	    "generatorURL": "http://a1638af4a3e2:9090/graph?g0.expr=up+%3D%3D+0&g0.tab=0"
//	  }
//	],
// create sender source id = monitor name name CEM Sample Application type SampleApp
//	"groupLabels": {
//	  "alertname": "monitor_service_down"
//	},
//	"commonLabels": {
//	  "alertname": "monitor_service_down",
//	  "instance": "nodeexporter:9100",
//	  "job": "nodeexporter",
//	  "monitor": "docker-host-alpha",
//	  "severity": "critical"
//	},
//	"commonAnnotations": {
//	  "description": "Service nodeexporter:9100 is down.",
//	  "summary": "Monitor service non-operational"
//	},
//	"externalURL": "http://1ac7f53fffea:9093"
//	}

// Full Event Model for Cloud Event Management
//   {
//	  "resource": {
//	    "type": "Application",
//	    "name": "string",
//	    "sourceId": "string",
//	    "service": "string",
//	    "cluster": "string",
//	    "displayName": "string",
//	    "component": "string",
//	    "location": "string",
//	    "application": "string",
//	    "hostname": "string",
//	    "ipaddress": "string",
//	    "port": 80,
//	    "interface": "string",
//	    "additionalProp1": {}
//	  },
//	  "relatedResources": [
//	    {
//	      "relationship": "string",
//	      "type": "Application",
//	      "name": "string",
//	      "sourceId": "string",
//	      "service": "string",
//	      "cluster": "string",
//	      "displayName": "string",
//	      "component": "string",
//	      "location": "string",
//	      "application": "string",
//	      "hostname": "string",
//	      "ipaddress": "string",
//	      "port": 80,
//	      "interface": "string",
//	      "additionalProp1": {}
//	    }
//	  ],
//	  "summary": "string",
//	  "severity": "Critical",
//	  "timestamp": "Unknown Type: string,integer",
//	  "sender": {
//	    "type": "Application",
//	    "name": "string",
//	    "sourceId": "string",
//	    "service": "string",
//	    "cluster": "string",
//	    "displayName": "string",
//	    "component": "string",
//	    "location": "string",
//	    "application": "string",
//	    "hostname": "string",
//	    "ipaddress": "string",
//	    "port": 80,
//	    "interface": "string",
//	    "additionalProp1": {}
//	  },
//	  "type": {
//	    "statusOrThreshold": "> 30 seconds",
//	    "eventType": "Response time threshold breached"
//	  },
//	  "urls": [
//	    {
//	      "url": "https://www.bluemix.net",
//	      "description": "string"
//	    }
//	  ],
//	  "details": {
//	    "sampleDetail": "sample",
//	    "additionalProp1": {}
//	  },
//	  "resolution": false,
//	  "expiryTime": 3600
//	}


