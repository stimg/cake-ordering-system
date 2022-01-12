'use strict';

const AWS = require('aws-sdk');
const { notifyCakeProducer } = require('./handler');
const ses = new AWS.SES({
  region: process.env.region
});

const CAKE_PRODUCER_EMAIL = process.env.cakeProducerEmail;
const CAKE_ORDER_EMAIL = process.env.cakeOrderEmail;

const notifyCakeProducerByEmail = order => {
  const params = {
    Destination: {
      ToAddresses: [CAKE_PRODUCER_EMAIL]
    },
    Message: {
      Subject: {
        Data: 'New order placement'
      },
      Body: {
        Text: {
          Data: JSON.stringify(order)
        }
      }
    },
    Source: CAKE_ORDER_EMAIL
  }
  
  console.log('Sending email with the following params:', params);
  
  return ses.sendEmail(params)
     .promise()
     .then(data => {
       console.log('Email for order %s is sent', order.orderId)
       return data;
     })
     .catch(err => err)
}

module.exports.handlePlacedOrders = placedOrders => {
  const promises = [];
  
  placedOrders.forEach(o => {
    const p = notifyCakeProducerByEmail(o);
    promises.push(p);
  });
  
  console.log('Promises created:', promises);
  return Promise.all(promises);
}

