'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper');
const cakeProducerManager = require('./cakeProducerManager');
const orderDeliveryManager = require('./orderDeliveryManager');

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

module.exports.notifySuppliers = async event => {
  // console.log('Got kinesis event:', JSON.stringify(event));
  const promises = [];
  const orders = kinesisHelper.getRecords(event);
  
  orders.forEach(o => {
    if (o.eventType === 'order_place') {
      promises.push(cakeProducerManager.handlePlacedOrder(o));
    }
    if (o.eventType === 'order_fulfilled') {
      promises.push(orderDeliveryManager.handleOrderDelivery(o));
    }
  });

  Promise.all(promises).then(() => {
    console.log('All went well!');
  })
}
