/* Archivo: frontend/js/gastosFijos.js */

document.addEventListener('DOMContentLoaded', () => {

  // Función para formatear un número como moneda (por ejemplo, para mostrar $1.234,56)
  function formatearMoneda(valor) {
    return '$' + parseFloat(valor).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Función para obtener y mostrar los gastos fijos en la tabla
  function fetchGastosFijos() {
    fetch('/api/gastosFijos')
      .then(response => response.json())
      .then(data => {
        // Selecciona el cuerpo de la tabla usando el selector CSS
        const tbody = document.querySelector('#tabla-gastos tbody');
        if (tbody) {
          tbody.innerHTML = ''; // Limpia la tabla
          data.forEach(expense => {
            const row = document.createElement('tr');
            // Construye la fila con los datos del gasto
            row.innerHTML = `
              <td>${expense.descripcion}</td>
              <td>${formatearMoneda(expense.monto)}</td>
              <td>${expense.observaciones || ''}</td>
              <td>${expense.estado || ''}</td>
              <td>
                <!-- Aquí podrías incluir botones de editar/eliminar -->
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
    // Para el campo fecha, se puede usar la fecha actual en formato ISO (solo la parte de la fecha)
    const fecha = new Date().toISOString().split('T')[0];
    
    fetch('/api/gastosFijos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion, monto, fecha, observaciones, estado })
    })
      .then(response => response.json())
      .then(newExpense => {
        console.log('Gasto fijo agregado:', newExpense);
        // Una vez agregado, actualizamos la lista de gastos fijos.
        fetchGastosFijos();
      })
      .catch(error => console.error("Error al agregar gasto fijo:", error));
  }
  
  // Configuración del evento del formulario para agregar un nuevo gasto fijo
  const formGasto = document.getElementById('form-gasto');
  if (formGasto) {
    formGasto.addEventListener('submit', (event) => {
      event.preventDefault(); // Evita que se envíe el formulario de forma tradicional
      
      // Obtiene los valores de los inputs por sus IDs
      const descripcion = document.getElementById('descripcion').value.trim();
      const montoStr = document.getElementById('monto').value;
      const observaciones = document.getElementById('observaciones').value.trim();
      const estado = document.getElementById('estado').value;
      
      // Se limpia el string para transformar el monto en número (retira símbolos y separadores)
      const monto = parseFloat(montoStr.replace(/[^0-9.,-]+/g, '').replace(',', '.'));
      
      // Validaciones básicas
      if (!descripcion || isNaN(monto) || monto <= 0 || !estado) {
        alert("Por favor, complete correctamente todos los campos obligatorios.");
        return;
      }
      
      // Llama a la función para agregar el gasto fijo
      addGastoFijo(descripcion, monto, observaciones, estado);
      
      // Reinicia el formulario luego del envío
      formGasto.reset();
    });
  }
  
  // Inicializa la carga de gastos fijos al cargar la página
  fetchGastosFijos();
});
