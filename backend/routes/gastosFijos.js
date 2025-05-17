/* Archivo: backend/routes/gastosFijos.js */

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {

    // Formatea un número como moneda argentina ($1.234,56)
    function formatearMoneda(valor) {
      const num = Number(valor);
      if (isNaN(num)) return '$0,00';
      return num.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    // Muestra un mensaje simple (puedes personalizar o usar una librería de notificaciones)
    function mostrarMensaje(mensaje, tipo = 'error') {
      alert(`${tipo.toUpperCase()}: ${mensaje}`);
    }

    // Obtiene y muestra los gastos fijos
    async function fetchGastosFijos() {
      try {
        const response = await fetch('/api/gastosFijos');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        const tbody = document.querySelector('#tabla-gastos tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        data.forEach(expense => {
          const row = document.createElement('tr');
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
      } catch (error) {
        console.error('Error al obtener gastos fijos:', error);
        mostrarMensaje('No se pudo cargar la lista de gastos fijos.', 'error');
      }
    }

    // Agrega un nuevo gasto fijo
    async function addGastoFijo(descripcion, monto, observaciones, estado) {
      const fecha = new Date().toISOString().split('T')[0];
      try {
        const response = await fetch('/api/gastosFijos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ descripcion, monto, fecha, observaciones, estado }),
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const newExpense = await response.json();
        console.log('Gasto fijo agregado:', newExpense);
        await fetchGastosFijos();
        mostrarMensaje('Gasto fijo agregado correctamente.', 'success');
      } catch (error) {
        console.error('Error al agregar gasto fijo:', error);
        mostrarMensaje('No se pudo agregar el gasto fijo.', 'error');
      }
    }

    // Convierte texto a número flotante válido para monto
    function parseMonto(montoStr) {
      if (!montoStr) return NaN;
      // Reemplaza coma por punto y elimina caracteres no numéricos excepto punto y signo menos
      const limpio = montoStr.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
      return parseFloat(limpio);
    }

    // Evento del formulario para agregar gasto fijo
    const formGasto = document.getElementById('form-gasto');
    if (formGasto) {
      formGasto.addEventListener('submit', async (event) => {
        event.preventDefault();

        const descripcion = document.getElementById('descripcion').value.trim();
        const montoStr = document.getElementById('monto').value.trim();
        const observaciones = document.getElementById('observaciones').value.trim();
        const estado = document.getElementById('estado').value;

        const monto = parseMonto(montoStr);

        if (!descripcion) {
          mostrarMensaje('La descripción es obligatoria.', 'error');
          return;
        }
        if (isNaN(monto) || monto <= 0) {
          mostrarMensaje('Ingrese un monto válido mayor que cero.', 'error');
          return;
        }
        if (!estado) {
          mostrarMensaje('Seleccione un estado.', 'error');
          return;
        }

        await addGastoFijo(descripcion, monto, observaciones, estado);
        formGasto.reset();
      });
    }

    // Carga inicial de gastos fijos
    fetchGastosFijos();
  });
}
