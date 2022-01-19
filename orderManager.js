'use strict';

const { v1: uuidv1 } = require('uuid');
const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis();
const db = require('./dbHelper');

const STREAM_NAME = process.env.ORDER_STREAM_NAME;

module.exports.createOrder = body => ({
  orderId: uuidv1(),
  name: body.name,
  address: body.address,
  quantity: body.quantity,
  productId: body.productId,
  orderDate: Date.now(),
  eventType: 'order_place'
});

const putOrderIntoStream = order => {
  return kinesis.putRecord({
    Data: JSON.stringify(order),
    PartitionKey: order.orderId,
    StreamName: STREAM_NAME
  }).promise();
}

module.exports.placeNewOrder = order => db.saveOrder(order).then(() => putOrderIntoStream(order));

module.exports.fulfillOrder = async body => {
  const order = await db.getOrder(body.orderId);
  
  order.fulfillmentDate = Date.now();
  order.fulfillmentId = body.fulfillmentId;
  order.eventType = 'order_fulfilled';
  
  console.log('Order to save:', order);
  return db.saveOrder(order).then(() => {
    return putOrderIntoStream(order).then(() => order);
  }).catch(err => console.log('ERROR:', err));
}
