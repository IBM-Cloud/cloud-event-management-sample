# Starter Application For Cloud Event Management
This is a starter application for the [Cloud Event Management][provision_url] service in Bluemix, that demonstrates how to send events via the API using a simple Node.js web application. For more information, see the [API documentation][api_docs_url].

## Cloud Event Management Overview
Use [Cloud Event Management][video_url] to set up real-time incident management for your services, applications, and infrastructure. Cloud Event Management can receive events from various monitoring sources, either on premise or in the cloud. Events indicate that something has happened on an application, service, or another monitored object. Related events are correlated into an incident. The information from incidents, together with policies and runbooks, help operations teams identify underlying problems and restore service.

[![introduction video][image_url]][video_url]


## Running the app on Bluemix

1. Before running this app, you will need an instance of the Cloud Event Management service. Get one [here][provision_url].

2. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool

3. Clone the app to your local environment from your terminal 

4. `cd` into this newly created directory

5. Open the manifest.yml file and change the host value to something unique.

  The host you choose will determine the subdomain of your application's URL: `<host>.mybluemix.net`

6. Connect to Bluemix in the command line tool and follow the prompts to log in

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

  If asked to select a space, select the one that contains your Cloud Event Management instance.

7. Confirm that you are in the correct space with:

  ```
  cf services
  ```

  You should see your Cloud Event Management instance listed.  Make a note of the instance name.

8. Push the app to Bluemix.

  ```
  $ cf push
  ```

  When the command finishes, you should see the `<host>.mybluemix.net` URL in the output.  This will be the URL at which you can access the sample app.

9. Bind the Cloud Event Management service to the app, where `<instance_name>` is the name from Step 7.
  ```
  $ cf bind-service CEMSampleApp "<instance_name>"
  ```

10. Restage the app
  ```
  $ cf restage CEMSampleApp
  ```

11. Access the app at the URL from Step 9, and press the button to send events!


## Run the app locally

1. [Install Node.js][install_node_url]

2. Clone the app to your local environment 

3. cd into the app directory

4. Edit `config.js` and fill in your Cloud Event Management instance name, username and password:

  ```
var defaults = {
      cloudeventmanagement: {
        url: 'https://ibmeventmgt-bm-eventpreprocessor.mybluemix.net/api/events/demo/v1',
        name: '',
        password: '',
      }
}
  ```
  This will allow the starter app to authenticate with Cloud Event Management and send events.

5. Run `npm install` to install the app's dependencies

6. Run `npm start` to start the app

7. Access the running app in a browser at the address specified by the terminal output, e.g.:
  ```
  Server starting on http://localhost:6001
  ```

8. Press the button to send an event!  Try modifying the code in app.js to change the content, source, and severity of the event.

[image_url]: https://ibmeventmgt-bm-brokers.mybluemix.net/static/incident_viewer.png
[video_url]: https://ibm.biz/Bdisd7
[api_docs_url]: https://ibmeventmgt-bm-eventpreprocessor.mybluemix.net/docs/events/v1/
[provision_url]: https://console.bluemix.net/catalog/services/cloud-event-management
[install_node_url]: https://nodejs.org/en/download/
[cloud_foundry_url]: https://github.com/cloudfoundry/cli

