const userCreated = require('./auth/userCreated.handler');
const userStatusChanged = require('./auth/userStatusChanged.handler');
const loginFailed = require('./auth/loginFailed.handler');
const vendorCreated = require('./vendor/vendorCreated.handler');
const vendorStatusChanged = require('./vendor/vendorStatusChanged.handler');
const branchCreated = require('./vendor/branchCreated.handler');
const branchStatusChanged = require('./vendor/branchStatusChanged.handler');
const orderCreated = require('./ordered/orderCreated.handler');
const orderStatusChanged = require('./ordered/orderStatusChanged.handler');
const ticketCreado = require('./support/ticketCreado.handler');
const ticketAprobado = require('./support/ticketAprobado.handler');

const HANDLERS = {
  USER_CREATED: userCreated,
  USER_STATUS_CHANGED: userStatusChanged,
  LOGIN_SUCCESS: null,
  LOGIN_FAILED: loginFailed,
  VENDOR_CREATED: vendorCreated,
  VENDOR_UPDATED: null,
  VENDOR_STATUS_CHANGED: vendorStatusChanged,
  BRANCH_CREATED: branchCreated,
  BRANCH_STATUS_CHANGED: branchStatusChanged,
  STAFF_CREATED: null,
  STAFF_UPDATED: null,
  STAFF_STATUS_CHANGED: null,
  ORDER_CREATED: orderCreated,
  ORDER_STATUS_CHANGED: orderStatusChanged,
  TICKET_CREADO: ticketCreado,
  TICKET_APROBADO: ticketAprobado,
};

module.exports = { HANDLERS };
