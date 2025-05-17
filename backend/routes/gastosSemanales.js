// Archivo: backend/routes/gastosSemanales.js

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {

    // Formatea número a moneda ARS
    function formatCurrency(amount) {
      const num = Number(amount);
      if (isNaN(num)) return '$0,00';
      return num.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // Muestra mensajes simples
    function mostrarMensaje(mensaje, tipo = 'error') {
      alert(`${tipo.toUpperCase()}: ${mensaje}`);
    }

    // Obtiene y muestra gastos semanales
    async function fetchGastosSemanales() {
      try {
        const response = await fetch('/api/gastosSemanales');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        Object.keys(data).forEach(semana => {
          const lista = document.querySelector(`ul.lista-gastos-semana[data-semana="${semana}"]`);
          if (!lista) return;

          lista.innerHTML = '';
          data[semana].forEach(expense => {
            const li = document.createElement('li');
            li.textContent = `${expense.descripcion} - ${formatCurrency(expense.monto)} - ${expense.fecha}`;
            lista.appendChild(li);
          });

          const gastosSemana = data[semana].reduce((total, exp) => total + Number(exp.monto), 0);
          const semanaDiv = document.querySelector(`div.semana[data-semana="${semana}"]`);
          if (semanaDiv) {
            const progressBar = semanaDiv.querySelector('.progress-bar');
            const progressText = semanaDiv.querySelector('.progress-text');
            const max = 1000; // Valor máximo para la barra
            const percentage = Math.min((gastosSemana / max) * 100, 100);

            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (progressText) progressText.textContent = formatCurrency(gastosSemana);
          }
        });
      } catch (error) {
        console.error('Error al obtener gastos semanales:', error);
        mostrarMensaje('No se pudo cargar la lista de gastos semanales.', 'error');
      }
    }

    // Agrega un gasto semanal
    async function addGastoSemanal(semana, descripcion, monto, fecha) {
      try {
        const response = await fetch(`/api/gastosSemanales/${semana}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ descripcion, monto, fecha }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const newExpense = await response.json();
        console.log('Gasto semanal agregado:', newExpense);
        await fetchGastosSemanales();
        mostrarMensaje('Gasto semanal agregado correctamente.', 'success');
      } catch (error) {
        console.error('Error al agregar gasto semanal:', error);
        mostrarMensaje('No se pudo agregar el gasto semanal.', 'error');
      }
    }

    // Limpia gastos de una semana
    async function clearSemana(semana) {
      try {
        const response = await fetch(`/api/gastosSemanales/${semana}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        console.log(`Gastos de la semana ${semana} eliminados:`, result);
        await fetchGastosSemanales();
        mostrarMensaje(`Gastos de la semana ${semana} eliminados.`, 'success');
      } catch (error) {
        console.error('Error al limpiar gastos de la semana:', error);
        mostrarMensaje(`No se pudieron eliminar los gastos de la semana ${semana}.`, 'error');
      }
    }

    // Limpia todos los gastos semanales
    async function clearAllSemanas() {
      try {
        const response = await fetch('/api/gastosSemanales', { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        console.log('Todos los gastos semanales eliminados:', result);
        await fetchGastosSemanales();
        mostrarMensaje('Todos los gastos semanales eliminados.', 'success');
      } catch (error) {
        console.error('Error al limpiar todos los gastos semanales:', error);
        mostrarMensaje('No se pudieron eliminar todos los gastos semanales.', 'error');
      }
    }

    // Parsea monto de string a número flotante válido
    function parseMonto(montoStr) {
      if (!montoStr) return NaN;
      const limpio = montoStr.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
      return parseFloat(limpio);
    }

    // Eventos para abrir modal de agregar gasto semanal
    document.querySelectorAll('.btn-add-semana').forEach(button => {
      button.addEventListener('click', () => {
        const semana = button.getAttribute('data-semana');
        const modal = document.getElementById('modal-semana-add');
        if (!modal) return;

        document.getElementById('semana-numero').value = semana;
        document.getElementById('semana-fecha').value = new Date().toISOString().split('T')[0];
        modal.style.display = 'block';
      });
    });

    // Evento para cancelar modal
    const modalCancel = document.getElementById('modal-semana-cancel');
    if (modalCancel) {
      modalCancel.addEventListener('click', () => {
        const modal = document.getElementById('modal-semana-add');
        if (modal) modal.style.display = 'none';
      });
    }

    // Evento para manejar formulario del modal
    const formSemanaAdd = document.getElementById('form-semana-add');
    if (formSemanaAdd) {
      formSemanaAdd.addEventListener('submit', event => {
        event.preventDefault();

        const semana = document.getElementById('semana-numero').value;
        const descripcion = document.getElementById('semana-descripcion').value.trim();
        const montoStr = document.getElementById('semana-monto').value.trim();
        const fecha = document.getElementById('semana-fecha').value;

        const monto = parseMonto(montoStr);

        if (!descripcion) {
          mostrarMensaje('La descripción es obligatoria.', 'error');
          return;
        }
        if (isNaN(monto) || monto <= 0) {
          mostrarMensaje('Ingrese un monto válido mayor que cero.', 'error');
          return;
        }
        if (!fecha) {
          mostrarMensaje('La fecha es obligatoria.', 'error');
          return;
        }

        addGastoSemanal(semana, descripcion, monto, fecha);
        formSemanaAdd.reset();

        const modal = document.getElementById('modal-semana-add');
        if (modal) modal.style.display = 'none';
      });
    }

    // Evento para limpiar gastos por semana
    document.querySelectorAll('.btn-clear-week').forEach(button => {
      button.addEventListener('click', () => {
        const semana = button.getAttribute('data-semana');
        if (confirm(`¿Estás seguro de limpiar los gastos de la semana ${semana}?`)) {
          clearSemana(semana);
        }
      });
    });

    // Botón para limpiar todos los gastos semanales
    const btnClearAll = document.querySelector('.btn-clear-all');
    if (btnClearAll) {
      btnClearAll.addEventListener('click', () => {
        if (confirm('¿Estás seguro de limpiar los gastos de todas las semanas?')) {
          clearAllSemanas();
        }
      });
    }

    // Carga inicial
    fetchGastosSemanales();
  });
}
