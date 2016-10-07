"use strict";
var amqp = require('amqplib/callback_api');
var SSH = require('simple-ssh');
var fuseConfig = require('../config/configuration');
var fs = require('fs');
var TransData = require('../app/models/TransData');
var mongoose = require('mongoose');
var scpClient = require('scp2');
var CC = 'jitender.k.kumar@oracle.com';
const exec = require('child_process').exec;
mongoose.Promise = global.Promise;
mongoose.connect(fuseConfig.dburl);
var db = mongoose.connection;
var mailSubject = '"FusionPrcCloud-premerge Validation Complete"';

db.once('open', function () {
	console.log('Server : Child process is connected to the database ');
});

var updateTransactionStatus = function (transaction, status, logFile) {
	var query = '';
	if (status === "Running") {
		query = { "name": transaction.name ,"currentStatus": "Queued" };
        TransData.findOneAndUpdate(query, { "currentStatus": status, "starttime": Date.now(), "logFileName": logFile }, { upsert: false }, function (err, doc) {
			if (err)
				console.error('Unable to update the row for the transaction ' + transaction.name, err);
			else
				console.log('update row for transaction , will start PreMerge process on the transaction :', transaction.name);
		});
    } else if (status === "Archived") {
		query = { "name": transaction.name,"currentStatus": "Running" };
		TransData.findOneAndUpdate(query, { "currentStatus": status, "endtime": Date.now(), "logFileName": logFile }, { upsert: false }, function (err, doc) {
			if (err)
				console.error('Unable to update the row for the transaction ' + transaction.name, err);
			else
				console.log('update row for transaction , will start PreMerge process on the transaction :', transaction.name);
		});
    }
};

var updateTransactionErrorStatus = function (transaction,logFile) {
	logFile = fuseConfig.transactionArchivedLogLocation + logFile;
	var query = { "name": transaction.name , "currentStatus": "Queued" };
	TransData.findOneAndUpdate(query, { "currentStatus": "Archived", "starttime": Date.now(), "endtime": Date.now(), "premergeOutput": transaction.description.error , "logFileName": logFile }, { upsert: false }, function (err, doc) {
		if (err)
			console.error('Unable to update the row for the transaction ' + transaction.name, err);
		else
			console.log('update row for transaction , will start PreMerge process on the transaction :', transaction.name);
	});
};

var updateErroredTransation = function(trans,logStream,logFile){
			var errorMessage = "Problem Occured while running Validation script on transaction : "+trans.name+" , Error :"+trans.description.error;
			var errorMailCommand = 'echo '+'\"'+errorMessage+'\"'+ ' | mutt -s '+mailSubject+' '+trans.email;
			logStream.write("Problem Occured while running Validation script on transaction : "+trans.name+" Error :"+trans.description.error);
			logStream.end();
			var source = fs.createReadStream(fuseConfig.transactionActiveLogLocation + logFile);
			var dest = fs.createWriteStream(fuseConfig.transactionArchivedLogLocation + logFile);
			source.pipe(dest);
			source.on('end', function () {
				console.log('transaction logs moved to Archived');
				fs.unlink(fuseConfig.transactionActiveLogLocation + logFile);
				dest.end();
			});
			source.on('error', function (err) {
				console.error('failed to move transaction logs to Archived');
			});
			updateTransactionErrorStatus(trans,logFile);
			new SSH({
				host: fuseConfig.historyServerUrl,
				user: fuseConfig.adeServerUser,
				pass: fuseConfig.adeServerPass
			}).exec(errorMailCommand, {
				out: function (stdout) {
					console.log(stdout);
					return false;
			},
			err: function (stderr) {
				console.log(stderr);
				return false;
			}
		}).start();
}

var processTransaction = function (transData) {
	var trans = JSON.parse(transData);
	var date = new Date();
	var logFile = trans.name + '_' + date.getTime();
    var logStream = fs.createWriteStream(fuseConfig.transactionActiveLogLocation + logFile, { 'flags': 'a' });
	if (trans.description.error) {
			updateErroredTransation(trans,logStream,logFile)
			return;
	}
	var transName = ("jjikumar" + trans.name.substring(trans.name.indexOf('_')))+'_' + date.getTime();
	console.log('transaction data recived in the child process ', trans);
    var series = trans.description.baseLabel.value;
	var bugNo = trans.description.bugNum.value;
	var premergeOutLoc = '/ade/'+viewName+'/fusionapps/premerge/';
    var viewName = fuseConfig.adeServerUser + '_cloud_' + date.getTime();
	var transactionLogFile = premergeOutLoc+transName+'.txt';
	var transactionIncrBuildFile = premergeOutLoc+transName+'_incrbld.out';
	var transactionIncrBuildLog = premergeOutLoc+transName+'_incrbld.log';
    updateTransactionStatus(trans, 'Running', fuseConfig.transactionActiveLogLocation + logFile);
    var createViewCommand = 'ade createview ' + viewName + ' -series ' + series + ' -latest';
	var useViewCommand = 'ade useview -silent ' + viewName + ' -exec ';
	var begintrans = useViewCommand +' \"ade begintrans ' + transName + ' && ';
    var fetchTransCommand = begintrans + 'ade fetchtrans ' + trans.name + ' &&  ';
    var checkInCommand = fetchTransCommand + 'ade ci -all &&  ade savetrans && ade settransproperty -p BUG_NUM -v ' + bugNo + ' && cd &&  ade cleanview  && yes n | /ade/' + viewName + '/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh '+'-Dfamily=prc ';
    var finScriptParams = checkInCommand + ' -d ' + trans.dbString + ' -DupdateBug=' + trans.updateBug + ' -DrunJUnits=' + (trans.runJunits === 'Y' ? 1 : 0) + ' -DapplyPackages=' + (trans.applyFPR === 'Y' ? 1 : 0);
    var endDelimeter = ' \"';
	var destroyTransCommand = useViewCommand + ' \" ade destroytrans -force ' + transName + endDelimeter;
    var exeCommand = finScriptParams + endDelimeter;
	var sendmailSuccess = 'cat '+ transactionLogFile+ ' | mutt -s ' +mailSubject+' -a '+transactionIncrBuildFile+' -a '+transactionIncrBuildLog+' -b '+CC+' '+trans.email ;
	var errorMessage = "Problem Occured while running Validation script on transaction : "+trans.name+" , Pleas view the logs and validate your result ";
	var sendmailFailure = 'echo '+'\"'+errorMessage+'\"'+ ' | mutt -s '+mailSubject+' -c '+CC+' '+trans.email;
	var sendmailCommand = '[ -f '+ transactionLogFile+ ' ]  && ' + sendmailSuccess +' || ' + sendmailFailure ;
	var preMergeResCopyCommand = 'scp -i '+fuseConfig.sshPublicKeyLocation+' -r '+fuseConfig.adeServerUser+'@'+fuseConfig.adeServerUrl+':'+premergeOutLoc+' '+__dirname+'\\History\\Archived\\'+trans.name+'\\';;
	console.log('command to copy data : ',preMergeResCopyCommand);
	console.log('send mail command',sendmailCommand);
    console.log('command to be executed', exeCommand);
	new SSH({
		host: fuseConfig.historyServerUrl,
		user: fuseConfig.adeServerUser,
		pass: fuseConfig.adeServerPass
	}).exec(createViewCommand, {
        out: function (stdout) {
			logStream.write(stdout);
            console.log(stdout);
        },
        err: function (stderr) {
            console.log(stderr);
            return false;
        }
	}).exec(exeCommand, {
		out: function (stdout) {
			logStream.write(stdout);
			console.log(stdout);
		},
		err: function (stderr) {
			console.log(stderr);
			return false;
		}
	}).exec(sendmailCommand, {
		out: function (stdout) {
		var child = exec(preMergeResCopyCommand,
			(error, stdout, stderr) => {
				console.log(`stdout: ${stdout}`);
				console.log(`stderr: ${stderr}`);
				if (error !== null) {
					console.log(`exec error: ${error}`);
				}
		});
			console.log(stdout);
		},
		err: function (stderr) {
			console.log(stderr);
			return false;
		}
	}).exec(destroyTransCommand, {
		out: function (stdout) {
			console.log(stdout);
		},
		err: function (stderr) {
			console.log(stderr);
			return false;
		}
	}).exec('yes n | ade destroyview -force ' + viewName, {
		out: function (stdout) {
			console.log(stdout);
		},
		err: function (stderr) {
			console.log(stderr);
			return false;
		}
	}).exec('echo', {
		out: function (stdout) {
			logStream.write('Premerge Process completed');
			console.log('Premerge Process completed');
			logStream.end();
			var source = fs.createReadStream(fuseConfig.transactionActiveLogLocation + logFile);
			var dest = fs.createWriteStream(fuseConfig.transactionArchivedLogLocation + logFile);
			source.pipe(dest);
			source.on('end', function () {
				console.log('transaction logs moved to Archived');
				fs.unlink(fuseConfig.transactionActiveLogLocation + logFile);
				dest.end();
			});
			source.on('error', function (err) {
				console.error('failed to move transaction logs to Archived');
			});
			updateTransactionStatus(trans, 'Archived', fuseConfig.transactionArchivedLogLocation + logFile);
			return;
		},
		err: function (stderr) {
			console.log(stderr);
			return false;
		}
	}).start();
};
processTransaction(process.argv[2]);