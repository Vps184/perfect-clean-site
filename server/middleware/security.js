const validator = require('validator');
const xss = require('xss');
const logger = require('../utils/logger');

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove XSS attacks
      let sanitized = xss(value, {
        whiteList: {}, // No HTML allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      });
      
      // Escape HTML entities
      sanitized = validator.escape(sanitized);
      
      return sanitized.trim();
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          sanitized[key] = value.map(sanitizeValue);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = sanitizeValue(value);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Validation middleware for contact form
const validateContactForm = (req, res, next) => {
  const { nome, telefone, servico, data, horario } = req.body;
  const errors = [];

  // Nome validation
  if (!nome || typeof nome !== 'string') {
    errors.push('Nome é obrigatório');
  } else if (!validator.isLength(nome, { min: 2, max: 50 })) {
    errors.push('Nome deve ter entre 2 e 50 caracteres');
  } else if (!validator.isAlpha(nome.replace(/\s/g, ''), 'pt-BR')) {
    errors.push('Nome deve conter apenas letras');
  }

  // Telefone validation
  if (!telefone || typeof telefone !== 'string') {
    errors.push('Telefone é obrigatório');
  } else {
    const telefoneClean = telefone.replace(/\D/g, '');
    if (!validator.isMobilePhone(telefoneClean, 'pt-BR')) {
      errors.push('Formato de telefone inválido');
    }
  }

  // Serviço validation
  const validServices = [
    'Limpeza de Sofás',
    'Higienização de Colchões',
    'Limpeza de Poltronas',
    'Tratamento Antiácaro',
    'Estofados Automotivos'
  ];
  
  if (!servico || !validServices.includes(servico)) {
    errors.push('Serviço selecionado é inválido');
  }


  if (errors.length > 0) {
    logger.logSecurity('invalid_form_data', req, { errors });
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  next();
};

// Rate limiting tracker
const trackRateLimit = (req, res, next) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  
  // Log suspicious activity
  if (req.rateLimit && req.rateLimit.remaining < 2) {
    logger.logSecurity('rate_limit_warning', req, {
      remaining: req.rateLimit.remaining,
      total: req.rateLimit.total,
      resetTime: new Date(req.rateLimit.resetTime)
    });
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request logging middleware
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log all requests
    logger.info('Request processed', {
      type: 'request',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Log slow requests
    if (duration > 1000) {
      logger.logPerformance(req.url, duration, req);
    }
  });

  next();
};

module.exports = {
  sanitizeInput,
  validateContactForm,
  trackRateLimit,
  securityHeaders,
  logRequest
};