import { reactive } from "vue";

const CLAVE_TOKEN = "punto_tecnologico_token";
const CLAVE_USUARIO = "punto_tecnologico_usuario";
const URL_BASE_API = String(process.env.API_BASE_URL || "").replace(/\/+$/, "");

function leerUsuarioGuardado() {
  const usuarioGuardado = sessionStorage.getItem(CLAVE_USUARIO);

  if (!usuarioGuardado) {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado);
  } catch {
    sessionStorage.removeItem(CLAVE_USUARIO);
    return null;
  }
}

const estado = reactive({
  token: sessionStorage.getItem(CLAVE_TOKEN),
  usuario: leerUsuarioGuardado(),
  inicializado: false,
});

function guardarSesion({ token, usuario }) {
  estado.token = token;
  estado.usuario = usuario;
  sessionStorage.setItem(CLAVE_TOKEN, token);
  sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

function limpiarSesion() {
  estado.token = null;
  estado.usuario = null;
  sessionStorage.removeItem(CLAVE_TOKEN);
  sessionStorage.removeItem(CLAVE_USUARIO);
}

async function solicitar(ruta, opciones = {}) {
  const { esFormulario = false, ...opcionesFetch } = opciones;
  const cabeceras = {
    Accept: "application/json",
    ...(opciones.body && !esFormulario
      ? { "Content-Type": "application/json" }
      : {}),
    ...(opciones.headers || {}),
  };

  if (estado.token) {
    cabeceras.Authorization = `Bearer ${estado.token}`;
    cabeceras["X-Access-Token"] = estado.token;
  }

  const respuesta = await fetch(`${URL_BASE_API}${ruta}`, {
    ...opcionesFetch,
    headers: cabeceras,
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const primerErrorValidacion = Object.values(datos.errors || {})[0]?.[0];
    const error = new Error(
      primerErrorValidacion ||
        datos.message ||
        "Ocurrio un error al procesar la solicitud."
    );
    error.status = respuesta.status;
    error.data = datos;
    throw error;
  }

  return datos;
}

async function iniciarSesion({ nombreUsuario, contrasena }) {
  const datos = await solicitar("/autenticacion/iniciar-sesion", {
    method: "POST",
    body: JSON.stringify({
      nombre_usuario: nombreUsuario,
      contrasena,
      nombre_dispositivo: "quasar-web",
    }),
  });

  guardarSesion({
    token: datos.token,
    usuario: datos.usuario,
  });

  estado.inicializado = true;

  return datos.usuario;
}

async function cargarPerfil() {
  if (!estado.token) {
    estado.inicializado = true;
    return null;
  }

  try {
    const datos = await solicitar("/autenticacion/perfil");
    guardarSesion({
      token: estado.token,
      usuario: datos.usuario,
    });

    return datos.usuario;
  } catch (error) {
    limpiarSesion();
    throw error;
  } finally {
    estado.inicializado = true;
  }
}

async function cerrarSesion() {
  try {
    if (estado.token) {
      await solicitar("/autenticacion/cerrar-sesion", {
        method: "POST",
      });
    }
  } finally {
    limpiarSesion();
    estado.inicializado = true;
  }
}

function estaAutenticado() {
  return Boolean(estado.token && estado.usuario);
}

export {
  cargarPerfil,
  cerrarSesion,
  estaAutenticado,
  estado as estadoAutenticacion,
  iniciarSesion,
  limpiarSesion,
  solicitar as solicitarApi,
  URL_BASE_API,
};
