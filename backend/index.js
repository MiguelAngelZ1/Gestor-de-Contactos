// backend/index.js
// ========================================
// Este es el punto de entrada del servidor Express.
// - Carga las variables de entorno (DATABASE_URL, PORT).
// - Configura la conexión a PostgreSQL usando el paquete pg.
// - Usa Express para manejar peticiones, servir archivos estáticos del directorio 'frontend'
//   y exponer los endpoints del API en rutas específicas.
// ========================================

require('dotenv').config(); // Carga las variables definidas en .env
const express = require('express'); // Importa el framework Express
const cors = require('cors'); // Importa CORS para permitir peticiones desde otros orígenes
const path = require('path'); // Importa path para trabajar con rutas de archivos
const { Pool } = require('pg'); // Importa el Pool de pg para la conexión a PostgreSQL

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Conexión leída del .env
  ssl: { rejectUnauthorized: false } // Requerido en Render para conexiones seguras
});

// Configuración de Middlewares
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite leer datos en formato JSON desde las peticiones

// SERVIR ARCHIVOS ESTÁTICOS
// Se servirán los archivos que estén en la carpeta 'frontend' ubicada en la raíz del proyecto
app.use(express.static(path.join(__dirname, '../frontend')));

// IMPORTAR Y USAR LAS RUTAS DEL API
const configRoutes = require('./routes/config');
const gastosFijosRoutes = require('./routes/gastosFijos');
const gastosSemanalesRoutes = require('./routes/gastosSemanales');

app.use('/api/config', configRoutes);
app.use('/api/gastosFijos', gastosFijosRoutes);
app.use('/api/gastosSemanales', gastosSemanalesRoutes);

// Fallback: Para cualquier ruta desconocida, se envía el index.html del frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Inicia el servidor en el puerto especificado, ligándolo a todas las interfaces (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

module.exports = pool;
