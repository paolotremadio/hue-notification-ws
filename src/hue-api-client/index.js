const https = require('https');
const axios = require('axios');
const Bottleneck = require('bottleneck');

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

  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 100,
    reservoir: 5, // initial value
    reservoirRefreshAmount: 5,
    reservoirRefreshInterval: 1000, // must be divisible by 250
  });

  const limitedGet = limiter.wrap(instance.get.bind(instance));

  return {
    get: async resource => limitedGet(resource),
  };
};

module.exports = { init };
