<template>
  <q-page class="pagina-ventas q-pa-lg">
    <div class="encabezado-ventas encabezado-ventas--checkout">
      <div>
        <div class="text-caption text-weight-bold texto-resalte-panel">Ventas</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-none">Registro de venta</h1>
      </div>
      <div class="resumen-estado-ventas">
        <q-chip square color="grey-2" text-color="dark" icon="store">
          {{ sucursalActual || 'Sin sucursal' }}
        </q-chip>
        <q-chip
          square
          :color="formulario.tipoVenta === 'credito' ? 'amber-2' : 'green-2'"
          text-color="dark"
          :icon="formulario.tipoVenta === 'credito' ? 'credit_card' : 'payments'"
        >
          {{ formulario.tipoVenta === 'credito' ? 'Credito' : 'Contado' }}
        </q-chip>
      </div>
    </div>

    <q-banner v-if="mensajeExito" rounded class="bg-green-1 text-green-10 q-mt-lg">
      {{ mensajeExito }}
    </q-banner>

    <q-banner v-if="errorGeneral" rounded class="bg-red-1 text-red-10 q-mt-lg">
      {{ errorGeneral }}
    </q-banner>

    <div class="columna-compras q-mt-lg">
      <q-card flat bordered class="tarjeta-ventas-secundaria">
        <q-card-section class="q-pa-md">
          <div class="cabecera-acciones-ventas">
            <div class="row q-gutter-sm">
              <q-btn
                unelevated
                color="amber-1"
                text-color="amber-10"
                icon="description"
                label="Cotizacion"
                class="boton-accion-secundaria-ventas"
                @click="imprimirBorrador('cotizacion')"
              />
              <q-btn
                unelevated
                color="blue-1"
                text-color="blue-10"
                icon="receipt_long"
                label="Nota"
                class="boton-accion-secundaria-ventas"
                @click="imprimirBorrador('nota')"
              />
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                unelevated
                color="grey-2"
                text-color="grey-9"
                icon="arrow_back"
                label="Volver a inventario"
                class="boton-accion-secundaria-ventas"
                to="/inventario"
              />
              <q-btn
                unelevated
                color="red-1"
                text-color="negative"
                icon="delete_sweep"
                label="Vaciar carrito"
                class="boton-accion-secundaria-ventas"
                @click="limpiarCarritoCompleto"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="tarjeta-ventas-principal">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente">
            <div>
              <div class="text-h6 text-weight-bold">Venta actual</div>
              <div class="text-body2 text-grey-7 q-mt-xs">
                Revisa cliente, caja y carrito antes de guardar.
              </div>
            </div>
            <q-chip square color="grey-2" text-color="dark" icon="shopping_cart">
              {{ cantidadItemsCarrito }} item(s)
            </q-chip>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="rejilla-resumen-pagos-credito rejilla-resumen-pagos-credito--ventas-page">
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral tarjeta-resumen-pago--ventas-page">
              <div class="text-caption text-grey-7">Items en carrito</div>
              <div class="text-h5 text-weight-bold">{{ cantidadItemsCarrito }}</div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success tarjeta-resumen-pago--ventas-page tarjeta-resumen-pago--total-ventas">
              <div class="text-caption text-grey-7">Total USD</div>
              <div class="text-h5 text-weight-bold">$ {{ formatearMonto(totalCarritoUsd) }}</div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning tarjeta-resumen-pago--ventas-page tarjeta-resumen-pago--total-ventas">
              <div class="text-caption text-grey-7">Total Bs</div>
              <div class="text-h5 text-weight-bold">Bs. {{ formatearMonto(totalCarritoBs) }}</div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral tarjeta-resumen-pago--ventas-page">
              <div class="text-caption text-grey-7">Tipo de venta</div>
              <div class="text-h5 text-weight-bold">{{ formulario.tipoVenta === 'credito' ? 'Credito' : 'Contado' }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="cabecera-seccion-ventas">
            <div>
              <div class="text-subtitle1 text-weight-bold">Datos generales</div>
              <div class="text-body2 text-grey-7 q-mt-xs">Cliente, caja y documento de impresion.</div>
            </div>
          </div>
          <div class="rejilla-compras-simple q-mt-md">
            <q-input :model-value="sucursalActual" outlined disable label="Sucursal actual" />

            <q-select
              v-model="formulario.tipoVenta"
              outlined
              emit-value
              map-options
              label="Tipo de venta"
              :options="tiposVenta"
              option-value="value"
              option-label="label"
            />

            <q-select
              v-model="formulario.tipoItem"
              outlined
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              label="Tipo de item"
              :options="opcionesTipoItemFiltradas"
              @filter="filtrarTiposItem"
              @new-value="agregarTipoItem"
            />

            <q-input
              v-model.trim="formulario.clienteNombre"
              outlined
              label="Nombre del cliente"
            />

            <q-input
              v-model.trim="formulario.clienteTelefono"
              outlined
              label="Telefono"
            />

            <q-input
              v-model="formulario.clienteFechaNacimiento"
              outlined
              type="date"
              label="Fecha de nacimiento"
            />

            <q-select
              v-model="formulario.cajaId"
              outlined
              emit-value
              map-options
              label="Caja"
              :options="cajas"
              option-value="value"
              option-label="label"
              @update:model-value="sincronizarCajaSeleccionada"
            />

            <q-select
              v-model="formulario.moneda"
              outlined
              emit-value
              map-options
              label="Moneda"
              :options="opcionesMoneda"
              option-value="value"
              option-label="label"
            />

            <q-select
              v-model="formulario.plantillaSucursalId"
              outlined
              emit-value
              map-options
              label="Plantilla de impresion"
              :options="plantillas"
              option-value="value"
              option-label="label"
              @update:model-value="sincronizarPlantillaSeleccionada"
            />

            <q-input
              v-model="formulario.observaciones"
              outlined
              label="Observaciones"
              class="campo-formulario-usuarios--ancho-dos-columnas campo-ventas-observaciones"
            />
          </div>
        </q-card-section>

        <template v-if="formulario.tipoVenta === 'credito'">
          <q-separator />

          <q-card-section class="q-pa-lg seccion-credito-ventas">
            <div class="cabecera-seccion-ventas">
              <div>
                <div class="text-subtitle1 text-weight-bold">Abono inicial</div>
                <div class="text-body2 text-grey-7 q-mt-xs">Registra el primer pago y confirma el saldo pendiente.</div>
              </div>
              <q-chip square color="amber-2" text-color="dark" icon="credit_card">
                Venta a credito
              </q-chip>
            </div>
            <div class="rejilla-compras-simple q-mt-md">
              <q-input
                v-model.number="formulario.abonoInicialUsd"
                outlined
                type="number"
                min="0"
                step="0.01"
                label="Abono inicial USD"
              />

              <q-input
                v-model.number="formulario.abonoInicialBs"
                outlined
                type="number"
                min="0"
                step="0.01"
                label="Abono inicial Bs"
              />

              <q-file
                v-model="formulario.comprobanteCredito"
                outlined
                clearable
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                label="Comprobante opcional"
              />

              <q-input
                v-model="formulario.observacionesAbonoInicial"
                outlined
                label="Observacion del abono"
              />

              <q-input
                :model-value="formatearMonto(saldoPendienteUsd)"
                outlined
                disable
                label="Saldo pendiente USD"
              />

              <q-input
                :model-value="formatearMonto(saldoPendienteBs)"
                outlined
                disable
                label="Saldo pendiente Bs"
              />
            </div>
          </q-card-section>
        </template>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente">
            <div class="text-subtitle1 text-weight-bold">Carrito</div>
            <q-chip square color="grey-2" text-color="dark" icon="shopping_cart">
              {{ cantidadItemsCarrito }} item(s)
            </q-chip>
          </div>

          <div class="contenedor-tabla-simple">
            <q-markup-table flat bordered class="tabla-simple-compras tabla-carrito-ventas">
              <thead>
                <tr>
                  <th class="text-left">Modelo</th>
                  <th class="text-left">Marca</th>
                  <th class="text-left">Categoria</th>
                  <th class="text-left">Serie</th>
                  <th class="text-left">Precio</th>
                  <th class="text-left">Precio venta USD</th>
                  <th class="text-left">Precio venta Bs</th>
                  <th class="text-left">Stock</th>
                  <th class="text-left">Cantidad</th>
                  <th class="text-left">Total</th>
                  <th class="text-center">Accion</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!carrito.items.length">
                  <td colspan="11" class="text-center text-grey-7">
                    Aun no hay productos en el carrito.
                  </td>
                </tr>
                <tr v-for="item in carrito.items" :key="item.productoId">
                  <td>{{ item.modelo }}</td>
                  <td>{{ item.marca || '-' }}</td>
                  <td>{{ item.categoria || '-' }}</td>
                  <td>
                    <div v-if="item.seriesSeleccionadas.length">
                      {{ item.seriesSeleccionadas.join(', ') }}
                    </div>
                    <div v-else class="text-grey-6">Sin serie</div>
                  </td>
                  <td class="columna-tabla-simple">
                    <q-select
                      :model-value="item.modoPrecio"
                      dense
                      outlined
                      emit-value
                      map-options
                      :options="opcionesPrecio"
                      option-value="value"
                      option-label="label"
                      @update:model-value="seleccionarModoPrecio(item.productoId, $event)"
                    />
                    <div class="text-caption text-grey-7 q-mt-xs">
                      Lista: $ {{ formatearMonto(item.precioListaUsd) }} / Bs.
                      {{ formatearMonto(item.precioListaBs) }}
                    </div>
                    <div class="text-caption text-grey-7">
                      Mayorista: $ {{ formatearMonto(item.precioMayoristaUsd) }} / Bs.
                      {{ formatearMonto(item.precioMayoristaBs) }}
                    </div>
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="item.precioVentaUsd"
                      dense
                      outlined
                      type="number"
                      min="0"
                      step="0.01"
                      @update:model-value="cambiarPrecio(item.productoId, 'usd', $event)"
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="item.precioVentaBs"
                      dense
                      outlined
                      type="number"
                      min="0"
                      step="0.01"
                      @update:model-value="cambiarPrecio(item.productoId, 'bs', $event)"
                    />
                  </td>
                  <td>
                    <q-badge color="blue-1" text-color="primary" rounded>
                      {{ item.stockDisponible }}
                    </q-badge>
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="item.cantidad"
                      dense
                      outlined
                      type="number"
                      min="1"
                      :max="item.stockDisponible"
                      @update:model-value="cambiarCantidad(item.productoId, $event)"
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <div>$ {{ formatearMonto(item.precioVentaUsd * item.cantidad) }}</div>
                    <div class="text-caption text-grey-7">
                      Bs. {{ formatearMonto(item.precioVentaBs * item.cantidad) }}
                    </div>
                  </td>
                  <td class="text-center">
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="negative"
                      @click="eliminarItem(item.productoId)"
                    >
                      <q-tooltip>Quitar del carrito</q-tooltip>
                    </q-btn>
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="barra-acciones-venta q-pa-lg">
          <div class="total-acciones-venta">
            <div class="text-caption text-grey-7">Total a cobrar</div>
            <div class="text-subtitle1 text-weight-bold">
              $ {{ formatearMonto(totalCarritoUsd) }} / Bs. {{ formatearMonto(totalCarritoBs) }}
            </div>
          </div>
          <div class="acciones-finales-ventas">
            <q-btn
              unelevated
              color="dark"
              text-color="white"
              icon="save"
              label="Guardar venta"
              :disable="!carrito.items.length"
              :loading="guardando && accionGuardado === 'guardar'"
              @click="guardarVenta('guardar')"
            />
            <q-btn
              unelevated
              color="primary"
              text-color="white"
              icon="print"
              label="Guardar e imprimir"
              :disable="!carrito.items.length"
              :loading="guardando && accionGuardado === 'imprimir'"
              @click="guardarVenta('imprimir')"
            />
          </div>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { estadoAutenticacion } from 'src/services/auth'
import {
  actualizarCantidadCarrito,
  actualizarPrecioCarrito,
  cantidadItemsCarrito,
  carrito,
  quitarProductoCarrito,
  seleccionarModoPrecioCarrito,
  totalCarritoBs,
  totalCarritoUsd,
  vaciarCarrito
} from 'src/composables/useCarritoVentas'
import { obtenerDatosFormularioVenta, registrarVenta } from 'src/services/ventas'
import { imprimirDocumentoVenta } from 'src/utils/documentosVentas'

defineOptions({
  name: 'VentasPage'
})

const $q = useQuasar()
const cargando = ref(false)
const guardando = ref(false)
const accionGuardado = ref('guardar')
const mensajeExito = ref('')
const errorGeneral = ref('')
const cajas = ref([])
const plantillas = ref([])
const tiposVenta = ref([])
const plantillaPredeterminadaId = ref(null)

const opcionesMoneda = [
  { value: 'bs', label: 'Bolivianos' },
  { value: 'usd', label: 'Dolares' }
]

const opcionesPrecio = [
  { value: 'unitario', label: 'Precio unitario' },
  { value: 'mayorista', label: 'Precio mayorista' },
  { value: 'personalizado', label: 'Personalizado' }
]

const tiposItemBase = [
  'Pieza suelta',
  'PC',
  'Laptop',
  'Impresora',
  'Monitor',
  'Combo'
]

const opcionesTipoItemFiltradas = ref([...tiposItemBase])
const sucursalActual = computed(() => estadoAutenticacion.usuario?.sucursal || '')
const plantillaSeleccionada = computed(
  () => plantillas.value.find((item) => Number(item.value) === Number(formulario.plantillaSucursalId)) || null
)
const saldoPendienteUsd = computed(() => {
  if (formulario.tipoVenta !== 'credito') return 0
  return Math.max(Number(totalCarritoUsd.value || 0) - Number(formulario.abonoInicialUsd || 0), 0)
})
const saldoPendienteBs = computed(() => {
  if (formulario.tipoVenta !== 'credito') return 0
  return Math.max(Number(totalCarritoBs.value || 0) - Number(formulario.abonoInicialBs || 0), 0)
})

const formulario = reactive({
  cajaId: null,
  moneda: 'bs',
  tipoCambio: null,
  tipoVenta: 'contado',
  tipoItem: 'Pieza suelta',
  clienteNombre: '',
  clienteTelefono: '',
  clienteFechaNacimiento: '',
  observaciones: '',
  plantillaSucursalId: null,
  plantillaImpresion: 'clasica',
  abonoInicialUsd: 0,
  abonoInicialBs: 0,
  observacionesAbonoInicial: '',
  comprobanteCredito: null
})

function formatearMonto (valor) {
  return Number(valor || 0).toFixed(2)
}

function filtrarTiposItem (valor, update) {
  update(() => {
    const texto = String(valor || '').trim().toLowerCase()

    if (!texto) {
      opcionesTipoItemFiltradas.value = [...tiposItemBase]
      return
    }

    opcionesTipoItemFiltradas.value = tiposItemBase.filter((item) =>
      item.toLowerCase().includes(texto)
    )
  })
}

function agregarTipoItem (valor, done) {
  const texto = String(valor || '').trim()

  if (!texto) {
    done(null)
    return
  }

  if (!tiposItemBase.includes(texto)) {
    tiposItemBase.push(texto)
  }

  opcionesTipoItemFiltradas.value = [...tiposItemBase]
  done(texto, 'toggle')
}

function sincronizarCajaSeleccionada () {
  const caja = cajas.value.find((item) => Number(item.value) === Number(formulario.cajaId))

  if (!caja) {
    return
  }

  formulario.moneda = caja.tipo_moneda || 'bs'
}

function obtenerCajaPredeterminada () {
  const cajasDisponibles = cajas.value || []

  return (
    cajasDisponibles.find((item) =>
      String(item.tipo_moneda || '').toLowerCase() === 'bs' &&
      String(item.metodo_base || '').toLowerCase() === 'efectivo'
    ) ||
    cajasDisponibles.find((item) => String(item.tipo_moneda || '').toLowerCase() === 'bs') ||
    cajasDisponibles[0] ||
    null
  )
}

function sincronizarPlantillaSeleccionada () {
  const plantilla = plantillaSeleccionada.value
  formulario.plantillaImpresion = plantilla?.plantilla_impresion || 'clasica'
}

function cambiarCantidad (productoId, valor) {
  actualizarCantidadCarrito(productoId, valor)
}

function cambiarPrecio (productoId, campo, valor) {
  actualizarPrecioCarrito(productoId, campo, valor)
}

function seleccionarModoPrecio (productoId, modo) {
  seleccionarModoPrecioCarrito(productoId, modo)
}

function eliminarItem (productoId) {
  quitarProductoCarrito(productoId)
}

function limpiarCarritoCompleto () {
  vaciarCarrito()
}

function reiniciarFormularioVenta () {
  formulario.tipoVenta = 'contado'
  formulario.tipoItem = 'Pieza suelta'
  formulario.clienteNombre = ''
  formulario.clienteTelefono = ''
  formulario.clienteFechaNacimiento = ''
  formulario.observaciones = ''
  formulario.abonoInicialUsd = 0
  formulario.abonoInicialBs = 0
  formulario.observacionesAbonoInicial = ''
  formulario.comprobanteCredito = null
  formulario.tipoCambio = null
  formulario.moneda = 'bs'
  formulario.cajaId = obtenerCajaPredeterminada()?.value || null
  formulario.plantillaSucursalId = plantillaPredeterminadaId.value || plantillas.value[0]?.value || null
  sincronizarCajaSeleccionada()
  sincronizarPlantillaSeleccionada()
}

async function cargarFormulario () {
  cargando.value = true
  errorGeneral.value = ''

  try {
    const datos = await obtenerDatosFormularioVenta()
    cajas.value = datos.cajas || []
    plantillas.value = datos.plantillas || []
    tiposVenta.value = datos.tipos_venta || [
      { value: 'contado', label: 'Contado' },
      { value: 'credito', label: 'Credito' }
    ]
    plantillaPredeterminadaId.value = datos.plantilla_predeterminada_id || null
    formulario.moneda = 'bs'
    formulario.cajaId = obtenerCajaPredeterminada()?.value || null
    formulario.plantillaSucursalId = plantillaPredeterminadaId.value || plantillas.value[0]?.value || null
    sincronizarCajaSeleccionada()
    sincronizarPlantillaSeleccionada()
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo cargar el formulario de ventas.'
  } finally {
    cargando.value = false
  }
}

function construirBorradorDocumento () {
  return {
    nro_venta: 'BORRADOR',
    sucursal: sucursalActual.value,
    moneda: formulario.moneda,
    cliente_nombre: formulario.clienteNombre,
    cliente_telefono: formulario.clienteTelefono,
    observaciones: formulario.observaciones,
    fecha_venta: new Date().toLocaleString('es-BO'),
    total_usd: Number(totalCarritoUsd.value || 0),
    total_bs: Number(totalCarritoBs.value || 0),
    detalles: carrito.items.map((item) => ({
      modelo: item.modelo,
      marca: item.marca,
      categoria: item.categoria,
      series: item.seriesSeleccionadas?.length ? item.seriesSeleccionadas.join(', ') : '-',
      cantidad: item.cantidad,
      precioVentaUsd: Number(item.precioVentaUsd || 0),
      precioVentaBs: Number(item.precioVentaBs || 0),
      subtotal_usd: Number(item.precioVentaUsd || 0) * Number(item.cantidad || 0),
      subtotal_bs: Number(item.precioVentaBs || 0) * Number(item.cantidad || 0)
    }))
  }
}

function validarFormularioVenta () {
  if (!carrito.items.length) {
    return 'Debes agregar productos al carrito antes de vender.'
  }

  if (!formulario.clienteNombre.trim()) {
    return 'Debes registrar el nombre del cliente.'
  }

  if (!formulario.clienteTelefono.trim()) {
    return 'Debes registrar el telefono del cliente.'
  }

  if (!formulario.tipoItem.trim()) {
    return 'Selecciona o escribe el tipo de item.'
  }

  if (!formulario.cajaId) {
    return 'Selecciona una caja para registrar la venta.'
  }

  if (!formulario.plantillaSucursalId) {
    return 'Selecciona una plantilla de impresion.'
  }

  if (formulario.tipoVenta === 'credito') {
    if (Number(formulario.abonoInicialUsd || 0) > Number(totalCarritoUsd.value || 0)) {
      return 'El abono inicial USD no puede ser mayor al total de la venta.'
    }

    if (Number(formulario.abonoInicialBs || 0) > Number(totalCarritoBs.value || 0)) {
      return 'El abono inicial Bs no puede ser mayor al total de la venta.'
    }
  }

  return ''
}

function imprimirBorrador (tipoDocumento) {
  try {
    const error = validarFormularioVenta()

    if (error && !carrito.items.length) {
      errorGeneral.value = error
      return
    }

    imprimirDocumentoVenta({
      tipoDocumento,
      borrador: construirBorradorDocumento(),
      plantilla: plantillaSeleccionada.value
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'No se pudo abrir la impresion.'
    })
  }
}

async function guardarVenta (accion = 'guardar') {
  errorGeneral.value = ''
  mensajeExito.value = ''
  accionGuardado.value = accion

  const errorValidacion = validarFormularioVenta()
  if (errorValidacion) {
    errorGeneral.value = errorValidacion
    return
  }

  guardando.value = true

  try {
    const respuesta = await registrarVenta({
      cajaId: formulario.cajaId,
      moneda: formulario.moneda,
      tipoCambio: formulario.tipoCambio,
      tipoVenta: formulario.tipoVenta,
      tipoItem: formulario.tipoItem,
      clienteNombre: formulario.clienteNombre,
      clienteTelefono: formulario.clienteTelefono,
      clienteFechaNacimiento: formulario.clienteFechaNacimiento || null,
      observaciones: formulario.observaciones,
      plantillaSucursalId: formulario.plantillaSucursalId,
      plantillaImpresion: formulario.plantillaImpresion,
      abonoInicialUsd: formulario.abonoInicialUsd,
      abonoInicialBs: formulario.abonoInicialBs,
      observacionesAbonoInicial: formulario.observacionesAbonoInicial,
      comprobanteCredito: formulario.comprobanteCredito,
      detalles: carrito.items
    })

    vaciarCarrito()
    mensajeExito.value = respuesta.message || 'Venta registrada correctamente.'
    reiniciarFormularioVenta()

    if (accion === 'imprimir' && respuesta.venta) {
      try {
        imprimirDocumentoVenta({
          tipoDocumento: 'recibo',
          venta: respuesta.venta,
          plantilla: respuesta.venta.plantilla
        })
      } catch (errorImpresion) {
        $q.notify({
          type: 'warning',
          message: errorImpresion.message || 'La venta se guardo, pero no se pudo abrir la impresion.'
        })
      }
    }

    $q.notify({
      type: 'positive',
      message: accion === 'imprimir'
        ? 'Venta registrada e impresion preparada correctamente.'
        : 'Venta registrada correctamente.'
    })
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo registrar la venta.'
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarFormulario()
})
</script>
