/* =====================================================
   CalculadoraIMC.online — app.js
   JavaScript compartido por TODAS las páginas
   ===================================================== */

/* ══════════════════════════════════════════
   CONFIGURACIÓN PUBLICIDAD DIRECTA
   Para cambiar imagen → reemplaza el archivo
   en /ads/ con el mismo nombre (300×250 px)
══════════════════════════════════════════ */
const publicidadActiva = true;

const anuncios = [
  { imagen: "ads/ad1.jpg", enlace: "https://cliente1.com" },
  { imagen: "ads/ad2.jpg", enlace: "https://cliente2.com" },
  { imagen: "ads/ad3.jpg", enlace: "https://cliente3.com" }
];

/* ══════════════════════════════════════════
   ARRANQUE — se ejecuta en cada página
   Detecta automáticamente los espacios
   de publicidad que existan en la página
══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initModal();

  // Detectar y activar TODOS los espacios publicitarios
  // que existan en la página actual, sin necesidad de
  // llamar manualmente a initPublicidad() desde el HTML
  const todosLosAds = ["adLat", "adBM", "adFT", "adTop", "adCal"];
  const presentes = todosLosAds.filter(id => document.getElementById(id));
  if (presentes.length > 0) {
    initPublicidad(presentes);
  }
});

/* ══════════════════════════════════════════
   UTILIDADES COMPARTIDAS
══════════════════════════════════════════ */

// Obtener elemento por ID
const g = id => document.getElementById(id);

// Escribir texto en un elemento
const tx = (id, v) => { const el = g(id); if (el) el.textContent = v; };

// Limitar número entre min y max
const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);

// Mostrar resultado oculto con scroll
function show(id) {
  const el = g(id);
  if (!el) return;
  el.classList.remove("hidden");
  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
}

// Validar campos requeridos (marca con borde rojo)
function validar(ids) {
  let ok = true;
  ids.forEach(id => {
    const el = g(id);
    if (!el) return;
    el.classList.remove("invalid");
    if (!el.value || el.value.trim() === "") {
      el.classList.add("invalid");
      ok = false;
      el.addEventListener("input", () => el.classList.remove("invalid"), { once: true });
    }
  });
  if (!ok) {
    document.querySelector(".invalid")?.focus();
    toast("⚠️ Completa todos los campos requeridos", "warn");
  }
  return ok;
}

// Notificación flotante (toast)
function toast(msg, tipo) {
  const t = g("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show" + (tipo === "ok" ? " ok" : tipo === "warn" ? " warn" : "");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3500);
}

// Guardar en localStorage
function save(k, d) {
  try {
    localStorage.setItem("imc_" + k, JSON.stringify({
      ts: new Date().toLocaleString("es-ES"), ...d
    }));
  } catch (e) {}
}

/* ══════════════════════════════════════════
   MODAL — Contacto de publicidad
   Tu correo nunca aparece en el HTML.
   Los mensajes llegan via Formspree.
══════════════════════════════════════════ */
function initModal() {
  // Cerrar con Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarModal();
  });

  // Formulario de publicidad
  const form = g("formPub");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    // Validar campos del modal
    const campos = ["pNombre", "pEmail", "pTipo", "pMensaje"];
    let ok = true;
    campos.forEach(id => {
      const el = g(id);
      if (!el) return;
      el.classList.remove("m-invalid");
      if (!el.value || el.value.trim() === "") {
        el.classList.add("m-invalid");
        ok = false;
        el.addEventListener("input", () => el.classList.remove("m-invalid"), { once: true });
      }
    });

    // Validar formato email
    const emailEl = g("pEmail");
    if (emailEl?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add("m-invalid");
      ok = false;
    }

    if (!ok) {
      document.querySelector(".m-invalid")?.focus();
      toast("⚠️ Completa todos los campos", "warn");
      return;
    }

    const btn    = g("btnEnviar");
    const status = g("mStatus");
    btn.disabled = true;
    btn.textContent = "⏳ Enviando…";
    status.className = "m-status";
    status.textContent = "";

    // Si aún no configuraste Formspree
    if (!this.action || this.action.includes("PEGA_TU_LINK")) {
      setTimeout(() => {
        status.className = "m-status ok";
        status.style.display = "block";
        status.style.background = "#fef3c7";
        status.style.color = "#92400e";
        status.style.border = "1px solid #fcd34d";
        status.textContent = "⚙️ Formulario en configuración. Actívalo en formspree.io (5 minutos, gratis).";
        btn.disabled = false;
        btn.textContent = "📨 Enviar solicitud";
      }, 600);
      return;
    }

    try {
      const res = await fetch(this.action, {
        method: "POST",
        body: new FormData(this),
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        status.className = "m-status ok";
        status.textContent = "✅ ¡Solicitud enviada! Te respondemos en menos de 24 horas.";
        this.reset();
        toast("✅ Mensaje enviado con éxito", "ok");
      } else {
        throw new Error();
      }
    } catch {
      status.className = "m-status err";
      status.textContent = "❌ Error al enviar. Por favor inténtalo de nuevo.";
      toast("Error al enviar el mensaje", "");
    }

    btn.disabled = false;
    btn.textContent = "📨 Enviar solicitud";
  });
}

function abrirModal() {
  const ov = g("modalContacto");
  if (!ov) return;
  ov.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => g("pNombre")?.focus(), 350);
}

function cerrarModal() {
  const ov = g("modalContacto");
  if (!ov) return;
  ov.classList.remove("open");
  document.body.style.overflow = "";
}

function cerrarFondo(e) {
  if (e.target === e.currentTarget) cerrarModal();
}

/* ══════════════════════════════════════════
   PUBLICIDAD DIRECTA
   Llama a initPublicidad(["adBM","adFT"...])
   desde cada página con los IDs que tenga
══════════════════════════════════════════ */
function initPublicidad(ids) {
  ids.forEach(id => {
    const c = g(id);
    if (!c) return;

    if (!publicidadActiva) { c.style.display = "none"; return; }

    // Asigna anuncio por posición del array
    const idx = ids.indexOf(id) % anuncios.length;
    const a   = anuncios[idx];

    if (!a) { ph(c); return; }

    renderAd(c, a);

    // Si hay más de 1 anuncio → rotar cada 8 segundos
    if (anuncios.length > 1) rotar(c, idx);
  });
}

function renderAd(c, a) {
  const img = new Image();
  img.onload  = () => {
    c.innerHTML = `<a href="${a.enlace}" target="_blank" rel="noopener sponsored">
      <img src="${a.imagen}" alt="Publicidad" width="300" height="250" loading="lazy"/>
    </a>`;
  };
  img.onerror = () => ph(c);
  img.src = a.imagen;
}

function ph(c) {
  c.innerHTML = `<div class="ad-ph">
    <span class="ico">📣</span>
    <p>Espacio disponible para publicidad</p>
    <small>Contáctanos para anunciarte aquí</small>
  </div>`;
}

function rotar(c, ini) {
  let idx = ini;
  setInterval(() => {
    idx = (idx + 1) % anuncios.length;
    c.style.transition = "opacity .4s";
    c.style.opacity = "0";
    setTimeout(() => {
      renderAd(c, anuncios[idx]);
      c.style.opacity = "1";
    }, 400);
  }, 8000);
}
