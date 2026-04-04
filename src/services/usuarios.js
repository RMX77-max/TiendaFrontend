import { solicitarApi } from 'src/services/auth'

async function obtenerDatosModuloUsuarios () {
  const [datosFormulario, datosUsuarios] = await Promise.all([
    solicitarApi('/usuarios/formulario'),
    solicitarApi('/usuarios')
  ])

  return {
    roles: datosFormulario.roles || [],
    sucursales: datosFormulario.sucursales || [],
    usuarios: datosUsuarios.usuarios || []
  }
}

async function registrarUsuario (formulario) {
  const datosFormulario = new FormData()

  datosFormulario.append('nombre', formulario.nombre)
  datosFormulario.append('apellido', formulario.apellido)
  datosFormulario.append('documento_identidad', formulario.documentoIdentidad)
  datosFormulario.append('telefono', formulario.telefono)
  datosFormulario.append('direccion', formulario.direccion)
  datosFormulario.append('nombre_usuario', formulario.nombreUsuario)
  datosFormulario.append('contrasena', formulario.contrasena)
  datosFormulario.append('rol', formulario.rol)

  if (formulario.sucursal) {
    datosFormulario.append('sucursal', formulario.sucursal)
  }

  if (formulario.fotoFacturaLuz) {
    datosFormulario.append('foto_factura_luz', formulario.fotoFacturaLuz)
  }

  return solicitarApi('/usuarios', {
    method: 'POST',
    body: datosFormulario,
    esFormulario: true
  })
}

async function cambiarEstadoUsuario (idUsuario, activo) {
  return solicitarApi(`/usuarios/${idUsuario}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ activo })
  })
}

export {
  cambiarEstadoUsuario,
  obtenerDatosModuloUsuarios,
  registrarUsuario
}
