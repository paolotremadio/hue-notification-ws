// See https://dresden-elektronik.github.io/deconz-rest-doc/websocket/

const composeChangeMessage = (resource, id, state) => ({
  t: 'event',
  e: 'changed',
  r: resource,
  id,
  state,
});
module.exports = { composeChangeMessage };
