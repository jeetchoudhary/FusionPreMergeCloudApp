/**
 * Created by jitender choudhary on 10/28/2016.
 */
"use strict";
module.exports = function (app) {
	var fuseConfig = require('../config/configuration');
	var messageServer = require('./MessageProcessor');
	var messageClient = require('./MessageBroker');
	var TransData = require('../app/models/TransData');
	var Databases = require('../app/models/DBData');
	var ProjectList = require('../app/models/ProjectListData');
	var fs = require('fs');
	var q = require('q');
	var transactionLogLocation = ".\\History\\Current\\";
	var amqp = require('amqplib/callback_api');
	var SSH = require('simple-ssh');
	var adeServerMap = new Object();
	var child_process = require('child_process');
	var exec = require('child_process').exec;
	var logger = require('./LoggingConfig');
	
	var ssh = new SSH({
		host: fuseConfig.historyServerUrl,
		user: fuseConfig.adeServerUser,
		pass: fuseConfig.adeServerPass
	});

	// Helper Methods ================================================================================================================================================================================================


	/**This Method is just to dump project list data in to the database , for the production sys need to comment this method and use only method written below it to update project list */
	var updateListinDbStandalone = function () {
		var projectNames = [];
		var listLocationLocal = __dirname + '\\ProjectList\\Procurement.jws';
		try {
			var fileData = fs.readFileSync(listLocationLocal).toString();
			var childrenStartData = fileData.substring(fileData.indexOf('<list n="listOfChildren">'));
			var childrenList = childrenStartData.substring(0, childrenStartData.indexOf('</list>') + 7);
			var aFileNameParts = childrenList.split(".jpr");
			for (var i in aFileNameParts) {
				if (aFileNameParts[i].lastIndexOf('path=') != -1) {
					var projectPath = 'fusionapps/prc/components/procurement/' + aFileNameParts[i].substring(aFileNameParts[i].lastIndexOf('path=') + 6);
					if (projectPath.substring(projectPath.length - 4) == 'Test') {
						projectNames.push(projectPath);
						logger.info('project updated in the db : ', projectPath);
					}
				}
			}
		} catch (ex) {
			logger.info('Failed to parse projectNames from fileList', ex);
		}
		var query = { "name": "FUSIONAPPS_PT.V2MIBPRCX_LINUX.X64" };
		ProjectList.findOneAndUpdate(query, { "list": projectNames }, { upsert: true }, function (err, doc) {
			if (err) {
				logger.error('failed to save list in db :', err);
			} else {
				logger.info('saved list in db  :');
			}
		});
	};
	// updateListinDbStandalone();

	var parseProjectListandUpdateDB = function (series, listLocationLocal, viewName) {
		logger.info('about to parse projectList and update DB with series : ', series);
		var projectNames = [];
		try {
			var fileData = fs.readFileSync(listLocationLocal + 'Procurement.jws').toString();
			var childrenStartData = fileData.substring(fileData.indexOf('<list n="listOfChildren">'));
			var childrenList = childrenStartData.substring(0, childrenStartData.indexOf('</list>') + 7);
			var aFileNameParts = childrenList.split(".jpr");
			for (var i in aFileNameParts) {
				if (aFileNameParts[i].lastIndexOf('path=') != -1) {
					var projectPath = 'fusionapps/prc/components/procurement/' + aFileNameParts[i].substring(aFileNameParts[i].lastIndexOf('path=') + 6);
					if (projectPath.substring(projectPath.length - 4) == 'Test') {
						projectNames.push(projectPath);
						logger.info('project updated in the db : ', projectPath);
					}
				}
			}
		} catch (ex) { logger.info('Failed to parse projectNames from fileList', ex) }

		var query = { "name": "FUSIONAPPS_PT.V2MIBPRCX_LINUX.X64" };
		ProjectList.findOneAndUpdate(query, { "list": projectNames }, { upsert: true }, function (err, doc) {
			if (err) {
				logger.error('failed to save list in db :', err);
			} else {
				logger.info('saved list in db  :');
			}
		});
	};
	var updateProjectNameList = function (series) {
		var viewName = 'cloudupdateProjects';
		var createViewCommand = 'ade createview ' + viewName + ' -series ' + series + ' -latest';
		var listLocationOnServer = '/scratch/' + fuseConfig.adeServerUser + '_' + viewName + '/fusionapps/prc/components/procurement/Procurement.jws';
		var listLocationLocal = __dirname + '\\ProjectList\\';
		var projectListCopyCommand = 'scp ' + fuseConfig.sshPublicKeyLocation + ' -r ' + fuseConfig.adeServerUser + '@' + fuseConfig.historyServerUrl + ':' + listLocationOnServer + ' ' + listLocationLocal;
		logger.info('command to copy file : ', projectListCopyCommand);
		ssh.exec(createViewCommand, {
			out: function (stdout) {
				logger.info(stdout);
			},
			err: function (stderr) {
				logger.error('failed to execute command desc :', stderr);
				return;
			}
		}).exec('echo', {
			out: function (stdout) {
				var copyFiles = exec(projectListCopyCommand, function (error, stdout, stderr) {
					if (error) {
						logger.error('Failed to copy projectList file from server : ', error);
					}
				});
			},
			err: function (stderr) {
				logger.error('failed to execute command echo :', stderr);
			}
		}).exec('echo', {
			out: function (stdout) {
				setTimeout(function () { parseProjectListandUpdateDB(series, listLocationLocal, viewName); }, 5000);
			},
			err: function (stderr) {
				logger.error('failed to execute command echo :', stderr);
			}
		}).start();
	};

	var initilizeADEServerMap = function () {
		var adeServerList = fuseConfig.adeServerUrl.split(';');
		for (var adeServer of adeServerList) {
			adeServerMap[adeServer] = 0;
		}
	};
	initilizeADEServerMap();

	var getADEServerName = function () {
		var serverName = '';
		var count = 1000;
		for (var server in adeServerMap) {
			if (adeServerMap[server] < count) {
				count = adeServerMap[server];
				serverName = server;
			}
		}
		adeServerMap[serverName] = adeServerMap[serverName] + 1;
		return serverName;
	};

	var processSubmitRequest = function (transaction) {
		child_process.fork(__dirname + "/ProcessRequest.js", [JSON.stringify(transaction)], {});

	};

    var parseTransactionData = function (input) {
		logger.info('parsing transaction description data');
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
					logger.info('bugNum : ', bugNum);
				}
				else if (lines[i].includes(transDescKeyword)) {
					transDesc = (lines[i].substring(lines[i].indexOf(':') + 1)).trim();
					logger.info('transDesc : ', transDesc);
				}
				else if (lines[i].includes(baseLabelKeyword)) {
					baseLabel = lines[i].substring(lines[i].indexOf(baseLabelKeyword) + baseLabelKeyword.length + 1, lines[i].indexOf('X64') + 3);
					logger.info('baseLabel : ', baseLabel);
				}
			} else {
				break;
			}

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
		logger.info('Server : Above to describe transaction :', command);
		ssh.exec(command, {
			out: function (stdout) {
				op = op + stdout;
			},
			err: function (stderr) {
				logger.error('failed to execute command desc :', stderr);
				return;
			}
		}).exec('echo', {
			out: function (stdout) {
				ssh.end();
				var transactionDescData = parseTransactionData(op);
				deferred.resolve(transactionDescData);
			},
			err: function (stderr) {
				logger.error('failed to execute command echo :', stderr);
			}
		}).start();
		return deferred.promise;
	};

	var getTransactionLogFileName = function (transactionName) {
		var newPath = transactionLogLocation + transactionName + '_1';
		var path = newPath.replace(/\\/g, "/");
		fs.open(newPath, 'r', function (error, fd) {
			if (error) { throw new Error("ERROR - failed to open file : " + newPath); }
		});
	};

// server routes ================================================================================================================================================================================================

	app.post('/api/updateProjectList', function (req, res) {
		var seriesName = req.body.val;
		updateProjectNameList(seriesName);
	});

	app.get('/api/getProjectList', function (req, res) {
		ProjectList.find({}, function (err, projectList) {
			if (err) {
				logger.error('error occured while projectlist from the db : ', err);
			}
			else {
				// logger.info('projectList retrieved from db ', projectList);
				res.status(200).json(projectList);
			}
		});
	});

    app.post('/api/submit', function (req, res) {
		var currentTransactionData = new TransData({
			name: req.body.name,
			submittedBy: req.body.email,
			currentStatus: 'Queued',
			submittedtime: Date.now(),
			starttime: '',
			endtime: '',
			DBString: req.body.dbString,
			updateBug: req.body.updateBug,
			runJunits: req.body.runJunits
		});

		var queryResult = TransData.find({ $or: [{ name: req.body.name, currentStatus: 'Running' }, { name: req.body.name, currentStatus: 'Queued' }] }, function (err, transData) {
			if (err) {
				logger.error('error occured while fetching running transactions :', err);
			}
			else if (transData.length > 0) {
				logger.info('Another Request for the Transaction is Already in process :', req.body.name);
				res.status(450).send({ error: "Another Request for the Transaction is Already in process , multiple request for the same transaction can not be submitted" });
			}
			else if (transData.length === 0) {
				currentTransactionData.save(function (err) {
					if (err) {
						logger.error('failed to save transaction data to the database : ', err);
					} else {
						logger.info('Transaction saved successfully and pre merge will run soon on the transaction: ', req.body.name);
					}
				});
				req.body.adeServerUsed = getADEServerName();
				processSubmitRequest(req.body);
			}
		});
	});

    app.get('/api/info/dbs', function (req, res) {
		Databases.find({}, function (err, dbData) {
			if (err) {
				logger.error('error occured while fetching Currently avaliable Databases : ', err);
			}
			else {
				logger.info('Currently avaliable Databases count is ', dbData.length);
				res.status(200).json(dbData);
			}
		});
	});

    app.post('/api/transactions/list', function (req, res) {
		TransData.find({ "currentStatus": req.body.transState }, function (err, transData) {
			if (err) {
				logger.error('error occured while fetching running transactions: ', err);
				throw err;
			}
			else {
				res.status(200).json(transData);
			}
		});
    });

	app.post('/api/transactions/name/output', function (req, res) {
		var localFilePath = req.body.histTrans.logFileName;
		var stat = fs.statSync(localFilePath);
		try {
			res.writeHead(200, {
				'Content-Type': 'application/text',
				'Content-Length': stat.size
			});
			var readStream = fs.createReadStream(localFilePath);
			readStream.pipe(res);
		} catch (error) {
			logger.error("unable to read transaction detail ", error);
		}
    });

    app.post('/api/transactions/describe', function (req, res) {
		var command = 'ade describetrans ' + req.body.name;
		getTransactionDetails(command).then(function (newResponse) {
			logger.info('Recived details for the transaction from ADE Server : ', newResponse);
			res.status(200).send(newResponse);
		});
    });
};