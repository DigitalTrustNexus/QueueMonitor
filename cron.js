var cron = require('node-cron');
var magento = require("./magento.js");
var psql = require("./psql.js");
var pay = require("./payment.js");
var magentoServerURL = process.env.magentoServer;
var magentoServerPort = process.env.magentoPort;
var magentoAdminCredentials = "./magentoAdminCredentials.json";
var magentoOptions = new Object();
var magentoHeader = new Object();

magentoHeader['Content-Type'] = 'application/json';
magentoOptions['host'] = magentoServerURL;
magentoOptions['port'] = magentoServerPort;
magentoOptions['headers'] = magentoHeader;

var admintoken;
var orders;
admintoken = magento.get_admintoken(magentoHeader,magentoOptions,magentoAdminCredentials);
var id = "";
var processing = 0;

cron.schedule('*/10 * * * * *', function () {
   if (processing == 0){
      if (id == "") orderid = 134; 
      else orderid = id;
      orders = magento.get_orders(magentoHeader,magentoOptions,admintoken, orderid);
      console.log('Result Order = ' + orders.items.length);
      var cid = orders.items.length;
      if (cid > 0) {
          if (id == "") {
            id = orders.items[cid-1].items[0].order_id;
            console.log("get id = " + id);
          } else {
            id = orders.items[0].items[0].order_id;
   	    parse_order(orders.items[0]);
          }
      }
   }
});

cron.schedule('55 * * * * *', function () {
   admintoken = magento.get_admintoken(magentoHeader,magentoOptions,magentoAdminCredentials);
   console.log("admin token = " + admintoken);
});

function parse_order(order) {
   processing = 1;
   console.log('parse order time = ' + order.created_at);
   console.log('order_id = ' + order.items[0].order_id);
   console.log('item_id = ' + order.items[0].item_id);
   console.log('sku = ' + order.items[0].sku);
   console.log('product id = ' + order.items[0].product_id);
   console.log('price = ' + order.items[0].price);
   console.log('name1 = ' + order.items[0].name);
   console.log('location = ' + order.billing_address.city);

   product = magento.get_product(magentoHeader,magentoOptions,admintoken, order.items[0].sku);
   var d1, d2, d3, i;
   console.log('product = ' + product.custom_attributes.length);
   for (i = 0; i < product.custom_attributes.length; i ++){
          if (product.custom_attributes[i].attribute_code == 'd1'){
              d1 = parseFloat(product.custom_attributes[i].value);
          }
          if (product.custom_attributes[i].attribute_code == 'd2'){
              d2 = parseFloat(product.custom_attributes[i].value);
          }
          if (product.custom_attributes[i].attribute_code == 'd3'){
              d3 = parseFloat(product.custom_attributes[i].value);
          }
   }

   var order_id = order.items[0].order_id;
   var price = order.items[0].price;

   console.log('d1 = ' + d1 + " " + d2 + " " +d3);
   psql.put_info(order.items[0].item_id, 'queued', 0, order.items[0].name, order.items[0].price, d1, d2, d3, order.items[0].item_id, order.billing_address.city);
   
   pay.make_payment(magentoHeader,magentoOptions, price, order_id);
   magento.complete_order(magentoHeader,magentoOptions,admintoken, order_id);

   processing = 0;
} 
