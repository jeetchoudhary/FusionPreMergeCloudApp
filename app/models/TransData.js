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
	logFileName : String
});

var Trans = mongoose.model('Trans', TransDataSchema);
module.exports = Trans;
