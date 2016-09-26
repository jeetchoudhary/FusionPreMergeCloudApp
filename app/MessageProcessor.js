"use strict";
var amqp = require('amqplib/callback_api');
var fuseConfig = require('../config/configuration');
const child_process = require('child_process');
var TransData = require('../app/models/TransData');

var updateTransactionStatus = function(transaction,status){
    var query = {"name" : transaction.name};
	if(status==="Running"){
        TransData.findOneAndUpdate(query,{ "currentStatus" : status , "starttime" : Date.now()}, {upsert:false}, function(err, doc){
	    if (err) 
	    	console.error('Unable to update the row for the transaction '+transaction.name,err);
	    else
	    	console.log('update row for transaction , will start PreMerge process on the transaction :',transaction.name);
	});
    }else if(status==="Archived"){
         TransData.findOneAndUpdate(query,{ "currentStatus" : status , "endtime" : Date.now()}, {upsert:false}, function(err, doc){
	    if (err) 
	    	console.error('Unable to update the row for the transaction '+transaction.name,err);
	    else
	    	console.log('update row for transaction , will start PreMerge process on the transaction :',transaction.name);
	});
    }	
};

amqp.connect(fuseConfig.messageQueueURL, function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue(fuseConfig.transactionMessageQueue, { durable: true });
        console.log("Waiting for messages in : ", fuseConfig.transactionMessageQueue);
        ch.consume(fuseConfig.transactionMessageQueue, function (msg) {
            console.log("Request Arrived , will now process request :", msg.content.toString());
            updateTransactionStatus(JSON.parse(msg.content.toString()),'Running');
            child_process.fork(__dirname+"/commandProcess.js", [msg.content.toString()],{ execArgv: ['--debug=5859'] });
        }, { noAck: true });
    });
});