import { solicitarApi } from 'src/services/auth'

async function obtenerFormularioCompra () {
  return solicitarApi('/compras/formulario')
}

async function listarCompras (filtros = {}) {
  const parametros = new URLSearchParams()

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
      parametros.append(clave, valor)
    }
  })

  const sufijo = parametros.toString() ? `?${parametros.toString()}` : ''

  return solicitarApi(`/compras${sufijo}`)
}

async function obtenerDetalleCompra (idCompra) {
  return solicitarApi(`/compras/${idCompra}`)
}

async function registrarCompra (formulario) {
  return solicitarApi('/compras', {
    method: 'POST',
    body: JSON.stringify(formulario)
  })
}

async function actualizarCompra (idCompra, formulario) {
  return solicitarApi(`/compras/${idCompra}`, {
    method: 'PUT',
    body: JSON.stringify(formulario)
  })
}

async function registrarProveedor (formulario) {
  return solicitarApi('/compras/proveedores', {
    method: 'POST',
    body: JSON.stringify(formulario)
  })
}

export {
  actualizarCompra,
  listarCompras,
  obtenerDetalleCompra,
  obtenerFormularioCompra,
  registrarCompra,
  registrarProveedor
}
