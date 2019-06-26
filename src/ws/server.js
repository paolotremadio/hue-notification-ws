const WebSocket = require('ws');

const init = ({ host, port }) => {
  const wss = new WebSocket.Server({
    host,
    port,
  });

  wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  return wss;
};

module.exports = { init };
