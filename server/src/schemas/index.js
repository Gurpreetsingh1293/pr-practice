const authSchemas = require('./authSchema');
const shgSchemas = require('./shgSchema');
const productSchemas = require('./productSchema');
const orderSchemas = require('./orderSchema');
const adminSchemas = require('./adminSchema');

module.exports = {
  ...authSchemas,
  ...shgSchemas,
  ...productSchemas,
  ...orderSchemas,
  ...adminSchemas,
};
