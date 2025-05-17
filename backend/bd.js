// backend/db.js
require('dotenv').config(); // Carga las variables definidas en .env
const { Pool } = require('pg'); // Importa Pool de pg

// Configurar la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Conexión leída del .env
  ssl: { rejectUnauthorized: false } // Requerido en Render para conexiones seguras
});

module.exports = pool;
