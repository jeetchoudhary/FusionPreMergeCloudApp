"use strict";
var amqp = require('amqplib/callback_api');
var fuseConfig = require('../config/configuration');
const child_process = require('child_process');

amqp.connect(fuseConfig.messageQueueURL, function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue(fuseConfig.transactionMessageQueue, { durable: true });
        console.log("Waiting for messages in : ", fuseConfig.transactionMessageQueue);
        ch.consume(fuseConfig.transactionMessageQueue, function (msg) {
            console.log("Request Arrived , will now process request :", msg.content.toString());
            var transaction = JSON.parse(msg.content.toString());
            child_process.fork(__dirname+"/commandProcess.js", [transaction],{ execArgv: ['--debug=5859'] });
        }, { noAck: true });
    });
});