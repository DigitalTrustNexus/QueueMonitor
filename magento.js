var fs = require("fs");
var http = require('http');
var deasync = require('deasync');

/*
 * get admin token
 */
module.exports.get_admintoken = function(magentoHeader, magentoOptions, magentoAdminCredentials) {
    console.log("get admin token...");
    magentoOptions['path'] = '/market/index.php/rest/V1/integration/admin/token';
    magentoOptions['method'] = 'POST';

    var user = JSON.stringify(JSON.parse(fs.readFileSync(magentoAdminCredentials)));
    var admintoken = null;
    var adminTokenRequest = http.request(magentoOptions, function (res) {
        var msg = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            msg += chunk;
        });
        res.on('end', function () {
            admintoken = JSON.parse(msg);
            //console.log('AdminToken = ' + admintoken);
        });
    });
    adminTokenRequest.write(user);
    adminTokenRequest.end();
    while (admintoken == null) {
        deasync.sleep(50);
    }

    return admintoken;
}

/*
 * get orders in the store
 */
module.exports.get_orders = function(magentoHeader, magentoOptions, admintoken, curid) {
    console.log("get orders ...");
    //magentoOptions['path'] = '/market/index.php/rest/V1/orders?searchCriteria';
    magentoOptions['path'] = '/market/index.php/rest/V1/orders?searchCriteria[filter_groups][0][filters][0][field]=entity_id&searchCriteria[filter_groups][0][filters][0][value]=' + curid + '&searchCriteria[filter_groups][0][filters][0][condition_type]=gt';
    magentoOptions['method'] = 'GET';
    magentoHeader['Authorization'] = 'Bearer ' + admintoken;
    magentoOptions['headers'] = magentoHeader;
    var orders = null;
    var orderRequest = http.request(magentoOptions, function (res) {
        var msg = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            msg += chunk;
        });
        res.on('end', function () {
            orders = JSON.parse(msg);
        });
    });
    orderRequest.write("user");
    orderRequest.end();
    while (orders == null) {
        deasync.sleep(50);
    }
    return orders;
}

/*
 * get product info 
 */
module.exports.get_product = function(magentoHeader, magentoOptions, admintoken, product_id) {
    console.log("get product ...");
    magentoOptions['path'] = '/market/index.php/rest/V1/products/' + product_id;
    magentoOptions['method'] = 'GET';
    magentoHeader['Authorization'] = 'Bearer ' + admintoken;
    magentoOptions['headers'] = magentoHeader;
    var prod = null;
    var prodRequest = http.request(magentoOptions, function (res) {
        var msg = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            msg += chunk;
        });
        res.on('end', function () {
            prod = JSON.parse(msg);
        });
    });
    prodRequest.write("user");
    prodRequest.end();
    while (prod == null) {
        deasync.sleep(300);
    }
    return prod;
}

/*
 * change order status to complate
 */
module.exports.complete_order = function(magentoHeader, magentoOptions, admintoken, order_id) {
    magentoOptions['path'] = '/market/index.php/rest/V1/order/' + order_id + '/invoice';
    magentoOptions['method'] = 'POST';
    magentoHeader['Authorization'] = 'Bearer ' + admintoken;
    magentoOptions['headers'] = magentoHeader;
    var params = JSON.stringify({"statusHistory":{"comment":"test", "status":"Complete"}});
    var result = null;
    var orderCompleteRequest = http.request(magentoOptions, function (res) {
        var msg = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            msg += chunk;
        });
        res.on('end', function () {
            result = JSON.parse(msg);
            console.log('Result = ' + result);
        });
    });
    orderCompleteRequest.write(params);
    orderCompleteRequest.end();
    while (result == null) {
        deasync.sleep(50);
    }
    return;
}

