var express = require('express');
const util = require('util');
var promise = require('bluebird');
var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var url = 'localhost';
var port = '5432';
var connectionString = 'postgres://CheckPasswordMrg:CheckPasswordMrg@' + url +':' + port + '/CheckPasswordMrg';
var db = pgp(connectionString);

module.exports.put_info = function (id, status, percentcomplete, sku, price, dimension1, dimension2, dimension3, ordernumber, location) {
    console.log("put into " + sku);

    db.any('insert into queue(id, status, percentcomplete, sku, price, dimension1, dimension2, dimension3, ordernumber, location)' 
             +  'values (' + id + ','  + '\'' + status + '\'' + ',' + percentcomplete + ',' 
             + '\'' + sku + '\'' + ',' + price + ',' + dimension1 + ',' + dimension2 + ',' + dimension3 + ',' 
             + '\'' + ordernumber + '\'' + ',' + '\'' + location + '\');')
        .then(function (data) {
        console.error(data);
    });
}

