/**
 * Created by jitender choudhary on 10/28/2016.
 */
var mongoose = require('mongoose');
var DBDataSchema = mongoose.Schema({
    release: String,
	alias : String,
	connectionString : String,
	currentStatus : String
});

var Databases = mongoose.model('Databases', DBDataSchema);
module.exports = Databases;