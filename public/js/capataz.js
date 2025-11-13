document.addEventListener("DOMContentLoaded", () => {
  const inputAsistencia = document.getElementById("asistencia");
  const tablaBody = document.querySelector("#tablaAsistencia tbody");
  const btnEntrada = document.getElementById("btnRegistrar");
  const btnSalida = document.getElementById("btnSalida");

  // Obtener usuario logueado
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Debes iniciar sesión primero");
    window.location.href = "index.html";
    return;
  }
  const usuario_id = user.id;

  // Mensajes flotantes
  const showMessage = (msg, type = "info") => {
    const box = document.createElement("div");
    box.textContent = msg;
    box.className = `msg ${type}`;
    Object.assign(box.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "10px 15px",
      background: type === "error" ? "#f44336" : "#4CAF50",
      color: "white",
      borderRadius: "6px",
      zIndex: 9999,
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      transition: "opacity 0.3s",
    });
    document.body.appendChild(box);
    setTimeout(() => (box.style.opacity = "0"), 3500);
    setTimeout(() => box.remove(), 4000);
  };

  // Fecha actual
  const ahora = new Date();
  const hoy = ahora.toLocaleDateString("en-CA"); // YYYY-MM-DD (zona local)
  inputAsistencia.min = `${hoy}T08:00`;
  inputAsistencia.max = `${hoy}T17:00`;
  inputAsistencia.value = ahora.toISOString().slice(0, 16);

  async function cargarAsistencias() {
    try {
      const resp = await fetch(`/api/capataz/asistencias/${usuario_id}`);
      const data = await resp.json();

      tablaBody.innerHTML = "";

      if (data.length === 0) {
        showMessage("No tienes asistencias registradas.", "error");
        btnEntrada.disabled = false;
        btnSalida.disabled = true;
        return;
      }

      data.forEach((a) => {
        const fila = document.createElement("tr");
        fila.setAttribute("data-id", a.id);

        const fechaFormateada = new Date(a.fecha).toLocaleDateString("es-CL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        fila.innerHTML = `
          <td>${fechaFormateada}</td>
          <td>${a.hora_entrada?.slice(0, 5) || "-"}</td>
          <td id="salida-${a.id}">${a.hora_salida?.slice(0, 5) || "-"}</td>
        `;
        tablaBody.appendChild(fila);
      });

      const hayAsistenciaHoy = data.some((a) => {
        const fechaLocal = new Date(a.fecha).toLocaleDateString("en-CA");
        return fechaLocal === hoy;
      });

      if (!hayAsistenciaHoy) {
        showMessage("No has marcado asistencia hoy.", "error");
        btnEntrada.disabled = false;
        btnSalida.disabled = true;
      } else {
        const asistenciaHoy = data.find((a) => {
          const fechaLocal = new Date(a.fecha).toLocaleDateString("en-CA");
          return fechaLocal === hoy;
        });

        btnEntrada.disabled = true;

        if (!asistenciaHoy.hora_salida || asistenciaHoy.hora_salida === "00:00:00") {
          btnSalida.disabled = false;
        } else {
          btnSalida.disabled = true;
        }
      }
    } catch (error) {
      console.error(error);
      showMessage("Error al cargar asistencias", "error");
    }
  }

  cargarAsistencias();

  btnEntrada.addEventListener("click", async () => {
    const valor = inputAsistencia.value;
    if (!valor) return showMessage("Selecciona una hora válida.", "error");

    const fecha = new Date(valor);
    const hora = fecha.getHours();

    if (fecha.toLocaleDateString("en-CA") !== hoy)
      return showMessage("Solo puedes registrar asistencia del día actual.", "error");
    if (hora < 8 || hora >= 17)
      return showMessage("El horario permitido es entre 08:00 y 17:00.", "error");

    try {
      const resp = await fetch("/api/capataz/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: hoy, hora_entrada: valor, usuario_id }),
      });

      const data = await resp.json();
      if (resp.ok) {
        const fila = document.createElement("tr");
        fila.setAttribute("data-id", data.id);
        fila.innerHTML = `
          <td>${data.fecha}</td>
          <td>${data.hora_entrada}</td>
          <td id="salida-${data.id}">-</td>
        `;
        tablaBody.appendChild(fila);
        btnEntrada.disabled = true;
        btnSalida.disabled = false;
        showMessage("Entrada registrada correctamente", "success");
      } else {
        showMessage(data.message || "Error al registrar asistencia", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("No se pudo conectar al servidor", "error");
    }
  });

  btnSalida.addEventListener("click", async () => {
    try {
      const resp = await fetch(`/api/capataz/asistencia/salida/${usuario_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await resp.json();
      if (resp.ok) {
        const filaHoy = [...tablaBody.querySelectorAll("tr")].find((f) => {
          const fechaFila = f.querySelector("td").textContent;
          const fechaLocal = new Date(a.fecha).toLocaleDateString("es-CL");
          return fechaFila === fechaLocal;
        });

        if (filaHoy) {
          filaHoy.querySelector("td:last-child").textContent = data.hora_salida.slice(0, 5);
        }

        btnSalida.disabled = true;
        showMessage("Salida registrada correctamente", "success");
        await cargarAsistencias();
      } else {
        showMessage(data.message || "Error al registrar salida", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("No se pudo conectar al servidor", "error");
    }
  });
});
