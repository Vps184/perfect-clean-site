#!/bin/bash
# Perfect Clean - Script de inicialização

echo "🚀 Iniciando Perfect Clean..."

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Compilar CSS
echo "🎨 Compilando CSS..."
npm run build:css

# Verificar se o CSS foi gerado
if [ ! -f "public/assets/css/styles.css" ]; then
    echo "❌ Erro: CSS não foi compilado"
    exit 1
fi

echo "✅ CSS compilado com sucesso ($(du -h public/assets/css/styles.css | cut -f1))"

# Iniciar servidor
echo "🖥️ Iniciando servidor..."
npm start