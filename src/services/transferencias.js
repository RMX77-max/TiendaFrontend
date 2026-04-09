import { solicitarApi } from 'src/services/auth'

async function listarSolicitudesTransferencia () {
  return solicitarApi('/transferencias/solicitudes')
}

async function registrarSolicitudTransferencia (formulario) {
  return solicitarApi('/transferencias/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      producto_id: Number(formulario.productoId),
      sucursal_origen_id: Number(formulario.sucursalOrigenId),
      cantidad_solicitada: Number(formulario.cantidadSolicitada || 0),
      detalle_solicitud: formulario.detalleSolicitud || null
    })
  })
}

async function responderSolicitudTransferencia (idSolicitud, formulario) {
  return solicitarApi(`/transferencias/solicitudes/${idSolicitud}/responder`, {
    method: 'PATCH',
    body: JSON.stringify({
      accion: formulario.accion,
      cantidad_aprobada: formulario.cantidadAprobada == null
        ? null
        : Number(formulario.cantidadAprobada),
      detalle_respuesta: formulario.detalleRespuesta || null
    })
  })
}

async function registrarTransferenciaDirecta (formulario) {
  return solicitarApi('/transferencias/directa', {
    method: 'POST',
    body: JSON.stringify({
      producto_id: Number(formulario.productoId),
      sucursal_origen_id: Number(formulario.sucursalOrigenId),
      sucursal_destino_id: Number(formulario.sucursalDestinoId),
      cantidad: Number(formulario.cantidadSolicitada || 0),
      detalle: formulario.detalleSolicitud || null
    })
  })
}

export {
  listarSolicitudesTransferencia,
  registrarSolicitudTransferencia,
  responderSolicitudTransferencia,
  registrarTransferenciaDirecta
}
