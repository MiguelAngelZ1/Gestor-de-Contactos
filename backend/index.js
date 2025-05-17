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

// Ruta wildcard para el frontend (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Middleware para manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error general:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Verificar conexión a PostgreSQL antes de iniciar el servidor
pool.connect()
  .then(() => {
    console.log('Conexión exitosa a PostgreSQL');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a PostgreSQL:', err);
    process.exit(1); // Termina el proceso si falla la conexión
  });
