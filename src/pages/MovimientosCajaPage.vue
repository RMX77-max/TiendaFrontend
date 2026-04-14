<template>
  <q-page class="pagina-compras q-pa-lg">
    <div>
      <div class="text-caption text-weight-bold texto-resalte-panel">Ventas</div>
      <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Historial de ventas</h1>
      <p class="text-body1 text-grey-8 q-ma-none">
        Revisa las ventas registradas con filtros por fecha, caja y numero de venta.
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
                Los vendedores ven sus ventas y los supervisores las de su sucursal.
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
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { obtenerDatosModuloCajas } from 'src/services/cajas'
import { listarVentas } from 'src/services/ventas'

defineOptions({
  name: 'MovimientosCajaPage'
})

const cargando = ref(false)
const errorGeneral = ref('')
const cajas = ref([])
const ventas = ref([])

const filtros = reactive({
  nroVenta: '',
  cajaId: null,
  fechaDesde: '',
  fechaHasta: ''
})

const columnasVentas = [
  { name: 'nro_venta', label: 'Nro venta', align: 'left', field: 'nro_venta', sortable: true },
  { name: 'fecha_venta', label: 'Fecha', align: 'left', field: 'fecha_venta', sortable: true },
  { name: 'sucursal', label: 'Sucursal', align: 'left', field: 'sucursal', sortable: true },
  { name: 'caja', label: 'Caja', align: 'left', field: 'caja', sortable: true },
  { name: 'usuario', label: 'Usuario', align: 'left', field: 'usuario', sortable: true },
  { name: 'cantidad_items', label: 'Items', align: 'left', field: 'cantidad_items', sortable: true },
  { name: 'total', label: 'Total', align: 'left', field: 'total_usd', sortable: true }
]

function formatearMonto (valor) {
  return Number(valor || 0).toFixed(2)
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
    ventas.value = datosVentas.ventas || []
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo cargar el historial de ventas.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarModulo()
})
</script>
