var http = require('http');
var request = require('sync-request');
var deasync = require('deasync');
var createtx = require("./create_tx.js");

module.exports.make_payment = function(magentoHeader, magentoOptions, price, orderID) {
    var invoicePut = {
        'name': '',
        'email': '',
        'orderid': orderID,
        'price':price
    };

    var res = request('POST', 'http://ec2-18-224-91-77.us-east-2.compute.amazonaws.com:18322/invoice', {
        json: invoicePut,
    });
    //var msgJSON = JSON.parse(res.getBody('utf8'));
    //var bitpayURL = JSON.stringify(msgJSON.url).replace(/\"/g, "");
    var bitpayURL = res.getBody('utf8');

    console.log("create transaction... " + bitpayURL);
    createtx.set_payment(bitpayURL);
}
