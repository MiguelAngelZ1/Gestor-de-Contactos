/* Archivo: frontend/js/gastosFijos.js */

// Verifica que el código se esté ejecutando en el navegador
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {

    // Función para formatear un número como moneda (ej. $1.234,56)
    function formatearMoneda(valor) {
      let num = parseFloat(valor);
      if (isNaN(num)) num = 0;
      return '$' + num.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    // Función para obtener y mostrar los gastos fijos en la tabla
    function fetchGastosFijos() {
      fetch('/api/gastosFijos')
        .then(response => {
          if (!response.ok)
            throw new Error("Error en la respuesta de la red");
          return response.json();
        })
        .then(data => {
          // Selecciona el <tbody> de la tabla donde se mostrarán los gastos
          const tbody = document.querySelector('#tabla-gastos tbody');
          if (tbody) {
            tbody.innerHTML = ''; // Limpia el contenido previo
            data.forEach(expense => {
              const row = document.createElement('tr');
              // Construye la fila usando la información del gasto
              row.innerHTML = `
                <td>${expense.descripcion}</td>
                <td>${formatearMoneda(expense.monto)}</td>
                <td>${expense.observaciones || ''}</td>
                <td>${expense.estado || ''}</td>
                <td>
                  <button class="btn-edit" data-id="${expense.id}">Editar</button>
                  <button class="btn-delete" data-id="${expense.id}">Eliminar</button>
                </td>
              `;
              tbody.appendChild(row);
            });
          }
        })
        .catch(error => console.error("Error al obtener gastos fijos:", error));
    }

    // Función para agregar un nuevo gasto fijo mediante una petición POST
    function addGastoFijo(descripcion, monto, observaciones, estado) {
      // Usa la fecha actual en formato ISO (solo la parte de la fecha)
      const fecha = new Date().toISOString().split('T')[0];

      fetch('/api/gastosFijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, monto, fecha, observaciones, estado })
      })
        .then(response => {
          if (!response.ok)
            throw new Error("Error al agregar gasto fijo");
          return response.json();
        })
        .then(newExpense => {
          console.log('Gasto fijo agregado:', newExpense);
          // Una vez agregado, se actualiza la lista en la tabla
          fetchGastosFijos();
        })
        .catch(error => console.error("Error al agregar gasto fijo:", error));
    }

    // Configura el evento para el formulario que agrega un gasto fijo
    const formGasto = document.getElementById('form-gasto');
    if (formGasto) {
      formGasto.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita el envío tradicional del formulario

        // Obtiene los valores de los inputs
        const descripcion = document.getElementById('descripcion').value.trim();
        const montoStr = document.getElementById('monto').value;
        const observaciones = document.getElementById('observaciones').value.trim();
        const estado = document.getElementById('estado').value;

        // Convierte el valor del monto a número: limpia el string eliminando dos o más caracteres no numéricos
        const monto = parseFloat(montoStr.replace(/[^0-9.,-]+/g, '').replace(',', '.'));

        // Validaciones básicas para los campos
        if (!descripcion || isNaN(monto) || monto <= 0 || !estado) {
          alert("Por favor, complete correctamente todos los campos obligatorios.");
          return;
        }

        // Se llama a la función para agregar el gasto fijo, y luego se resetea el formulario
        addGastoFijo(descripcion, monto, observaciones, estado);
        formGasto.reset();
      });
    }

    // Se carga la lista de gastos fijos al iniciar la página
    fetchGastosFijos();
  });
}
