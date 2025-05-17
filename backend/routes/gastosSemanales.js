// backend/routes/gastosSemanales.js
// ========================================
// Endpoints para manejar los gastos semanales.
// Se agruparán por semana (del 1 al 4), se pueden agregar y eliminar gastos.
// ========================================

const express = require('express');
const router = express.Router();
const pool = require('../index'); // Conexión a la base de datos

// GET: Obtener los gastos semanales agrupados por semana
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT semana, json_agg(row_to_json(g)) as gastos
      FROM (
        SELECT id, semana, descripcion, monto, fecha
        FROM gastos_semanales
        ORDER BY id
      ) g
      GROUP BY semana
      ORDER BY semana;
    `);
    const data = {};
    result.rows.forEach(row => {
      data[row.semana] = row.gastos;
    });
    // Asegura que existan las semanas 1-4, incluso si están vacías
    for (let i = 1; i <= 4; i++) {
      if (!data[i]) data[i] = [];
    }
    res.json(data);
  } catch (err) {
    console.error("Error al obtener gastos semanales:", err);
    res.status(500).json({ error: 'Error al obtener los gastos semanales' });
  }
});

// POST: Agregar un gasto semanal para una semana específica
router.post('/:semana', async (req, res) => {
  const { semana } = req.params;  // Número de la semana, recibido por URL
  const { descripcion, monto, fecha } = req.body; // Datos del gasto
  try {
    const result = await pool.query(
      'INSERT INTO gastos_semanales (semana, descripcion, monto, fecha) VALUES ($1, $2, $3, $4) RETURNING *',
      [parseInt(semana), descripcion, monto, fecha]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al agregar gasto semanal:", err);
    res.status(500).json({ error: 'Error al agregar gasto semanal' });
  }
});

// DELETE: Eliminar todos los gastos de una semana específica
router.delete('/:semana', async (req, res) => {
  const { semana } = req.params;
  try {
    await pool.query('DELETE FROM gastos_semanales WHERE semana = $1', [parseInt(semana)]);
    res.json({ message: `Gastos de la semana ${semana} eliminados` });
  } catch (err) {
    console.error("Error al eliminar gastos de la semana", semana, ":", err);
    res.status(500).json({ error: 'Error al eliminar gastos de la semana' });
  }
});

// DELETE: Eliminar todos los gastos semanales
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM gastos_semanales');
    res.json({ message: 'Todos los gastos semanales eliminados' });
  } catch (err) {
    console.error("Error al eliminar todos los gastos semanales:", err);
    res.status(500).json({ error: 'Error al eliminar los gastos semanales' });
  }
});

module.exports = router;
