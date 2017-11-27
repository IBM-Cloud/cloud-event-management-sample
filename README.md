# Starter Integration Broker For Cloud Event Management

This is a starter application for the [Cloud Event Management][provision_url] service in Bluemix, that demonstrates how to create a third party integration broker with CEM so users can create integration instances (event sources) from that broker which allows for custom creation, mapping, and sending events via using a simple Node.js web application.

The application serves the purpose as a Cloud Event Management integration broker that will be used to map incoming [Prometheus][prometheus_url] events and forward them to Cloud Event Management. After registering the broker, users will be able to create the Prometheus event source which will generate a webhook url for the broker. Prometheus events can then be sent into this webhook url which will then be transformed into an event and forwarded on to Cloud Event Management.

For more information, see the [API documentation][api_docs_url].

TODO: correct documentation links

## Cloud Event Management Overview
Use [Cloud Event Management][video_url] to set up real-time incident management for your services, applications, and infrastructure. Cloud Event Management can receive events from various monitoring sources, either on premise or in the cloud. Events indicate that something has happened on an application, service, or another monitored object. Related events are correlated into an incident. The information from incidents, together with policies and runbooks, help operations teams identify underlying problems and restore service.

[![introduction video][image_url]][video_url]


## Running the app on Bluemix

1. Before running this app, you will need an instance of the Cloud Event Management service. Get one [here][provision_url].

2. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool

3. Clone the app to your local environment from your terminal

4. `cd` into the src directory of this newly created directory

5. Open the manifest.yml file and change the INTEGRATION_CONTROLLER value to reflex the CEM environment you are using.

  TODO: show production urls

6. Connect to Bluemix in the command line tool and follow the prompts to log in

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

7. Confirm that you are in the correct organization and space with:

  ```
  cf target
  ```

8. Push the app to Bluemix.

  ```
  $ cf push
  ```

  When the command finishes, you should see the `<host>.mybluemix.net` URL in the output.  This will be the URL at which you can access the sample app. Note your broker endpoint url will be `https://<host>.mybluemix.net/api/broker`

12. Continue on to the section for registering your broker


## Running the app locally

1. [Install Node.js][install_node_url]

2. Clone the app to your local environment

3. cd into the src directory

4. Run `npm install` to install the app's dependencies

5. Run `../run.sh` to start the app

6. Access the running app in a browser at the address specified by the terminal output, e.g.:
  ```
  Server starting on http://localhost:6018
  ```
7. View the broker catalog: `http://localhost:6018/api/broker/v2/catalog`


## Registering the broker

Once the sample broker app has been deployed to Bluemix, you can now register the app with the integration controller. The `src/scripts/brokers.js` file can be used to assist in managing your broker's registration.

1. Retrieve your cf oauth-token:
`cf oauth-token`

2. Use the `./brokers.js register` command to register the new integration broker. 

Options:

- `-n`: A unique name (label) for the broker
- `-r`: The integration controller that was defined in the manifest.yml file in the previous steps
- `-u`: The broker api url that is currently running in Bluemix (/api/broker)
- `-a`: Additional bluemix user IDs that have access to manage the broker. The user making this request will automatically be added as an authorized user.
- `-v`: Cloud event management tenants (service instance IDs) that have access to the integrations managed by the broker
- `-t`: The cf oauth-token that was returned in the previous step.

Note: `-v` and `-a` can be listed multiple times to add additional users and tenants.

3. Once the broker is registered, users in the tenants supplied will immediately have access to create instances of your new integration. As a user of one of these tenants, in the Cloud Event Management UI, create an instance of the new integration. This will provide a webhook that you can post Prometheus events to.

4. Post the prometheus-firing.json sample event to the webhook that is located under the `sample-events` directory.

5. Continue to manage your broker with the `brokers.js` script.
- register
- retrieve
- update
- remove

[image_url]: https://ibmeventmgt-bm-brokers.mybluemix.net/static/incident_viewer.png
[video_url]: https://ibm.biz/Bdisd7
[api_docs_url]: https://console.bluemix.net/apidocs/919-cloud-event-management-api
[api_docs_event_url]: https://console.bluemix.net/apidocs/919-cloud-event-management-api#create-an-event
[provision_url]: https://console.bluemix.net/catalog/?search=event%20management
[install_node_url]: https://nodejs.org/en/download/
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
[prometheus_url]: https://prometheus.io/
[prometheus_config_url]: https://prometheus.io/docs/alerting/configuration/#webhook_config
