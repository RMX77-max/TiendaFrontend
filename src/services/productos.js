import { solicitarApi } from 'src/services/auth'

async function obtenerDatosFormularioProducto () {
  return solicitarApi('/productos/formulario')
}

async function listarProductos () {
  return solicitarApi('/productos')
}

async function obtenerDetalleProducto (idProducto) {
  return solicitarApi(`/productos/${idProducto}/detalle`)
}

async function registrarProducto (formulario) {
  return solicitarApi('/productos', {
    method: 'POST',
    body: JSON.stringify({
      modelo: formulario.modelo,
      marca_id: formulario.marcaId,
      categoria_id: formulario.categoriaId,
      tipo_cambio: Number(formulario.tipoCambio || 0),
      precio_unitario_usd: Number(formulario.precioUnitarioUsd || 0),
      precio_unitario_bs: Number(formulario.precioUnitarioBs || 0),
      precio_mayorista_usd: Number(formulario.precioMayoristaUsd || 0),
      precio_mayorista_bs: Number(formulario.precioMayoristaBs || 0),
      costo_usd: Number(formulario.costoUsd || 0),
      costo_bs: Number(formulario.costoBs || 0),
      cantidad_total: Number(formulario.cantidadTotal || 0),
      registrar_series: formulario.registrarSeries === true,
      distribucion_sucursales: formulario.distribucionSucursales.map((item) => ({
        sucursal_id: item.sucursalId,
        cantidad: Number(item.cantidad || 0)
      })),
      series: formulario.series.map((serie) => ({
        sucursal_id: serie.sucursalId,
        numero_serie: serie.numeroSerie || null,
        observaciones: serie.observaciones || null
      }))
    })
  })
}

async function actualizarProducto (idProducto, formulario) {
  return solicitarApi(`/productos/${idProducto}`, {
    method: 'PUT',
    body: JSON.stringify({
      modelo: formulario.modelo,
      marca_id: formulario.marcaId,
      categoria_id: formulario.categoriaId,
      tipo_cambio: Number(formulario.tipoCambio || 0),
      precio_unitario_usd: Number(formulario.precioUnitarioUsd || 0),
      precio_unitario_bs: Number(formulario.precioUnitarioBs || 0),
      precio_mayorista_usd: Number(formulario.precioMayoristaUsd || 0),
      precio_mayorista_bs: Number(formulario.precioMayoristaBs || 0),
      costo_usd: Number(formulario.costoUsd || 0),
      costo_bs: Number(formulario.costoBs || 0)
    })
  })
}

async function eliminarProducto (idProducto) {
  return solicitarApi(`/productos/${idProducto}`, {
    method: 'DELETE'
  })
}

async function registrarMarca (nombre) {
  return solicitarApi('/catalogos/marcas', {
    method: 'POST',
    body: JSON.stringify({ nombre })
  })
}

async function registrarCategoria (nombre) {
  return solicitarApi('/catalogos/categorias', {
    method: 'POST',
    body: JSON.stringify({ nombre })
  })
}

export {
  listarProductos,
  obtenerDetalleProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerDatosFormularioProducto,
  registrarCategoria,
  registrarMarca,
  registrarProducto
}
