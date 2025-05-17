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
      .then(response => response.json())
      .then(data => {
        // Se espera que el backend retorne { ingreso_total: <valor> }
        document.getElementById('ingresoTotal').innerText = formatearMoneda(data.ingreso_total);
      })
      .catch(error => console.error("Error al obtener el ingreso total:", error));
  }
  
  // Llama a la función para obtener el ingreso total al cargar la página
  obtenerIngresoTotal();

  // Evento para manejar el clic en "Agregar Ingreso"
  document.getElementById('btnAgregarIngreso').addEventListener('click', () => {
    // Obtener el valor ingresado y limpiarlo de caracteres que no sean dígitos o punto
    const inputValor = document.getElementById('ingresoInput').value;
    // Se remueven caracteres que no sean dígitos, comas o puntos
    const ingresoValor = parseFloat(inputValor.replace(/[^0-9,.-]+/g, "").replace(',', '.'));
    
    if (isNaN(ingresoValor) || ingresoValor <= 0) {
      alert("Por favor, ingrese un monto válido.");
      return;
    }
    
    // Realiza una petición POST al endpoint /api/config para actualizar el ingreso total.
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingresoTotal: ingresoValor })
    })
      .then(response => response.json())
      .then(data => {
        // Se espera que el backend retorne { ingresoTotal: <nuevo valor> } o similar.
        document.getElementById('ingresoTotal').innerText = formatearMoneda(data.ingresoTotal);
        // Opcional: Limpiar el campo de entrada
        document.getElementById('ingresoInput').value = "";
      })
      .catch(error => console.error("Error al actualizar el ingreso:", error));
  });

  // Evento para manejar el clic en "Limpiar Ingreso".
  // Este ejemplo reinicia el ingreso a 0; puedes ajustar la lógica según lo necesites.
  document.getElementById('btnLimpiarIngreso').addEventListener('click', () => {
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingresoTotal: 0 })
    })
      .then(response => response.json())
      .then(data => {
        document.getElementById('ingresoTotal').innerText = formatearMoneda(data.ingresoTotal);
      })
      .catch(error => console.error("Error al limpiar el ingreso:", error));
  });
});
