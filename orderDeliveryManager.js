'use strict';

module.exports.handleOrderDelivery = order =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Delivery for order # %s requested.', order.orderId);
      resolve(order);
    }, 1);
  })
