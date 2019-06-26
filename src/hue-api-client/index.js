const https = require('https');
const axios = require('axios');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const init = ({
  host, port, user, ssl,
}) => {
  const protocol = ssl ? 'https' : 'http';
  const instance = axios.create({
    baseURL: `${protocol}://${host}:${port}/api/${user}`,
    httpsAgent,
    timeout: 5000,
  });

  return {
    get: async resource => instance.get(resource),
  };
};

module.exports = { init };
