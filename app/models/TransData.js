/**
 * Created by jitender choudhary on 10/28/2016.
 */
var mongoose = require('mongoose');
var TransDataSchema = mongoose.Schema({
    name: String,
    submittedBy : String,
	currentStatus : String,
	submittedtime: Date,
	starttime: Date,
	endtime : Date,
	DBString : String,
	updateBug : String,
	runJunits : String,
	premergeOutput : String,
	logFileName : String,
	adeServerUsed : String,
	DBServerUsed : String,
	allowDBOverride : String,
	remark : String,
	transactionDetailedLocation : String,
	submissionMethod:String
});

var Trans = mongoose.model('Trans', TransDataSchema);
module.exports = Trans;
