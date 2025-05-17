/* js/recordatoriosFunctions.js */

/*
  Este script se encarga de la gestión de recordatorios:
  - Agrega nuevos recordatorios mediante el formulario.
  - Muestra la lista de recordatorios de forma dinámica.
  - Permite eliminar un recordatorio mostrando un modal de confirmación
    y un cartel de alerta.
*/

document.addEventListener('DOMContentLoaded', function() {
  // Removemos el foco de todos los botones para que no queden "presionados"
  document.querySelectorAll('.btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      this.blur();
    });
  });

  // Array para almacenar los recordatorios (en un escenario real se persistirían en base de datos o localStorage)
  let recordatorios = [];

  // Variable global para almacenar el ítem (elemento DOM) que se pretende eliminar
  let recordatorioToDelete = null;

  // Seleccionamos el formulario y el contenedor de los recordatorios
  const reminderForm = document.getElementById('reminder-form');
  const listContainer = document.getElementById('lista-recordatorios');

  // Aseguramos que el modal y el cartel de alerta estén ocultos al cargar la página
  const confirmModal = document.getElementById('confirmModal');
  const alertMessage = document.getElementById('alertMessage');
  confirmModal.style.display = 'none';
  alertMessage.classList.add('hidden');
  alertMessage.style.display = 'none';

  /**
   * Función para renderizar la lista de recordatorios.
   * Reinicia el contenido del contenedor y vuelve a insertar cada recordatorio almacenado.
   */
  function renderRecordatorios() {
    // Dejamos el título y reiniciamos el contenido del contenedor
    listContainer.innerHTML = '<h2>Recordatorios Activos</h2>';

    // Recorremos el array y creamos cada ítem dinámicamente
    recordatorios.forEach(rec => {
      const recDiv = document.createElement('div');
      recDiv.className = 'reminder-item';
      // Asignamos un atributo 'data-id' para identificar el ítem
      recDiv.setAttribute('data-id', rec.id);

      // Se crea el contenido HTML: un párrafo con ícono, descripción, fecha formateada
      // y un botón alineado a la derecha para eliminar.
      recDiv.innerHTML = `
        <p><i class="fas fa-bell"></i> ${rec.descripcion} - ${new Date(rec.fecha).toLocaleDateString('es-AR')}</p>
        <button type="button" class="btn delete-btn" style="margin-left:auto;" onclick="openDeleteModal(this)">
          <i class="fas fa-trash"></i>
        </button>
      `;
      // Insertamos el nuevo ítem en el contenedor
      listContainer.appendChild(recDiv);
    });
  }

  // Evento submit del formulario para agregar un nuevo recordatorio
  reminderForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir envío tradicional

    // Recoger y recortar valores del formulario
    const descripcion = document.getElementById('recordatorio').value.trim();
    const fecha = document.getElementById('fecha-recordatorio').value;

    // Validación simple: evitar campos vacíos
    if (!descripcion || !fecha) return;

    // Crear objeto recordatorio con un id único usando Date.now()
    const nuevoRecordatorio = {
      id: Date.now(),
      descripcion: descripcion,
      fecha: fecha
    };

    // Agregar el nuevo recordatorio al array
    recordatorios.push(nuevoRecordatorio);
    // Actualizamos la lista de recordatorios en pantalla
    renderRecordatorios();
    // Reiniciamos el formulario
    reminderForm.reset();
  });

  /* ------------------------------ */
  /* Funciones para Modal y Alerta  */
  /* ------------------------------ */

  // Función para abrir el modal de confirmación al hacer click en eliminar
  window.openDeleteModal = function(button) {
    recordatorioToDelete = button.closest('.reminder-item');
    confirmModal.style.display = 'block';
  };

  // Función para cerrar el modal
  window.closeModal = function() {
    confirmModal.style.display = 'none';
  };

  // Función para confirmar la eliminación del recordatorio seleccionado
  window.confirmDelete = function() {
    if (recordatorioToDelete) {
      const id = recordatorioToDelete.getAttribute('data-id');
      // Filtrar el array y eliminar el recordatorio con el id indicado
      recordatorios = recordatorios.filter(rec => rec.id != id);
      renderRecordatorios();
      showAlert("Recordatorio eliminado correctamente", true);
      recordatorioToDelete = null;
    } else {
      showAlert("Error: No se pudo eliminar el recordatorio", false);
    }
    closeModal();
  };

  /**
   * Función para mostrar una alerta en pantalla.
   * @param {string} message - Mensaje a mostrar.
   * @param {boolean} success - Si es true, muestra estilo de éxito; si no, error.
   */
  window.showAlert = function(message, success) {
    // Actualizamos el contenido del alert con el ícono adecuado
    alertMessage.innerHTML = success 
      ? `<p><i class="fas fa-check-circle"></i> ${message}</p>`
      : `<p><i class="fas fa-exclamation-circle"></i> ${message}</p>`;

    // Mostramos el alert usando la clase visible (para activar la transición de opacidad)
    alertMessage.style.display = 'block';
    alertMessage.classList.remove('hidden');
    alertMessage.classList.add('visible');

    // Después de 3 segundos, removemos la clase visible para que la alerta se desvanezca
    setTimeout(() => {
      alertMessage.classList.remove('visible');
      alertMessage.classList.add('hidden');
      alertMessage.style.display = 'none';
    }, 3000);
  };

  // Cierra el modal si el usuario hace click fuera del contenido del modal
  window.onclick = function(event) {
    if (event.target === confirmModal) {
      closeModal();
    }
  };
});