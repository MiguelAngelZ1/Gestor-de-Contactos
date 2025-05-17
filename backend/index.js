// backend/index.js
// ========================================
// Punto de entrada del servidor Express:
// - Carga las variables de entorno.
// - Verifica la conexión a PostgreSQL.
// - Configura Express para servir archivos estáticos del directorio 'frontend'
//   y exponer los endpoints del API en rutas específicas.
// ========================================

require('dotenv').config(); // Carga las variables definidas en .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./bd');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas del API
const configRoutes = require('./routes/config');
const gastosFijosRoutes = require('./routes/gastosFijos');
const gastosSemanalesRoutes = require('./routes/gastosSemanales');

app.use('/api/config', configRoutes);
app.use('/api/gastosFijos', gastosFijosRoutes);
app.use('/api/gastosSemanales', gastosSemanalesRoutes);

// Middleware para manejo de errores generales (debe ir antes del wildcard)
app.use((err, req, res, next) => {
  console.error('Error general:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta wildcard para el frontend (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Verifica la conexión a la base de datos antes de iniciar el servidor
pool.query('SELECT 1')
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });

async function fetchGastosFijos() {
  const response = await fetch('/api/gastosFijos');
  if (!response.ok) throw new Error('Error al obtener gastos fijos');
  return await response.json();
}
