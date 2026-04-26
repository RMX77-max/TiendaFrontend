import { solicitarApi } from 'src/services/auth'

function agregarCampoFormulario (formData, clave, valor) {
  if (valor === undefined) {
    return
  }

  formData.append(clave, valor ?? '')
}

function construirFormularioVenta (formulario) {
  const formData = new FormData()

  agregarCampoFormulario(formData, 'caja_id', Number(formulario.cajaId))
  agregarCampoFormulario(formData, 'moneda', formulario.moneda)
  agregarCampoFormulario(formData, 'tipo_cambio', formulario.tipoCambio)
  agregarCampoFormulario(formData, 'tipo_venta', formulario.tipoVenta)
  agregarCampoFormulario(formData, 'tipo_item', formulario.tipoItem || null)
  agregarCampoFormulario(formData, 'cliente_nombre', formulario.clienteNombre || null)
  agregarCampoFormulario(formData, 'cliente_telefono', formulario.clienteTelefono || null)
  agregarCampoFormulario(formData, 'cliente_fecha_nacimiento', formulario.clienteFechaNacimiento || null)
  agregarCampoFormulario(formData, 'observaciones', formulario.observaciones || null)
  agregarCampoFormulario(formData, 'plantilla_sucursal_id', formulario.plantillaSucursalId || null)
  agregarCampoFormulario(formData, 'plantilla_impresion', formulario.plantillaImpresion || null)
  agregarCampoFormulario(formData, 'abono_inicial_usd', formulario.abonoInicialUsd ?? 0)
  agregarCampoFormulario(formData, 'abono_inicial_bs', formulario.abonoInicialBs ?? 0)
  agregarCampoFormulario(formData, 'observaciones_abono_inicial', formulario.observacionesAbonoInicial || null)

  if (formulario.comprobanteCredito instanceof File) {
    formData.append('comprobante_credito', formulario.comprobanteCredito)
  }

  ;(formulario.detalles || []).forEach((detalle, indice) => {
    agregarCampoFormulario(formData, `detalles[${indice}][producto_id]`, Number(detalle.productoId))
    agregarCampoFormulario(formData, `detalles[${indice}][cantidad]`, Number(detalle.cantidad || 0))
    agregarCampoFormulario(formData, `detalles[${indice}][precio_unitario_usd]`, Number(detalle.precioVentaUsd || 0))
    agregarCampoFormulario(formData, `detalles[${indice}][precio_unitario_bs]`, Number(detalle.precioVentaBs || 0))
  })

  return formData
}

function construirFormularioPagoVenta (formulario) {
  const formData = new FormData()

  agregarCampoFormulario(formData, 'caja_id', Number(formulario.cajaId))
  agregarCampoFormulario(formData, 'fecha_abono', formulario.fechaAbono)
  agregarCampoFormulario(formData, 'tipo_cambio_abono', formulario.tipoCambioAbono || null)
  agregarCampoFormulario(formData, 'abono_usd', formulario.abonoUsd ?? 0)
  agregarCampoFormulario(formData, 'abono_bs', formulario.abonoBs ?? 0)
  agregarCampoFormulario(formData, 'observaciones', formulario.observaciones || null)

  if (formulario.comprobanteFoto instanceof File) {
    formData.append('comprobante_foto', formulario.comprobanteFoto)
  }

  return formData
}

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

async function obtenerDetalleVenta (idVenta) {
  return solicitarApi(`/ventas/${idVenta}`)
}

async function registrarVenta (formulario) {
  return solicitarApi('/ventas', {
    method: 'POST',
    body: construirFormularioVenta(formulario),
    esFormulario: true
  })
}

async function registrarPagoCreditoVenta (idVenta, formulario) {
  return solicitarApi(`/ventas/${idVenta}/pagos-credito`, {
    method: 'POST',
    body: construirFormularioPagoVenta(formulario),
    esFormulario: true
  })
}

export {
  listarVentas,
  obtenerDatosFormularioVenta,
  obtenerDetalleVenta,
  registrarPagoCreditoVenta,
  registrarVenta
}
