# Cloud Event Management Overview
This starter demonstrates how to send events via the Cloud Event Management API using a simple Node.js web application. 

Before running this app, you will need an instance of the Cloud Event Management service. 


## Running the app on Bluemix

1. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool

2. Clone the app to your local environment from your terminal 

3. `cd` into this newly created directory

4. Open the manifest.yml file and change the host value to something unique.

The host you choose will determine the subdomain of your application's URL: `<host>.mybluemix.net`

5. Connect to Bluemix in the command line tool and follow the prompts to log in

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

  If asked to select a space, select the one that contains your Cloud Event Management instance.

6. Confirm that you are in the correct space with:

  ```
  cf services
  ```

  You should see your Cloud Event Management instance listed.  Make a note of the instance name.

7. Push the app to Bluemix.

  ```
  $ cf push CEMSampleApp
  ```

  When the command finishes, you should see the `<host>.mybluemix.net` URL in the output.  This will be the URL at which you can access the sample app.

8. Bind the Cloud Event Management service to the app, where `<instance_name>` is the name from Step 6.
  ```
  $ cf bind-service CEMSampleApp "<instance_name>"
  ```

9. Access the app at the URL from Step 7, and press the button to send an event!


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

[install_node_url]: https://nodejs.org/en/download/
[cloud_foundry_url]: https://github.com/cloudfoundry/cli

