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
  // Función auxiliar para formatear números a dos decimales y con separador de miles.
  const formatearValor = (valor) => valor.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Actualiza el contenido de cada tarjeta individualmente.
  // Se asume que en el DOM existen elementos con los siguientes ids.
  document.getElementById('totalGastado').innerText = `$${formatearValor(totalGastado)}`;
  document.getElementById('presupuesto').innerText = `$${formatearValor(presupuesto)}`;
  document.getElementById('saldoRestante').innerText = `$${formatearValor(saldoRestante)}`;
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
  // Se obtiene el contexto 2D del canvas con id "chartCanvas".
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  
  // Si ya existe un gráfico, se destruye para reinicializarlo.
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Datos y configuración del gráfico de barras.
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
            // Añade el signo de dólar a cada tick
            callback: function(value) {
              return '$' + value;
            }
          }
        }
      }
    }
  });
}

// Ejemplo de llamadas iniciales para demostrar la funcionalidad.
// En la aplicación real, estos valores se actualizarán dinámicamente.
actualizarResumen(0, 0, 0);
actualizarGrafico(0, 0);

/*
  Nota: Se pueden agregar funciones adicionales, como:
    - Función para cargar datos desde el backend o localStorage.
    - Función para recalcular totales según nuevos ingresos o gastos.
    - Funciones para manejar interacciones adicionales del usuario.
*/