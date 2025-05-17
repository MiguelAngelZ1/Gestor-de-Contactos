// Archivo: backend/routes/gastosSemanales.js

const express = require('express');
const router = express.Router();
const pool = require('../bd');

// GET: Obtener todos los gastos semanales agrupados por semana
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gastos_semanales ORDER BY semana DESC, fecha DESC');
    // Agrupar por semana
    const agrupados = {};
    result.rows.forEach(gasto => {
      if (!agrupados[gasto.semana]) agrupados[gasto.semana] = [];
      agrupados[gasto.semana].push(gasto);
    });
    res.json(agrupados);
  } catch (err) {
    console.error('Error al obtener gastos semanales:', err);
    res.status(500).json({ error: 'Error al obtener gastos semanales' });
  }
});

// POST: Agregar un gasto semanal a una semana específica
router.post('/:semana', async (req, res) => {
  const { semana } = req.params;
  const { descripcion, monto, fecha } = req.body;
  if (!descripcion || isNaN(monto) || monto <= 0 || !fecha) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO gastos_semanales (semana, descripcion, monto, fecha) VALUES ($1, $2, $3, $4) RETURNING *',
      [semana, descripcion, monto, fecha]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar gasto semanal:', err);
    res.status(500).json({ error: 'Error al agregar gasto semanal' });
  }
});

// DELETE: Eliminar todos los gastos de una semana específica
router.delete('/:semana', async (req, res) => {
  const { semana } = req.params;
  try {
    const result = await pool.query('DELETE FROM gastos_semanales WHERE semana = $1 RETURNING *', [semana]);
    res.json({ message: `Gastos de la semana ${semana} eliminados`, count: result.rowCount });
  } catch (err) {
    console.error('Error al eliminar gastos de la semana:', err);
    res.status(500).json({ error: 'Error al eliminar gastos de la semana' });
  }
});

// DELETE: Eliminar todos los gastos semanales
router.delete('/', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM gastos_semanales RETURNING *');
    res.json({ message: 'Todos los gastos semanales eliminados', count: result.rowCount });
  } catch (err) {
    console.error('Error al eliminar todos los gastos semanales:', err);
    res.status(500).json({ error: 'Error al eliminar todos los gastos semanales' });
  }
});

module.exports = router;
