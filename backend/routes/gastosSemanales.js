/* Archivo: frontend/js/gastosSemanales.js */
document.addEventListener('DOMContentLoaded', () => {

  // Función para formatear un número como moneda (ej. $1.234,56)
  function formatCurrency(amount) {
    return '$' + parseFloat(amount).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Función para obtener y mostrar los gastos semanales
  function fetchGastosSemanales() {
    fetch('/api/gastosSemanales')
      .then(response => response.json())
      .then(data => {
        // data debe venir como un objeto con claves "1", "2", "3" y "4"
        Object.keys(data).forEach(semana => {
          // Seleccionamos la lista de gastos para la semana correspondiente
          const lista = document.querySelector(`ul.lista-gastos-semana[data-semana="${semana}"]`);
          if (lista) {
            lista.innerHTML = ''; // Limpiar contenido previo
            data[semana].forEach(expense => {
              const li = document.createElement('li');
              // Mostramos descripción, monto formateado y la fecha
              li.textContent = `${expense.descripcion} - ${formatCurrency(expense.monto)} - ${expense.fecha}`;
              lista.appendChild(li);
            });
          }

          // Opcional: Actualizar la barra de progreso y el texto (por ejemplo, mostrando el total gastado en la semana)
          const gastosSemana = data[semana].reduce((total, exp) => total + parseFloat(exp.monto), 0);
          const semanaDiv = document.querySelector(`div.semana[data-semana="${semana}"]`);
          if (semanaDiv) {
            const progressBar = semanaDiv.querySelector('.progress-bar');
            const progressText = semanaDiv.querySelector('.progress-text');
            // Por ejemplo, supongamos que el máximo es 1000 para determinar el ancho porcentual
            const max = 1000;
            const percentage = Math.min((gastosSemana / max) * 100, 100);
            if (progressBar && progressText) {
              progressBar.style.width = `${percentage}%`;
              progressText.textContent = formatCurrency(gastosSemana);
            }
          }
        });
      })
      .catch(error => console.error("Error al obtener gastos semanales:", error));
  }

  // Función para agregar un gasto semanal (POST a /api/gastosSemanales/:semana)
  function addGastoSemanal(semana, descripcion, monto, fecha) {
    fetch(`/api/gastosSemanales/${semana}`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion, monto, fecha })
    })
      .then(response => response.json())
      .then(newExpense => {
        console.log("Gasto semanal agregado:", newExpense);
        fetchGastosSemanales();
      })
      .catch(error => console.error("Error al agregar gasto semanal:", error));
  }

  // Función para limpiar los gastos de una semana (DELETE a /api/gastosSemanales/:semana)
  function clearSemana(semana) {
    fetch(`/api/gastosSemanales/${semana}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(result => {
        console.log(`Gastos de la semana ${semana} eliminados:`, result);
        fetchGastosSemanales();
      })
      .catch(error => console.error("Error al limpiar gastos de la semana:", error));
  }

  // Función para limpiar todos los gastos semanales (DELETE a /api/gastosSemanales)
  function clearAllSemanas() {
    fetch('/api/gastosSemanales', { method: 'DELETE' })
      .then(response => response.json())
      .then(result => {
        console.log("Todos los gastos semanales eliminados:", result);
        fetchGastosSemanales();
      })
      .catch(error => console.error("Error al limpiar todos los gastos semanales:", error));
  }

  /*=====================================
  =
  =  Eventos para agregar gasto semanal mediante modal
  =
  =====================================*/

  // Al hacer clic en los botones "Agregar Gasto" de cada semana, se abre el modal
  document.querySelectorAll('.btn-add-semana').forEach(button => {
    button.addEventListener('click', () => {
      // Obtiene el número de semana desde el atributo data
      const semana = button.getAttribute('data-semana');
      // Asigna este valor al input oculto del modal
      document.getElementById('semana-numero').value = semana;
      // Opcional: Prellenar la fecha actual en el input (la fecha se obtiene en formato ISO YYYY-MM-DD)
      document.getElementById('semana-fecha').value = new Date().toISOString().split('T')[0];
      // Muestra el modal de agregar gasto semanal (aquí lo hacemos visible cambiando el estilo)
      document.getElementById('modal-semana-add').style.display = 'block';
    });
  });

  // Evento para cancelar el modal de gasto semanal
  const modalCancel = document.getElementById('modal-semana-cancel');
  if (modalCancel) {
    modalCancel.addEventListener('click', () => {
      document.getElementById('modal-semana-add').style.display = 'none';
    });
  }

  // Manejo del formulario del modal para agregar gasto semanal
  const formSemanaAdd = document.getElementById('form-semana-add');
  if (formSemanaAdd) {
    formSemanaAdd.addEventListener('submit', event => {
      event.preventDefault();
      const semana = document.getElementById('semana-numero').value;
      const descripcion = document.getElementById('semana-descripcion').value.trim();
      const montoStr = document.getElementById('semana-monto').value;
      const fecha = document.getElementById('semana-fecha').value; // Este campo es de solo lectura
      // Convertir el monto a número limpiando la cadena (retira símbolos de moneda y separadores)
      const monto = parseFloat(montoStr.replace(/[^0-9.,-]+/g, '').replace(',', '.'));
      
      if (!descripcion || isNaN(monto) || monto <= 0 || !fecha) {
        alert("Por favor, complete los campos de forma correcta.");
        return;
      }
      
      addGastoSemanal(semana, descripcion, monto, fecha);
      formSemanaAdd.reset();
      document.getElementById('modal-semana-add').style.display = 'none';
    });
  }

  /*=====================================
  =
  =  Eventos para limpiar gastos semanales
  =
  =====================================*/

  // Cada botón para limpiar una semana (btn-clear-week)
  document.querySelectorAll('.btn-clear-week').forEach(button => {
    button.addEventListener('click', () => {
      const semana = button.getAttribute('data-semana');
      if (confirm(`¿Estás seguro de limpiar los gastos de la semana ${semana}?`)) {
        clearSemana(semana);
      }
    });
  });

  // Botón global para limpiar todas las semanas (btn-clear-all)
  const btnClearAll = document.querySelector('.btn-clear-all');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (confirm("¿Estás seguro de limpiar los gastos de todas las semanas?")) {
        clearAllSemanas();
      }
    });
  }

  // Finalmente, se carga la lista de gastos semanales al iniciar la página
  fetchGastosSemanales();
});
