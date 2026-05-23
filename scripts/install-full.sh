#!/bin/bash

# Script de instalación completa del proyecto
# Hospital Dr. Benigno Sánchez - Quillacollo

set -e

echo "================================================"
echo "Instalación del Sistema de Gestión de Equipos"
echo "Hospital Dr. Benigno Sánchez"
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir títulos
print_section() {
    echo ""
    echo -e "${YELLOW}=== $1 ===${NC}"
    echo ""
}

# Función para imprimir éxito
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Función para imprimir error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar requisitos
print_section "Verificando requisitos previos"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Descárgalo de https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node --version) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_success "npm $(npm --version) encontrado"

# Instalar Frontend
print_section "Instalando Frontend (Next.js)"

if [ -f "package.json" ]; then
    print_success "Encontrado package.json"
    npm install
    print_success "Dependencias del frontend instaladas"
else
    print_error "No se encontró package.json en el directorio raíz"
    exit 1
fi

# Crear archivo .env.local
print_section "Configurando variables de entorno"

if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success "Archivo .env.local creado"
    fi
else
    print_success "Archivo .env.local ya existe"
fi

# Mostrar instrucciones finales
print_section "Instalación completada"

echo -e "${GREEN}El sistema ha sido instalado exitosamente.${NC}"
echo ""
echo "Para iniciar la aplicación:"
echo ""
echo -e "${YELLOW}Frontend:${NC}"
echo "  npm run dev"
echo "  Disponible en: http://localhost:3000"
echo ""
echo -e "${GREEN}Para más información, consulta README.md${NC}"
echo ""
