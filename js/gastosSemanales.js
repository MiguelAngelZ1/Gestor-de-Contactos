// Archivo: js/gastosSemanales.js

document.addEventListener('DOMContentLoaded', () => {
  // Si no existe la clave "gastos" (gastos fijos) en localStorage, la inicializamos con un array vacío.
  if (!localStorage.getItem('gastos')) {
    localStorage.setItem('gastos', JSON.stringify([]));
  }

  // Función auxiliar: Retorna la estructura actualizada de gastos semanales.
  function getGastosSemanales() {
    return JSON.parse(localStorage.getItem('gastosSemanales')) || {
      "1": [],
      "2": [],
      "3": [],
      "4": []
    };
  }

  // Variable global con la estructura actual.
  let gastosSemanales = getGastosSemanales();
  localStorage.setItem('gastosSemanales', JSON.stringify(gastosSemanales));

  /**
   * updateGastosSemanalesUI – Actualiza la interfaz de la sección de gastos semanales.
   * Calcula la asignación base: (ingresoTotal - totalGastosFijos) / 4.
   * Luego recorre las semanas (1 a 4) aplicando la lógica de déficit:
   *   - La Semana 1 usa la asignación base.
   *   - Si se gasta de más, el exceso se transfiere a la siguiente semana.
   * Finalmente, se actualiza la barra de progreso y la lista de cada semana.
   */
  function updateGastosSemanalesUI() {
    // Releer la estructura actualizada de gastos semanales.
    gastosSemanales = getGastosSemanales();

    // Leer el presupuesto total (ingresoTotal) almacenado en localStorage.
    let ingresoTotal = parseFloat(localStorage.getItem('ingresoTotal') || "0");

    // Sumar los gastos fijos (almacenados en la clave "gastos").
    let gastosFijos = JSON.parse(localStorage.getItem('gastos')) || [];
    let totalGastosFijos = gastosFijos.reduce((sum, gasto) => {
      return sum + (parseFloat(gasto.monto) || 0);
    }, 0);

    // La asignación base para cada semana será el remanente dividido en 4.
    const baseAllocation = (ingresoTotal - totalGastosFijos) / 4;

    // Acumulador: déficit de la semana anterior.
    let prevDeficit = 0;

    // Se recorre cada una de las semanas (1 a 4).
    for (let week = 1; week <= 4; week++) {
      const weekKey = week.toString();
      // La asignación efectiva para la semana es la base menos el déficit transferido.
      let effective = baseAllocation - prevDeficit;
      if (effective < 0) effective = 0;

      // Sumar los gastos de la semana.
      let spending = gastosSemanales[weekKey].reduce((sum, gasto) => {
        return sum + (parseFloat(gasto.monto) || 0);
      }, 0);

      let available;
      let currentDeficit = 0;
      if (spending > effective) {
        available = 0;
        currentDeficit = spending - effective;
      } else {
        available = effective - spending;
        currentDeficit = 0;
      }
      
      // Actualiza la barra de progreso y la lista de la semana.
      updateSemanaUI(week, effective, available);
      
      // Se transfiere el déficit actual (si lo hubiera) a la siguiente semana.
      prevDeficit = currentDeficit;
    }
    
    // Forzamos un reflow leyendo una propiedad del documento.
    void document.body.offsetHeight;
  }

  /**
   * updateSemanaUI – Actualiza la UI (barra y lista) para una semana en concreto.
   * @param {number} weekIndex - Número de la semana (1 a 4).
   * @param {number} effective - Asignación efectiva para la semana.
   * @param {number} available - Monto disponible luego de restar los gastos.
   */
  function updateSemanaUI(weekIndex, effective, available) {
    const formattedAvailable = "$" + available.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const semanaDiv = document.querySelector(`.semana[data-semana="${weekIndex}"]`);
    if (!semanaDiv) return;
    
    // Actualizar la barra de progreso.
    const progressBar = semanaDiv.querySelector(".progress-bar");
    if (progressBar) {
      let porcentaje = effective ? (available / effective) * 100 : 0;
      progressBar.style.width = porcentaje + "%";
      if (porcentaje >= 70) {
        progressBar.style.backgroundColor = "#28a745"; // Verde.
      } else if (porcentaje >= 40) {
        progressBar.style.backgroundColor = "#ffc107"; // Ámbar.
      } else {
        progressBar.style.backgroundColor = "#dc3545"; // Rojo.
      }
      const progressText = progressBar.querySelector(".progress-text");
      if (progressText) {
        progressText.innerText = formattedAvailable;
      }
    }
    
    // Actualizar la lista de gastos de la semana.
    const listaSemana = document.querySelector(`.lista-gastos-semana[data-semana="${weekIndex}"]`);
    if (listaSemana) {
      listaSemana.innerHTML = "";
      getGastosSemanales()[weekIndex.toString()].forEach(gasto => {
        const li = document.createElement("li");
        li.classList.add("gasto-item");
        const montoFormateado = "$" + parseFloat(gasto.monto).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        li.innerText = `${gasto.descripcion} - ${montoFormateado} (${gasto.fecha})`;
        listaSemana.appendChild(li);
      });
    }
  }

  // --- Listeners para la UI de gastos semanales ---

  // Listener para cada botón "Agregar Gasto" de una semana: abre el modal.
  document.querySelectorAll(".btn-add-semana").forEach(btn => {
    btn.addEventListener("click", function () {
      const semana = this.getAttribute("data-semana");
      document.getElementById("semana-numero").value = semana;
      const today = new Date();
      document.getElementById("semana-fecha").value = today.toLocaleDateString("es-AR");
      document.getElementById("modal-semana-add").style.display = "block";
    });
  });

  // Listener para cada botón "Limpiar Semana".
  document.querySelectorAll(".btn-clear-week").forEach(btn => {
    btn.addEventListener("click", function () {
      const semana = this.getAttribute("data-semana");
      gastosSemanales = getGastosSemanales();
      // Vacía los gastos de la semana indicada.
      gastosSemanales[semana] = [];
      localStorage.setItem("gastosSemanales", JSON.stringify(gastosSemanales));
      updateGastosSemanalesUI();
    });
  });

  // Listener para el botón global "Limpiar Todas las Semanas".
  const btnClearAll = document.querySelector(".btn-clear-all");
  if (btnClearAll) {
    btnClearAll.addEventListener("click", () => {
      gastosSemanales = { "1": [], "2": [], "3": [], "4": [] };
      localStorage.setItem("gastosSemanales", JSON.stringify(gastosSemanales));
      updateGastosSemanalesUI();
    });
  } else {
    console.error("No se encontró el botón global 'btn-clear-all'.");
  }

  // Listener para cerrar el modal "Agregar Gasto Semanal".
  const modalCancel = document.getElementById("modal-semana-cancel");
  if (modalCancel) {
    modalCancel.addEventListener("click", () => {
      document.getElementById("modal-semana-add").style.display = "none";
      document.getElementById("form-semana-add").reset();
    });
  }

  // Listener para el formulario "Agregar Gasto Semanal".
  const formSemanaAdd = document.getElementById("form-semana-add");
  if (formSemanaAdd) {
    formSemanaAdd.addEventListener("submit", function (e) {
      e.preventDefault();
      const semana = document.getElementById("semana-numero").value;
      const descripcion = document.getElementById("semana-descripcion").value.trim();
      let montoInput = document.getElementById("semana-monto").value;
      // Normaliza el monto eliminando "$", puntos y cambiando la coma por punto.
      montoInput = montoInput.replace(/\$/g, "").replace(/\./g, "").replace(/,/g, ".");
      const monto = parseFloat(montoInput) || 0;
      const fecha = document.getElementById("semana-fecha").value;

      if (descripcion !== "" && monto > 0) {
        const nuevaEntrada = { descripcion, monto, fecha };
        gastosSemanales = getGastosSemanales();
        if (!gastosSemanales[semana]) {
          gastosSemanales[semana] = [];
        }
        gastosSemanales[semana].push(nuevaEntrada);
        localStorage.setItem("gastosSemanales", JSON.stringify(gastosSemanales));
        updateGastosSemanalesUI();
        document.getElementById("modal-semana-add").style.display = "none";
        document.getElementById("form-semana-add").reset();
      } else {
        alert("Por favor, completa la descripción y asegúrate de que el monto sea mayor a 0.");
      }
    });
  }

  // --- Actualización en tiempo real ante cambios externos ---

  // Si se modifica "ingresoTotal" o "gastos" en otra pestaña, se actualiza la UI.
  window.addEventListener('storage', (e) => {
    if (e.key === 'ingresoTotal' || e.key === 'gastos') {
      updateGastosSemanalesUI();
    }
  });

  // Cuando la ventana recibe foco, se actualiza la UI.
  window.addEventListener('focus', updateGastosSemanalesUI);

  // Listener para el campo ingresoTotal (si existe), para actualizar la UI en tiempo real.
  const ingresoInput = document.getElementById("ingresoTotal");
  if (ingresoInput) {
    ingresoInput.addEventListener("input", function () {
      localStorage.setItem("ingresoTotal", this.value);
      updateGastosSemanalesUI();
    });
  }

  // Se actualiza la UI al cargar.
  updateGastosSemanalesUI();
});