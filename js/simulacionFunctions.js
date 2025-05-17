/* js/simulacionFunctions.js */

/*
  Este archivo se encarga de procesar la simulación de escenarios
  a partir de los datos ingresados, como el ingreso mensual y la
  variación de gastos.
*/

// Seleccionamos el formulario de simulación
const simulationForm = document.getElementById('simulation-form');

// Añadimos un listener para el envío del formulario
simulationForm.addEventListener('submit', function(event) {
  // Prevenir el comportamiento por defecto de recarga
  event.preventDefault();

  // Recoger los valores ingresados
  const ingreso = parseFloat(document.getElementById('ingreso').value) || 0;
  const variacion = parseFloat(document.getElementById('variacion').value) || 0;

  // Ejemplo de cálculo de simulación:
  // Supongamos que "totalGastado" es un 100% de referencia,
  // la variación ajusta ese valor.
  const totalGastadoActual = 100; // Valor fijo de ejemplo
  const ajuste = totalGastadoActual * (variacion / 100);
  const nuevoTotalGastado = totalGastadoActual + ajuste;

  // Mostrar el resultado en el contenedor designado
  const resultDiv = document.getElementById('simulation-result');
  resultDiv.innerHTML = `
    <p>Con un ingreso de $${ingreso} y una variación de gastos del ${variacion}%,</p>
    <p>el total gastado simulado es: $${nuevoTotalGastado.toFixed(2)}</p>
  `;
});