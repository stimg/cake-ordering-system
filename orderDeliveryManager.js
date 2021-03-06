'use strict';

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: process.env.REGION });
const orderManager = require('./orderManager');
const db = require('./dbHelper');

const DELIVERY_COMPANY_QUEUE = process.env.DELIVERY_COMPANY_QUEUE;

module.exports.handleOrderDelivery = order => {
  order.deliveryDate = Date.now();
  const params = {
    MessageBody: JSON.stringify(order),
    QueueUrl: DELIVERY_COMPANY_QUEUE
  }
  
  return Promise.all([
    db.saveOrder(order),
    sqs.sendMessage(params).promise()
  ]);
}
