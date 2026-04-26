import { solicitarApi } from 'src/services/auth'

async function obtenerDatosModuloCajas () {
  const [datosFormulario, datosListado] = await Promise.all([
    solicitarApi('/cajas/formulario'),
    solicitarApi('/cajas')
  ])

  return {
    monedas: datosFormulario.monedas || [],
    metodos: datosFormulario.metodos || [],
    sucursales: datosFormulario.sucursales || [],
    puedeGestionar: datosFormulario.puede_gestionar === true,
    cajas: datosListado.cajas || []
  }
}

async function listarMovimientosCaja (filtros = {}) {
  const parametros = new URLSearchParams()

  if (filtros.cajaId) parametros.set('caja_id', filtros.cajaId)
  if (filtros.sucursalId) parametros.set('sucursal_id', filtros.sucursalId)
  if (filtros.fechaDesde) parametros.set('fecha_desde', filtros.fechaDesde)
  if (filtros.fechaHasta) parametros.set('fecha_hasta', filtros.fechaHasta)
  if (filtros.concepto) parametros.set('concepto', filtros.concepto)
  if (filtros.referenciaTipo) parametros.set('referencia_tipo', filtros.referenciaTipo)
  if (Array.isArray(filtros.referenciaTipos) && filtros.referenciaTipos.length) {
    parametros.set('referencia_tipos', filtros.referenciaTipos.join(','))
  }
  if (filtros.tipoMovimiento) parametros.set('tipo_movimiento', filtros.tipoMovimiento)
  if (filtros.metodoBase) parametros.set('metodo_base', filtros.metodoBase)
  if (filtros.tipoMoneda) parametros.set('tipo_moneda', filtros.tipoMoneda)

  const sufijo = parametros.toString() ? `?${parametros.toString()}` : ''
  return solicitarApi(`/cajas/movimientos${sufijo}`)
}

async function registrarMovimientoCaja (formulario) {
  return solicitarApi('/cajas/movimientos', {
    method: 'POST',
    body: JSON.stringify({
      caja_id: Number(formulario.cajaId),
      tipo_movimiento: formulario.tipoMovimiento,
      monto: Number(formulario.monto || 0),
      concepto: formulario.concepto,
      detalle: formulario.detalle || null,
      fecha_movimiento: formulario.fechaMovimiento || null
    })
  })
}

async function registrarCaja (formulario) {
  return solicitarApi('/cajas', {
    method: 'POST',
    body: JSON.stringify({
      nombre: formulario.nombre,
      codigo: formulario.codigo || null,
      tipo_moneda: formulario.tipoMoneda,
      metodo_base: formulario.metodoBase,
      observaciones: formulario.observaciones || null
    })
  })
}

async function actualizarCaja (idCaja, formulario) {
  return solicitarApi(`/cajas/${idCaja}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre: formulario.nombre,
      codigo: formulario.codigo || null,
      tipo_moneda: formulario.tipoMoneda,
      metodo_base: formulario.metodoBase,
      activa: formulario.activa === true,
      observaciones: formulario.observaciones || null
    })
  })
}

async function generarCajasBase () {
  return solicitarApi('/cajas/generar-base', {
    method: 'POST'
  })
}

export {
  actualizarCaja,
  generarCajasBase,
  listarMovimientosCaja,
  obtenerDatosModuloCajas,
  registrarCaja,
  registrarMovimientoCaja
}
