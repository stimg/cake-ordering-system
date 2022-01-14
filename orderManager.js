'use strict';

const { v1: uuidv1 } = require('uuid');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const kinesis = new AWS.Kinesis();

const TABLE_NAME = process.env.ORDER_TABLE_NAME;
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

const getOrder = async orderId =>
  await dynamo.get({
    TableName: TABLE_NAME,
    Key: { orderId: orderId }
  }).promise().then(result => result.Item);

const saveOrder = order => {
  return dynamo.put({
    TableName: TABLE_NAME,
    Item: order
  }).promise();
}

const putOrderIntoStream = order => {
  return kinesis.putRecord({
    Data: JSON.stringify(order),
    PartitionKey: order.orderId,
    StreamName: STREAM_NAME
  }).promise();
}

module.exports.placeNewOrder = order => saveOrder(order).then(() => putOrderIntoStream(order));

module.exports.fulfillOrder = async body => {
  const order = await getOrder(body.orderId);
  console.log('Got an order:', order);
  
  order.fulfillmentDate = Date.now();
  order.fulfillmentId = body.fulfillmentId;
  order.eventType = 'order_fulfilled';
  
  return saveOrder(order).then(() => {
    return putOrderIntoStream(order).then(() => order);
  }).catch(err => console.log('ERROR:', err));
}
