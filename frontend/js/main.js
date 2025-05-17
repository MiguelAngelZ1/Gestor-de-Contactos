/* frontend/js/main.js */
/*
  Función global para:
  - Inicializar el formato de moneda en todos los inputs con la clase "moneda" usando Cleave.js.
  - Actualizar el resumen financiero global (ingreso, gasto y saldo) consultando siempre al backend.
*/

document.addEventListener('DOMContentLoaded', function () {
  // Inicializar Cleave.js en todos los inputs con la clase "moneda"
  if (typeof Cleave !== 'undefined') {
    document.querySelectorAll('.moneda').forEach(function (input) {
      new Cleave(input, {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        prefix: '$',
        noImmediatePrefix: false,
        rawValueTrimPrefix: true,
        delimiter: '.',
        numeralDecimalMark: ',',
        numeralDecimalScale: 2
      });
    });
  }

  // Función para formatear moneda
  function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Función para actualizar el resumen financiero desde la base de datos
  function updateDashboard() {
    // Obtener ingreso total desde el backend
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        const ingresoTotal = typeof data.ingreso_total !== 'undefined' ? Number(data.ingreso_total) : 0;
        // Obtener gastos fijos desde el backend
        fetch('/api/gastosFijos')
          .then(res => res.json())
          .then(gastos => {
            let totalGastado = Array.isArray(gastos)
              ? gastos.reduce((acc, gasto) => acc + (parseFloat(gasto.monto) || 0), 0)
              : 0;
            let saldoRestante = ingresoTotal - totalGastado;

            // Obtener los elementos del DOM (si es que existen en esta página)
            const ingresoEl = document.getElementById('ingresoTotal');
            const totalGastadoEl = document.getElementById('totalGastado');
            const saldoRestanteEl = document.getElementById('saldoRestante');

            if (ingresoEl) ingresoEl.innerText = formatearMoneda(ingresoTotal);
            if (totalGastadoEl) totalGastadoEl.innerText = formatearMoneda(totalGastado);
            if (saldoRestanteEl) saldoRestanteEl.innerText = formatearMoneda(saldoRestante);
          })
          .catch(() => {
            // Si falla la carga de gastos, mostrar solo el ingreso
            const ingresoEl = document.getElementById('ingresoTotal');
            if (ingresoEl) ingresoEl.innerText = formatearMoneda(data.ingreso_total || 0);
          });
      })
      .catch(() => {
        // Si falla la carga de ingreso, mostrar todo en cero
        const ingresoEl = document.getElementById('ingresoTotal');
        const totalGastadoEl = document.getElementById('totalGastado');
        const saldoRestanteEl = document.getElementById('saldoRestante');
        if (ingresoEl) ingresoEl.innerText = "$0,00";
        if (totalGastadoEl) totalGastadoEl.innerText = "$0,00";
        if (saldoRestanteEl) saldoRestanteEl.innerText = "$0,00";
      });
  }

  // Llamada a updateDashboard() al cargar la página.
  updateDashboard();
});