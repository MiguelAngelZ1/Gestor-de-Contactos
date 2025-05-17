/* Archivo: frontend/js/ingresos.js */

// Espera a que el DOM se cargue completamente
document.addEventListener('DOMContentLoaded', () => {

  // Función para formatear números como moneda en formato Argentino
  function formatearMoneda(valor) {
    return '$' + parseFloat(valor).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Función para obtener el ingreso total desde el backend
  function obtenerIngresoTotal() {
    fetch('/api/config')
      .then(response => {
        if (!response.ok) throw new Error('Error al obtener ingreso');
        return response.json();
      })
      .then(data => {
        // Se espera que el backend retorne { ingreso_total: <valor> }
        const ingresoTotalEl = document.getElementById('ingresoTotal');
        if (ingresoTotalEl && typeof data.ingreso_total !== 'undefined') {
          ingresoTotalEl.innerText = formatearMoneda(data.ingreso_total);
        }
      })
      .catch(error => {
        console.error("Error al obtener el ingreso total:", error);
        const ingresoTotalEl = document.getElementById('ingresoTotal');
        if (ingresoTotalEl) ingresoTotalEl.innerText = "$0,00";
      });
  }
  
  // Llama a la función para obtener el ingreso total al cargar la página
  obtenerIngresoTotal();

  // Evento para manejar el clic en "Agregar Ingreso"
  const btnAgregarIngreso = document.getElementById('btnAgregarIngreso');
  if (btnAgregarIngreso) {
    btnAgregarIngreso.addEventListener('click', () => {
      const input = document.getElementById('ingresoInput');
      if (!input) return;
      const inputValor = input.value;
      // Se remueven caracteres que no sean dígitos, comas o puntos
      const ingresoValor = parseFloat(inputValor.replace(/[^0-9,.-]+/g, "").replace(',', '.'));

      if (isNaN(ingresoValor) || ingresoValor <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return;
      }

      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingresoTotal: ingresoValor })
      })
        .then(response => {
          if (!response.ok) throw new Error('Error al actualizar ingreso');
          return response.json();
        })
        .then(data => {
          // Se espera que el backend retorne { ingreso_total: <nuevo valor> }
          const ingresoTotalEl = document.getElementById('ingresoTotal');
          if (ingresoTotalEl && typeof data.ingreso_total !== 'undefined') {
            ingresoTotalEl.innerText = formatearMoneda(data.ingreso_total);
          }
          input.value = "";
        })
        .catch(error => {
          console.error("Error al actualizar el ingreso:", error);
          alert("No se pudo actualizar el ingreso.");
        });
    });
  }

  // Evento para manejar el clic en "Limpiar Ingreso"
  const btnLimpiarIngreso = document.getElementById('btnLimpiarIngreso');
  if (btnLimpiarIngreso) {
    btnLimpiarIngreso.addEventListener('click', () => {
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingresoTotal: 0 })
      })
        .then(response => {
          if (!response.ok) throw new Error('Error al limpiar ingreso');
          return response.json();
        })
        .then(data => {
          const ingresoTotalEl = document.getElementById('ingresoTotal');
          if (ingresoTotalEl && typeof data.ingreso_total !== 'undefined') {
            ingresoTotalEl.innerText = formatearMoneda(data.ingreso_total);
          }
        })
        .catch(error => {
          console.error("Error al limpiar el ingreso:", error);
          alert("No se pudo limpiar el ingreso.");
        });
    });
  }
});
