"use strict";
var amqp = require('amqplib/callback_api');
var fuseConfig = require('../config/configuration');
const child_process = require('child_process');
var TransData = require('../app/models/TransData');
var q = require('q');
var SSH = require('simple-ssh');

var parseTransactionData = function (input) {
	console.log('parsing transaction description data');
	var index = input.lastIndexOf("not found in ADE");
	if (index > 0) {
		var error = { "error": "Transaction Does Not exist" };
		return error;
	}
	var lines = input.split('\n');
	var baseLabelKeyword = 'BASE_LABEL';
	var bugNumKeyword = 'BUG_NUM';
	var transDescKeyword = 'ORAREVIEW_DESCRIPTION';
	var baseLabel = '';
	var bugNum = '';
	var transDesc = '';
	for (var i = 0; i < lines.length; i++) {
		if (baseLabel === '' || bugNum === '' || transDesc === '') {
			if (lines[i].includes(bugNumKeyword)) {
				bugNum = (lines[i].substring(lines[i].indexOf(':') + 1)).trim();
				console.log('bugNum : ', bugNum);
			}
			else if (lines[i].includes(transDescKeyword)) {
				transDesc = (lines[i].substring(lines[i].indexOf(':') + 1)).trim();
				console.log('transDesc : ', transDesc);
			}
			else if (lines[i].includes(baseLabelKeyword)) {
				baseLabel = lines[i].substring(lines[i].indexOf(baseLabelKeyword) + baseLabelKeyword.length + 1, lines[i].indexOf('X64') + 3);
				console.log('baseLabel : ', baseLabel);
			}
		} else
			break;
	}
	var transDescription = {
		"baseLabel": { "name": "Base Label for Transaction", "value": baseLabel },
		"bugNum": { "name": "Bug Number", "value": bugNum },
		"transDesc": { "name": "Transaction Description", "value": transDesc }
	};
	return transDescription;
};

var getTransactionDetails = function (command) {
	var op = "";
	var deferred = q.defer();
	command = "ade describetrans " + command;
	console.log('Server : Above to describe transaction', command);
	new SSH({
		host: fuseConfig.historyServerUrl,
		user: fuseConfig.adeServerUser,
		pass: fuseConfig.adeServerPass
	}).exec(command, {
		out: function (stdout) {
			op = op + stdout;
		},
		err: function (stderr) {
			console.error('failed to execute command desc', stderr);
			return;
		}
	}).exec('echo', {
		out: function (stdout) {
			var transactionDescData = parseTransactionData(op);
			deferred.resolve(transactionDescData);
		},
		err: function (stderr) {
			console.error('failed to execute command echo', stderr);
		}
	}).start();
	return deferred.promise;
};

amqp.connect(fuseConfig.messageQueueURL, function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue(fuseConfig.transactionMessageQueue, { durable: true });
        console.log("Waiting for messages in : ", fuseConfig.transactionMessageQueue);
        ch.consume(fuseConfig.transactionMessageQueue, function (msg) {
            console.log("Request Arrived , will now process request :", msg.content.toString());
            var transaction = JSON.parse(msg.content.toString());
			getTransactionDetails(transaction.name).then(function (newResponse) {
				console.log('new Response', newResponse);
				transaction.description = newResponse;
				//			  Need to uncomment it to debug the server  
				//            child_process.fork(__dirname+"/commandProcess.js", [JSON.stringify(transaction)],{ execArgv: ['--debug=5859'] });
				child_process.fork(__dirname + "/commandProcess.js", [JSON.stringify(transaction)], {});
			});
        }, { noAck: true });
    });
});