/**
 * Created by jitender choudhary on 10/28/2016.
 */
// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var serveIndex = require('serve-index');
var SSH = require('simple-ssh');
var fs = require('fs');

// configuration ===========================================

var fuseConfig = require('./config/configuration');
var logger = require('./app/LoggingConfig');
var logStream = fs.createWriteStream('log.txt', {'flags': 'a'});
var port = process.env.PORT || 80;
mongoose.Promise = global.Promise;
mongoose.connect(fuseConfig.dburl);
var db = mongoose.connection;
var ssh = new SSH({
    host: fuseConfig.historyServerUrl,
    user: fuseConfig.adeServerUser,
    pass: fuseConfig.adeServerPass
});

db.on('error', console.error.bind(console, 'Server : Could not connect to database, Please check if your database is up and running '));
db.once('open', function() {
 logger.info('Server : Application connected to database , server is about to start ');
});

app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); 


// routes ==================================================
require('./app/routes')(app); // pass our application into our routes
var server = app.listen(port);
logger.info('Fusion Server Started on port ' + port);
exports = module.exports = app;