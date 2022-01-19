'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.ORDER_TABLE_NAME;

const getOrder = async orderId => {
  const res = await dynamo.get({
    TableName: TABLE_NAME,
    Key: { orderId: orderId }
  }).promise();
  return res.Item;
}

const saveOrder = order =>
  dynamo.put({
    TableName: TABLE_NAME,
    Item: order
  }).promise();

module.exports = {
  getOrder: getOrder,
  saveOrder: saveOrder
}
