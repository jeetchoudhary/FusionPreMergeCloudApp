/**
 * Created by jitender choudhary on 10/28/2016.
 */

"use strict";
var amqp = require('amqplib/callback_api');
var fuseConfig = require('../config/configuration');
var processTimeout;
var mongoose = require('mongoose');
var Databases = require('../app/models/DBData');
var logger = require('./LoggingConfig');
mongoose.Promise = global.Promise;
mongoose.connect(fuseConfig.dburl);
var db = mongoose.connection;
db.once('open', function () {
	console.log('Server : Process Request is connected to the database ');
});

var serveRequest = function (transaction) {
    console.log('Posting request to process premerge for transaction :', transaction.name);
    amqp.connect(fuseConfig.messageQueueURL, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'fusionPremerge';
            ch.assertQueue(q, { durable: true });
            ch.sendToQueue(q, new Buffer(JSON.stringify(transaction)), { persistent: true });
            console.log("Message Posted to queue ", transaction);
        });
    });
};

var checkParticularDBAvaliablityandProcess = function (transaction) {
    var query = { "connectionString": transaction.dbString };
    transaction.DBServerUsed = transaction.dbString;
    console.log('checkParticularDBAvaliablityandProcess() request received');
    Databases.find(query).lean().exec(function (err, dbData) {
        if (err) {
            console.error('error occured while fetching Currently avaliable Databases : ', err);
        }
        else if (dbData.length > 0) {
            var db = dbData[0];
            if (db.currentStatus !== 'USED') {
                Databases.findOneAndUpdate({ 'alias': db.alias }, { "currentStatus": 'USED' }, { upsert: false }, function (err, doc) {
                    if (err) {
                        console.error('Unable to update the row for the DB String  ' + transaction.dbString, err);
                    } else {
                        console.log('Locked Database for the Junits : ', transaction.dbString);
                        clearTimeout(processTimeout);
                        serveRequest(transaction);
                    }
                });
            }
        }
        else {
            clearTimeout(processTimeout);
            serveRequest(transaction);
        }
    });
};

var checkAnyDBAvaliablityandProcess = function (transaction) {
    var query = { "currentStatus" : "UNUSED"};
    console.log('checkAnyDBAvaliablityandProcess() request received');
    Databases.find(query, function (err, dbData) {
       console.log('call back from db received : ',dbData);
		if (err) { console.error('error occured while fetching Currently avaliable Databases : ', err); }
        else if (dbData.length > 0)
         {
            var db = dbData[0];
            console.log('updating status for the database : ',db.connectionString);
            Databases.findOneAndUpdate({ 'alias': db.alias }, { "currentStatus": 'USED' }, { upsert: false }, function (err, doc) {
                if (err) {
                    console.error('Unable to update the row for the DB String  ' + transaction.dbString, err);
                } else {
                    console.log('Locked Database for the Junints : ', transaction.dbString);
                    clearTimeout(processTimeout);
                    transaction.DBServerUsed = db.connectionString;
                    serveRequest(transaction);
                }
            });
        }
		});
};

var processSubmitRequest = function (transaction) {
    var transaction = JSON.parse(transaction);
    var dbSplitIndex = transaction.dbString.indexOf('@') + 1;
    var dbDomain = transaction.dbString.substring(dbSplitIndex, dbSplitIndex + 3);
    var adeDomain = transaction.adeServerUsed.substring(0, 3);
    if (dbDomain !== adeDomain) {
        transaction.remark = 'DB and ADE Server are in Different Zone';
    }
    console.log('transaction.runJunits : ',transaction.runJunits );
    console.log('transaction.allowDBOverride : ',transaction.allowDBOverride );
    if (transaction.runJunits === 'Y') {
        if (transaction.allowDBOverride === 'N'){
        	processTimeout = setInterval(checkParticularDBAvaliablityandProcess, 1000*30 , transaction);
        }         
        else{
        	processTimeout = setInterval(checkAnyDBAvaliablityandProcess, 1000*30 , transaction);
        }     
    }
    else {
         transaction.DBServerUsed = transaction.dbString;
         serveRequest(transaction);
    }
};

processSubmitRequest(process.argv[2]);