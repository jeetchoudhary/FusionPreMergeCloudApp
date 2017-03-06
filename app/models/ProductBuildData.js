/**
 * Created by jitender choudhary on 03/03/2017.
 */
var mongoose = require('mongoose');
var ProjectListSchema = mongoose.Schema({
    productName: String,
	familyName : String,
    buildFile : String,
    workspaceFile : String
});
var BuildData = mongoose.model('BuildData', ProjectListSchema);
module.exports = BuildData;