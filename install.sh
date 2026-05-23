#!/bin/bash

# Script de instalación automática para el Sistema de Gestión de Mantenimiento Biomédico
# Hospital Dr. Benigno Sánchez - Quillacollo

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Sistema de Gestión de Mantenimiento Biomédico          ║"
echo "║   Hospital Dr. Benigno Sánchez - Quillacollo             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Verificar Node.js
print_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versión 18+ requerida. Tienes: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detectado"

# Preguntar qué instalar
echo ""
print_info "Instalando Frontend (Next.js)..."

# Instalar Frontend
echo ""
print_info "════════════════════════════════════════════════════════════"
print_info "INSTALANDO FRONTEND (Next.js)"
print_info "════════════════════════════════════════════════════════════"

# Instalar dependencias
print_info "Instalando dependencias npm..."
npm install
if [ $? -ne 0 ]; then
    print_error "Error instalando dependencias"
    exit 1
fi
print_success "Dependencias instaladas"

# Crear .env.local si no existe
if [ ! -f ".env.local" ]; then
    print_info "Creando archivo .env.local..."
    cp .env.example .env.local
    print_success "Archivo .env.local creado"
    print_warning "Edita .env.local si deseas personalizar la configuración"
fi

print_success "Frontend instalado correctamente"

# Mensaje final
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🎉 INSTALACIÓN COMPLETADA 🎉                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}Frontend instalado:${NC}"
echo "  Para iniciar: npm run dev"
echo "  URL: http://localhost:3000"
echo ""

echo -e "${BLUE}📚 Para más información consulta README.md${NC}"
echo ""
