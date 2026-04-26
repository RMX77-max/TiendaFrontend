import { solicitarApi } from 'src/services/auth'

function agregarCampoFormulario (formData, clave, valor) {
  if (valor === undefined) {
    return
  }

  formData.append(clave, valor ?? '')
}

function construirFormularioCompra (formulario, incluirMetodoPut = false) {
  const formData = new FormData()

  if (incluirMetodoPut) {
    formData.append('_method', 'PUT')
  }

  agregarCampoFormulario(formData, 'proveedor_id', formulario.proveedor_id)
  agregarCampoFormulario(formData, 'fecha_pedido', formulario.fecha_pedido)
  agregarCampoFormulario(formData, 'tipo_compra', formulario.tipo_compra)
  agregarCampoFormulario(formData, 'tipo_cambio_general', formulario.tipo_cambio_general)
  agregarCampoFormulario(formData, 'tiempo_entrega_dias', formulario.tiempo_entrega_dias)
  agregarCampoFormulario(formData, 'observaciones', formulario.observaciones)

  ;(formulario.detalles || []).forEach((detalle, indice) => {
    agregarCampoFormulario(formData, `detalles[${indice}][producto_id]`, detalle.producto_id)
    agregarCampoFormulario(formData, `detalles[${indice}][detalle_texto]`, detalle.detalle_texto)
    agregarCampoFormulario(formData, `detalles[${indice}][cantidad]`, detalle.cantidad)
    agregarCampoFormulario(formData, `detalles[${indice}][tipo_cambio_aplicado]`, detalle.tipo_cambio_aplicado)
    agregarCampoFormulario(formData, `detalles[${indice}][moneda_referencia]`, detalle.moneda_referencia)
    agregarCampoFormulario(formData, `detalles[${indice}][precio_unitario_usd]`, detalle.precio_unitario_usd)
    agregarCampoFormulario(formData, `detalles[${indice}][precio_unitario_bs]`, detalle.precio_unitario_bs)
    agregarCampoFormulario(formData, `detalles[${indice}][observaciones]`, detalle.observaciones)
  })

  ;(formulario.abonos || []).forEach((abono, indice) => {
    agregarCampoFormulario(formData, `abonos[${indice}][sucursal_id]`, abono.sucursal_id)
    agregarCampoFormulario(formData, `abonos[${indice}][caja_id]`, abono.caja_id)
    agregarCampoFormulario(formData, `abonos[${indice}][fecha_abono]`, abono.fecha_abono)
    agregarCampoFormulario(formData, `abonos[${indice}][tipo_cambio_abono]`, abono.tipo_cambio_abono)
    agregarCampoFormulario(formData, `abonos[${indice}][moneda_referencia]`, abono.moneda_referencia)
    agregarCampoFormulario(formData, `abonos[${indice}][abono_usd]`, abono.abono_usd)
    agregarCampoFormulario(formData, `abonos[${indice}][abono_bs]`, abono.abono_bs)
    agregarCampoFormulario(formData, `abonos[${indice}][observaciones]`, abono.observaciones)

    if (abono.comprobante_foto instanceof File) {
      formData.append(`abonos[${indice}][comprobante_foto]`, abono.comprobante_foto)
    }
  })

  ;(formulario.cuotas || []).forEach((cuota, indice) => {
    agregarCampoFormulario(formData, `cuotas[${indice}][fecha_vencimiento]`, cuota.fecha_vencimiento)
    agregarCampoFormulario(formData, `cuotas[${indice}][monto_usd]`, cuota.monto_usd)
    agregarCampoFormulario(formData, `cuotas[${indice}][observaciones]`, cuota.observaciones)
  })

  return formData
}

function construirFormularioGuia (formulario, incluirMetodoPut = false) {
  const formData = new FormData()

  if (incluirMetodoPut) {
    formData.append('_method', 'PUT')
  }

  agregarCampoFormulario(formData, 'fecha_registro', formulario.fecha_registro)
  agregarCampoFormulario(formData, 'monto_bs', formulario.monto_bs)
  agregarCampoFormulario(formData, 'estado', formulario.estado)
  agregarCampoFormulario(formData, 'pagado', formulario.pagado ? 1 : 0)
  agregarCampoFormulario(formData, 'observaciones', formulario.observaciones)

  if (formulario.foto_guia instanceof File) {
    formData.append('foto_guia', formulario.foto_guia)
  }

  return formData
}

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
    body: construirFormularioCompra(formulario),
    esFormulario: true
  })
}

async function actualizarCompra (idCompra, formulario) {
  return solicitarApi(`/compras/${idCompra}`, {
    method: 'POST',
    body: construirFormularioCompra(formulario, true),
    esFormulario: true
  })
}

async function registrarProveedor (formulario) {
  return solicitarApi('/compras/proveedores', {
    method: 'POST',
    body: JSON.stringify(formulario)
  })
}

async function registrarPagoCredito (idCompra, formulario) {
  return solicitarApi(`/compras/${idCompra}/pagos-credito`, {
    method: 'POST',
    body: JSON.stringify(formulario)
  })
}

async function registrarGuiaCompra (idCompra, formulario) {
  return solicitarApi(`/compras/${idCompra}/guias`, {
    method: 'POST',
    body: construirFormularioGuia(formulario),
    esFormulario: true
  })
}

async function registrarRecepcionCompra (idCompra, formulario) {
  return solicitarApi(`/compras/${idCompra}/recepciones`, {
    method: 'POST',
    body: JSON.stringify(formulario)
  })
}

async function cerrarCompraIncompleta (idCompra, formulario) {
  return solicitarApi(`/compras/${idCompra}/cerrar-incompleto`, {
    method: 'PATCH',
    body: JSON.stringify(formulario)
  })
}

async function ingresarRecepcionInventario (idRecepcion, formulario) {
  return solicitarApi(`/compras/recepciones/${idRecepcion}/ingresar-inventario`, {
    method: 'POST',
    body: JSON.stringify(formulario)
  })
}

async function actualizarGuiaCompra (idGuia, formulario) {
  return solicitarApi(`/compras/guias/${idGuia}`, {
    method: 'POST',
    body: construirFormularioGuia(formulario, true),
    esFormulario: true
  })
}

async function eliminarGuiaCompra (idGuia) {
  return solicitarApi(`/compras/guias/${idGuia}`, {
    method: 'DELETE'
  })
}

export {
  actualizarCompra,
  cerrarCompraIncompleta,
  actualizarGuiaCompra,
  eliminarGuiaCompra,
  ingresarRecepcionInventario,
  listarCompras,
  obtenerDetalleCompra,
  obtenerFormularioCompra,
  registrarGuiaCompra,
  registrarRecepcionCompra,
  registrarPagoCredito,
  registrarCompra,
  registrarProveedor
}
