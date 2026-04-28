<template>
  <q-page class="pagina-historial-ventas q-pa-lg">
    <div class="encabezado-ventas">
      <div class="text-caption text-weight-bold texto-resalte-panel">Ventas</div>
      <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-none">Historial de ventas</h1>
    </div>

    <q-banner v-if="errorGeneral" rounded class="bg-red-1 text-red-10 q-mt-lg">
      {{ errorGeneral }}
    </q-banner>

    <div class="columna-historial-ventas q-mt-lg">
      <q-card flat bordered class="tarjeta-panel-historial-ventas">
        <q-card-section class="q-pa-md">
          <div class="cabecera-acciones-ventas cabecera-historial-ventas">
            <div>
              <div class="text-h6 text-weight-bold">Consulta de ventas</div>
              <div class="text-body2 text-grey-7">
                Revisa ventas registradas, pagos pendientes y recibos.
              </div>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                color="grey-8"
                icon="refresh"
                label="Actualizar"
                class="boton-accion-secundaria-ventas"
                @click="cargarModulo"
              />
              <q-btn
                flat
                color="grey-8"
                icon="filter_alt_off"
                label="Limpiar filtros"
                class="boton-accion-secundaria-ventas"
                @click="limpiarFiltros"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="tarjeta-panel-historial-ventas">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-panel-cajas cabecera-panel-cajas--con-filtros">
            <div class="text-h6 text-weight-bold">Ventas registradas</div>

            <div class="filtros-historial-ventas">
              <q-input
                v-model="filtros.nroVenta"
                dense
                outlined
                label="Nro venta"
                @update:model-value="cargarModulo"
              />

              <q-select
                v-model="filtros.cajaId"
                dense
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
                dense
                outlined
                type="date"
                label="Fecha desde"
                @update:model-value="cargarModulo"
              />

              <q-input
                v-model="filtros.fechaHasta"
                dense
                outlined
                type="date"
                label="Fecha hasta"
                @update:model-value="cargarModulo"
              />

              <q-select
                v-model="filtros.estadoPago"
                dense
                outlined
                emit-value
                map-options
                clearable
                label="Estado"
                :options="opcionesEstadoPago"
                option-value="value"
                option-label="label"
              />
            </div>
          </div>

          <div class="resumen-historial-ventas q-mt-lg">
            <div class="tarjeta-resumen-historial">
              <div class="text-caption text-grey-7">Ventas</div>
              <div class="text-h6 text-weight-bold">{{ ventasFiltradas.length }}</div>
            </div>
            <div class="tarjeta-resumen-historial tarjeta-resumen-historial--success">
              <div class="text-caption text-grey-7">Total USD</div>
              <div class="text-h6 text-weight-bold">$ {{ formatearMonto(totalVentasUsd) }}</div>
            </div>
            <div class="tarjeta-resumen-historial tarjeta-resumen-historial--warning">
              <div class="text-caption text-grey-7">Saldo pendiente</div>
              <div class="text-h6 text-weight-bold">$ {{ formatearMonto(saldoPendienteUsd) }}</div>
            </div>
            <div class="tarjeta-resumen-historial">
              <div class="text-caption text-grey-7">Creditos activos</div>
              <div class="text-h6 text-weight-bold">{{ ventasCreditoPendientes }}</div>
            </div>
          </div>

          <div class="contenedor-tabla-simple q-mt-lg">
            <q-table
              flat
              :rows="ventasFiltradas"
              :columns="columnasVentas"
              row-key="id"
              :loading="cargando"
              no-data-label="Aun no hay ventas registradas."
              :pagination="{ rowsPerPage: 8 }"
            >
              <template #body-cell-tipo="propiedades">
                <q-td :props="propiedades">
                  <q-badge
                    rounded
                    class="badge-estado"
                    :class="claseTipoVenta(propiedades.row.tipo_venta)"
                  >
                    {{ propiedades.row.tipo_venta_label }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-estado_pago="propiedades">
                <q-td :props="propiedades">
                  <q-badge
                    rounded
                    class="badge-estado"
                    :class="claseEstadoPago(propiedades.row.estado_pago)"
                  >
                    {{ propiedades.row.estado_pago_label }}
                  </q-badge>
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
                  <div class="row justify-end q-gutter-xs no-wrap">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="visibility"
                      @click="abrirDetalleVenta(propiedades.row)"
                    >
                      <q-tooltip>Ver detalle</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      color="positive"
                      icon="payments"
                      :disable="!puedeRegistrarPago(propiedades.row)"
                      @click="abrirDialogoPago(propiedades.row)"
                    >
                      <q-tooltip>Registrar pago</q-tooltip>
                    </q-btn>
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
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente cabecera-detalle-venta">
            <div class="text-h6 text-weight-bold">
              Venta {{ ventaSeleccionada?.nro_venta || '' }}
            </div>

            <div class="acciones-detalle-venta">
              <q-btn
                flat
                color="grey-8"
                label="Nota"
                class="boton-accion-secundaria-ventas"
                @click="imprimirVentaActual('nota')"
              />
              <q-btn
                flat
                color="grey-8"
                label="Recibo"
                class="boton-accion-secundaria-ventas"
                @click="imprimirVentaActual('recibo')"
              />
              <q-btn
                flat
                color="positive"
                label="Registrar pago"
                class="boton-accion-secundaria-ventas"
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
            <div class="rejilla-resumen-pagos-credito rejilla-resumen-pagos-credito--ventas">
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral tarjeta-resumen-pago--cliente">
                <div class="text-caption text-grey-7">Cliente</div>
                <div class="text-subtitle1 text-weight-bold">{{ ventaSeleccionada.cliente_nombre || 'Sin nombre registrado' }}</div>
                <div class="text-caption text-grey-7 q-mt-sm">
                  {{ ventaSeleccionada.cliente_telefono || 'Sin telefono registrado' }}
                </div>
              </div>
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success">
                <div class="text-caption text-grey-7">Total</div>
                <div class="text-h6 text-weight-bold">$ {{ formatearMonto(ventaSeleccionada.total_usd) }}</div>
                <div class="text-body2 text-grey-7">Bs. {{ formatearMonto(ventaSeleccionada.total_bs) }}</div>
              </div>
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning">
                <div class="text-caption text-grey-7">Abonado</div>
                <div class="text-h6 text-weight-bold">$ {{ formatearMonto(ventaSeleccionada.total_abonos_usd) }}</div>
                <div class="text-body2 text-grey-7">Bs. {{ formatearMonto(ventaSeleccionada.total_abonos_bs) }}</div>
              </div>
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral">
                <div class="text-caption text-grey-7">Saldo pendiente</div>
                <div class="text-h6 text-weight-bold">$ {{ formatearMonto(ventaSeleccionada.saldo_pendiente_usd) }}</div>
                <div class="text-body2 text-grey-7">Bs. {{ formatearMonto(ventaSeleccionada.saldo_pendiente_bs) }}</div>
              </div>
            </div>

            <div class="estado-detalle-venta q-mt-md">
              <q-badge rounded class="badge-estado" :class="claseTipoVenta(ventaSeleccionada.tipo_venta)">
                {{ ventaSeleccionada.tipo_venta_label }}
              </q-badge>
              <q-badge rounded class="badge-estado" :class="claseEstadoPago(ventaSeleccionada.estado_pago)">
                {{ ventaSeleccionada.estado_pago_label }}
              </q-badge>
              <q-badge rounded class="badge-estado badge-estado--neutro">
                TC {{ formatearMonto(obtenerTipoCambioVenta(ventaSeleccionada)) }}
              </q-badge>
            </div>

            <div class="rejilla-meta-venta q-mt-lg">
              <div class="tarjeta-meta-venta">
                <div class="text-caption text-grey-7">Sucursal</div>
                <div class="text-subtitle2 text-weight-medium">{{ ventaSeleccionada.sucursal || '-' }}</div>
              </div>
              <div class="tarjeta-meta-venta">
                <div class="text-caption text-grey-7">Caja base</div>
                <div class="text-subtitle2 text-weight-medium">{{ ventaSeleccionada.caja || '-' }}</div>
              </div>
              <div class="tarjeta-meta-venta">
                <div class="text-caption text-grey-7">Tipo de venta</div>
                <div class="text-subtitle2 text-weight-medium">{{ ventaSeleccionada.tipo_venta_label }}</div>
              </div>
              <div class="tarjeta-meta-venta">
                <div class="text-caption text-grey-7">Estado de pago</div>
                <div class="text-subtitle2 text-weight-medium">{{ ventaSeleccionada.estado_pago_label }}</div>
              </div>
              <div class="tarjeta-meta-venta">
                <div class="text-caption text-grey-7">Fecha</div>
                <div class="text-subtitle2 text-weight-medium">{{ ventaSeleccionada.fecha_venta }}</div>
              </div>
              <div class="tarjeta-meta-venta tarjeta-meta-venta--amplia">
                <div class="text-caption text-grey-7">Observaciones</div>
                <div class="text-subtitle2 text-weight-medium">{{ ventaSeleccionada.observaciones || 'Sin observaciones registradas' }}</div>
              </div>
            </div>

            <div class="q-mt-xl">
              <div class="text-subtitle1 text-weight-bold">Productos vendidos</div>
            </div>

            <div class="contenedor-tabla-simple q-mt-md">
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
                    <td>{{ detalle.modelo || detalle.producto || '-' }}</td>
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

    <q-dialog v-model="dialogoPagoAbierto">
      <q-card class="tarjeta-dialogo-pago-venta">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-dialogo-cajas">
            <div>
              <div class="text-caption text-weight-bold texto-resalte-panel">
                Ventas
              </div>
              <div class="text-h6 text-weight-bold q-mt-xs">Registrar pago</div>
            </div>

            <q-btn
              flat
              round
              dense
              class="boton-cerrar-modal-compras"
              icon="close"
              @click="dialogoPagoAbierto = false"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner v-if="errorPago" rounded class="bg-red-1 text-red-10 q-mb-lg">
            {{ errorPago }}
          </q-banner>

          <div v-if="ventaSeleccionada" class="resumen-pago-venta q-mb-lg">
            <div class="item-resumen-pago-venta item-resumen-pago-venta--principal">
              <div class="text-caption text-grey-7">Venta</div>
              <div class="text-subtitle2 text-weight-bold">{{ ventaSeleccionada.nro_venta }}</div>
              <div class="text-body2 text-grey-7">
                {{ ventaSeleccionada.cliente_nombre || 'Sin cliente' }}
              </div>
            </div>
            <div class="item-resumen-pago-venta item-resumen-pago-venta--success">
              <div class="text-caption text-grey-7">Total de deuda</div>
              <div class="text-h6 text-weight-bold">{{ totalDeudaPago }}</div>
            </div>
            <div class="item-resumen-pago-venta item-resumen-pago-venta--cambio">
              <div class="text-caption text-grey-7">Tipo de cambio</div>
              <div class="text-h6 text-weight-bold">{{ formatearMonto(tipoCambioPactadoVenta) }}</div>
              <div class="text-body2 text-grey-7">Se mantiene fijo para esta venta.</div>
            </div>
            <div class="item-resumen-pago-venta item-resumen-pago-venta--saldo item-resumen-pago-venta--warning">
              <div class="text-caption text-grey-7">Saldo pendiente USD</div>
              <div class="text-h6 text-weight-bold">
                $ {{ formatearMonto(ventaSeleccionada.saldo_pendiente_usd) }}
              </div>
            </div>
            <div class="item-resumen-pago-venta item-resumen-pago-venta--saldo">
              <div class="text-caption text-grey-7">Saldo pendiente Bs</div>
              <div class="text-h6 text-weight-bold">
                Bs. {{ formatearMonto(ventaSeleccionada.saldo_pendiente_bs) }}
              </div>
            </div>
          </div>

          <div class="formulario-pago-venta">
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
              :model-value="formularioPago.tipoCambioAbono"
              outlined
              type="number"
              min="0.01"
              step="0.01"
              label="Tipo de cambio"
              disable
            />

            <q-input
              :model-value="formularioPago.abonoUsd"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Pago USD"
              @update:model-value="actualizarMontoPago('usd', $event)"
            />

            <q-input
              :model-value="formularioPago.abonoBs"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Pago Bs"
              @update:model-value="actualizarMontoPago('bs', $event)"
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
              class="campo-pago-venta--ancho-completo"
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
  fechaHasta: '',
  estadoPago: null
})

const formularioPago = reactive({
  cajaId: null,
  fechaAbono: new Date().toISOString().slice(0, 10),
  tipoCambioAbono: null,
  monedaManual: '',
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
const opcionesEstadoPago = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'pagado', label: 'Pagado' }
]

const cajasDisponiblesPago = computed(() => {
  const sucursal = ventaSeleccionada.value?.sucursal

  return (cajasVenta.value || []).filter((caja) => {
    return !sucursal || caja.sucursal === sucursal
  })
})
const monedaDeudaVenta = computed(() => ventaSeleccionada.value?.moneda || 'bs')
const tipoCambioPactadoVenta = computed(() => obtenerTipoCambioVenta())
const cajaPagoSeleccionada = computed(() =>
  cajasVenta.value.find((item) => Number(item.value) === Number(formularioPago.cajaId)) || null
)
const totalDeudaPago = computed(() => {
  if (!ventaSeleccionada.value) return '-'

  return monedaDeudaVenta.value === 'usd'
    ? `$ ${formatearMonto(ventaSeleccionada.value.total_usd)}`
    : `Bs. ${formatearMonto(ventaSeleccionada.value.total_bs)}`
})
const totalVentasUsd = computed(() =>
  ventasFiltradas.value.reduce((total, venta) => total + Number(venta.total_usd || 0), 0)
)
const saldoPendienteUsd = computed(() =>
  ventasFiltradas.value.reduce((total, venta) => total + Number(venta.saldo_pendiente_usd || 0), 0)
)
const ventasCreditoPendientes = computed(() =>
  ventasFiltradas.value.filter((venta) => puedeRegistrarPago(venta)).length
)
const ventasFiltradas = computed(() => {
  if (!filtros.estadoPago) {
    return ventas.value
  }

  return ventas.value.filter((venta) => venta.estado_pago === filtros.estadoPago)
})

function formatearMonto (valor) {
  return Number(valor || 0).toFixed(2)
}

function normalizarNumero (valor) {
  const numero = Number(valor || 0)
  return Number.isFinite(numero) ? numero : 0
}

function redondearMonto (valor) {
  return Number(normalizarNumero(valor).toFixed(2))
}

function obtenerTipoCambioVenta (venta = ventaSeleccionada.value) {
  const tipoCambioVenta = normalizarNumero(venta?.tipo_cambio)

  if (tipoCambioVenta > 0) {
    return redondearMonto(tipoCambioVenta)
  }

  const totalUsd = normalizarNumero(venta?.total_usd)
  const totalBs = normalizarNumero(venta?.total_bs)

  if (totalUsd > 0 && totalBs > 0) {
    return redondearMonto(totalBs / totalUsd)
  }

  return 1
}

function obtenerTipoCambioPago () {
  return Math.max(
    0.01,
    redondearMonto(tipoCambioPactadoVenta.value)
  )
}

function actualizarMontoPago (monedaOrigen, valor) {
  const tipoCambio = obtenerTipoCambioPago()
  const monto = redondearMonto(valor)
  formularioPago.tipoCambioAbono = tipoCambio
  formularioPago.monedaManual = monedaOrigen

  if (monedaOrigen === 'usd') {
    formularioPago.abonoUsd = monto
    formularioPago.abonoBs = redondearMonto(monto * tipoCambio)
    return
  }

  formularioPago.abonoBs = monto
  formularioPago.abonoUsd = redondearMonto(monto / tipoCambio)
}

function actualizarTipoCambioPago (valor) {
  formularioPago.tipoCambioAbono = obtenerTipoCambioPago()
  actualizarMontoPago(
    formularioPago.monedaManual || 'bs',
    formularioPago.monedaManual === 'usd' ? formularioPago.abonoUsd : formularioPago.abonoBs
  )
}

function puedeRegistrarPago (venta) {
  return Boolean(
    venta &&
    venta.tipo_venta === 'credito' &&
    venta.estado_pago !== 'pagado'
  )
}

function claseEstadoPago (estado) {
  if (estado === 'pagado') return 'badge-estado--pagado'
  if (estado === 'parcial') return 'badge-estado--parcial'
  if (estado === 'pendiente') return 'badge-estado--pendiente'
  return 'badge-estado--neutro'
}

function claseTipoVenta (tipo) {
  if (tipo === 'credito') return 'badge-estado--credito'
  if (tipo === 'contado') return 'badge-estado--contado'
  return 'badge-estado--neutro'
}

function limpiarFiltros () {
  filtros.nroVenta = ''
  filtros.cajaId = null
  filtros.fechaDesde = ''
  filtros.fechaHasta = ''
  filtros.estadoPago = null
  cargarModulo()
}

function reiniciarFormularioPago () {
  formularioPago.cajaId = cajasDisponiblesPago.value[0]?.value || ventaSeleccionada.value?.caja_id || null
  formularioPago.fechaAbono = new Date().toISOString().slice(0, 10)
  formularioPago.tipoCambioAbono = tipoCambioPactadoVenta.value
  formularioPago.monedaManual = ''
  formularioPago.abonoUsd = 0
  formularioPago.abonoBs = 0
  formularioPago.comprobanteFoto = null
  formularioPago.observaciones = ''
}

function sincronizarCajaPago () {
  const monedaOrigen = formularioPago.monedaManual || cajaPagoSeleccionada.value?.tipo_moneda || monedaDeudaVenta.value
  actualizarMontoPago(
    monedaOrigen,
    monedaOrigen === 'usd' ? formularioPago.abonoUsd : formularioPago.abonoBs
  )
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

  const monedaPago = cajaPagoSeleccionada.value?.tipo_moneda || monedaDeudaVenta.value
  const montoPrincipal = monedaPago === 'usd'
    ? Number(formularioPago.abonoUsd || 0)
    : Number(formularioPago.abonoBs || 0)

  if (montoPrincipal <= 0) {
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
