// backend/bd.js
// ========================================
// Configuración del pool de conexiones a PostgreSQL.
// Utiliza variables de entorno y soporta conexión segura para Render.
// ========================================

require('dotenv').config();
const { Pool } = require('pg');

// Configuración condicional de SSL según entorno
const isProduction = process.env.NODE_ENV === 'production';

// Log para depuración: muestra la URL real que se está usando
if (!isProduction) {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = pool;
