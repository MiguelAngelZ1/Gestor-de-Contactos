// Lógica de gestión de gastos semanales usando la API REST (backend y base de datos)

document.addEventListener('DOMContentLoaded', function () {
  // Utilidad para formatear moneda
  function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Obtener y renderizar todos los gastos semanales agrupados por semana
  function cargarGastosSemanales() {
    fetch('/api/gastosSemanales')
      .then(res => res.json())
      .then(agrupados => {
        [1, 2, 3, 4].forEach(num => renderSemana(agrupados, num));
      })
      .catch(() => {
        [1, 2, 3, 4].forEach(num => renderSemana({}, num));
      });
  }

  // Renderizar una semana específica
  function renderSemana(agrupados, semana) {
    const lista = document.querySelector(`.lista-gastos-semana[data-semana="${semana}"]`);
    const progressBar = document.querySelector(`.semana[data-semana="${semana}"] .progress-bar`);
    const progressText = document.querySelector(`.semana[data-semana="${semana}"] .progress-text`);
    if (!lista || !progressBar || !progressText) return;

    lista.innerHTML = '';
    const gastos = agrupados && agrupados[semana] ? agrupados[semana] : [];
    let total = 0;

    gastos.forEach((gasto) => {
      total += Number(gasto.monto) || 0;
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${gasto.descripcion}</span>
        <span>${formatearMoneda(gasto.monto)}</span>
        <button class="btn-delete-gasto-semana" data-id="${gasto.id}" title="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      lista.appendChild(li);
    });

    progressText.textContent = formatearMoneda(total);
    progressBar.style.width = '100%';
  }

  // Abrir modal para agregar gasto semanal
  document.querySelectorAll('.btn-add-semana').forEach(btn => {
    btn.addEventListener('click', function () {
      const semana = this.getAttribute('data-semana');
      document.getElementById('semana-numero').value = semana;
      document.getElementById('semana-descripcion').value = '';
      document.getElementById('semana-monto').value = '';
      document.getElementById('semana-fecha').value = new Date().toISOString().slice(0, 10);
      document.getElementById('modal-semana-add').style.display = 'block';
    });
  });

  // Cerrar modal de agregar gasto semanal
  document.getElementById('modal-semana-cancel').addEventListener('click', function () {
    document.getElementById('modal-semana-add').style.display = 'none';
  });

  // Guardar gasto semanal desde el modal (POST a la API)
  document.getElementById('form-semana-add').addEventListener('submit', function (e) {
    e.preventDefault();
    const semana = document.getElementById('semana-numero').value;
    const descripcion = document.getElementById('semana-descripcion').value.trim();
    const montoRaw = document.getElementById('semana-monto').value.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
    const monto = parseFloat(montoRaw);
    const fecha = document.getElementById('semana-fecha').value;

    if (!descripcion || isNaN(monto) || monto <= 0) {
      alert('Complete todos los campos correctamente.');
      return;
    }

    fetch(`/api/gastosSemanales/${semana}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion, monto, fecha })
    })
      .then(res => res.json())
      .then(() => {
        cargarGastosSemanales();
        document.getElementById('modal-semana-add').style.display = 'none';
      })
      .catch(() => alert('Error al guardar el gasto semanal.'));
  });

  // Eliminar gasto individual de una semana (DELETE a la API)
  document.querySelectorAll('.lista-gastos-semana').forEach(lista => {
    lista.addEventListener('click', function (e) {
      if (e.target.closest('.btn-delete-gasto-semana')) {
        const btn = e.target.closest('.btn-delete-gasto-semana');
        const id = btn.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar este gasto?')) {
          fetch(`/api/gastosSemanales/item/${id}`, {
            method: 'DELETE'
          })
            .then(res => res.json())
            .then(() => cargarGastosSemanales())
            .catch(() => alert('Error al eliminar el gasto.'));
        }
      }
    });
  });

  // Limpiar todos los gastos de una semana (DELETE a la API)
  document.querySelectorAll('.btn-clear-week').forEach(btn => {
    btn.addEventListener('click', function () {
      const semana = this.getAttribute('data-semana');
      if (confirm(`¿Seguro que deseas limpiar todos los gastos de la semana ${semana}?`)) {
        fetch(`/api/gastosSemanales/${semana}`, {
          method: 'DELETE'
        })
          .then(res => res.json())
          .then(() => cargarGastosSemanales())
          .catch(() => alert('Error al limpiar la semana.'));
      }
    });
  });

  // Limpiar todos los gastos de todas las semanas (DELETE a la API)
  const btnClearAll = document.querySelector('.btn-clear-all');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', function () {
      if (confirm('¿Seguro que deseas limpiar TODOS los gastos semanales?')) {
        fetch('/api/gastosSemanales', {
          method: 'DELETE'
        })
          .then(res => res.json())
          .then(() => cargarGastosSemanales())
          .catch(() => alert('Error al limpiar todos los gastos.'));
      }
    });
  }

  // Inicializar Cleave.js en el input del modal de semana
  if (typeof Cleave !== 'undefined') {
    new Cleave('#semana-monto', {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand',
      prefix: '$',
      noImmediatePrefix: false,
      delimiter: '.',
      numeralDecimalMark: ',',
      numeralDecimalScale: 2
    });
  }

  // Cerrar modal al hacer click fuera del contenido
  window.addEventListener('click', function (event) {
    const modal = document.getElementById('modal-semana-add');
    if (event.target === modal) modal.style.display = 'none';
  });

  // Render inicial desde la base de datos
  cargarGastosSemanales();
});