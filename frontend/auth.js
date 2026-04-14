const API = "postgresql://postgres:mnwmIXdTikSvaGaWJLDGbkeGSljLiFdp@interchange.proxy.rlwy.net:15562/railway";

function mostrarTab(id) {
  document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).style.display = "block";
  document.getElementById("tab-" + id).classList.add("active");
}

async function loginCliente() {
  const correo = document.getElementById("correoLogin").value.trim();
  const errorEl = document.getElementById("errorLogin");
  errorEl.textContent = "";

  if (!correo) {
    errorEl.textContent = "Ingresa tu correo";
    return;
  }

  // Validación Gmail
  if (!correo.endsWith("@gmail.com")) {
    errorEl.textContent = "Solo se permiten correos Gmail";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/cliente/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error;
      return;
    }

    localStorage.setItem("tipo", "cliente");
    localStorage.setItem("clienteId", data.cliente.id);
    localStorage.setItem("clienteNombre", data.cliente.nombre);

    window.location.href = "casas.html";

  } catch (error) {
    errorEl.textContent = "Error de conexión";
  }
}


async function registrarCliente() {
  const nombre = document.getElementById("regNombre").value.trim();
  const correo = document.getElementById("regCorreo").value.trim();
  const telefono = document.getElementById("regTelefono").value.trim();
  const errorEl = document.getElementById("errorRegistro");
  errorEl.textContent = "";

  if (!nombre || !correo) {
    errorEl.textContent = "Nombre y correo son obligatorios";
    return;
  }

  // Validación Gmail
  if (!correo.endsWith("@gmail.com")) {
    errorEl.textContent = "Solo se permiten correos Gmail";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/cliente/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, telefono })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error;
      return;
    }

    localStorage.setItem("tipo", "cliente");
    localStorage.setItem("clienteId", data.cliente.id);
    localStorage.setItem("clienteNombre", data.cliente.nombre);

    window.location.href = "casas.html";

  } catch (error) {
    errorEl.textContent = "Error de conexión";
  }
}


async function loginAgente() {
  const password = document.getElementById("passwordAgente").value;
  const errorEl  = document.getElementById("errorAgente");
  errorEl.textContent = "";

  if (!password) { errorEl.textContent = "Ingresa la contraseña"; return; }

  try {
    const res = await fetch(`${API}/auth/agente/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error;
      return;
    }

    localStorage.setItem("tipo", "agente");
    localStorage.removeItem("clienteId");
    localStorage.removeItem("clienteNombre");

    window.location.href = "casas.html";

  } catch (error) {
    errorEl.textContent = "Error de conexión";
  }
}