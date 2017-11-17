'use strict';

const request      = require('superagent');
const express      = require('express');
const bodyParser   = require('body-parser');
const esCatalog    = require('../catalog/eventSourceCatalog');
const config       = require('../etc/config.js');

const router = express.Router();
router.use(bodyParser.json({type: '*/*'}));

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

router.post('/:serviceId/:subscriptionId?/:instanceId?/:key?', (req, res, next) => {
  const {serviceId, subscriptionId, instanceId, key} = req.params;
  console.log({serviceId, subscriptionId, instanceId, key, body: req.body}, "Incoming Prometheus Event");

  const pEvent = req.body;

  let cemEvent;
  try {
    cemEvent = mapPrometheusEvent(pEvent);
  } catch (e) {
    // The Prometheus event could not be mapped
    return res.sendStatus(400);
  }

  request
  .post(`${config.integrationcontroller}/api/events/v1`)
  .auth(`${subscriptionId}/${instanceId}`, key)
  .send(cemEvent)
  .set('Accept', 'application/json')
  .end((postErr, postRes) => {
    if (postErr || !postRes.body) {
      console.log({postErr}, 'Unable to send event to integration controller gateway');
      return res.status(500).send('Unable to send event to integration controller gateway');
    }

    res.send(postRes.body);
  });
});

module.exports = router;
