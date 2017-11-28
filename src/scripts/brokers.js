#!/usr/bin/env node
'use strict';

/*
 * Tool to perform operations against the integration controller.
 *
 * Commands include: help, register, retrieve, update, remove
 */

const commandLineCommands = require('command-line-commands');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const request = require('superagent');

const argDef = {
  retrieve: [
    { name: 'name', alias: 'n', type: String, description: 'Broker name to register with controller' },
    { name: 'registry', alias: 'r', type: String, description: 'Cloud event management integration controller broker registry api url' },
    { name: 'token', alias: 't', type: String, description: 'Bluemix cloud foundry user bearer token' }
  ],
  register: [
    { name: 'auth', alias: 'a', type: String, multiple: true, defaultValue: [], description: 'Authorized user ID' },
    { name: 'name', alias: 'n', type: String, description: 'Broker name to register with controller' },
    { name: 'registry', alias: 'r', type: String, description: 'Cloud event management integration controller broker registry api url' },
    { name: 'token', alias: 't', type: String, description: 'Bluemix cloud foundry user bearer token' },
    { name: 'url', alias: 'u', type: String, description: 'Broker url to register with controller' },
    { name: 'visibility', alias: 'v', type: String, multiple: true, defaultValue: [ '*' ], description: 'Subscription or tenant ids which integrations are visible' }
  ],
  remove: [
    { name: 'name', alias: 'n', type: String, description: 'Broker name to register with controller' },
    { name: 'registry', alias: 'r', type: String, description: 'Cloud event management integration controller broker registry api url' },
    { name: 'token', alias: 't', type: String, description: 'Bluemix cloud foundry user bearer token' }
  ],
  update: [
    { name: 'auth', alias: 'a', type: String, multiple: true, defaultValue: [], description: 'Authorized user ID' },
    { name: 'name', alias: 'n', type: String, description: 'Broker name to register with controller' },
    { name: 'registry', alias: 'r', type: String, description: 'Cloud event management integration controller broker registry api url' },
    { name: 'token', alias: 't', type: String, description: 'Bluemix cloud foundry user bearer token' },
    { name: 'url', alias: 'u', type: String, description: 'Broker url to register with controller' },
    { name: 'visibility', alias: 'v', type: String, multiple: true, defaultValue: [ '*' ], description: 'Subscription or tenant ids which integrations are visible' }
  ],
};

const argData = {
  null: {
    usage: [
      {
        header: 'brokers.js',
        content: 'Manage CEM integration brokers'
      },
      {
        header: 'synopsis',
        content: '$ brokers.js <command> <options>'
      },
      {
        header: 'Command List',
        content: [
          { name: 'help', summary: 'Display help information.' },
          { name: 'register', summary: 'Register a new CEM integration broker.' },
          { name: 'remove', summary: 'Delete a CEM integration broker.' },
          { name: 'retrieve', summary: 'Retrieve an existing CEM integration broker.' },
          { name: 'update', summary: 'Update and refresh the CEM integration broker.' }
        ]
      }
    ]
  },
  help: {
    definitions: [
      { name: 'topic', type: String, description: 'the topic to display help on', defaultOption: true }
    ],
    usage: [
      {
        header: 'brokers.js help',
        content: 'Get help about an action'
      },
      {
        header: 'synopsis',
        content: '$ brokers.js help --topic <command>'
      },
      {
        header: 'commands',
        content: 'register, remove, retrieve, update'
      }
    ]
  },
  remove: {
    definitions: argDef.remove,
    usage: [
      {
        header: 'action',
        content: 'Remove an existing CEM integration broker.'
      },
      {
        header: 'synopsis',
        content: '$ brokers.js remove <arguments>'
      },
      {
        header: 'arguments',
        optionList: argDef.remove
      }
    ]
  },
  register: {
    definitions: argDef.register,
    usage: [
      {
        header: 'action',
        content: 'Register a new CEM integration broker.'
      },
      {
        header: 'synopsis',
        content: '$ brokers.js register <arguments>'
      },
      {
        header: 'arguments',
        optionList: argDef.register
      }
    ]
  },
  retrieve: {
    definitions: argDef.retrieve,
    usage: [
      {
        header: 'action',
        content: 'Retrieve an existing CEM integration broker.'
      },
      {
        header: 'synopsis',
        content: '$ brokers.js retrieve <arguments>'
      },
      {
        header: 'arguments',
        optionList: argDef.retrieve
      }
    ]
  },
  update: {
    definitions: argDef.update,
    usage: [
      {
        header: 'action',
        content: 'Update an existing CEM integration broker.'
      },
      {
        header: 'synopsis',
        content: '$ brokers.js update <arguments>'
      },
      {
        header: 'arguments',
        optionList: argDef.update
      }
    ]
  }
};

const { command, argv } = commandLineCommands([ null, 'help', 'register', 'retrieve', 'update', 'remove' ]);
const options = commandLineArgs(argData[command].definitions, argv);
const usage = commandLineUsage(argData[command].usage);

function validateArgs(command, options) {
  if (!options.token || !options.registry || !options.name) {
    return false;
  } else if (command.toLowerCase() === 'register' && !options.url) {
    return false;
  } else if (command.toLowerCase() === 'update' && !options.url) {
    return false;
  }

  return true;
}

switch(command) {
  case null:
    console.log(usage);
    break;
  case 'help':
    if (options.topic) {
      console.log(commandLineUsage(argData[options.topic].usage))
    } else {
      console.log(commandLineUsage(argData.help.usage))
    }
    break;
  case 'register':
    if (!validateArgs(command, options)) {
      console.log(usage);
      process.exit(1);
    }

    request
      .post(`${options.registry}/api/integrations/v1/brokers`)
      .set('Authorization', options.token)
      .set('Accept', 'application/json')
      .send({
        authorized_users: options.auth,
        broker_url: options.url,
        name: options.name,
        visibilities: options.visibility.map(v => { return { tenant: v } })
      })
      .end((err, res) => {
        if (err || !res || !res.body) {
          console.log({err}, 'Error registering broker');
        } else {
          console.log(JSON.stringify(res.body, null, 2));
        }
    });
    break;
  case 'remove':
    if (!validateArgs(command, options)) {
      console.log(usage);
      process.exit(1);
    }
    request
      .del(`${options.registry}/api/integrations/v1/brokers/${options.name}`)
      .set('Authorization', options.token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err && err.status === 404) {
          console.log('Broker is not found');
        } else if (err) {
          console.log({err}, 'Error removing broker');
        } else {
          console.log('Success');
        }
      });
    break;
  case 'retrieve':
    if (!validateArgs(command, options)) {
      console.log(usage);
      process.exit(1);
    }

    request
      .get(`${options.registry}/api/integrations/v1/brokers/${options.name}`)
      .set('Authorization', options.token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err && err.status === 404) {
          console.log('Broker is not found');
        } else if (err || !res || !res.body) {
          console.log({err}, 'Error retrieving broker');
        } else {
          console.log(JSON.stringify(res.body, null, 2));
        }
      });
    break;
  case 'update':
    if (!validateArgs(command, options)) {
      console.log(usage);
      process.exit(1);
    }
    request
      .put(`${options.registry}/api/integrations/v1/brokers`)
      .set('Authorization', options.token)
      .set('Accept', 'application/json')
      .send({
        authorized_users: options.auth,
        broker_url: options.url,
        name: options.name,
        visibilities: options.visibility.map(v => { return { tenant: v } })
      })
      .end((err, res) => {
        if (err && err.status === 404) {
          console.log({err}, 'Broker is not found');
        } else if (err || !res || !res.body) {
          console.log({err}, 'Error updating broker');
        } else {
          console.log(JSON.stringify(res.body, null, 2));
        }
      });
  break;
}
