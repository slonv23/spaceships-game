const path = require('path');

const opts = {
    errorEventName: 'error',
    logDirectory: path.resolve(__dirname, '../../../logs'), // NOTE: folder must exist and be writable...
    fileNamePattern: 'roll-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};

const simpleNodeLogger = require('simple-node-logger'),
      consoleAppender = new simpleNodeLogger.appenders.ConsoleAppender({});

const logger = simpleNodeLogger.createRollingFileLogger(opts);
logger.setLevel('debug');
logger.setAppenders([...logger.getAppenders(), consoleAppender]);
logger.logError = (message, error) => {
    let errorBody = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.warn(`${message}: ${errorBody}`);
};

module.exports = logger;
