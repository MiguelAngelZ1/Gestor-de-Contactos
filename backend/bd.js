// backend/bd.js
// ========================================
// Configuración del pool de conexiones a PostgreSQL.
// Utiliza variables de entorno y soporta conexión segura para Render.
// ========================================

require('dotenv').config();
const { Pool } = require('pg');

// Crea una instancia del pool de conexiones con configuración desde .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necesario para Render (SSL sin verificación estricta)
  },
});

module.exports = pool;
