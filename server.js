const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import custom modules
const logger = require('./server/utils/logger');
const {
  sanitizeInput,
  validateContactForm,
  trackRateLimit,
  securityHeaders,
  logRequest
} = require('./server/middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging
app.use(logRequest);

// Security middlewares
app.use(securityHeaders);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"]
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://perfectclean.com.br', 'https://www.perfectclean.com.br']
    : true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting with tracking
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per IP
  message: { 
    success: false,
    error: 'Muitas tentativas. Tente novamente em 15 minutos.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

app.use(trackRateLimit);

// Serve static files with caching
app.use('/assets', express.static('public/assets', {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

app.use(express.static('public', {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.post('/api/contato', limiter, validateContactForm, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { nome, telefone, servico, data, horario } = req.body;

    // Prepare webhook data
    const webhookData = {
      nome,
      telefone,
      servico,
      data: data || 'Não informado',
      horario: horario || 'Não informado',
      dataEnvio: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    };

    // Send to n8n webhook (if configured)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (n8nWebhookUrl) {
      try {
        const webhookResponse = await axios.post(n8nWebhookUrl, webhookData, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        logger.info('Webhook sent successfully', {
          type: 'webhook_success',
          status: webhookResponse.status,
          nome: nome
        });
      } catch (webhookError) {
        logger.error('Webhook failed', {
          type: 'webhook_error',
          error: webhookError.message,
          url: n8nWebhookUrl,
          nome: nome
        });
        // Continue even if webhook fails
      }
    }

    // Log successful contact
    logger.logContact(webhookData, req);

    // Performance logging
    const duration = Date.now() - startTime;
    if (duration > 500) {
      logger.logPerformance('/api/contato', duration, req);
    }

    res.json({ 
      success: true, 
      message: 'Solicitação enviada com sucesso! Entraremos em contato via WhatsApp em breve.' 
    });

  } catch (error) {
    logger.logError(error, req, { endpoint: '/api/contato' });
    
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor. Tente novamente mais tarde.',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
});

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Perfect Clean API',
    version: require('./package.json').version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'ok', // Would check actual database if present
      webhook: process.env.N8N_WEBHOOK_URL ? 'configured' : 'not_configured',
      logs: 'ok'
    }
  };

  logger.info('Health check requested', {
    type: 'health_check',
    ip: req.ip,
    uptime: process.uptime()
  });

  res.json(healthData);
});

// Enhanced 404 handler
app.use((req, res) => {
  logger.logSecurity('404_not_found', req, { 
    requestedPath: req.path,
    method: req.method 
  });
  
  res.status(404).json({ 
    success: false,
    error: 'Endpoint não encontrado',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Enhanced error handler
app.use((error, req, res, next) => {
  logger.logError(error, req, { 
    middleware: 'global_error_handler',
    stack: error.stack 
  });
  
  const errorResponse = {
    success: false,
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  };

  // Include error details in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.details = {
      message: error.message,
      stack: error.stack
    };
  }

  res.status(500).json(errorResponse);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    type: 'unhandled_rejection',
    reason: reason,
    promise: promise
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    type: 'uncaught_exception',
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info('Server started', {
      type: 'server_start',
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      rateLimiting: '5 requests per 15min',
      webhook: process.env.N8N_WEBHOOK_URL ? 'configured' : 'not_configured',
      logLevel: logger.level
    });
    
    console.log(`🚀 Perfect Clean Server rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🔒 Rate limiting ativo: 5 tentativas por 15min`);
    console.log(`📝 Logs estruturados ativos`);
    console.log(`⚡ Webhook N8N: ${process.env.N8N_WEBHOOK_URL ? 'Configurado' : 'Não configurado'}`);
  });
}

// Export app for testing
module.exports = app;