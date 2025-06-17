# Perfect Clean - Site Premium

Site premium para Perfect Clean com integração backend, design responsivo e tecnologia avançada.

## 🚀 Funcionalidades

### Frontend
- ✅ Design premium com paleta Azul Marinho (#1A1F71) monocromática
- ✅ Totalmente responsivo (Mobile-first)
- ✅ Animações suaves e hover effects
- ✅ Formulário inteligente com validações
- ✅ Geração automática de link WhatsApp
- ✅ Otimizações para performance e acessibilidade

### Backend
- ✅ Servidor Express.js com segurança (Helmet)
- ✅ Rate limiting (5 tentativas por 15min)
- ✅ API de contato com validações
- ✅ Integração com webhooks (n8n)
- ✅ Logs estruturados
- ✅ Health check endpoint

### Segurança
- ✅ CSP (Content Security Policy)
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validação de entrada
- ✅ Sanitização de dados

## 📋 Instalação

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Passos

1. **Clone e instale dependências:**
```bash
cd site-v1
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Compile o CSS (obrigatório):**
```bash
npm run build:css
```

4. **Execute em desenvolvimento:**
```bash
npm run dev
```

5. **Execute em produção:**
```bash
npm start
```

### 🚀 Script de Inicialização Rápida

```bash
# Executa tudo automaticamente
./scripts/start.sh
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
PORT=3000
N8N_WEBHOOK_URL=https://seu-webhook.com/perfect-clean
NODE_ENV=production
```

### Estrutura de Arquivos

```
site-v1/
├── index.html                    # Página principal
├── server.js                     # Servidor Express.js
├── package.json                  # Dependências e scripts
├── tailwind.config.js            # Configuração Tailwind
├── jest.config.js                # Configuração de testes
├── Dockerfile                    # Container Docker
├── docker-compose.yml            # Orquestração Docker
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore                    # Arquivos ignorados pelo Git
├── public/                       # Arquivos públicos
│   ├── assets/
│   │   ├── css/                  # CSS compilado
│   │   └── js/                   # JavaScript frontend
│   ├── icons/                    # Ícones e favicons
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service Worker
├── src/                          # Código fonte
│   ├── input.css                 # CSS fonte (Tailwind)
│   └── js/                       # JavaScript modular
│       ├── modules/              # Módulos JS
│       └── utils/                # Utilitários JS
├── server/                       # Backend
│   ├── middleware/               # Middlewares
│   │   └── security.js          # Segurança e validação
│   └── utils/                    # Utilitários servidor
│       └── logger.js             # Sistema de logs
├── tests/                        # Testes automatizados
│   ├── server.test.js           # Testes do servidor
│   └── setup.js                 # Configuração de testes
└── logs/                         # Arquivos de log
```

## 📱 Recursos Mobile

- Touch-friendly (tap highlights removidos)
- Otimizações iOS (zoom preventido)
- Scroll suave
- Menu mobile responsivo
- Formulários otimizados

## 🔗 APIs

### POST /api/contato
Processa formulário de contato com validações completas.

**Body:**
```json
{
  "nome": "string",
  "telefone": "(11) 99999-9999",
  "servico": "string",
  "data": "2025-01-01",
  "horario": "Manhã (8h-12h)"
}
```

### GET /api/health
Health check do servidor.

## 🚀 Deploy

### Vercel/Netlify
1. Conecte o repositório
2. Configure as variáveis de ambiente
3. Deploy automático

### VPS/Cloud
1. Clone o repositório
2. Configure .env
3. Execute `npm install && npm start`
4. Configure proxy reverso (nginx)

## 📊 Performance

- Lazy loading de imagens
- Intersection Observer para animações
- Debounced scroll events
- Prefetch de recursos críticos
- CSS/JS otimizado

## 🎨 Customização

### Cores (Tailwind)
```javascript
colors: {
  'navy': '#1A1F71',        // Azul marinho (predominante)
  'snow': '#F8F9FA',        // Branco neve
  'silver': '#B0B0B0',      // Cinza prata
  'navy-light': '#2C3E95'   // Azul marinho claro
}
```

### Tipografia
- Títulos: Playfair Display
- Textos: Montserrat

## 🔒 Segurança

- Rate limiting: 5 tentativas/15min
- CSP headers configurados
- Validação rigorosa de entrada
- Sanitização de dados
- HTTPS recomendado

## 📞 Suporte

Para dúvidas técnicas ou customizações, consulte a documentação do código ou entre em contato.

---

**Perfect Clean** - Limpeza Premium com Confiança e Tecnologia 🚀