/* js/gastosFunctions.js */
/*
  Archivo: gastosFunctions.js
  Propósito: Manejar la lógica del registro de gastos fijos,
             incluyendo validación en tiempo real,
             renderización y persistencia usando la API REST,
             gestión de eliminación mediante modal y la funcionalidad
             de edición para actualizar un gasto fijo.
*/

document.addEventListener('DOMContentLoaded', function() {
  let deleteTargetId = null;
  let cleaveEditMonto = null; // Para controlar la instancia de Cleave.js en edición

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

  // Referencias para modal de edición.
  const modalEdit = document.getElementById('modal-edit');
  const formEdit = document.getElementById('form-edit');
  const editId = document.getElementById('edit-id');
  const editMonto = document.getElementById('edit-monto');
  const editObservaciones = document.getElementById('edit-observaciones');
  const editEstado = document.getElementById('edit-estado');
  const errorEditMonto = document.getElementById('error-edit-monto');
  const errorEditEstado = document.getElementById('error-edit-estado');
  const btnCancelEdit = document.getElementById('cancel-edit');

  // Utilidad para formatear moneda
  function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

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
    if (isNaN(monto) || monto <= 0) {
      errorMonto.innerText = "El monto debe ser mayor a 0.";
      return false;
    } else {
      errorMonto.innerText = "";
      return true;
    }
  }

  function validateEstado() {
    const estado = document.getElementById('estado').value;
    if (!estado) {
      errorEstado.innerText = "Debe seleccionar un estado del gasto.";
      return false;
    } else {
      errorEstado.innerText = "";
      return true;
    }
  }

  const descripcionInput = document.getElementById('descripcion');
  const montoInput = document.getElementById('monto');
  const estadoInput = document.getElementById('estado');
  if (descripcionInput) descripcionInput.addEventListener('input', validateDescripcion);
  if (montoInput) montoInput.addEventListener('input', validateMonto);
  if (estadoInput) estadoInput.addEventListener('change', validateEstado);

  // Envío del formulario principal.
  if (formGasto) {
    formGasto.addEventListener('submit', function(event) {
      event.preventDefault();

      const isDescValid = validateDescripcion();
      const isMontoValid = validateMonto();
      const isEstadoValid = validateEstado();

      if (!isDescValid || !isMontoValid || !isEstadoValid) return;

      const descripcion = descripcionInput.value.trim();
      const rawMonto = montoInput.value;
      const normalizedMonto = rawMonto.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
      const monto = parseFloat(normalizedMonto) || 0;
      const observaciones = document.getElementById('observaciones').value;
      const estado = estadoInput.value;

      fetch('/api/gastosFijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, monto, observaciones, estado })
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al agregar gasto');
        return res.json();
      })
      .then(() => {
        renderGastos();
        formGasto.reset();
        errorDescripcion.innerText = "";
        errorMonto.innerText = "";
        errorEstado.innerText = "";
      })
      .catch(() => alert('No se pudo agregar el gasto.'));
    });
  }

  // Función para renderizar la tabla de gastos.
  function renderGastos() {
    if (!tablaGastosBody) return;
    tablaGastosBody.innerHTML = '';

    fetch('/api/gastosFijos')
      .then(res => res.json())
      .then(gastos => {
        gastos.forEach((gasto) => {
          const fila = document.createElement('tr');
          const montoFormateado = formatearMoneda(gasto.monto);

          const estadoIcono = (gasto.estado === 'Pendiente')
            ? '<i class="fa-solid fa-xmark" style="color: red; font-size: 1.5rem;"></i>'
            : '<i class="fa-solid fa-check" style="color: green; font-size: 1.5rem;"></i>';

          fila.innerHTML = `
            <td>${gasto.descripcion}</td>
            <td>${montoFormateado}</td>
            <td>${gasto.observaciones || ''}</td>
            <td style="text-align: center;">${estadoIcono}</td>
            <td style="text-align: center;">
              <button class="btn btn-reset" data-id="${gasto.id}" style="margin-right: 0.5rem;">
                <i class="fa-solid fa-arrows-rotate"></i> Editar
              </button>
              <button class="btn btn-delete" data-id="${gasto.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `;
          tablaGastosBody.appendChild(fila);
        });

        // Asignar evento para los botones de eliminación.
        document.querySelectorAll('.btn-delete').forEach((button) => {
          button.addEventListener('click', function() {
            deleteTargetId = this.getAttribute('data-id');
            showModal(modalDelete);
          });
        });

        // Asignar evento para los botones de edición.
        document.querySelectorAll('.btn-reset').forEach((button) => {
          button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            openEditModal(id);
          });
        });
      })
      .catch(() => {
        tablaGastosBody.innerHTML = '<tr><td colspan="5">No se pudieron cargar los gastos.</td></tr>';
      });
  }

  // Funciones para el modal de eliminación.
  function showModal(modalElement) {
    if (modalElement) modalElement.style.display = 'block';
  }

  function hideModal(modalElement) {
    if (modalElement) modalElement.style.display = 'none';
  }

  if (modalConfirm) {
    modalConfirm.addEventListener('click', function() {
      if (deleteTargetId) {
        fetch(`/api/gastosFijos/${deleteTargetId}`, {
          method: 'DELETE'
        })
        .then(res => {
          if (!res.ok) throw new Error('Error al eliminar gasto');
          return res.json();
        })
        .then(() => {
          renderGastos();
          deleteTargetId = null;
          hideModal(modalDelete);
        })
        .catch(() => alert('No se pudo eliminar el gasto.'));
      } else {
        hideModal(modalDelete);
      }
    });
  }

  if (modalCancel) {
    modalCancel.addEventListener('click', function() {
      deleteTargetId = null;
      hideModal(modalDelete);
    });
  }

  window.addEventListener('click', function(event) {
    if (event.target === modalDelete) hideModal(modalDelete);
    if (event.target === modalEdit) hideModal(modalEdit);
  });

  window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      hideModal(modalDelete);
      hideModal(modalEdit);
    }
  });

  // Función para abrir el modal de edición.
  function openEditModal(id) {
    fetch(`/api/gastosFijos/${id}`)
      .then(res => res.json())
      .then(gasto => {
        editId.value = gasto.id;
        editMonto.value = formatearMoneda(gasto.monto);
        editObservaciones.value = gasto.observaciones || '';
        editEstado.value = gasto.estado;
        errorEditMonto.innerText = "";
        errorEditEstado.innerText = "";

        if (cleaveEditMonto) cleaveEditMonto.destroy();
        cleaveEditMonto = new Cleave('#edit-monto', {
          numeral: true,
          numeralThousandsGroupStyle: 'thousand',
          prefix: '$',
          noImmediatePrefix: false,
          delimiter: '.',
          numeralDecimalMark: ',',
          numeralDecimalScale: 2
        });

        showModal(modalEdit);
      })
      .catch(() => alert('No se pudo cargar el gasto para editar.'));
  }

  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', function() {
      hideModal(modalEdit);
    });
  }

  function validateEditMonto() {
    const rawMonto = editMonto.value;
    const normalizedMonto = rawMonto.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
    const monto = parseFloat(normalizedMonto);
    if (isNaN(monto) || monto <= 0) {
      errorEditMonto.innerText = "El monto debe ser mayor a 0.";
      return false;
    } else {
      errorEditMonto.innerText = "";
      return true;
    }
  }

  function validateEditEstado() {
    const estado = editEstado.value;
    if (!estado) {
      errorEditEstado.innerText = "Debe seleccionar un estado.";
      return false;
    } else {
      errorEditEstado.innerText = "";
      return true;
    }
  }

  if (formEdit) {
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

      fetch(`/api/gastosFijos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto, observaciones, estado })
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al actualizar gasto');
        return res.json();
      })
      .then(() => {
        renderGastos();
        hideModal(modalEdit);
      })
      .catch(() => alert('No se pudo actualizar el gasto.'));
    });
  }

  // Inicializar la tabla al cargar la página.
  renderGastos();
});