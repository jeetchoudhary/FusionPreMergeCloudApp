/**
 * Created by jitender choudhary on 10/28/2016.
 */
"use strict";
var amqp = require('amqplib/callback_api');
var SSH = require('simple-ssh');
var fuseConfig = require('../config/configuration');
var fs = require('fs');
var TransData = require('../app/models/TransData');
var Databases = require('../app/models/DBData');
var mongoose = require('mongoose');
var logger = require('./LoggingConfig');
var CC = 'jitender.k.kumar@oracle.com';
var exec = require('child_process').exec;
mongoose.Promise = global.Promise;
mongoose.connect(fuseConfig.dburl);
var db = mongoose.connection;
var mailSubject = '"FusionPrcCloud-premerge Validation Complete"';

db.once('open', function () {
	logger.info('Server : Child process is connected to the database ');
});

var releaseDBLock = function (dbServer) {
	logger.info('about to release lock for database  :', dbServer);
	var query = { "connectionString": dbServer, "currentStatus": "USED" };
	Databases.findOneAndUpdate(query, { "currentStatus": "UNUSED" }, { upsert: false }, function (err, doc) {
		if (err) {
			logger.error('Unable to release lock on db :' + dbServer, err);
		} else {
			logger.info('Released lock on db  :', dbServer);
		}
	});
};


var getTransactionOverallStatus = function (permergeResultMainOutputFile) {
	var transactionStatus = "";
	if (fs.existsSync(permergeResultMainOutputFile)) {
		logger.info('Premerge final output file exist at location  :', permergeResultMainOutputFile);
		var premergeOutputArray = fs.readFileSync(permergeResultMainOutputFile).toString().split("\n");
		for (var i in premergeOutputArray) {
			if (premergeOutputArray[i].includes("Overall Validation Status")) {
				var words = premergeOutputArray[i].split(" ");
				var transactionStatus = words[words.length - 2].trim();
				console.log('Transactinal final status ' + transactionStatus);
				break;
			}
		}
	} else {
		logger.info('Premerge final output file does not exist at location  :', permergeResultMainOutputFile);
	}
	return transactionStatus;
};

var updateTransactionStatus = function (transaction, status, logFile, permergeResultMainOutputFile) {
	var query = '';
	if (status === "Running") {
		query = { "name": transaction.name, "currentStatus": "Queued" };
		TransData.findOneAndUpdate(query, { "currentStatus": status, "starttime": Date.now(), "logFileName": logFile, "DBServerUsed": transaction.DBServerUsed, "adeServerUsed": transaction.adeServerUsed }, { upsert: false }, function (err, doc) {
			if (err) {
				logger.error('Unable to update the row for the transaction ' + transaction.name, err);
			} else {
				logger.info('update row for transaction , will start PreMerge process on the transaction :', transaction.name);
			}
		});
	} else if (status === "Archived") {
		query = { "name": transaction.name, "currentStatus": "Running" };
		var detailedLogLocation = transaction.transactionDetailedLocation;
		logger.info('Premerge detailedLogLocation for the transaction ' + transaction.name + ' : ', detailedLogLocation);
		var transStatus = getTransactionOverallStatus(permergeResultMainOutputFile);
		TransData.findOneAndUpdate(query, { "currentStatus": status, "endtime": Date.now(), "logFileName": logFile, "premergeOutput": transStatus, "transactionDetailedLocation": detailedLogLocation }, { upsert: false }, function (err, doc) {
			if (err) {
				logger.error('Unable to update the row for the transaction ' + transaction.name, err);
			}
			else {
				logger.info('update row for transaction , completed PreMerge process on the transaction :', transaction.name);
			}
			if (transaction.runJunits === 'Y') {
				releaseDBLock(transaction.DBServerUsed);
				logger.info('Released lock for DB' + transaction.DBServerUsed);
			}
		});
	}
};

var updateTransactionErrorStatus = function (transaction, logFile) {
	logFile = fuseConfig.transactionArchivedLogLocation + logFile;
	var query = { "name": transaction.name, "currentStatus": "Queued" };
	TransData.findOneAndUpdate(query, { "currentStatus": "Archived", "starttime": Date.now(), "endtime": Date.now(), "premergeOutput": transaction.description.error, "logFileName": logFile }, { upsert: false }, function (err, doc) {
		if (err) {
			logger.error('Unable to update the row for the transaction ' + transaction.name, err);
		} else {
			logger.info('update row for transaction , no more processing required for the transaction :', transaction.name);
		}
	});
};

var updateErroredTransation = function (trans, logStream, logFile) {
	var errorMessage = "Problem Occured while running Validation script on transaction : " + trans.name + " , Error :" + trans.description.error;
	var errorMailCommand = 'echo ' + '\"' + errorMessage + '\"' + ' | mutt -s ' + mailSubject + ' ' + trans.email;
	logStream.write("Problem Occured while running Validation script on transaction : " + trans.name + " Error :" + trans.description.error);
	logStream.end();
	var source = fs.createReadStream(fuseConfig.transactionActiveLogLocation + logFile);
	var dest = fs.createWriteStream(fuseConfig.transactionArchivedLogLocation + logFile);
	source.pipe(dest);
	source.on('end', function () {
		logger.info('transaction logs moved to Archived');
		fs.unlink(fuseConfig.transactionActiveLogLocation + logFile);
		dest.end();
	});
	source.on('error', function (err) {
		logger.error('failed to move transaction logs to Archived');
	});
	updateTransactionErrorStatus(trans, logFile);
	new SSH({
		host: trans.adeServerUsed,
		user: fuseConfig.adeServerUser,
		pass: fuseConfig.adeServerPass
	}).exec(errorMailCommand, {
		out: function (stdout) {
			logger.info(stdout);
			return false;
		},
		err: function (stderr) {
			logger.info(stderr);
			return false;
		}
	}).start();
};

var processTransaction = function (transData) {
	var trans = JSON.parse(transData);
	var date = new Date();
	var logFile = trans.name + '_' + date.getTime();
	var logStream = fs.createWriteStream(fuseConfig.transactionActiveLogLocation + logFile, { 'flags': 'a' });
	if (trans.description.error) {
		updateErroredTransation(trans, logStream, logFile);
		return;
	}
	var transName = ("jjikumar" + trans.name.substring(trans.name.indexOf('_'))) + '_' + date.getTime();
	logger.info('transaction data recived in the child process ', trans);
	var series = trans.description.baseLabel.value;
	var bugNo = trans.description.bugNum.value;
	var viewName = fuseConfig.adeServerUser + '_cloud_' + date.getTime();
	var premergeOutLoc = '/scratch/views/' + viewName + '/fusionapps/premerge/';
	var premergeOutTransName = premergeOutLoc + transName;
	var transactionLogFile = premergeOutTransName + '.txt';
	var transactionIncrBuildFile = premergeOutLoc + transName + '_incrbld.out';
	var transactionIncrBuildLog = premergeOutLoc + transName + '_incrbld.log';
	var transactionJunitFile = premergeOutLoc + transName + '_junit.out';
	updateTransactionStatus(trans, 'Running', fuseConfig.transactionActiveLogLocation + logFile, "");
	var mkprivatePrcJaznCommand = 'ade mkprivate /scratch/views/' + viewName + '/fusionapps/prc/components/procurement/src/META-INF/* ';
	var mkprivatePrcEssJaznCommand = 'ade mkprivate /scratch/views/' + viewName + '/fusionapps/prc/components/procurementEss/src/META-INF/* ';
	var createViewCommand = 'ade createview ' + viewName + ' -series ' + series + ' -latest';
	var useViewCommand = 'ade useview -silent ' + viewName + ' -exec ';
	var begintrans = useViewCommand + ' \" ade begintrans ' + transName + ' && ';
	var fetchTransCommand = begintrans + 'ade fetchtrans ' + trans.name + ' &&  ';
	var checkInCommand = "";
	if(trans.runJunits === 'Y'){
		 checkInCommand = fetchTransCommand + 'ade ci -all &&  ade savetrans && ade settransproperty -p BUG_NUM -v ' + bugNo + ' && cd /scratch/views/' + viewName + 
						'/fusionapps/ && ade expand -recurse prc && ade mkprivate prc/* && cd .. '+mkprivatePrcJaznCommand + ' && '+mkprivatePrcEssJaznCommand +'&& yes n | /ade/' + viewName + '/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh' + ' -d ' + trans.dbString;
	}else{
		checkInCommand = fetchTransCommand + 'ade ci -all &&  ade savetrans && ade settransproperty -p BUG_NUM -v ' + bugNo + ' && yes n | /ade/' + viewName + '/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh' + ' -d ' + trans.dbString;
	}
	var finScriptParams = checkInCommand + ' -DupdateBug=' + trans.updateBug + ' -DrunJUnits=' + (trans.runJunits === 'Y' ? 1 : 0) + ' -Dfamily=prc -DjunitBuildFile=/ade/' + viewName + '/fusionapps/prc/build-po.xml ';
	if (trans.junitSelectedList) {
		for (var i in trans.junitSelectedList) {
			finScriptParams += ' -j ' + trans.junitSelectedList[i].id + '.jpr';
		}
	}
	var endDelimeter = ' \"';
	var destroyTransCommand = useViewCommand + ' \" ade settransproperty -p BUG_NUM -r && ade destroytrans -force ' + transName + endDelimeter;
	var exeCommand = finScriptParams + endDelimeter;
	var detailedTransactionOutputLocation = 'http://slc04kxc.us.oracle.com:81/' + transName + '_1'
	var emailBody = 'Premerge validation completed for your transaction ' + trans.name + '. you can verify the result of the validation at ' + detailedTransactionOutputLocation;
	trans.transactionDetailedLocation = detailedTransactionOutputLocation;
	var sendmailSuccess = 'echo ' + emailBody + ' | mutt -s ' + mailSubject + ' -b ' + CC + ' ' + trans.email;
	var errorMessage = "PreMerge Validation completed on transaction : " + trans.name + " , Please view the logs and validate your result ";
	var sendmailFailure = 'echo ' + '\"' + errorMessage + '\"' + ' | mutt -s ' + mailSubject + ' -b ' + CC + ' ' + trans.email;
	var sendmailCommand = sendmailSuccess;
	var premergeResultLocalLocation = __dirname + '\\..\\History\\Archived\\' + transName + '_1\\';
	var preMergeResCopyCommand = 'scp -i ' + fuseConfig.sshPublicKeyLocation + ' -r ' + fuseConfig.adeServerUser + '@' + trans.adeServerUsed + ':' + premergeOutLoc + ' ' + premergeResultLocalLocation;
	var permergeResultMainOutputFile = premergeResultLocalLocation + transName + '.txt';
	logger.info('command to copy data : ', preMergeResCopyCommand);
	logger.info('send mail command', sendmailCommand);
	logger.info('command to be executed', exeCommand);
	new SSH({
		host: trans.adeServerUsed,
		user: fuseConfig.adeServerUser,
		pass: fuseConfig.adeServerPass
	}).exec(createViewCommand, {
		out: function (stdout) {
			logStream.write(stdout);
			logger.info(stdout);
		},
		err: function (stderr) {
			logger.info(stderr);
			return false;
		}
	}).exec(exeCommand, {
		out: function (stdout) {
			logStream.write(stdout);
			logger.info(stdout);
		},
		err: function (stderr) {
			logger.info(stderr);
			return false;
		}
	}).exec('echo', {
		out: function (stdout) {
			var copyFiles = exec(preMergeResCopyCommand, function (error, stdout, stderr) {
				if (error) {
					logger.error('Error occured while coping premerge result files : ', error);
				}
			});
			logStream.write('Premerge Process completed');
			logger.info('Premerge Process completed');
			logStream.end();
			var source = fs.createReadStream(fuseConfig.transactionActiveLogLocation + logFile);
			var dest = fs.createWriteStream(fuseConfig.transactionArchivedLogLocation + logFile);
			source.pipe(dest);
			source.on('end', function () {
				logger.info('transaction logs moved to Archived');
				fs.unlink(fuseConfig.transactionActiveLogLocation + logFile);
				dest.end();
			});
			source.on('error', function (err) {
				logger.error('failed to move transaction logs to Archived');
			});
		},
		err: function (stderr) {
			logger.info(stderr);
			return false;
		}
	}).exec("echo", {
		out: function (stdout) {
			logger.info("permergeResultMainOutputFile : " + permergeResultMainOutputFile);
			setTimeout(function () {
				updateTransactionStatus(trans, 'Archived', fuseConfig.transactionArchivedLogLocation + logFile, permergeResultMainOutputFile);
			}, 5000);
		},
		err: function (stderr) {
			logger.info(stderr);
			return false;
		}
	}).exec(sendmailCommand, {
		out: function (stdout) {
			logger.info(stdout);
		},
		err: function (stderr) {
			logger.info(stderr);
			return false;
		}
	}).exec(destroyTransCommand, {
		out: function (stdout) {
			logger.info(stdout);
		},
		err: function (stderr) {
			logger.info(stderr);
			return false;
		}
	}).exec('yes n | ade destroyview -force ' + viewName, {
		out: function (stdout) {
			logger.info(stdout);
		},
		err: function (stderr) {
			logger.info(stderr);
			return false;
		}
	}).start();
};
processTransaction(process.argv[2]);