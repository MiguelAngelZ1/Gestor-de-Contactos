/* js/dashboardFunctions.js */
/*
  Archivo: dashboardFunctions.js
  Propósito: Funciones específicas para la página del Dashboard (index.html).
  Aquí se incluyen cálculos, la actualización visual de las tarjetas de resumen
  y la configuración de los gráficos con Chart.js.
*/

/**
 * Función para actualizar las tarjetas de resumen financiero.
 * Actualiza los elementos con id "totalGastado", "presupuesto" y "saldoRestante".
 *
 * @param {number} totalGastado - Total gastado hasta el momento.
 * @param {number} presupuesto - Ingreso acumulado (presupuesto total).
 * @param {number} saldoRestante - Diferencia entre presupuesto y gasto.
 */
function actualizarResumen(totalGastado, presupuesto, saldoRestante) {
  const formatearValor = (valor) => valor.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Verifica que los elementos existen antes de actualizar
  const totalGastadoEl = document.getElementById('totalGastado');
  const presupuestoEl = document.getElementById('presupuesto');
  const saldoRestanteEl = document.getElementById('saldoRestante');

  if (totalGastadoEl) totalGastadoEl.innerText = `$${formatearValor(totalGastado)}`;
  if (presupuestoEl) presupuestoEl.innerText = `$${formatearValor(presupuesto)}`;
  if (saldoRestanteEl) saldoRestanteEl.innerText = `$${formatearValor(saldoRestante)}`;
}

/**
 * Función para inicializar y actualizar el gráfico que muestra la distribución del presupuesto.
 * Utiliza Chart.js para renderizar un gráfico de barras con los datos de gasto y saldo.
 *
 * @param {number} totalGastado - Total gastado hasta el momento.
 * @param {number} saldoRestante - Saldo restante (presupuesto - totalGastado).
 */
let chartInstance = null; // Variable global para mantener la instancia del gráfico.
function actualizarGrafico(totalGastado, saldoRestante) {
  const canvas = document.getElementById('chartCanvas');
  if (!canvas) return; // Evita errores si el canvas no existe

  const ctx = canvas.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = {
    labels: ['Total Gastado', 'Saldo Restante'],
    datasets: [{
      label: 'Valores ($)',
      data: [totalGastado, saldoRestante],
      backgroundColor: ['#f44336', '#4caf50']
    }]
  };

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Distribución del Presupuesto'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString('es-AR');
            }
          }
        }
      }
    }
  });
}

// Llamadas iniciales de ejemplo (puedes eliminarlas si cargas datos reales dinámicamente)
actualizarResumen(0, 0, 0);
actualizarGrafico(0, 0);

/*
  Nota: Se pueden agregar funciones adicionales, como:
    - Función para cargar datos desde el backend o localStorage.
    - Función para recalcular totales según nuevos ingresos o gastos.
    - Funciones para manejar interacciones adicionales del usuario.
*/