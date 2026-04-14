<template>
  <q-page class="pagina-usuarios q-pa-lg">
    <div class="encabezado-usuarios">
      <div>
        <div class="text-caption text-weight-bold texto-resalte-panel">Cajas</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Cajas y control de movimientos</h1>
        <p class="text-body1 text-grey-8 q-ma-none">
          Administra las cajas por sucursal y deja lista la base para registrar ingresos y egresos reales.
        </p>
      </div>

      <q-card flat bordered class="tarjeta-resumen-usuarios">
        <q-card-section>
          <div class="text-caption text-grey-7">Cajas registradas</div>
          <div class="text-h4 text-weight-bold q-mt-xs">{{ cajas.length }}</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Activas: {{ totalActivas }} | Inactivas: {{ totalInactivas }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="bloques-usuarios q-mt-lg">
      <q-card flat bordered class="tarjeta-listado-usuarios">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-listado-usuarios">
            <div>
              <div class="text-h6 text-weight-bold">Panel de cajas</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Aqui se ve rapido cuanto dinero hay en cada caja y se puede entrar al detalle de ingresos y egresos.
              </p>
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                v-if="puedeGestionar"
                unelevated
                color="dark"
                text-color="white"
                icon="add"
                label="Registrar nueva caja"
                @click="abrirModalCaja()"
              />
              <q-btn
                flat
                icon="refresh"
                label="Actualizar"
                :loading="cargando"
                @click="cargarModulo"
              />
            </div>
          </div>

          <q-banner v-if="mensajeExito" rounded class="bg-green-1 text-green-10 q-mt-md">
            {{ mensajeExito }}
          </q-banner>

          <q-banner v-if="errorGeneral" rounded class="bg-red-1 text-red-10 q-mt-md">
            {{ errorGeneral }}
          </q-banner>

          <q-banner
            v-if="!puedeGestionar"
            rounded
            class="bg-blue-1 text-blue-10 q-mt-md"
          >
            En este perfil puedes revisar saldos y detalles. La creacion o edicion queda a cargo del supervisor.
          </q-banner>

          <div v-if="!cajas.length && !cargando" class="text-grey-7 q-mt-lg">
            Aun no hay cajas registradas.
          </div>

          <div v-else class="rejilla-cajas-panel q-mt-lg">
            <q-card
              v-for="caja in cajas"
              :key="caja.id"
              flat
              bordered
              class="tarjeta-caja-panel"
              @click="abrirDetalleCaja(caja)"
            >
              <q-card-section class="q-pa-lg">
                <div class="row items-start justify-between q-gutter-md">
                  <div>
                    <div class="text-subtitle1 text-weight-bold">{{ caja.nombre }}</div>
                    <div class="text-body2 text-grey-7 q-mt-xs">
                      {{ caja.sucursal || 'Sin sucursal' }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ caja.metodo_base_label }} | {{ caja.tipo_moneda_label }}
                    </div>
                  </div>

                  <q-badge :color="caja.activa ? 'positive' : 'grey-6'">
                    {{ caja.activa ? 'Activa' : 'Inactiva' }}
                  </q-badge>
                </div>

                <div class="text-caption text-grey-7 q-mt-lg">Saldo actual</div>
                <div class="text-h3 text-weight-bold q-mt-sm">
                  {{ etiquetaMoneda(caja.tipo_moneda) }}{{ formatearMonto(caja.saldo_actual) }}
                </div>

                <div class="rejilla-resumen-caja q-mt-lg">
                  <div class="item-resumen-caja item-resumen-caja--success">
                    <div class="text-caption text-grey-7">Ingresos</div>
                    <div class="text-subtitle1 text-weight-bold q-mt-xs">
                      {{ etiquetaMoneda(caja.tipo_moneda) }}{{ formatearMonto(caja.total_ingresos) }}
                    </div>
                  </div>
                  <div class="item-resumen-caja item-resumen-caja--warning">
                    <div class="text-caption text-grey-7">Egresos</div>
                    <div class="text-subtitle1 text-weight-bold q-mt-xs">
                      {{ etiquetaMoneda(caja.tipo_moneda) }}{{ formatearMonto(caja.total_egresos) }}
                    </div>
                  </div>
                </div>

                <div class="row items-center justify-between q-mt-lg">
                  <div class="text-caption text-grey-7">
                    {{ caja.codigo || 'Sin codigo interno' }}
                  </div>
                  <div class="row items-center q-gutter-xs">
                    <q-btn
                      v-if="puedeGestionar"
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                      @click.stop="abrirModalCaja(caja)"
                    >
                      <q-tooltip>Editar caja</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      color="grey-8"
                      icon="visibility"
                      @click.stop="abrirDetalleCaja(caja)"
                    >
                      <q-tooltip>Ver detalle</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>

    </div>

    <q-dialog v-model="dialogoCajaAbierto">
      <q-card class="tarjeta-dialogo-transferencia">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold">
                {{ cajaEditandoId ? 'Editar caja' : 'Registrar nueva caja' }}
              </div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Configura la caja con su moneda y metodo base.
              </p>
            </div>
            <q-btn flat round dense icon="close" @click="cerrarModalCaja" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-form class="formulario-usuarios" @submit="guardarCaja">
            <div class="campo-formulario-usuarios">
              <q-input
                v-model="formulario.nombre"
                outlined
                label="Nombre de caja"
                :disable="!puedeGestionar"
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-input
                v-model="formulario.codigo"
                outlined
                label="Codigo interno"
                :disable="!puedeGestionar"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-select
                v-model="formulario.tipoMoneda"
                outlined
                emit-value
                map-options
                label="Moneda"
                :disable="!puedeGestionar"
                :options="monedas"
                option-value="value"
                option-label="label"
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-select
                v-model="formulario.metodoBase"
                outlined
                emit-value
                map-options
                label="Metodo base"
                :disable="!puedeGestionar"
                :options="metodos"
                option-value="value"
                option-label="label"
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-toggle
                v-model="formulario.activa"
                color="primary"
                label="Caja activa"
                :disable="!puedeGestionar"
              />
            </div>

            <div class="campo-formulario-usuarios campo-formulario-usuarios--ancho-dos-columnas">
              <q-input
                v-model="formulario.observaciones"
                outlined
                type="textarea"
                autogrow
                label="Observaciones"
                :disable="!puedeGestionar"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat color="grey-8" label="Cancelar" @click="cerrarModalCaja" />
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            :disable="!puedeGestionar"
            :label="cajaEditandoId ? 'Actualizar caja' : 'Registrar caja'"
            :loading="guardando"
            @click="guardarCaja"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoDetalleCajaAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente">
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                round
                dense
                icon="close"
                class="boton-cerrar-modal-compras"
                @click="dialogoDetalleCajaAbierto = false"
              />
              <div>
                <div class="text-caption text-weight-bold texto-resalte-panel">Cajas</div>
                <div class="text-h5 text-weight-bold q-mt-sm">Detalle de caja</div>
                <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                  Revisa el saldo, los totales y el historial real de movimientos de esta caja.
                </p>
              </div>
            </div>

            <q-badge
              v-if="cajaSeleccionada"
              color="blue-1"
              text-color="primary"
              rounded
              class="q-px-md q-py-sm"
            >
              {{ cajaSeleccionada.nombre }}
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="cajaSeleccionada" class="q-pa-lg">
          <div class="rejilla-compras-simple">
            <q-input :model-value="cajaSeleccionada.nombre" outlined disable label="Caja" />
            <q-input :model-value="cajaSeleccionada.sucursal" outlined disable label="Sucursal" />
            <q-input :model-value="cajaSeleccionada.codigo || 'Sin codigo'" outlined disable label="Codigo" />
            <q-input :model-value="cajaSeleccionada.metodo_base_label" outlined disable label="Metodo base" />
            <q-input :model-value="cajaSeleccionada.tipo_moneda_label" outlined disable label="Moneda" />
            <q-input
              :model-value="cajaSeleccionada.activa ? 'Activa' : 'Inactiva'"
              outlined
              disable
              label="Estado"
            />
          </div>

          <div class="rejilla-resumen-caja-amplio q-mt-lg">
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral">
              <div class="text-caption text-grey-7">Saldo actual</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ etiquetaMoneda(cajaSeleccionada.tipo_moneda) }}{{ formatearMonto(cajaSeleccionada.saldo_actual) }}
              </div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success">
              <div class="text-caption text-grey-7">Ingresos</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ etiquetaMoneda(cajaSeleccionada.tipo_moneda) }}{{ formatearMonto(cajaSeleccionada.total_ingresos) }}
              </div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning">
              <div class="text-caption text-grey-7">Egresos</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ etiquetaMoneda(cajaSeleccionada.tipo_moneda) }}{{ formatearMonto(cajaSeleccionada.total_egresos) }}
              </div>
            </div>
          </div>

          <div class="q-mt-lg">
            <div class="text-subtitle1 text-weight-bold">Movimientos de la caja</div>
            <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
              Aqui se ve el historial real de ingresos y egresos registrados para esta caja.
            </p>

            <div class="contenedor-tabla-simple q-mt-md">
              <q-table
                flat
                :rows="movimientosCajaSeleccionada"
                :columns="columnasMovimientosCaja"
                row-key="id"
                :loading="cargandoMovimientosCaja"
                no-data-label="Aun no hay movimientos registrados para esta caja."
                :pagination="{ rowsPerPage: 6 }"
              >
                <template #body-cell-monto="propiedades">
                  <q-td :props="propiedades">
                    {{ etiquetaMoneda(propiedades.row.moneda) }}{{ formatearMonto(propiedades.row.monto) }}
                  </q-td>
                </template>

                <template #body-cell-saldo_resultante="propiedades">
                  <q-td :props="propiedades">
                    {{ etiquetaMoneda(propiedades.row.moneda) }}{{ formatearMonto(propiedades.row.saldo_resultante) }}
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>

          <q-input
            class="q-mt-lg"
            :model-value="cajaSeleccionada.observaciones || 'Sin observaciones registradas.'"
            outlined
            disable
            type="textarea"
            autogrow
            label="Observaciones"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  actualizarCaja,
  listarMovimientosCaja,
  obtenerDatosModuloCajas,
  registrarCaja
} from 'src/services/cajas'

defineOptions({
  name: 'CajasPage'
})

const cargando = ref(false)
const guardando = ref(false)
const puedeGestionar = ref(false)
const mensajeExito = ref('')
const errorGeneral = ref('')
const cajaEditandoId = ref(null)
const dialogoCajaAbierto = ref(false)
const dialogoDetalleCajaAbierto = ref(false)
const cajaSeleccionada = ref(null)
const cajas = ref([])
const movimientosCajaSeleccionada = ref([])
const cargandoMovimientosCaja = ref(false)
const monedas = ref([])
const metodos = ref([])
const sucursales = ref([])

const formulario = reactive(crearFormularioVacio())

const columnasCajas = [
  { name: 'sucursal', label: 'Sucursal', align: 'left', field: 'sucursal', sortable: true },
  { name: 'nombre', label: 'Caja', align: 'left', field: 'nombre', sortable: true },
  { name: 'moneda', label: 'Moneda', align: 'left', field: 'tipo_moneda_label', sortable: true },
  { name: 'metodo', label: 'Metodo', align: 'left', field: 'metodo_base_label', sortable: true },
  { name: 'saldo', label: 'Saldo actual', align: 'left', field: 'saldo_actual', sortable: true },
  { name: 'estado', label: 'Estado', align: 'left', field: 'activa', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'left', field: 'id' }
]

const totalActivas = computed(() => cajas.value.filter(item => item.activa).length)
const totalInactivas = computed(() => cajas.value.filter(item => !item.activa).length)

const columnasMovimientosCaja = [
  { name: 'fecha_movimiento', label: 'Fecha', align: 'left', field: 'fecha_movimiento', sortable: true },
  { name: 'tipo_movimiento_label', label: 'Tipo', align: 'left', field: 'tipo_movimiento_label', sortable: true },
  { name: 'concepto', label: 'Concepto', align: 'left', field: 'concepto', sortable: true },
  { name: 'monto', label: 'Monto', align: 'left', field: 'monto', sortable: true },
  { name: 'saldo_resultante', label: 'Saldo despues del movimiento', align: 'left', field: 'saldo_resultante', sortable: true },
  { name: 'detalle', label: 'Detalle', align: 'left', field: 'detalle', sortable: false }
]

function crearFormularioVacio () {
  return {
    nombre: '',
    codigo: '',
    tipoMoneda: 'bs',
    metodoBase: 'efectivo',
    activa: true,
    observaciones: ''
  }
}

function reglaRequerida (valor) {
  return !!valor || 'Este campo es obligatorio.'
}

function formatearMonto (valor) {
  return Number(valor || 0).toFixed(2)
}

function etiquetaMoneda (moneda) {
  return moneda === 'usd' ? '$ ' : 'Bs. '
}

function reiniciarFormulario () {
  Object.assign(formulario, crearFormularioVacio())
  cajaEditandoId.value = null
  mensajeExito.value = ''
  errorGeneral.value = ''
}

function abrirModalCaja (caja = null) {
  if (caja) {
    cajaEditandoId.value = caja.id
    formulario.nombre = caja.nombre || ''
    formulario.codigo = caja.codigo || ''
    formulario.tipoMoneda = caja.tipo_moneda || 'bs'
    formulario.metodoBase = caja.metodo_base || 'efectivo'
    formulario.activa = caja.activa === true
    formulario.observaciones = caja.observaciones || ''
  } else {
    reiniciarFormulario()
  }

  mensajeExito.value = ''
  errorGeneral.value = ''
  dialogoCajaAbierto.value = true
}

function cerrarModalCaja () {
  dialogoCajaAbierto.value = false
  reiniciarFormulario()
}

function abrirDetalleCaja (caja) {
  cajaSeleccionada.value = caja
  dialogoDetalleCajaAbierto.value = true
  cargarMovimientosCaja(caja.id)
}

async function cargarMovimientosCaja (idCaja) {
  cargandoMovimientosCaja.value = true

  try {
    const datos = await listarMovimientosCaja({
      cajaId: idCaja
    })
    movimientosCajaSeleccionada.value = datos.movimientos || []
  } catch (error) {
    movimientosCajaSeleccionada.value = []
    errorGeneral.value = error.message || 'No se pudo cargar el detalle de movimientos de la caja.'
  } finally {
    cargandoMovimientosCaja.value = false
  }
}

async function cargarModulo () {
  cargando.value = true
  errorGeneral.value = ''

  try {
    const datos = await obtenerDatosModuloCajas()
    monedas.value = datos.monedas
    metodos.value = datos.metodos
    sucursales.value = datos.sucursales
    cajas.value = datos.cajas
    puedeGestionar.value = datos.puedeGestionar === true
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo cargar el modulo de cajas.'
  } finally {
    cargando.value = false
  }
}

async function guardarCaja () {
  if (!puedeGestionar.value) {
    return
  }

  guardando.value = true
  mensajeExito.value = ''
  errorGeneral.value = ''

  try {
    const respuesta = cajaEditandoId.value
      ? await actualizarCaja(cajaEditandoId.value, formulario)
      : await registrarCaja(formulario)

    await cargarModulo()
    cerrarModalCaja()
    mensajeExito.value = respuesta.message || 'Caja guardada correctamente.'
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo guardar la caja.'
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarModulo()
})
</script>
