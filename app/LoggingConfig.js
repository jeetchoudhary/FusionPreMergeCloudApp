/**
 * Created by jitender choudhary on 10/28/2016.
 */
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/../ApplicationLogs/debug.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/../ApplicationLogs/exceptions.log', json: false })
  ],
  exitOnError: false
});

module.exports = logger;