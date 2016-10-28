/**
 * Created by jitender choudhary on 10/28/2016.
 */
	var amqp = require('amqplib/callback_api');	
	var exports = module.exports = {};
	var fuseConfig = require('../config/configuration');
	var logger = require('./LoggingConfig');
	
	exports.serve = function(transaction){
		console.log('MessageClient:',transaction.name);
		amqp.connect(fuseConfig.messageQueueURL, function(err, conn) {
		  conn.createChannel(function(err, ch) {
		    var q = 'fusionPremerge';
		    ch.assertQueue(q, {durable: true});
		    ch.sendToQueue(q, new Buffer(JSON.stringify(transaction)), {persistent: true});
		    console.log(" Message Posted to queue ", transaction);
		  });
		});
	};
	

