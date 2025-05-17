// backend/routes/gastosFijos.js
// ========================================
// Endpoints para gestionar los gastos fijos.
// Permite obtener y agregar nuevos gastos fijos.
// ========================================

const express = require('express');
const router = express.Router();
const pool = require('../index');

// GET: Recuperar todos los gastos fijos ordenados por id
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gastos_fijos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener gastos fijos:", err);
    res.status(500).json({ error: 'Error al obtener los gastos fijos' });
  }
});

// POST: Agregar un nuevo gasto fijo
router.post('/', async (req, res) => {
  const { descripcion, monto, fecha } = req.body; // Se espera que se envíe un objeto con estas propiedades
  try {
    const result = await pool.query(
      'INSERT INTO gastos_fijos (descripcion, monto, fecha) VALUES ($1, $2, $3) RETURNING *',
      [descripcion, monto, fecha]
    );
    res.json(result.rows[0]); // Devuelve el nuevo registro insertado
  } catch (err) {
    console.error("Error al agregar gasto fijo:", err);
    res.status(500).json({ error: 'Error al agregar gasto fijo' });
  }
});

module.exports = router;
