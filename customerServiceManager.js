'use strict';

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: process.env.REGION });
const db = require('./dbHelper');
const CUSTOMER_SERVICE_QUEUE = process.env.CUSTOMER_SERVICE_QUEUE;

module.exports.handleOrderDelivered = async ({ orderId, deliveryCompanyId, orderReview }) => {
  console.log('Order Id:', orderId);
  const order = await db.getOrder(orderId);
  
  order.deliveryCompanyId = deliveryCompanyId;
  order.orderReview = orderReview;
  
  const params = {
    MessageBody: JSON.stringify(order),
    QueueUrl: CUSTOMER_SERVICE_QUEUE
  }
  
  console.log('Sending message to queue with params:', params)
  return db.saveOrder(order).then(() =>
    sqs.sendMessage(params).promise()
  ).catch(err => console.log(err));
}
