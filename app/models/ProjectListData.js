/**
 * Created by jitender choudhary on 10/28/2016.
 */
var mongoose = require('mongoose');
var ProjectListSchema = mongoose.Schema({
    name: String,
	list : Array
});
var ProjectList = mongoose.model('ProjectList', ProjectListSchema);
module.exports = ProjectList;