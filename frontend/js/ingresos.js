/* Archivo: js/ingresos.js */
/*
  Propósito: Manejar la lógica de la sección de Ingresos del Dashboard.
  Funcionalidades:
    - Inicializar el formateo de moneda en el input de ingreso.
    - Capturar el valor ingresado y sumarlo al total de ingresos acumulados.
    - Persistir y recuperar el total de ingresos mediante localStorage.
    - Actualizar el resumen financiero (Ingreso Total, Total Gastado, Saldo Restante)
      tomando en cuenta los gastos ya registrados.
*/

// Recupera el ingreso total almacenado en localStorage o usa 0 si no existe.
let ingresoTotalAcumulado = parseFloat(localStorage.getItem('ingresoTotal')) || 0;

/*
  Inicialización de Cleave.js para el input de ingreso (formatea la moneda).
  Se configura para:
    - Permitir dos decimales.
    - Usar coma (",") como separador decimal.
    - Usar punto (".") para separar miles.
*/
new Cleave('#ingresoInput', {
  numeral: true,
  numeralDecimalScale: 2,      // Permite dos decimales
  numeralDecimalMark: ',',     // Separa decimales con coma
  delimiter: '.',              // Separa miles con punto
  numeralThousandsGroupStyle: 'thousand',
  prefix: '$',
  noImmediatePrefix: true,     // No muestra el prefijo hasta que se comienza a escribir.
  rawValueTrimPrefix: true
});

/**
 * Función para obtener el total gastado leyendo el arreglo de gastos desde localStorage.
 */
function obtenerTotalGastado() {
  const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
  return gastos.reduce((acum, gasto) => acum + gasto.monto, 0);
}

/**
 * Función para actualizar el resumen financiero en la interfaz.
 * Actualiza los elementos con id "ingresoTotal", "totalGastado" y "saldoRestante".
 */
function actualizarResumen() {
  // Recalcula el total gastado leyendo el arreglo guardado en localStorage.
  const totalGastado = obtenerTotalGastado();
  
  // Calcula el saldo restante.
  const saldoRestante = ingresoTotalAcumulado - totalGastado;
  
  // Función auxiliar para formatear un número en el formato "es-AR":
  // - Se mostrarán dos decimales.
  // - Los miles se separarán con punto y los decimales con coma.
  const formatearValor = (valor) => valor.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Actualiza los elementos en la UI.
  document.getElementById('ingresoTotal').innerText = '$' + formatearValor(ingresoTotalAcumulado);
  document.getElementById('totalGastado').innerText = '$' + formatearValor(totalGastado);
  document.getElementById('saldoRestante').innerText = '$' + formatearValor(saldoRestante);
}

/**
 * Evento para el botón "Agregar Ingreso":
 *   - Obtiene el valor del input, elimina el prefijo "$", elimina los puntos y reemplaza la coma decimal por punto,
 *     convierte el resultado a número y lo suma al total acumulado.
 *   - Actualiza localStorage, limpia el campo de entrada y actualiza el resumen financiero.
 */
document.getElementById('btnAgregarIngreso').addEventListener('click', function() {
  const inputElement = document.getElementById('ingresoInput');
  
  // Normalización: elimina "$", elimina TODOS los puntos (separadores de miles) y reemplaza la coma por punto.
  const rawValue = inputElement.value
    .replace(/\$/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const nuevoIngreso = parseFloat(rawValue) || 0;
  
  if (nuevoIngreso > 0) {
    ingresoTotalAcumulado += nuevoIngreso;
    localStorage.setItem('ingresoTotal', ingresoTotalAcumulado);
    inputElement.value = "";
    actualizarResumen();
  } else {
    alert("Ingrese un monto válido mayor a 0");
  }
});

/**
 * Evento para el botón "Limpiar Ingreso":
 *   Reinicia el ingreso total acumulado a cero, lo actualiza en localStorage y actualiza el resumen financiero.
 */
document.getElementById('btnLimpiarIngreso').addEventListener('click', function() {
  ingresoTotalAcumulado = 0;
  localStorage.setItem('ingresoTotal', ingresoTotalAcumulado);
  actualizarResumen();
});

// Actualiza el resumen al cargar la página.
actualizarResumen();