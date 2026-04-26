<template>
  <q-page class="pagina-compras q-pa-lg">
    <div>
      <div class="text-caption text-weight-bold texto-resalte-panel">Ventas</div>
      <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Historial de ventas</h1>
      <p class="text-body1 text-grey-8 q-ma-none">
        Revisa ventas registradas, pagos a credito y documentos imprimibles por sucursal.
      </p>
    </div>

    <q-banner v-if="errorGeneral" rounded class="bg-red-1 text-red-10 q-mt-lg">
      {{ errorGeneral }}
    </q-banner>

    <div class="columna-compras q-mt-lg">
      <q-card flat bordered class="tarjeta-compra-principal">
        <q-card-section class="q-pa-lg">
          <div class="rejilla-compras-simple">
            <q-input
              v-model="filtros.nroVenta"
              outlined
              label="Buscar por nro venta"
              @update:model-value="cargarModulo"
            />

            <q-select
              v-model="filtros.cajaId"
              outlined
              emit-value
              map-options
              clearable
              label="Caja"
              :options="cajas"
              option-value="value"
              option-label="label"
              @update:model-value="cargarModulo"
            />

            <q-input
              v-model="filtros.fechaDesde"
              outlined
              type="date"
              label="Fecha desde"
              @update:model-value="cargarModulo"
            />

            <q-input
              v-model="filtros.fechaHasta"
              outlined
              type="date"
              label="Fecha hasta"
              @update:model-value="cargarModulo"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="tarjeta-compra-principal">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente">
            <div>
              <div class="text-h6 text-weight-bold">Ventas registradas</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Desde aqui puedes revisar el detalle, reimprimir documentos y registrar pagos de ventas a credito.
              </p>
            </div>

            <q-btn flat icon="refresh" color="grey-8" label="Actualizar" @click="cargarModulo" />
          </div>

          <div class="contenedor-tabla-simple q-mt-lg">
            <q-table
              flat
              :rows="ventas"
              :columns="columnasVentas"
              row-key="id"
              :loading="cargando"
              no-data-label="Aun no hay ventas registradas."
              :pagination="{ rowsPerPage: 8 }"
            >
              <template #body-cell-tipo="propiedades">
                <q-td :props="propiedades">
                  {{ propiedades.row.tipo_venta_label }}
                </q-td>
              </template>

              <template #body-cell-estado_pago="propiedades">
                <q-td :props="propiedades">
                  {{ propiedades.row.estado_pago_label }}
                </q-td>
              </template>

              <template #body-cell-total="propiedades">
                <q-td :props="propiedades">
                  <div class="text-weight-medium">
                    $ {{ formatearMonto(propiedades.row.total_usd) }}
                  </div>
                  <div class="text-caption text-grey-7">
                    Bs. {{ formatearMonto(propiedades.row.total_bs) }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-saldo="propiedades">
                <q-td :props="propiedades">
                  <div class="text-weight-medium">
                    $ {{ formatearMonto(propiedades.row.saldo_pendiente_usd) }}
                  </div>
                  <div class="text-caption text-grey-7">
                    Bs. {{ formatearMonto(propiedades.row.saldo_pendiente_bs) }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-acciones="propiedades">
                <q-td :props="propiedades" class="text-right">
                  <div class="row justify-end q-gutter-sm no-wrap">
                    <q-btn flat dense color="primary" label="Detalle" @click="abrirDetalleVenta(propiedades.row)" />
                    <q-btn
                      flat
                      dense
                      color="positive"
                      label="Pago"
                      :disable="!puedeRegistrarPago(propiedades.row)"
                      @click="abrirDialogoPago(propiedades.row)"
                    />
                  </div>
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="dialogoDetalleAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente">
            <div>
              <div class="text-h6 text-weight-bold">
                Venta {{ ventaSeleccionada?.nro_venta || '' }}
              </div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Revisa el detalle completo, los pagos registrados y los documentos imprimibles.
              </p>
            </div>

            <div class="row q-gutter-sm items-center">
              <q-btn flat color="grey-8" label="Recibo" @click="imprimirVentaActual('recibo')" />
              <q-btn flat color="grey-8" label="Nota" @click="imprimirVentaActual('nota')" />
              <q-btn
                flat
                color="positive"
                label="Registrar pago"
                :disable="!puedeRegistrarPago(ventaSeleccionada)"
                @click="abrirDialogoPago(ventaSeleccionada)"
              />
              <q-btn flat round dense class="boton-cerrar-modal-compras" icon="close" @click="dialogoDetalleAbierto = false" />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="cargandoDetalle" class="text-grey-7">Cargando detalle...</div>

          <template v-else-if="ventaSeleccionada">
            <div class="rejilla-resumen-pagos-credito">
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral">
                <div class="text-caption text-grey-7">Cliente</div>
                <div class="text-subtitle1 text-weight-bold">{{ ventaSeleccionada.cliente_nombre }}</div>
              </div>
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success">
                <div class="text-caption text-grey-7">Total USD</div>
                <div class="text-h6 text-weight-bold">$ {{ formatearMonto(ventaSeleccionada.total_usd) }}</div>
              </div>
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning">
                <div class="text-caption text-grey-7">Abonado Bs</div>
                <div class="text-h6 text-weight-bold">Bs. {{ formatearMonto(ventaSeleccionada.total_abonos_bs) }}</div>
              </div>
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral">
                <div class="text-caption text-grey-7">Saldo pendiente Bs</div>
                <div class="text-h6 text-weight-bold">Bs. {{ formatearMonto(ventaSeleccionada.saldo_pendiente_bs) }}</div>
              </div>
            </div>

            <div class="rejilla-compras-simple q-mt-lg">
              <q-input :model-value="ventaSeleccionada.sucursal" outlined disable label="Sucursal" />
              <q-input :model-value="ventaSeleccionada.caja" outlined disable label="Caja base" />
              <q-input :model-value="ventaSeleccionada.tipo_venta_label" outlined disable label="Tipo de venta" />
              <q-input :model-value="ventaSeleccionada.estado_pago_label" outlined disable label="Estado de pago" />
              <q-input :model-value="ventaSeleccionada.cliente_telefono || '-'" outlined disable label="Telefono" />
              <q-input :model-value="ventaSeleccionada.fecha_venta" outlined disable label="Fecha" />
              <q-input
                :model-value="ventaSeleccionada.observaciones || '-'"
                outlined
                disable
                label="Observaciones"
                class="campo-formulario-usuarios--ancho-dos-columnas"
              />
            </div>

            <div class="contenedor-tabla-simple q-mt-lg">
              <q-markup-table flat bordered class="tabla-simple-compras">
                <thead>
                  <tr>
                    <th class="text-left">Producto</th>
                    <th class="text-left">Marca</th>
                    <th class="text-left">Categoria</th>
                    <th class="text-left">Serie</th>
                    <th class="text-left">Cant.</th>
                    <th class="text-left">P. USD</th>
                    <th class="text-left">P. Bs</th>
                    <th class="text-left">Subtotal USD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in ventaSeleccionada.detalles" :key="`${ventaSeleccionada.id}-${detalle.modelo}-${detalle.series}`">
                    <td>{{ detalle.modelo }}</td>
                    <td>{{ detalle.marca || '-' }}</td>
                    <td>{{ detalle.categoria || '-' }}</td>
                    <td>{{ detalle.series || '-' }}</td>
                    <td>{{ detalle.cantidad }}</td>
                    <td>$ {{ formatearMonto(detalle.precio_venta_usd) }}</td>
                    <td>Bs. {{ formatearMonto(detalle.precio_venta_bs) }}</td>
                    <td>$ {{ formatearMonto(detalle.subtotal_usd) }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>

            <div class="q-mt-xl">
              <div class="text-subtitle1 text-weight-bold">Pagos registrados</div>
              <div class="contenedor-tabla-simple q-mt-md">
                <q-markup-table flat bordered class="tabla-simple-compras">
                  <thead>
                    <tr>
                      <th class="text-left">Fecha</th>
                      <th class="text-left">Caja</th>
                      <th class="text-left">Usuario</th>
                      <th class="text-left">Pago USD</th>
                      <th class="text-left">Pago Bs</th>
                      <th class="text-left">Comprobante</th>
                      <th class="text-left">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!ventaSeleccionada.abonos?.length">
                      <td colspan="7" class="text-center text-grey-7">
                        Aun no hay pagos registrados para esta venta.
                      </td>
                    </tr>
                    <tr v-for="abono in ventaSeleccionada.abonos || []" :key="abono.id">
                      <td>{{ abono.fecha_abono }}</td>
                      <td>{{ abono.caja || '-' }}</td>
                      <td>{{ abono.usuario || '-' }}</td>
                      <td>$ {{ formatearMonto(abono.abono_usd) }}</td>
                      <td>Bs. {{ formatearMonto(abono.abono_bs) }}</td>
                      <td>
                        <a
                          v-if="abono.comprobante_url"
                          :href="resolverUrlArchivo(abono.comprobante_url)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="enlace-comprobante"
                        >
                          Ver comprobante
                        </a>
                        <span v-else>-</span>
                      </td>
                      <td>{{ abono.observaciones || '-' }}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoPagoAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente">
            <div>
              <div class="text-h6 text-weight-bold">Registrar pago</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Registra un abono real a caja para la venta {{ ventaSeleccionada?.nro_venta || '' }}.
              </p>
            </div>

            <q-btn flat round dense class="boton-cerrar-modal-compras" icon="close" @click="dialogoPagoAbierto = false" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner v-if="errorPago" rounded class="bg-red-1 text-red-10 q-mb-lg">
            {{ errorPago }}
          </q-banner>

          <div class="rejilla-compras-simple">
            <q-select
              v-model="formularioPago.cajaId"
              outlined
              emit-value
              map-options
              label="Caja"
              :options="cajasDisponiblesPago"
              option-value="value"
              option-label="label"
              @update:model-value="sincronizarCajaPago"
            />

            <q-input
              v-model="formularioPago.fechaAbono"
              outlined
              type="date"
              label="Fecha de pago"
            />

            <q-input
              v-model.number="formularioPago.abonoUsd"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Pago USD"
            />

            <q-input
              v-model.number="formularioPago.abonoBs"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Pago Bs"
            />

            <q-file
              v-model="formularioPago.comprobanteFoto"
              outlined
              clearable
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              label="Comprobante opcional"
            />

            <q-input
              v-model="formularioPago.observaciones"
              outlined
              label="Observaciones"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat color="grey-8" label="Cancelar" @click="dialogoPagoAbierto = false" />
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            label="Guardar pago"
            :loading="guardandoPago"
            @click="guardarPagoCredito"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { resolverUrlArchivo } from 'src/services/auth'
import { obtenerDatosModuloCajas } from 'src/services/cajas'
import {
  listarVentas,
  obtenerDetalleVenta,
  registrarPagoCreditoVenta
} from 'src/services/ventas'
import { imprimirDocumentoVenta } from 'src/utils/documentosVentas'

defineOptions({
  name: 'MovimientosCajaPage'
})

const $q = useQuasar()
const cargando = ref(false)
const cargandoDetalle = ref(false)
const guardandoPago = ref(false)
const errorGeneral = ref('')
const errorPago = ref('')
const cajas = ref([])
const cajasVenta = ref([])
const ventas = ref([])
const ventaSeleccionada = ref(null)
const dialogoDetalleAbierto = ref(false)
const dialogoPagoAbierto = ref(false)

const filtros = reactive({
  nroVenta: '',
  cajaId: null,
  fechaDesde: '',
  fechaHasta: ''
})

const formularioPago = reactive({
  cajaId: null,
  fechaAbono: new Date().toISOString().slice(0, 10),
  tipoCambioAbono: null,
  abonoUsd: 0,
  abonoBs: 0,
  comprobanteFoto: null,
  observaciones: ''
})

const columnasVentas = [
  { name: 'nro_venta', label: 'Nro venta', align: 'left', field: 'nro_venta', sortable: true },
  { name: 'fecha_venta', label: 'Fecha', align: 'left', field: 'fecha_venta', sortable: true },
  { name: 'sucursal', label: 'Sucursal', align: 'left', field: 'sucursal', sortable: true },
  { name: 'caja', label: 'Caja', align: 'left', field: 'caja', sortable: true },
  { name: 'tipo', label: 'Tipo', align: 'left', field: 'tipo_venta_label', sortable: true },
  { name: 'estado_pago', label: 'Estado', align: 'left', field: 'estado_pago_label', sortable: true },
  { name: 'usuario', label: 'Usuario', align: 'left', field: 'usuario', sortable: true },
  { name: 'cantidad_items', label: 'Items', align: 'left', field: 'cantidad_items', sortable: true },
  { name: 'total', label: 'Total', align: 'left', field: 'total_usd', sortable: true },
  { name: 'saldo', label: 'Saldo', align: 'left', field: 'saldo_pendiente_usd', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'right', field: 'id' }
]

const cajasDisponiblesPago = computed(() => {
  const sucursal = ventaSeleccionada.value?.sucursal

  return (cajasVenta.value || []).filter((caja) => {
    if (!sucursal) return true
    return caja.sucursal === sucursal
  })
})

function formatearMonto (valor) {
  return Number(valor || 0).toFixed(2)
}

function puedeRegistrarPago (venta) {
  return Boolean(
    venta &&
    venta.tipo_venta === 'credito' &&
    venta.estado_pago !== 'pagado'
  )
}

function reiniciarFormularioPago () {
  formularioPago.cajaId = cajasDisponiblesPago.value[0]?.value || ventaSeleccionada.value?.caja_id || null
  formularioPago.fechaAbono = new Date().toISOString().slice(0, 10)
  formularioPago.tipoCambioAbono = null
  formularioPago.abonoUsd = 0
  formularioPago.abonoBs = 0
  formularioPago.comprobanteFoto = null
  formularioPago.observaciones = ''
}

function sincronizarCajaPago () {
  const caja = cajasVenta.value.find((item) => Number(item.value) === Number(formularioPago.cajaId))

  if (!caja) return

  if (caja.tipo_moneda === 'usd') {
    formularioPago.abonoBs = 0
  } else {
    formularioPago.abonoUsd = 0
  }
}

async function cargarModulo () {
  cargando.value = true
  errorGeneral.value = ''

  try {
    const [datosCajas, datosVentas] = await Promise.all([
      obtenerDatosModuloCajas(),
      listarVentas(filtros)
    ])

    cajas.value = datosCajas.cajas.map((caja) => ({
      value: caja.id,
      label: `${caja.nombre} - ${caja.sucursal}`
    }))
    cajasVenta.value = (datosCajas.cajas || []).map((caja) => ({
      value: caja.id,
      label: `${caja.nombre} - ${caja.sucursal}`,
      sucursal: caja.sucursal,
      tipo_moneda: caja.tipo_moneda
    }))
    ventas.value = datosVentas.ventas || []
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo cargar el historial de ventas.'
  } finally {
    cargando.value = false
  }
}

async function abrirDetalleVenta (venta) {
  dialogoDetalleAbierto.value = true
  cargandoDetalle.value = true
  errorGeneral.value = ''

  try {
    const respuesta = await obtenerDetalleVenta(venta.id)
    ventaSeleccionada.value = respuesta.venta || null
  } catch (error) {
    dialogoDetalleAbierto.value = false
    errorGeneral.value = error.message || 'No se pudo cargar el detalle de la venta.'
  } finally {
    cargandoDetalle.value = false
  }
}

async function abrirDialogoPago (venta) {
  if (!venta) return

  if (!ventaSeleccionada.value || Number(ventaSeleccionada.value.id) !== Number(venta.id)) {
    await abrirDetalleVenta(venta)
  }

  if (!ventaSeleccionada.value) {
    return
  }

  errorPago.value = ''
  reiniciarFormularioPago()
  dialogoPagoAbierto.value = true
}

function imprimirVentaActual (tipoDocumento) {
  if (!ventaSeleccionada.value) return

  try {
    imprimirDocumentoVenta({
      tipoDocumento,
      venta: ventaSeleccionada.value,
      plantilla: ventaSeleccionada.value.plantilla
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'No se pudo abrir la impresion.'
    })
  }
}

async function guardarPagoCredito () {
  errorPago.value = ''

  if (!ventaSeleccionada.value) {
    errorPago.value = 'No hay una venta seleccionada.'
    return
  }

  if (!formularioPago.cajaId) {
    errorPago.value = 'Debes seleccionar una caja.'
    return
  }

  if (Number(formularioPago.abonoUsd || 0) <= 0 && Number(formularioPago.abonoBs || 0) <= 0) {
    errorPago.value = 'Debes registrar un monto mayor a cero.'
    return
  }

  guardandoPago.value = true

  try {
    const respuesta = await registrarPagoCreditoVenta(ventaSeleccionada.value.id, {
      cajaId: formularioPago.cajaId,
      fechaAbono: formularioPago.fechaAbono,
      tipoCambioAbono: formularioPago.tipoCambioAbono,
      abonoUsd: formularioPago.abonoUsd,
      abonoBs: formularioPago.abonoBs,
      comprobanteFoto: formularioPago.comprobanteFoto,
      observaciones: formularioPago.observaciones
    })

    ventaSeleccionada.value = respuesta.venta || null
    dialogoPagoAbierto.value = false
    await cargarModulo()
    $q.notify({
      type: 'positive',
      message: respuesta.message || 'Pago registrado correctamente.'
    })
  } catch (error) {
    errorPago.value = error.message || 'No se pudo registrar el pago.'
  } finally {
    guardandoPago.value = false
  }
}

onMounted(() => {
  cargarModulo()
})
</script>
