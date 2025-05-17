/* js/gastosFunctions.js */
/*
  Archivo: gastosFunctions.js
  Propósito: Manejar la lógica del registro de gastos fijos,
             incluyendo validación en tiempo real,
             renderización y persistencia con localStorage,
             gestión de eliminación mediante modal y la funcionalidad
             "Limpiar y Cargar" para actualizar un gasto fijo.
*/

document.addEventListener('DOMContentLoaded', function() {
  let gastos = [];
  let deleteTargetId = null;
  
  // Cargar gastos desde localStorage si existen.
  const storedGastos = localStorage.getItem('gastos');
  if (storedGastos) {
    gastos = JSON.parse(storedGastos);
  }
  
  // Función para guardar gastos en localStorage.
  function saveGastos() {
    localStorage.setItem('gastos', JSON.stringify(gastos));
  }
  
  // Referencias al DOM.
  const formGasto = document.getElementById('form-gasto');
  const tablaGastosBody = document.querySelector('#tabla-gastos tbody');
  const errorDescripcion = document.getElementById('error-descripcion');
  const errorMonto = document.getElementById('error-monto');
  const errorEstado = document.getElementById('error-estado');
  
  // Referencias para modal de eliminación.
  const modalDelete = document.getElementById('modal-delete');
  const modalConfirm = document.getElementById('modal-confirm');
  const modalCancel = document.getElementById('modal-cancel');
  
  // Referencias para modal de edición ("Limpiar y Cargar").
  const modalEdit = document.getElementById('modal-edit');
  const formEdit = document.getElementById('form-edit');
  const editId = document.getElementById('edit-id');
  const editMonto = document.getElementById('edit-monto');
  const editObservaciones = document.getElementById('edit-observaciones');
  const editEstado = document.getElementById('edit-estado');
  const errorEditMonto = document.getElementById('error-edit-monto');
  const errorEditEstado = document.getElementById('error-edit-estado');
  const btnCancelEdit = document.getElementById('cancel-edit');
  
  // Validaciones en tiempo real para el formulario principal.
  function validateDescripcion() {
    const descripcion = document.getElementById('descripcion').value.trim();
    if (descripcion === "") {
      errorDescripcion.innerText = "La descripción es requerida.";
      return false;
    } else {
      errorDescripcion.innerText = "";
      return true;
    }
  }
  
  function validateMonto() {
    const rawMonto = document.getElementById('monto').value;
    const normalizedMonto = rawMonto.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
    const monto = parseFloat(normalizedMonto);
    if (!monto || monto <= 0) {
      errorMonto.innerText = "El monto debe ser mayor a 0.";
      return false;
    } else {
      errorMonto.innerText = "";
      return true;
    }
  }
  
  function validateEstado() {
    const estado = document.getElementById('estado').value;
    if (estado === "" || estado === null) {
      errorEstado.innerText = "Debe seleccionar un estado del gasto.";
      return false;
    } else {
      errorEstado.innerText = "";
      return true;
    }
  }
  
  document.getElementById('descripcion').addEventListener('input', validateDescripcion);
  document.getElementById('monto').addEventListener('input', validateMonto);
  document.getElementById('estado').addEventListener('change', validateEstado);
  
  // Envío del formulario principal.
  formGasto.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const isDescValid = validateDescripcion();
    const isMontoValid = validateMonto();
    const isEstadoValid = validateEstado();
    
    if (!isDescValid || !isMontoValid || !isEstadoValid) return;
    
    const descripcion = document.getElementById('descripcion').value.trim();
    const rawMonto = document.getElementById('monto').value;
    const normalizedMonto = rawMonto.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
    const monto = parseFloat(normalizedMonto) || 0;
    const observaciones = document.getElementById('observaciones').value;
    const estado = document.getElementById('estado').value;
    
    const gasto = {
      id: Date.now(),
      descripcion,
      monto,
      observaciones,
      estado
    };
    
    gastos.push(gasto);
    saveGastos();
    renderGastos();
    
    formGasto.reset();
    errorDescripcion.innerText = "";
    errorMonto.innerText = "";
    errorEstado.innerText = "";
  });
  
  // Función para renderizar la tabla de gastos.
  function renderGastos() {
    tablaGastosBody.innerHTML = '';
    
    gastos.forEach((gasto) => {
      const fila = document.createElement('tr');
      
      // Formatear monto en formato 'es-AR'
      const montoFormateado = gasto.monto.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // Seleccionar ícono según el estado.
      const estadoIcono = (gasto.estado === 'Pendiente')
        ? '<i class="fa-solid fa-xmark" style="color: red; font-size: 1.5rem;"></i>'
        : '<i class="fa-solid fa-check" style="color: green; font-size: 1.5rem;"></i>';
      
      // Incorporar dos botones: uno para "Limpiar y Cargar" y otro para eliminar.
      fila.innerHTML = `
        <td>${gasto.descripcion}</td>
        <td>$${montoFormateado}</td>
        <td>${gasto.observaciones}</td>
        <td style="text-align: center;">${estadoIcono}</td>
        <td style="text-align: center;">
          <button class="btn btn-reset" data-id="${gasto.id}" style="margin-right: 0.5rem;">
            <i class="fa-solid fa-arrows-rotate"></i> Limpiar y Cargar
          </button>
          <button class="btn btn-delete" data-id="${gasto.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      
      tablaGastosBody.appendChild(fila);
    });
    
    saveGastos();
    
    // Asignar evento para los botones de eliminación.
    document.querySelectorAll('.btn-delete').forEach((button) => {
      button.addEventListener('click', function() {
        deleteTargetId = this.getAttribute('data-id');
        showModal(modalDelete);
      });
    });
    
    // Asignar evento para los botones de "Limpiar y Cargar" (edición).
    document.querySelectorAll('.btn-reset').forEach((button) => {
      button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        openEditModal(id);
      });
    });
  }
  
  // Funciones para el modal de eliminación.
  function showModal(modalElement) {
    modalElement.style.display = 'block';
  }
  
  function hideModal(modalElement) {
    modalElement.style.display = 'none';
  }
  
  modalConfirm.addEventListener('click', function() {
    if (deleteTargetId) {
      gastos = gastos.filter((gasto) => gasto.id != deleteTargetId);
      saveGastos();
      renderGastos();
      deleteTargetId = null;
    }
    hideModal(modalDelete);
  });
  
  modalCancel.addEventListener('click', function() {
    deleteTargetId = null;
    hideModal(modalDelete);
  });
  
  window.addEventListener('click', function(event) {
    if (event.target === modalDelete) hideModal(modalDelete);
    if (event.target === modalEdit) hideModal(modalEdit);
  });
  
  // Función para abrir el modal de "Limpiar y Cargar" en modo edición.
  function openEditModal(id) {
    const gasto = gastos.find((g) => g.id == id);
    if (!gasto) return;
    
    // Llenar los campos del formulario de edición con los valores actuales.
    editId.value = gasto.id;
    // El campo de monto se formatea; se asume que la clase "moneda" y Cleave.js se aplican también.
    editMonto.value = `$${gasto.monto.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    editObservaciones.value = gasto.observaciones;
    editEstado.value = gasto.estado;
    errorEditMonto.innerText = "";
    errorEditEstado.innerText = "";
    
    // Si es necesario, inicializar Cleave.js sobre el input de edición (solo si no se ha inicializado).
    new Cleave('#edit-monto', {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand',
      prefix: '$',
      noImmediatePrefix: false,
      delimiter: '.',
      numeralDecimalMark: ',',
      numeralDecimalScale: 2
    });
    
    showModal(modalEdit);
  }
  
  // Evento para cancelar la edición.
  btnCancelEdit.addEventListener('click', function() {
    hideModal(modalEdit);
  });
  
  // Validación en el formulario de edición (solo para el monto y estado, por ejemplo).
  function validateEditMonto() {
    const rawMonto = editMonto.value;
    const normalizedMonto = rawMonto.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
    const monto = parseFloat(normalizedMonto);
    if (!monto || monto <= 0) {
      errorEditMonto.innerText = "El monto debe ser mayor a 0.";
      return false;
    } else {
      errorEditMonto.innerText = "";
      return true;
    }
  }
  
  function validateEditEstado() {
    const estado = editEstado.value;
    if (estado === "" || estado === null) {
      errorEditEstado.innerText = "Debe seleccionar un estado.";
      return false;
    } else {
      errorEditEstado.innerText = "";
      return true;
    }
  }
  
  // Evento del formulario de edición para actualizar el gasto.
  formEdit.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const isMontoValid = validateEditMonto();
    const isEstadoValid = validateEditEstado();
    if (!isMontoValid || !isEstadoValid) return;
    
    const id = editId.value;
    const rawMonto = editMonto.value;
    const normalizedMonto = rawMonto.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
    const monto = parseFloat(normalizedMonto) || 0;
    const observaciones = editObservaciones.value;
    const estado = editEstado.value;
    
    // Actualizar el gasto en el arreglo.
    gastos = gastos.map((gasto) => {
      if (gasto.id == id) {
        return {
          ...gasto,
          monto,
          observaciones,
          estado
        };
      }
      return gasto;
    });
    
    saveGastos();
    renderGastos();
    hideModal(modalEdit);
  });
  
  // Inicializar la tabla al cargar la página.
  renderGastos();
});