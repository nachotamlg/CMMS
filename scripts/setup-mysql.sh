#!/bin/bash

# ============================================
# CMMS Biomédico - Script de Setup MySQL
# Crea la base de datos y usuario MySQL
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables por defecto
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_ROOT_USER="${MYSQL_ROOT_USER:-root}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
DB_NAME="cmms_biomedico"
DB_USER="cmms_user"
DB_PASSWORD="${DB_PASSWORD:-cmms_password_123}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}CMMS Biomédico - Setup MySQL${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Solicitar credenciales del root si no están disponibles
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
  echo -e "${YELLOW}Ingrese la contraseña del usuario root de MySQL:${NC}"
  read -sp "Contraseña root: " MYSQL_ROOT_PASSWORD
  echo ""
fi

# Permitir cambiar el usuario de base de datos
read -p "¿Desea cambiar el usuario de BD? (actual: $DB_USER) [s/n]: " change_user
if [ "$change_user" = "s" ] || [ "$change_user" = "S" ]; then
  read -p "Nuevo usuario: " DB_USER
fi

# Permitir cambiar la contraseña
read -p "¿Desea cambiar la contraseña de BD? [s/n]: " change_password
if [ "$change_password" = "s" ] || [ "$change_password" = "S" ]; then
  read -sp "Nueva contraseña: " DB_PASSWORD
  echo ""
fi

echo -e "\n${YELLOW}Configuración:${NC}"
echo "Host: $MYSQL_HOST"
echo "Puerto: $MYSQL_PORT"
echo "Base de datos: $DB_NAME"
echo "Usuario: $DB_USER"
echo ""

# Confirmar antes de proceder
read -p "¿Continuar con la creación? [s/n]: " confirm
if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
  echo -e "${YELLOW}Operación cancelada.${NC}"
  exit 0
fi

echo -e "\n${BLUE}Conectando a MySQL...${NC}"

# Crear base de datos y usuario
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASSWORD" <<EOF
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS $DB_NAME 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Asignar permisos
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Mostrar información
SELECT '✓ Base de datos creada' AS resultado;
SELECT CONCAT('✓ Usuario creado: $DB_USER@%') AS resultado;
SELECT CONCAT('✓ Usuario creado: $DB_USER@localhost') AS resultado;
EOF

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✓ Base de datos y usuario creados exitosamente${NC}"
  
  # Ejecutar el script SQL de inicialización
  echo -e "\n${BLUE}Ejecutando script de inicialización...${NC}"
  
  mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < "$(dirname "$0")/setup-mysql-complete.sql"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Tablas creadas exitosamente${NC}\n"
    
    # Mostrar información de conexión
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Setup completado${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "\n${YELLOW}Información de conexión:${NC}"
    echo "Host: $MYSQL_HOST"
    echo "Puerto: $MYSQL_PORT"
    echo "Base de datos: $DB_NAME"
    echo "Usuario: $DB_USER"
    echo -e "\n${YELLOW}Cadena de conexión:${NC}"
    echo "mysql://${DB_USER}:${DB_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${DB_NAME}"
    echo -e "\n${YELLOW}Usuarios por defecto creados:${NC}"
    echo "Admin: admin@cmms.local / admin123"
    echo "Supervisor: supervisor@cmms.local / supervisor123"
    echo "Técnico: juan@cmms.local / tecnico123"
    echo ""
  else
    echo -e "${RED}✗ Error al ejecutar el script SQL${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ Error al conectar a MySQL${NC}"
  exit 1
fi
