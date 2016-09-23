var mongoose = require('mongoose');
var DBDataSchema = mongoose.Schema({
    release: String,
	alias : String,
	connectionString : String
});

var Databases = mongoose.model('Databases', DBDataSchema);
module.exports = Databases;