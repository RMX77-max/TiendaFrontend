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
  if (filtros.fechaDesde) parametros.set('fecha_desde', filtros.fechaDesde)
  if (filtros.fechaHasta) parametros.set('fecha_hasta', filtros.fechaHasta)
  if (filtros.concepto) parametros.set('concepto', filtros.concepto)

  const sufijo = parametros.toString() ? `?${parametros.toString()}` : ''
  return solicitarApi(`/cajas/movimientos${sufijo}`)
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
  registrarCaja
}
