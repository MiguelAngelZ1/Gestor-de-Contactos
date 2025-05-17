// backend/index.js
// ========================================
// Este es el punto de entrada del servidor Express.
// - Carga las variables de entorno (DATABASE_URL, PORT).
// - Importa la conexión a PostgreSQL desde el módulo 'db.js'.
// - Configura Express para manejar peticiones, servir archivos estáticos del directorio 'frontend'
//   y exponer los endpoints del API en rutas específicas.
// ========================================

require('dotenv').config(); // Carga las variables definidas en .env
const express = require('express'); // Importa Express
const cors = require('cors'); // Importa CORS
const path = require('path'); // Importa path para trabajar con rutas de archivos
const pool = require('./bd'); // Importa la conexión a PostgreSQL desde db.js

const app = express();
const port = process.env.PORT || 3000;

// Configuración de Middlewares
app.use(cors());
app.use(express.json());

// SERVIR ARCHIVOS ESTÁTICOS
// Se servirán los archivos de la carpeta 'frontend' ubicada en la raíz del proyecto
app.use(express.static(path.join(__dirname, '../frontend')));

// IMPORTAR Y USAR LAS RUTAS DEL API
const configRoutes = require('./routes/config');
const gastosFijosRoutes = require('./routes/gastosFijos');
const gastosSemanalesRoutes = require('./routes/gastosSemanales');

app.use('/api/config', configRoutes);
app.use('/api/gastosFijos', gastosFijosRoutes);
app.use('/api/gastosSemanales', gastosSemanalesRoutes);

// Fallback: Para cualquier ruta desconocida se envía el index.html del frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Inicia el servidor en el puerto especificado y en todas las interfaces (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
