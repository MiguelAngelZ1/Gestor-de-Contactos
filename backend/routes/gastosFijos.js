/* Archivo: backend/routes/gastosFijos.js */

const express = require('express');
const router = express.Router();
const pool = require('../bd');

// GET: Obtener todos los gastos fijos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gastos_fijos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener gastos fijos:', err);
    res.status(500).json({ error: 'Error al obtener gastos fijos' });
  }
});

// POST: Agregar un gasto fijo
router.post('/', async (req, res) => {
  const { descripcion, monto, fecha, observaciones, estado } = req.body;
  if (!descripcion || isNaN(monto) || monto <= 0 || !fecha) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO gastos_fijos (descripcion, monto, fecha, observaciones, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [descripcion, monto, fecha, observaciones, estado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar gasto fijo:', err);
    res.status(500).json({ error: 'Error al agregar gasto fijo' });
  }
});

// DELETE: Eliminar un gasto fijo por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM gastos_fijos WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Gasto fijo no encontrado' });
    }
    res.json({ message: 'Gasto fijo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar gasto fijo:', err);
    res.status(500).json({ error: 'Error al eliminar gasto fijo' });
  }
});

// PUT: Editar un gasto fijo por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { descripcion, monto, fecha, observaciones, estado } = req.body;
  if (!descripcion || isNaN(monto) || monto <= 0 || !fecha) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  try {
    const result = await pool.query(
      'UPDATE gastos_fijos SET descripcion = $1, monto = $2, fecha = $3, observaciones = $4, estado = $5 WHERE id = $6 RETURNING *',
      [descripcion, monto, fecha, observaciones, estado, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Gasto fijo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar gasto fijo:', err);
    res.status(500).json({ error: 'Error al actualizar gasto fijo' });
  }
});

module.exports = router;
