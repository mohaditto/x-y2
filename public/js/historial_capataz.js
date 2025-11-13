document.addEventListener("DOMContentLoaded", () => {
  const tablaHistorial = document.querySelector("#tablaHistorial tbody");
  const inputBuscar = document.getElementById("buscarHistorial");
  const btnBuscar = document.getElementById("btnBuscarHistorial");

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Debes iniciar sesión primero");
    window.location.href = "index.html";
    return;
  }

  // Función para formatear fechas
  function formatearFecha(fecha) {
    if (!fecha || fecha === "0000-00-00 00:00:00" || fecha === "NO DEVUELTA") {
      return "—";
    }

    const f = new Date(fecha);
    if (isNaN(f.getTime())) return "—"; // evita errores de fechas inválidas

    return f.toLocaleString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Cargar historial desde el backend  
  async function cargarHistorial() {
    try {
      const resp = await fetch(`/api/capataz/historial/${user.id}`);
      const data = await resp.json();

      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada:", data);
        return;
      }

      mostrarHistorial(data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  }

  // Mostrar historial en la tabla
  function mostrarHistorial(lista) {
    tablaHistorial.innerHTML = "";

    lista.forEach((r) => {
      const fila = document.createElement("tr");

      // Asigna color según estado
      let colorEstado = "";
      switch (r.estado) {
        case "ACTIVO":
          colorEstado = "#e74c3c"; // rojo
          break;
        case "CERRADO":
          colorEstado = "#27ae60"; // verde
          break;
        case "PARCIAL":
          colorEstado = "#f1c40f"; // amarillo
          break;
        default:
          colorEstado = "#95a5a6"; // gris
      }

      fila.innerHTML = `
        <td>${r.trabajador}</td>
        <td>${r.herramienta}</td>
        <td>${formatearFecha(r.fecha_prestamo)}</td>
        <td>${formatearFecha(r.fecha_devolucion)}</td>
        <td style="color:${colorEstado}; font-weight:600;">${r.estado}</td>
      `;

      tablaHistorial.appendChild(fila);
    });
  }

  // Filtro de búsqueda
  btnBuscar.addEventListener("click", async () => {
    const termino = inputBuscar.value.toLowerCase();
    const resp = await fetch(`/api/capataz/historial/${user.id}`);
    const data = await resp.json();

    const filtrado = data.filter(
      (r) =>
        r.trabajador.toLowerCase().includes(termino) ||
        r.herramienta.toLowerCase().includes(termino)
    );

    mostrarHistorial(filtrado);
  });

  // Cargar historial al iniciar
  cargarHistorial();
});
