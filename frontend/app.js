const API = "postgresql://postgres:mnwmIXdTikSvaGaWJLDGbkeGSljLiFdp@interchange.proxy.rlwy.net:15562/railway";


if (window.location.pathname.includes("casas.html")) {
  iniciarCasas();
}

async function iniciarCasas() {
  const tipo   = localStorage.getItem("tipo");
  const nombre = localStorage.getItem("clienteNombre");

  if (!tipo) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nombreUsuario").textContent =
    tipo === "agente" ? "👷 Agente" : `👤 ${nombre}`;

  if (tipo === "agente") {
    document.getElementById("panelAgente").style.display = "block";
  }

  if (tipo === "cliente") {
    document.getElementById("linkFavoritos").style.display = "inline";
  }

  await cargarPropiedades();
}

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}


async function cargarPropiedades() {
  try {
    const res  = await fetch(`${API}/propiedades`);
    const data = await res.json();

    const tipo       = localStorage.getItem("tipo");
    const clienteId  = localStorage.getItem("clienteId");
    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = "";

    let favIds = [];
    if (tipo === "cliente" && clienteId) {
      try {
        const favRes = await fetch(`${API}/favoritos/cliente/${clienteId}/ids`);
        favIds = await favRes.json();
      } catch (e) {
        console.warn("No se pudieron cargar favoritos");
      }
    }

    data.forEach(p => {
      const div = document.createElement("div");
      div.classList.add("card");

      const imgSrc = `${API}/propiedades/imagen/${p.id}?t=${Date.now()}`;
      const esFav  = favIds.includes(p.id);

      div.innerHTML = `
        <img src="${imgSrc}"
          onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22><rect width=%22300%22 height=%22200%22 fill=%22%231a1a1a%22/><text x=%22150%22 y=%22105%22 text-anchor=%22middle%22 font-family=%22serif%22 font-size=%2213%22 fill=%22%23333%22 letter-spacing=%222%22>SIN IMAGEN</text></svg>'" />

        <p class="card-tipo">${p.tipo || ""}</p>
        <h3>${p.titulo || "Sin título"}</h3>
        <p>${p.descripcion || ""}</p>
        <p><strong>$${Number(p.precio || 0).toLocaleString()}</strong></p>

        <div class="card-actions">
          <button onclick="verDetalle(${p.id}, '${(p.titulo||'').replace(/'/g,"\\'")}', '${(p.descripcion||'').replace(/'/g,"\\'")}', '${p.precio}', '${(p.tipo||'').replace(/'/g,"\\'")}')">
            Ver detalle
          </button>

          ${tipo === "cliente" ? `
            <button id="favBtn-${p.id}" class="btn-secundario" onclick="toggleFavorito(${p.id}, this)">
              ${esFav ? "♥ Guardado" : "♡ Guardar"}
            </button>
          ` : ""}

          ${tipo === "agente" ? `
            <button onclick="toggleEditar(${p.id})">Editar</button>
            <button class="btn-peligro" onclick="eliminarPropiedad(${p.id})">Eliminar</button>
          ` : ""}
        </div>

        ${tipo === "agente" ? `
          <div id="formEditar-${p.id}" class="form-editar" style="display:none;">
            <input type="text"   id="eTitulo-${p.id}"      value="${(p.titulo||'').replace(/"/g,'&quot;')}"      placeholder="Título">
            <input type="text"   id="eDescripcion-${p.id}" value="${(p.descripcion||'').replace(/"/g,'&quot;')}" placeholder="Descripción">
            <input type="number" id="ePrecio-${p.id}"      value="${p.precio || ''}"                             placeholder="Precio">
            <input type="text"   id="eTipo-${p.id}"        value="${(p.tipo||'').replace(/"/g,'&quot;')}"        placeholder="Tipo">
            <input type="file"   id="eImagen-${p.id}"      accept="image/*">
            <div class="form-btns">
              <button onclick="guardarEdicion(${p.id})">Guardar</button>
              <button class="btn-secundario" onclick="toggleEditar(${p.id})">Cancelar</button>
            </div>
          </div>
        ` : ""}
      `;

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("Error cargando propiedades:", error);
  }
}


async function crearPropiedad() {
  try {
    const titulo      = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio      = document.getElementById("precio").value;
    const tipo        = document.getElementById("tipo").value.trim();
    const imagenInput = document.getElementById("imagen");

    if (!titulo || !descripcion || !precio || !tipo) {
      alert("Completa todos los campos");
      return;
    }

    if (!imagenInput.files.length) {
      alert("Selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("titulo",      titulo);
    formData.append("descripcion", descripcion);
    formData.append("precio",      precio);
    formData.append("tipo",        tipo);
    formData.append("imagen",      imagenInput.files[0]);

    const res  = await fetch(`${API}/propiedades`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error al crear propiedad: " + (data.error || "desconocido"));
      return;
    }

    alert("✅ Propiedad creada correctamente");

    document.getElementById("titulo").value      = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("precio").value      = "";
    document.getElementById("tipo").value        = "";
    document.getElementById("imagen").value      = "";

    await cargarPropiedades();

  } catch (error) {
    console.error("Error:", error);
  }
}

async function eliminarPropiedad(id) {
  if (!confirm("¿Eliminar propiedad?")) return;

  try {
    const res = await fetch(`${API}/propiedades/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert("Error al eliminar: " + (data.error || "desconocido"));
      return;
    }

    await cargarPropiedades();

  } catch (error) {
    console.error("Error:", error);
  }
}


function verDetalle(id, titulo, descripcion, precio, tipo) {
  const modal = document.getElementById("modalDetalle");

  document.getElementById("modalImagen").src =
    `${API}/propiedades/imagen/${id}?t=${Date.now()}`;

  document.getElementById("modalTitulo").textContent      = titulo;
  document.getElementById("modalDescripcion").textContent = descripcion;
  document.getElementById("modalPrecio").textContent      = `$${Number(precio).toLocaleString()}`;
  document.getElementById("modalTipo").textContent        = tipo;

  modal.dataset.propiedadId = id;
  modal.dataset.titulo      = titulo;

  modal.style.display          = "flex";
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  document.getElementById("modalDetalle").style.display = "none";
  document.body.style.overflow = "";
}

document.getElementById("modalDetalle").addEventListener("click", function(e) {
  if (e.target === this) cerrarModal();
});


function contactarAgente() {
  const modal  = document.getElementById("modalDetalle");
  const titulo = modal.dataset.titulo;
  const nombre = localStorage.getItem("clienteNombre") || "Cliente";

  const mensaje  = encodeURIComponent(
    `Hola, soy ${nombre} y me interesa la propiedad: "${titulo}". ¿Me pueden dar más información?`
  );
  const telefono = "524492097383";
  window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
}


function toggleEditar(id) {
  const form = document.getElementById(`formEditar-${id}`);
  form.style.display = form.style.display === "none" ? "block" : "none";
}

async function guardarEdicion(id) {
  const titulo      = document.getElementById(`eTitulo-${id}`).value.trim();
  const descripcion = document.getElementById(`eDescripcion-${id}`).value.trim();
  const precio      = document.getElementById(`ePrecio-${id}`).value;
  const tipo        = document.getElementById(`eTipo-${id}`).value.trim();
  const imagenInput = document.getElementById(`eImagen-${id}`);

  if (!titulo || !descripcion || !precio || !tipo) {
    alert("Completa todos los campos");
    return;
  }

  const formData = new FormData();
  formData.append("titulo",      titulo);
  formData.append("descripcion", descripcion);
  formData.append("precio",      precio);
  formData.append("tipo",        tipo);

  if (imagenInput.files.length > 0) {
    formData.append("imagen", imagenInput.files[0]);
  }

  try {
    const res = await fetch(`${API}/propiedades/${id}`, {
      method: "PUT",
      body: formData
    });

    if (!res.ok) {
      const data = await res.json();
      alert("Error: " + (data.error || "desconocido"));
      return;
    }

    alert("✅ Propiedad actualizada");
    await cargarPropiedades();

  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión");
  }
}


async function toggleFavorito(id_propiedad, btn) {
  const clienteId = localStorage.getItem("clienteId");
  if (!clienteId) return;

  try {
    const res  = await fetch(`${API}/favoritos/${id_propiedad}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_cliente: clienteId })
    });

    const data = await res.json();
    btn.innerHTML = data.favorito ? "♥ Guardado" : "♡ Guardar";

  } catch (error) {
    console.error("Error favorito:", error);
  }
}