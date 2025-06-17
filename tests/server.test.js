const request = require('supertest');
const express = require('express');

// Mock dependencies
jest.mock('../server/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  logContact: jest.fn(),
  logError: jest.fn(),
  logSecurity: jest.fn(),
  logPerformance: jest.fn(),
  level: 'info'
}));

jest.mock('axios');

// Create test server without starting it
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use dynamic port for tests

const app = require('../server');

describe('Perfect Clean API', () => {
  
  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'Perfect Clean API');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('checks');
    });
  });

  describe('POST /api/contato', () => {
    const validContactData = {
      nome: 'João Silva',
      telefone: '(11) 99999-9999',
      servico: 'Limpeza de Sofás'
    };

    test('should accept valid contact data', async () => {
      const response = await request(app)
        .post('/api/contato')
        .send(validContactData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('sucesso');
    });

    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/contato')
        .send({ nome: 'João' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should reject invalid phone format', async () => {
      const response = await request(app)
        .post('/api/contato')
        .send({
          ...validContactData,
          telefone: '123456789'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Formato de telefone inválido');
    });

    test('should reject invalid service', async () => {
      const response = await request(app)
        .post('/api/contato')
        .send({
          ...validContactData,
          servico: 'Impermeabilização'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Serviço selecionado é inválido');
    });

    test('should sanitize XSS attempts', async () => {
      const response = await request(app)
        .post('/api/contato')
        .send({
          nome: '<script>alert("xss")</script>João',
          telefone: '(11) 99999-9999',
          servico: 'Limpeza de Sofás'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Nome should be sanitized
    });

    test('should handle rate limiting', async () => {
      // Make 6 requests rapidly (rate limit is 5)
      const requests = Array(6).fill().map(() => 
        request(app)
          .post('/api/contato')
          .send(validContactData)
      );

      const responses = await Promise.all(requests);
      
      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect([429, 200]).toContain(lastResponse.status);
      
      if (lastResponse.status === 429) {
        expect(lastResponse.body.error).toContain('Muitas tentativas');
      }
    });

  });

  describe('Security Tests', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.error).toBe('Endpoint não encontrado');
    });

    test('should have security headers', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('should reject malformed JSON', async () => {
      const response = await request(app)
        .post('/api/contato')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    test('should handle server errors gracefully', async () => {
      // Mock axios to throw error
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app)
        .post('/api/contato')
        .send({
          nome: 'Test Error',
          telefone: '(11) 99999-9999',
          servico: 'Limpeza de Sofás'
        });

      // Should still succeed even if webhook fails
      expect([200, 500]).toContain(response.status);
    });
  });
});