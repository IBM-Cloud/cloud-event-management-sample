# Starter Integration Broker For Cloud Event Management

This is a starter application for the [Cloud Event Management][provision_url] service in Bluemix, that demonstrates how to create a third party integration broker and register it with CEM. This allows for custom creation, mapping, and sending of events via a simple Node.js web application.

The sample integration broker can be used to map incoming [Prometheus][prometheus_url] alerts and forward them to Cloud Event Management. After registering the broker, users will see a new Prometheus event source integration and be able to create instances of it. Each instance will return a webhook URL to the user; Prometheus alerts can then be sent to this URL, where they will be transformed into events and forwarded to Cloud Event Management.

For more information, see the [documentation][docs_url].

## Cloud Event Management Overview
Use [Cloud Event Management][video_url] to set up real-time incident management for your services, applications, and infrastructure. Cloud Event Management can receive events from various monitoring sources, either on premise or in the cloud. Events indicate that something has happened on an application, service, or another monitored object. Related events are correlated into an incident. The information from incidents, together with policies and runbooks, help operations teams identify underlying problems and restore service.

[![introduction video][image_url]][video_url]


## Running the app on Bluemix

1. Before running this app, you will need an instance of the Cloud Event Management service. Get one [here][provision_url].

2. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool.

3. Clone this repository to your local environment from your terminal:
  ```
  git clone git@github.com:IBM-Bluemix/cloud-event-management-sample.git
  ```

4. `cd` into the `src` directory of this newly created directory:
  ```
  cd cloud-event-management-sample/src
  ```

5. Open the manifest.yml file and change the INTEGRATION_CONTROLLER value to reflect the Bluemix region you are using:
  - For US South: `https://cem-integrationcontroller-us-south.opsmgmt.bluemix.net`
  - For United Kingdom or Germany: `https://cem-integrationcontroller-eu-gb.opsmgmt.bluemix.net`
  - For Sydney: `https://cem-integrationcontroller-au-syd.opsmgmt.bluemix.net`

6. Connect to Bluemix with the command line tool and follow the prompts to log in:

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

7. Confirm that you are in the correct organization and space with:

  ```
  cf target
  ```

8. Push the app to Bluemix:

  ```
  $ cf push
  ```

  When the command finishes, you should see the `<host>.mybluemix.net` URL in the output.  This will be the URL at which you can access the sample app. Note that your broker endpoint URL will be `https://<host>.mybluemix.net/api/broker`.

9. Continue on to the section for [registering your broker](#registering-the-broker).


## Running the app locally

1. [Install Node.js][install_node_url].

2. Clone this repository to your local environment from your terminal:
  ```
  git clone git@github.com:IBM-Bluemix/cloud-event-management-sample.git
  ```

3. `cd` into the `src` directory of this newly created directory:
  ```
  cd cloud-event-management-sample/src
  ```

4. Run `npm install` to install the app's dependencies.

5. Run `../run.sh` to start the app.

6. Access the running app in a browser at the address specified by the terminal output, e.g.:
  ```
  Server starting on http://localhost:6018
  ```
7. View the broker catalog: `http://localhost:6018/api/broker/v2/catalog`


## Registering the broker

Once the sample broker app has been deployed to Bluemix, you can now register the app with the integration controller. The `src/scripts/brokers.js` file can be used to assist in managing your broker's registration.

1. Retrieve your Bluemix OAuth token:
  ```
  cf oauth-token
  ```

2. Use the `src/scripts/brokers.js register` command to register the new integration broker, e.g.:
  ```
  src/scripts/brokers.js register \
  -n "<unique name>" \
  -r "https://cem-integrationcontroller-us-south.opsmgmt.bluemix.net" \
  -u "https://<host>.mybluemix.net/api/broker" \
  -a "owner@example.com" -a "admin@example.com" \
  -v "CustomerSubscriptionId1" -v "CustomerSubscriptionId2" \
  -t "<OAuth token>"
  ```

  Options:

  - `-n`: A unique name (label) for the broker.
  - `-r`: The integration controller that was defined in the `manifest.yml` file during the deployment process above.
  - `-u`: The broker endpoint URL that is currently running in Bluemix, which was determined during the deployment process above.
  - `-a`: Additional Bluemix user IDs that should have permission to manage this broker. The user making the registration request will automatically be added as an authorized user.
  - `-v`: Cloud Event Management tenant (service instance/subscription) IDs that should have access to the integrations provided by this broker.
  - `-t`: The OAuth token that was returned in the previous step.

  Note: `-v` and `-a` can be listed multiple times to add additional users and tenants.

3. Once the broker is registered, users in the tenants supplied will immediately have access to your new integration. Log in to the Cloud Event Management UI for one of these tenants, and create an instance of the new Prometheus event source. This will provide a webhook URL that you can post Prometheus events to.

4. POST the `prometheus-firing.json` sample event, located under the `sample-events` directory, to the webhook URL:
  ```
  curl \
  -H 'Content-Type: application/json' \
  -X POST "<webhook URL>" \
  -d "$(cat sample-events/prometheus-firing.json)"
  ```

5. You can use the `brokers.js` script to continue managing your broker:
  - `update`: use this command if you change your broker's catalog, or want to add/remove authorized users or tenant IDs.
  - `remove`: use this command to unregister your broker, making the integrations provided by it (and any instances created) no longer accessible.

[image_url]: https://ibmeventmgt-bm-brokers.mybluemix.net/static/incident_viewer.png
[video_url]: https://ibm.biz/Bdisd7
[docs_url]: https://console.bluemix.net/docs/services/EventManagement/em_customsource.html
[api_docs_event_url]: https://console.bluemix.net/apidocs/919-cloud-event-management-api#create-an-event
[provision_url]: https://console.bluemix.net/catalog/?search=event%20management
[install_node_url]: https://nodejs.org/en/download/
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
[prometheus_url]: https://prometheus.io/
[prometheus_config_url]: https://prometheus.io/docs/alerting/configuration/#webhook_config
