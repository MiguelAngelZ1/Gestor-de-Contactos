// backend/db.js
require('dotenv').config(); // Carga las variables de entorno definidas en .env
const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL de conexión definida en .env
  ssl: { rejectUnauthorized: false } // Requerido en Render para conexiones seguras
});

module.exports = pool;
