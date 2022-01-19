'use strict';

const AWS = require('aws-sdk');
const REGION = process.env.REGION;
const CAKE_PRODUCER_EMAIL = process.env.CAKE_PRODUCER_EMAIL;
const CAKE_ORDER_EMAIL = process.env.CAKE_ORDER_EMAIL;
const ses = new AWS.SES({ region: REGION });

module.exports.handlePlacedOrder = order => {
  const params = {
    Source: CAKE_ORDER_EMAIL,
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
    }
  }
  
  console.log('AWS Region:', REGION);
  console.log('Sending email with the following params:', params);
  console.log('Order Info:', JSON.stringify(order))
  
  return ses.sendEmail(params).promise();
}

