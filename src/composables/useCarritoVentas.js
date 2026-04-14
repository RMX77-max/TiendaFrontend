import { computed, reactive } from 'vue'
import { estadoAutenticacion } from 'src/services/auth'

const carrito = reactive({
  items: []
})

function obtenerSucursalActual () {
  return estadoAutenticacion.usuario?.sucursal || ''
}

function redondearDosDecimales (valor) {
  return Number(Number(valor || 0).toFixed(2))
}

function obtenerTipoCambioReferencia (precioUsd, precioBs) {
  const usd = Number(precioUsd || 0)
  const bs = Number(precioBs || 0)

  if (usd > 0 && bs > 0) {
    return bs / usd
  }

  return 0
}

function normalizarTexto (valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
}

function encontrarItem (productoId) {
  return carrito.items.find((item) => Number(item.productoId) === Number(productoId))
}

function obtenerStockActual (producto, sucursalActual) {
  return Number(
    (producto.existencias_por_sucursal || []).find(
      (item) => normalizarTexto(item.sucursal) === normalizarTexto(sucursalActual)
    )?.cantidad || 0
  )
}

function obtenerUnidadesDisponibles (producto, sucursalActual) {
  return (producto.unidades || [])
    .filter(
      (unidad) =>
        Number(unidad.activo ?? 1) === 1 &&
        normalizarTexto(unidad.estado) === 'disponible' &&
        normalizarTexto(unidad.sucursal) === normalizarTexto(sucursalActual)
    )
    .sort((unidadA, unidadB) => Number(unidadA.id) - Number(unidadB.id))
    .map((unidad) => ({
      id: unidad.id,
      numeroSerie: unidad.numero_serie || null
    }))
}

function aplicarModoPrecio (item, modo) {
  item.modoPrecio = modo

  if (modo === 'mayorista') {
    item.precioVentaUsd = redondearDosDecimales(item.precioMayoristaUsd)
    item.precioVentaBs = redondearDosDecimales(item.precioMayoristaBs)
    item.tipoCambioReferencia = obtenerTipoCambioReferencia(
      item.precioMayoristaUsd,
      item.precioMayoristaBs
    ) || item.tipoCambioReferencia
    return
  }

  item.precioVentaUsd = redondearDosDecimales(item.precioListaUsd)
  item.precioVentaBs = redondearDosDecimales(item.precioListaBs)
  item.tipoCambioReferencia = obtenerTipoCambioReferencia(
    item.precioListaUsd,
    item.precioListaBs
  ) || item.tipoCambioReferencia
}

function actualizarSeriesSeleccionadas (item) {
  item.seriesSeleccionadas = item.unidadesDisponibles
    .slice(0, Number(item.cantidad || 0))
    .map((unidad) => unidad.numeroSerie)
    .filter(Boolean)
}

function agregarProductoAlCarrito (producto) {
  const sucursalActual = obtenerSucursalActual()
  const stockActual = obtenerStockActual(producto, sucursalActual)

  if (stockActual <= 0) {
    return false
  }

  const unidadesDisponibles = obtenerUnidadesDisponibles(producto, sucursalActual)
  const existente = encontrarItem(producto.id)

  if (existente) {
    existente.stockDisponible = stockActual
    existente.unidadesDisponibles = unidadesDisponibles
    existente.cantidad = Math.min(stockActual, Number(existente.cantidad || 0) + 1)
    actualizarSeriesSeleccionadas(existente)
    return true
  }

  const nuevoItem = {
    productoId: producto.id,
    modelo: producto.modelo || producto.nombre || '-',
    marca: producto.marca || '-',
    categoria: producto.categoria || '-',
    precioListaUsd: redondearDosDecimales(producto.precio_unitario_usd || 0),
    precioListaBs: redondearDosDecimales(producto.precio_unitario_bs || 0),
    precioMayoristaUsd: redondearDosDecimales(
      producto.precio_mayorista_usd || producto.precio_unitario_usd || 0
    ),
    precioMayoristaBs: redondearDosDecimales(
      producto.precio_mayorista_bs || producto.precio_unitario_bs || 0
    ),
    precioVentaUsd: redondearDosDecimales(producto.precio_unitario_usd || 0),
    precioVentaBs: redondearDosDecimales(producto.precio_unitario_bs || 0),
    modoPrecio: 'unitario',
    cantidad: 1,
    stockDisponible: stockActual,
    sucursal: sucursalActual,
    unidadesDisponibles,
    seriesSeleccionadas: [],
    tipoCambioReferencia: obtenerTipoCambioReferencia(
      producto.precio_unitario_usd || 0,
      producto.precio_unitario_bs || 0
    ) || obtenerTipoCambioReferencia(
      producto.precio_mayorista_usd || 0,
      producto.precio_mayorista_bs || 0
    )
  }

  actualizarSeriesSeleccionadas(nuevoItem)
  carrito.items.push(nuevoItem)

  return true
}

function actualizarCantidadCarrito (productoId, cantidad) {
  const item = encontrarItem(productoId)

  if (!item) {
    return
  }

  const cantidadNormalizada = Math.max(
    1,
    Math.min(Number(item.stockDisponible || 0), Math.trunc(Number(cantidad || 1)))
  )

  item.cantidad = cantidadNormalizada
  actualizarSeriesSeleccionadas(item)
}

function actualizarPrecioCarrito (productoId, campo, valor) {
  const item = encontrarItem(productoId)

  if (!item) {
    return
  }

  const valorNormalizado = redondearDosDecimales(valor)
  const tipoCambio = Number(item.tipoCambioReferencia || 0)

  item.modoPrecio = 'personalizado'

  if (campo === 'usd') {
    item.precioVentaUsd = valorNormalizado
    if (tipoCambio > 0) {
      item.precioVentaBs = redondearDosDecimales(valorNormalizado * tipoCambio)
    }
    return
  }

  item.precioVentaBs = valorNormalizado
  if (tipoCambio > 0) {
    item.precioVentaUsd = redondearDosDecimales(valorNormalizado / tipoCambio)
  }
}

function seleccionarModoPrecioCarrito (productoId, modo) {
  const item = encontrarItem(productoId)

  if (!item) {
    return
  }

  aplicarModoPrecio(item, modo)
}

function quitarProductoCarrito (productoId) {
  carrito.items = carrito.items.filter((item) => Number(item.productoId) !== Number(productoId))
}

function vaciarCarrito () {
  carrito.items = []
}

const cantidadItemsCarrito = computed(() =>
  carrito.items.reduce((total, item) => total + Number(item.cantidad || 0), 0)
)

const totalCarritoUsd = computed(() =>
  carrito.items.reduce(
    (total, item) => total + Number(item.precioVentaUsd || 0) * Number(item.cantidad || 0),
    0
  )
)

const totalCarritoBs = computed(() =>
  carrito.items.reduce(
    (total, item) => total + Number(item.precioVentaBs || 0) * Number(item.cantidad || 0),
    0
  )
)

export {
  agregarProductoAlCarrito,
  actualizarCantidadCarrito,
  actualizarPrecioCarrito,
  cantidadItemsCarrito,
  carrito,
  quitarProductoCarrito,
  seleccionarModoPrecioCarrito,
  totalCarritoBs,
  totalCarritoUsd,
  vaciarCarrito
}
