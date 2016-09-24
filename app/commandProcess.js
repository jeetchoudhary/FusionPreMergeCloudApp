"use strict";
var amqp = require('amqplib/callback_api');
var SSH = require('simple-ssh');
var fuseConfig = require('../config/configuration');
var fs = require('fs');
var TransData = require('../app/models/TransData');
var ssh = new SSH({
    host: fuseConfig.historyServerUrl,
    user: fuseConfig.adeServerUser,
    pass: fuseConfig.adeServerPass
});

var updateTransactionStatus = function(transaction,status){
	var updateTime ;
	if(status==="Running")
		updateTime = "starttime";
	else if(status==="Archived")
		updateTime = "endtime";
	var query = { "name" : transaction.name };
	TransData.findOneAndUpdate(query, { "currentStatus" : status , updateTime:Date.now()}, {upsert:false}, function(err, doc){
	    if (err) 
	    	console.error('Unable to update the row for the transaction '+transaction.name,err);
	    else
	    	console.log('update row for transaction , will start PreMerge process on the transaction :',transaction.name);
	});
};

var processTransaction = function(trans){
	//TO DO : get data from DB && save premerge result on history server
    var series =  'FUSIONAPPS_PT.V2MIBPRCX_LINUX.X64';
    var seriesName = 'R_13';
    var logStream = fs.createWriteStream(fuseConfig.transactionActiveLogLocation+trans.name, {'flags': 'a'});
	var date = new Date();
    var viewName = fuseConfig.adeServerUser+'_R_13_'+date.getTime();
    var bugNo = '23502069';
    updateTransactionStatus(trans,'Running');
    var createViewCommand = 'ade createview '+ viewName + ' -series '+series+' -latest';
    var useViewCommand = 'ade useview -silent '+viewName+' -exec \"ade begintrans '+trans.name+'_'+date.getTime()+' && ';
    var fetchTransCommand = useViewCommand+'ade fetchtrans '+trans.name+' &&  ';
    var checkInCommand = fetchTransCommand+'ade ci -all &&  ade savetrans && ade settransproperty -p BUG_NUM -v '+bugNo+' && cd &&  ade cleanview  && yes n | /ade/'+viewName+'/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh ';
    var finScriptParams = checkInCommand+' -d '+trans.dbString+' -DupdateBug='+trans.updateBug+' -DrunJUnits='+(trans.runJunits==='Y'?1:0)+' -DapplyPackages='+(trans.applyFPR==='Y'?1:0);
    var destroyTransParam = finScriptParams+' && ade destroytrans -force '+trans.name +' && exit ';
    var endDelimeter = ' \"';
    var exeCommand = finScriptParams+endDelimeter;
    console.log('command to be executed',exeCommand);
	ssh.exec(createViewCommand, {
        out: function(stdout) {
        	logStream.write(stdout);
            console.log(stdout);
        },
        err: function(stderr) {
            console.log(stderr); 
            return false;
        }
	    }).exec(exeCommand, {
	        out: function(stdout) {
	        	logStream.write(stdout);
	            console.log(stdout);
	        },
	        err: function(stderr) {
	            console.log(stderr); 
	            return false;
	        }
	    }).exec('yes n | ade destroyview -force'+viewName, {
	        out: function(stdout) {
	        	logStream.write(stdout);
	            console.log(stdout);
	        },
	        err: function(stderr) {
	            console.log(stderr); 
	            return false;
	        }
	    }).exec('echo', {
	        out: function(stdout) {
	        	logStream.write('Premerge Process completed');
	            console.log('Premerge Process completed');
	            updateTransactionStatus(trans,'Archived');
	        },
	        err: function(stderr) {
	            console.log(stderr); 
	            return false;
	        }
	    })
    .start();
};
processTransaction(process.argv[2]);



