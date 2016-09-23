	var amqp = require('amqplib/callback_api');	
	var exports = module.exports = {};
	var fuseConfig = require('../config/configuration');
	
	exports.serve = function(transaction){
		console.log('MessageClient:',transaction.name);
		console.log('MessageClient:',transaction.email);
		console.log("***************************");

		amqp.connect(fuseConfig.messageQueueURL, function(err, conn) {
		  conn.createChannel(function(err, ch) {
		    var q = 'fusionPremerge';
		    var msg = 'Hello Jitender Here :)';

		    ch.assertQueue(q, {durable: true});
		    ch.sendToQueue(q, new Buffer(JSON.stringify(transaction)), {persistent: true});
		    console.log(" [x] Sent '%s'", msg);
		  });
		  setTimeout(function() { conn.close();  }, 500);
		});
	};
	

