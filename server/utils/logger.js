const winston = require('winston');
const path = require('path');

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// File format
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'perfect-clean-api' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Success log file for form submissions
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/contacts.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
} else {
  // In production, only log errors to console
  logger.add(new winston.transports.Console({
    level: 'error',
    format: consoleFormat
  }));
}

// Utility functions for specific log types
logger.logContact = (contactData, req) => {
  logger.info('New contact received', {
    type: 'contact_form',
    data: {
      nome: contactData.nome,
      telefone: contactData.telefone,
      servico: contactData.servico,
      data: contactData.data,
      horario: contactData.horario
    },
    request: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      timestamp: new Date().toISOString()
    }
  });
};

logger.logError = (error, req, context = {}) => {
  logger.error('Application error', {
    type: 'application_error',
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: req ? {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    } : null,
    context,
    timestamp: new Date().toISOString()
  });
};

logger.logSecurity = (event, req, details = {}) => {
  logger.warn('Security event', {
    type: 'security',
    event,
    request: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    },
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logPerformance = (route, duration, req) => {
  logger.info('Performance metric', {
    type: 'performance',
    route,
    duration: `${duration}ms`,
    request: {
      method: req.method,
      ip: req.ip
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;