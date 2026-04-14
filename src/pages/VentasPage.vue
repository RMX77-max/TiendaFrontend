<template>
  <q-page class="pagina-compras q-pa-lg">
    <div>
      <div class="text-caption text-weight-bold texto-resalte-panel">Ventas</div>
      <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Carrito y registro de venta</h1>
      <p class="text-body1 text-grey-8 q-ma-none">
        Completa los datos del cliente, revisa el detalle y registra la venta en la caja correcta.
      </p>
    </div>

    <q-banner v-if="mensajeExito" rounded class="bg-green-1 text-green-10 q-mt-lg">
      {{ mensajeExito }}
    </q-banner>

    <q-banner v-if="errorGeneral" rounded class="bg-red-1 text-red-10 q-mt-lg">
      {{ errorGeneral }}
    </q-banner>

    <div class="columna-compras q-mt-lg">
      <q-card flat bordered class="tarjeta-compra-principal">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente">
            <div>
              <div class="text-h6 text-weight-bold">Datos de la venta</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                El carrito toma productos de la sucursal actual del usuario y te deja ajustar el
                precio final de venta.
              </p>
            </div>

            <div class="row q-gutter-sm">
              <q-btn flat color="grey-8" label="Volver a inventario" to="/inventario" />
              <q-btn flat color="grey-8" label="Vaciar carrito" @click="limpiarCarritoCompleto" />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="rejilla-resumen-pagos-credito">
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral">
              <div class="text-caption text-grey-7">Items en carrito</div>
              <div class="text-h6 text-weight-bold">{{ cantidadItemsCarrito }}</div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success">
              <div class="text-caption text-grey-7">Total USD</div>
              <div class="text-h6 text-weight-bold">$ {{ formatearMonto(totalCarritoUsd) }}</div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning">
              <div class="text-caption text-grey-7">Total Bs</div>
              <div class="text-h6 text-weight-bold">Bs. {{ formatearMonto(totalCarritoBs) }}</div>
            </div>
          </div>

          <div class="rejilla-compras-simple q-mt-lg">
            <q-input :model-value="sucursalActual" outlined disable label="Sucursal actual" />

            <q-select
              v-model="formulario.tipoItem"
              outlined
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              label="Tipo de venta"
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

            <q-input
              v-model="formulario.observaciones"
              outlined
              label="Observaciones"
              class="campo-formulario-usuarios--ancho-dos-columnas"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="contenedor-tabla-simple">
            <q-markup-table flat bordered class="tabla-simple-compras">
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
                      @update:model-value="
                        cambiarPrecio(item.productoId, 'usd', $event)
                      "
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
                      @update:model-value="
                        cambiarPrecio(item.productoId, 'bs', $event)
                      "
                    />
                  </td>
                  <td>{{ item.stockDisponible }}</td>
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
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            label="Confirmar venta"
            :disable="!carrito.items.length"
            :loading="guardando"
            @click="guardarVenta"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
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

defineOptions({
  name: 'VentasPage'
})

const router = useRouter()
const cargando = ref(false)
const guardando = ref(false)
const mensajeExito = ref('')
const errorGeneral = ref('')
const cajas = ref([])

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

const formulario = reactive({
  cajaId: null,
  moneda: 'bs',
  tipoItem: 'Pieza suelta',
  clienteNombre: '',
  clienteTelefono: '',
  clienteFechaNacimiento: '',
  observaciones: ''
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

async function cargarFormulario () {
  cargando.value = true
  errorGeneral.value = ''

  try {
    const datos = await obtenerDatosFormularioVenta()
    cajas.value = datos.cajas || []
    formulario.cajaId = cajas.value[0]?.value || null
    sincronizarCajaSeleccionada()
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo cargar el formulario de ventas.'
  } finally {
    cargando.value = false
  }
}

async function guardarVenta () {
  errorGeneral.value = ''
  mensajeExito.value = ''

  if (!carrito.items.length) {
    errorGeneral.value = 'Debes agregar productos al carrito antes de vender.'
    return
  }

  if (!formulario.clienteNombre.trim()) {
    errorGeneral.value = 'Debes registrar el nombre del cliente.'
    return
  }

  if (!formulario.clienteTelefono.trim()) {
    errorGeneral.value = 'Debes registrar el telefono del cliente.'
    return
  }

  if (!formulario.tipoItem.trim()) {
    errorGeneral.value = 'Selecciona o escribe el tipo de venta.'
    return
  }

  if (!formulario.cajaId) {
    errorGeneral.value = 'Selecciona una caja para registrar la venta.'
    return
  }

  guardando.value = true

  try {
    const respuesta = await registrarVenta({
      cajaId: formulario.cajaId,
      moneda: formulario.moneda,
      tipoItem: formulario.tipoItem,
      clienteNombre: formulario.clienteNombre,
      clienteTelefono: formulario.clienteTelefono,
      clienteFechaNacimiento: formulario.clienteFechaNacimiento || null,
      observaciones: formulario.observaciones,
      detalles: carrito.items
    })

    vaciarCarrito()
    mensajeExito.value = respuesta.message || 'Venta registrada correctamente.'
    await router.push('/inventario')
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
