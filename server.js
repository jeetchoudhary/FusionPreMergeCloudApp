/**
 * Created by jitender choudhary on 10/28/2016.
 */
// modules =================================================
var express        = require('express');
var fusionAPP      = express();
var dirListApp     = express();
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
var fuseionAppPort = process.env.PORT || 80;
var dirListAppPort = 81;
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
// To redirect all the request from this server to another server uncomment below lines
// fusionAPP.get('*',function(req,res){  
//       //if(req.socket.localPort==80)
//          res.redirect('http://slc12ckt.us.oracle.com/');
// })
fusionAPP.use(bodyParser.json()); 
fusionAPP.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
fusionAPP.use(bodyParser.urlencoded({ extended: true }));
fusionAPP.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
fusionAPP.use(express.static(__dirname + '/public')); 

dirListApp.use(express.static(__dirname + '/History/Archived')); 
dirListApp.use(serveIndex('History/Archived', {'icons': true}))



// routes ==================================================
require('./app/routes')(fusionAPP); // pass our application into our routes
var fusionAppServer = fusionAPP.listen(fuseionAppPort);
logger.info('Fusion Server Started on port ' + fuseionAppPort);
var dirListServer = dirListApp.listen(dirListAppPort);
logger.info('Directory Server Started on port ' + dirListAppPort);

exports = module.exports = fusionAPP;