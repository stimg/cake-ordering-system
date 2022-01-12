'use strict';

const orderManager = require('./orderManager');

const createResponse = (statusCode, message) => ({
  statusCode: statusCode,
  body: JSON.stringify(message)
})

module.exports.createOrder = async (event) => {
  
  const body = JSON.parse(event.body);
  const order = orderManager.createOrder(body);
  
  return orderManager.placeNewOrder(order)
                     .then(() => createResponse(200, order))
                     .catch(err => createResponse(err.statusCode, err))
};

module.exports.orderFulfilled = async event => {
  const body = JSON.parse(event.body);
  
  return orderManager.fulfillOrder(body)
                     .then(order => createResponse(200, order))
                     .catch(err => createResponse(err.statusCode, err));
}
