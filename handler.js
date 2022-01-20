'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper');
const cakeProducerManager = require('./cakeProducerManager');
const orderDeliveryManager = require('./orderDeliveryManager');
const customerServiceManager = require('./customerServiceManager');

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

module.exports.orderDelivered = async event => {
  const payload = JSON.parse(event.body);
  return customerServiceManager.handleOrderDelivered(payload)
                             .then(order => createResponse(200, `Order ${payload.orderId} successfully delivered by ${payload.deliveryCompanyId}` ))
                             .catch(err => createResponse(err.statusCode, err));
}

module.exports.notifySuppliers = async event => {
  // console.log('Got kinesis event:', JSON.stringify(event));
  const promises = [];
  const orders = kinesisHelper.getRecords(event);
  
  console.log('Orders list:', orders);
  orders.forEach(o => {
    if (o.eventType === 'order_place') {
      promises.push(cakeProducerManager.handlePlacedOrder(o));
    }
    if (o.eventType === 'order_fulfilled') {
      promises.push(orderDeliveryManager.handleOrderDelivery(o));
    }
  });

  console.log('Promises num:', promises.length);
  return Promise.all(promises).then(() => {
    console.log('All went well!');
  }).catch(err => console.log(err));
}

module.exports.notifyDeliveryCompany = async event => {
  console.log('Delivery company notified!');
}

module.exports.notifyCustomerService = async event => {
  console.log('Customer service notified!');
}
