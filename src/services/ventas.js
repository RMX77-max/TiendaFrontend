import { solicitarApi } from 'src/services/auth'

async function obtenerDatosFormularioVenta () {
  return solicitarApi('/ventas/formulario')
}

async function listarVentas (filtros = {}) {
  const parametros = new URLSearchParams()

  if (filtros.nroVenta) parametros.set('nro_venta', filtros.nroVenta)
  if (filtros.cajaId) parametros.set('caja_id', filtros.cajaId)
  if (filtros.fechaDesde) parametros.set('fecha_desde', filtros.fechaDesde)
  if (filtros.fechaHasta) parametros.set('fecha_hasta', filtros.fechaHasta)

  const sufijo = parametros.toString() ? `?${parametros.toString()}` : ''
  return solicitarApi(`/ventas${sufijo}`)
}

async function registrarVenta (formulario) {
  return solicitarApi('/ventas', {
    method: 'POST',
    body: JSON.stringify({
      caja_id: Number(formulario.cajaId),
      moneda: formulario.moneda,
      tipo_cambio: null,
      tipo_item: formulario.tipoItem || null,
      cliente_nombre: formulario.clienteNombre || null,
      cliente_telefono: formulario.clienteTelefono || null,
      cliente_fecha_nacimiento: formulario.clienteFechaNacimiento || null,
      observaciones: formulario.observaciones || null,
      detalles: formulario.detalles.map((detalle) => ({
        producto_id: Number(detalle.productoId),
        cantidad: Number(detalle.cantidad || 0),
        precio_unitario_usd: Number(detalle.precioVentaUsd || 0),
        precio_unitario_bs: Number(detalle.precioVentaBs || 0)
      }))
    })
  })
}

export {
  listarVentas,
  obtenerDatosFormularioVenta,
  registrarVenta
}
