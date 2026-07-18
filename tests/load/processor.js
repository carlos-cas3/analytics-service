const crypto = require('crypto');

function setEventId(context, events, done) {
  context.vars.event_id = crypto.randomUUID();
  context.vars.aggregate_id = `user-${crypto.randomUUID().slice(0, 8)}`;
  done();
}

module.exports = { setEventId };
