require('dotenv').config();
const debug = require('debug')('hue-notification-ws');
const _ = require('lodash');
const equal = require('fast-deep-equal');

const { parseBoolean, parseNumber, parseString } = require('./config');
const { init: initApiClient } = require('./hue-api-client');
const { init: initWs } = require('./ws/server');
const { composeChangeMessage } = require('./message/factory');

const bridgeConfig = {
  host: parseString(process.env.HUE_HOST, 'localhost'),
  port: parseNumber(process.env.HUE_PORT, 80),
  user: parseString(process.env.HUE_USERNAME),
  ssl: parseBoolean(process.env.HUE_USE_SSL, false),
};

const pollingConfig = {
  lights: parseBoolean(process.env.POLL_LIGHTS, true),
  groups: parseBoolean(process.env.POLL_GROUPS, true),
  sensors: parseBoolean(process.env.POLL_SENSORS, true),
  interval: parseNumber(process.env.POLL_INTERVAL_SECONDS, 2), // Seconds
};
const websocketServerConfig = {
  host: parseString(process.env.WEBSOCKET_SERVER_HOST, 'localhost'),
  port: parseNumber(process.env.WEBSOCKET_SERVER_PORT, 7000),
};

const wss = initWs(websocketServerConfig);
const api = initApiClient(bridgeConfig);

debug('Connecting to Hue using settings:', bridgeConfig);
debug('Polling using settings:', pollingConfig);
debug('Websocket server using settings:', websocketServerConfig);
debug('Starting...');

const states = {
  lights: {},
  groups: {},
  sensors: {},
};

const poll = async () => {
  const {
    lights, groups, sensors, interval,
  } = pollingConfig;

  debug(`Polling - Lights: ${lights}, Groups: ${groups}, Sensors: ${sensors}`);

  const resources = [
    lights ? 'lights' : null,
    groups ? 'groups' : null,
    sensors ? 'sensors' : null,
  ].filter(el => el); // filter out null elements

  try {
    const responses = await Promise.all(resources.map(resource => api.get(`/${resource}`)));

    resources.map((resourceType, index) => {
      debug(`- Checking ${resourceType}`);

      const apiResponseKeyToDiff = resourceType === 'groups' ? 'action' : 'state';

      const apiResponse = responses[index].data;

      if (!_.isPlainObject(apiResponse)) {
        console.error('  Wrong response type received - Skipping', apiResponse);
        return false;
      }

      _.forEach(apiResponse, (newState, resourceId) => {
        try {
          const oldState = states[resourceType][resourceId];

          if (!oldState) {
            debug(`Resource "${resourceType}/${resourceId}" not found on local state; cannot diff, will move on`);
            return;
          }

          if (!equal(oldState[apiResponseKeyToDiff], newState[apiResponseKeyToDiff])) {
            debug(`  ${resourceType}/${resourceId} has a different state. Firing a notification message`);

            const message = composeChangeMessage(resourceType, resourceId, { ...newState.state, ...newState.action });
            wss.broadcast(JSON.stringify(message));
          }
        } catch (e) {
          console.error(e);
        }
      });


      // Save current state
      states[resourceType] = apiResponse;

      return true;
    });
  } catch (e) {
    console.error(e);
  }

  debug(`Waiting ${interval} seconds before polling again`);
  setTimeout(poll, interval * 1000);
};

poll();
