# Alert Notification Starter Overview

Alert Notification enables your IT staff to get instant notification of alerts for any critical IT issues, through email, SMS, voice, and mobile messages.  It offers easy-to-implement filtering of alerts and policy-based notifications that let you define which alerts you want to be notified about. Users can be organized into groups, allowing you to send notifications to several users at once.

This starter demonstrates how to send alerts via the Alert Notification API using a simple Node.js web application.  The Alert Notification API can receive alert requests from any event source to the IBM Alert Notification service, supporting hybrid cloud deployments. For more information, see the [API documentation][api_docs_url].

Before running this app, you will need an instance of the Alert Notification service (note that this is a paid service).  For instructions, please refer to [this video][setup_video_url].


## Running the app on Bluemix

1. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool

2. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/alert-notification-helloworld.git
  ```

3. `cd` into this newly created directory

4. Open the `manifest.yml` file and change the `host` value to something unique.

  The host you choose will determine the subdomain of your application's URL:  `<host>.mybluemix.net`

5. Connect to Bluemix in the command line tool and follow the prompts to log in

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

  If asked to select a space, select the one that contains your Alert Notification instance.

6. Confirm that you are in the correct space with:

  ```
  cf services
  ```

  You should see your Alert Notification instance listed.  Make a note of the instance name.

7. Push the app to Bluemix.

  ```
  $ cf push AlertNotificationSampleApp
  ```

  When the command finishes, you should see the `<host>.mybluemix.net` URL in the output.  This will be the URL at which you can access the sample app.

8. Bind the Alert Notification service to the app, where `<instance_name>` is the name from Step 6.
  ```
  $ cf bind-service AlertNotificationSampleApp "<instance_name>"
  ```

9. Access the app at the URL from Step 7, and press the button to send an alert!


## Run the app locally

1. [Install Node.js][install_node_url]

2. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/alert-notification-helloworld.git
  ```

3. cd into the app directory

4. Edit `config.js` and fill in your Alert Notification instance name, username and password:

  ```
  var defaults = {
      <instance_name>: {
          url: 'https://ibmnotifybm.mybluemix.net/api/alerts/v1',
          name: '<your_username>',
          password: '<your_password>',
      }
  }
  ```
  This will allow the starter app to authenticate with Alert Notification and send alerts.

5. Run `npm install` to install the app's dependencies

6. Run `npm start` to start the app

7. Access the running app in a browser at the address specified by the terminal output, e.g.:
  ```
  Server starting on http://localhost:6001
  ```

8. Press the button to send an alert!  Try modifying the code in app.js to change the content, source, and severity of the alert.

[install_node_url]: https://nodejs.org/en/download/
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
[api_docs_url]: https://ibmnotifybm.mybluemix.net/docs/alerts/v1/
[setup_video_url]: https://www.youtube.com/watch?v=MgtbDXvLIqM
