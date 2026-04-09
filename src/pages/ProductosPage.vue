<template>
  <q-page class="pagina-productos q-pa-lg">
    <div class="encabezado-productos">
      <div>
        <div class="text-caption text-weight-bold texto-resalte-panel">Productos</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Registro de productos</h1>
        <p class="text-body1 text-grey-8 q-ma-none">
          Registra un producto, define su tipo de cambio y distribuye sus unidades entre las sucursales.
        </p>
      </div>

      <q-card flat bordered class="tarjeta-resumen-productos">
        <q-card-section>
          <div class="text-caption text-grey-7">Cantidad total</div>
          <div class="text-h4 text-weight-bold q-mt-xs">{{ formulario.cantidadTotal }}</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Distribuido: {{ cantidadDistribuida }} / {{ formulario.cantidadTotal }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-banner v-if="mensajeExito" rounded class="bg-green-1 text-green-10 q-mt-lg">
      {{ mensajeExito }}
    </q-banner>

    <q-banner v-if="errorGeneral" rounded class="bg-red-1 text-red-10 q-mt-lg">
      {{ errorGeneral }}
    </q-banner>

    <q-form class="q-mt-lg columna-productos" @submit="guardarProducto">
      <div class="rejilla-superior-productos">
        <q-card flat bordered class="tarjeta-datos-producto">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold">Datos generales</div>
            <p class="text-body2 text-grey-7 q-mt-sm q-mb-lg">
              Completa los datos principales del producto.
            </p>

            <div class="formulario-producto">
              <div class="campo-formulario-producto">
                <q-input
                  v-model="formulario.modelo"
                  outlined
                  label="Modelo"
                  lazy-rules
                  :rules="[reglaRequerida]"
                />
              </div>

              <div class="campo-formulario-producto">
                <q-select
                  v-model="formulario.marcaId"
                  outlined
                  emit-value
                  map-options
                  label="Marca"
                  :options="marcas"
                  option-value="value"
                  option-label="label"
                  lazy-rules
                  :rules="[reglaRequerida]"
                >
                  <template #after>
                    <q-btn flat round dense icon="add" @click="abrirDialogoMarca = true" />
                  </template>
                </q-select>
              </div>

              <div class="campo-formulario-producto">
                <q-select
                  v-model="formulario.categoriaId"
                  outlined
                  emit-value
                  map-options
                  label="Categoria"
                  :options="categorias"
                  option-value="value"
                  option-label="label"
                  lazy-rules
                  :rules="[reglaRequerida]"
                >
                  <template #after>
                    <q-btn flat round dense icon="add" @click="abrirDialogoCategoria = true" />
                  </template>
                </q-select>
              </div>

              <div class="campo-formulario-producto">
                <q-input
                  v-model.number="formulario.cantidadTotal"
                  outlined
                  type="number"
                  min="1"
                  label="Cantidad total"
                  lazy-rules
                  :rules="[reglaCantidad]"
                  @update:model-value="sincronizarDistribucionConCantidad"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="tarjeta-costos-producto">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold">Precios, costos y tipo de cambio</div>
            <p class="text-body2 text-grey-7 q-mt-sm q-mb-lg">
              El tipo de cambio se usa para calcular automaticamente dolares y bolivianos.
            </p>

            <div class="formulario-producto">
              <div class="campo-formulario-producto campo-formulario-producto--ancho-completo">
                <q-input
                  v-model.number="formulario.tipoCambio"
                  outlined
                  type="number"
                  min="0.01"
                  step="0.01"
                  label="Tipo de cambio (Bs por $us)"
                  lazy-rules
                  :rules="[reglaTipoCambio]"
                  @update:model-value="recalcularMontosDesdeTipoCambio"
                />
              </div>

              <div class="campo-formulario-producto">
                <q-input
                  :model-value="formulario.precioUnitarioUsd"
                  outlined
                  type="number"
                  label="Precio unitario ($us)"
                  min="0"
                  step="0.01"
                  lazy-rules
                  :rules="[reglaNumero]"
                  @update:model-value="actualizarMonto('precioUnitario', 'usd', $event)"
                />
              </div>

              <div class="campo-formulario-producto">
                <q-input
                  :model-value="formulario.precioUnitarioBs"
                  outlined
                  type="number"
                  label="Precio unitario (Bs)"
                  min="0"
                  step="0.01"
                  lazy-rules
                  :rules="[reglaNumero]"
                  @update:model-value="actualizarMonto('precioUnitario', 'bs', $event)"
                />
              </div>

              <div class="campo-formulario-producto">
                <q-input
                  :model-value="formulario.precioMayoristaUsd"
                  outlined
                  type="number"
                  label="Precio mayorista ($us)"
                  min="0"
                  step="0.01"
                  lazy-rules
                  :rules="[reglaNumero]"
                  @update:model-value="actualizarMonto('precioMayorista', 'usd', $event)"
                />
              </div>

              <div class="campo-formulario-producto">
                <q-input
                  :model-value="formulario.precioMayoristaBs"
                  outlined
                  type="number"
                  label="Precio mayorista (Bs)"
                  min="0"
                  step="0.01"
                  lazy-rules
                  :rules="[reglaNumero]"
                  @update:model-value="actualizarMonto('precioMayorista', 'bs', $event)"
                />
              </div>

              <div class="campo-formulario-producto">
                <q-input
                  :model-value="formulario.costoUsd"
                  outlined
                  type="number"
                  label="Costo ($us)"
                  min="0"
                  step="0.01"
                  lazy-rules
                  :rules="[reglaNumero]"
                  @update:model-value="actualizarMonto('costo', 'usd', $event)"
                />
              </div>

              <div class="campo-formulario-producto">
                <q-input
                  :model-value="formulario.costoBs"
                  outlined
                  type="number"
                  label="Costo (Bs)"
                  min="0"
                  step="0.01"
                  lazy-rules
                  :rules="[reglaNumero]"
                  @update:model-value="actualizarMonto('costo', 'bs', $event)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-card flat bordered class="tarjeta-unidades-producto">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-col-gutter-md">
            <div>
              <div class="text-h6 text-weight-bold">Asignacion a sucursales</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Distribuye manualmente la cantidad total entre las sucursales.
              </p>
            </div>

            <q-toggle
              v-model="formulario.registrarSeries"
              color="dark"
              label="Registrar numeros de serie"
              @update:model-value="sincronizarSeriesConDistribucion"
            />
          </div>

          <div class="contenedor-tabla-productos q-mt-lg">
            <q-table
              flat
              :rows="formulario.distribucionSucursales"
              :columns="columnasDistribucion"
              row-key="sucursalId"
              hide-pagination
              :rows-per-page-options="[0]"
            >
              <template #body-cell-sucursal="propiedades">
                <q-td :props="propiedades">
                  {{ propiedades.row.sucursal }}
                </q-td>
              </template>

              <template #body-cell-cantidad="propiedades">
                <q-td :props="propiedades" style="width: 150px">
                  <q-input
                    v-model.number="propiedades.row.cantidad"
                    dense
                    outlined
                    type="number"
                    min="0"
                    @update:model-value="sincronizarSeriesConDistribucion"
                  />
                </q-td>
              </template>
            </q-table>
          </div>

          <div class="resumen-unidades-producto q-mt-lg">
            <div class="text-caption text-grey-7">Resumen de distribucion</div>
            <div class="text-h6 text-weight-bold q-mt-xs">
              {{ cantidadDistribuida }} / {{ formulario.cantidadTotal }}
            </div>
            <div class="text-body2 q-mt-sm" :class="distribucionCompleta ? 'text-green-8' : 'text-red-8'">
              {{ distribucionCompleta ? 'La distribucion esta completa.' : 'La suma por sucursal debe coincidir con la cantidad total.' }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card v-if="formulario.registrarSeries" flat bordered class="tarjeta-unidades-producto">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold">Registro de series</div>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            Completa una fila por cada unidad que necesite numero de serie. Si una unidad no trae serie, puedes dejarla vacia.
          </p>

          <div class="contenedor-tabla-productos q-mt-lg">
            <q-table
              flat
              :rows="formulario.series"
              :columns="columnasSeries"
              row-key="idTemporal"
              hide-pagination
              :rows-per-page-options="[0]"
              no-data-label="Activa el registro de series para generar las filas."
            >
              <template #body-cell-indice="propiedades">
                <q-td :props="propiedades">
                  {{ propiedades.pageIndex + 1 }}
                </q-td>
              </template>

              <template #body-cell-sucursal="propiedades">
                <q-td :props="propiedades">
                  {{ obtenerNombreSucursal(propiedades.row.sucursalId) }}
                </q-td>
              </template>

              <template #body-cell-numero_serie="propiedades">
                <q-td :props="propiedades" style="min-width: 220px">
                  <q-input
                    v-model="propiedades.row.numeroSerie"
                    dense
                    outlined
                    label="Serie opcional"
                  />
                </q-td>
              </template>

              <template #body-cell-observaciones="propiedades">
                <q-td :props="propiedades" style="min-width: 220px">
                  <q-input
                    v-model="propiedades.row.observaciones"
                    dense
                    outlined
                    label="Observaciones"
                  />
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>

      <div class="acciones-formulario-producto">
        <q-btn flat color="grey-8" label="Limpiar formulario" @click="reiniciarFormulario" />
        <q-btn
          unelevated
          color="dark"
          text-color="white"
          label="Registrar producto"
          type="submit"
          :loading="guardandoProducto"
        />
      </div>
    </q-form>

    <q-dialog v-model="abrirDialogoMarca">
      <q-card class="tarjeta-dialogo-catalogo">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Nueva marca</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="nuevaMarca" outlined label="Nombre de la marca" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            label="Guardar"
            :loading="guardandoMarca"
            @click="guardarMarcaNueva"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="abrirDialogoCategoria">
      <q-card class="tarjeta-dialogo-catalogo">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Nueva categoria</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="nuevaCategoria" outlined label="Nombre de la categoria" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            label="Guardar"
            :loading="guardandoCategoria"
            @click="guardarCategoriaNueva"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  obtenerDatosFormularioProducto,
  registrarCategoria,
  registrarMarca,
  registrarProducto
} from 'src/services/productos'

defineOptions({
  name: 'ProductosPage'
})

const cargandoDatos = ref(false)
const guardandoProducto = ref(false)
const guardandoMarca = ref(false)
const guardandoCategoria = ref(false)
const abrirDialogoMarca = ref(false)
const abrirDialogoCategoria = ref(false)
const nuevaMarca = ref('')
const nuevaCategoria = ref('')
const mensajeExito = ref('')
const errorGeneral = ref('')
const marcas = ref([])
const categorias = ref([])
const sucursales = ref([])
const contadorSeries = ref(1)

const formulario = reactive(crearFormularioVacio())

const columnasDistribucion = [
  { name: 'sucursal', label: 'Sucursal', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', align: 'left' }
]

const columnasSeries = [
  { name: 'indice', label: '#', align: 'left' },
  { name: 'sucursal', label: 'Sucursal', align: 'left' },
  { name: 'numero_serie', label: 'Numero de serie', align: 'left' },
  { name: 'observaciones', label: 'Observaciones', align: 'left' }
]

const cantidadDistribuida = computed(() =>
  formulario.distribucionSucursales.reduce((total, item) => total + Number(item.cantidad || 0), 0)
)

const distribucionCompleta = computed(() =>
  Number(formulario.cantidadTotal || 0) > 0 &&
  cantidadDistribuida.value === Number(formulario.cantidadTotal || 0)
)

function crearFormularioVacio () {
  return {
    modelo: '',
    marcaId: null,
    categoriaId: null,
    tipoCambio: 9,
    precioUnitarioUsd: 0,
    precioUnitarioBs: 0,
    precioMayoristaUsd: 0,
    precioMayoristaBs: 0,
    costoUsd: 0,
    costoBs: 0,
    cantidadTotal: 1,
    registrarSeries: false,
    distribucionSucursales: [],
    series: []
  }
}

function crearFilaSerie (sucursalId) {
  const idTemporal = `serie-${contadorSeries.value}`
  contadorSeries.value += 1

  return {
    idTemporal,
    sucursalId,
    numeroSerie: '',
    observaciones: ''
  }
}

function reglaRequerida (valor) {
  return !!valor || 'Este campo es obligatorio.'
}

function reglaNumero (valor) {
  return Number(valor) >= 0 || 'Ingresa un valor valido.'
}

function reglaTipoCambio (valor) {
  return Number(valor) > 0 || 'El tipo de cambio debe ser mayor a cero.'
}

function reglaCantidad (valor) {
  return Number(valor) > 0 || 'La cantidad total debe ser mayor a cero.'
}

function normalizarNumero (valor) {
  const numero = Number(valor || 0)
  return Number.isFinite(numero) ? numero : 0
}

function redondearMonto (valor) {
  return Number(normalizarNumero(valor).toFixed(2))
}

function limitarDosDecimales (valor) {
  return redondearMonto(valor)
}

function actualizarMonto (prefijo, monedaOrigen, valor) {
  const tipoCambio = Math.max(0.01, limitarDosDecimales(formulario.tipoCambio))
  const monto = limitarDosDecimales(valor)
  formulario.tipoCambio = tipoCambio

  if (monedaOrigen === 'usd') {
    formulario[`${prefijo}Usd`] = monto
    formulario[`${prefijo}Bs`] = redondearMonto(monto * tipoCambio)
    return
  }

  formulario[`${prefijo}Bs`] = monto
  formulario[`${prefijo}Usd`] = tipoCambio > 0 ? redondearMonto(monto / tipoCambio) : 0
}

function recalcularMontosDesdeTipoCambio () {
  formulario.tipoCambio = Math.max(0.01, limitarDosDecimales(formulario.tipoCambio))
  actualizarMonto('precioUnitario', 'usd', formulario.precioUnitarioUsd)
  actualizarMonto('precioMayorista', 'usd', formulario.precioMayoristaUsd)
  actualizarMonto('costo', 'usd', formulario.costoUsd)
}

function sincronizarDistribucionConCantidad () {
  formulario.cantidadTotal = Math.max(1, Math.trunc(normalizarNumero(formulario.cantidadTotal)) || 1)
  sincronizarSeriesConDistribucion()
}

function sincronizarSeriesConDistribucion () {
  if (!formulario.registrarSeries) {
    formulario.series = []
    return
  }

  const nuevasSeries = []

  formulario.distribucionSucursales.forEach((item) => {
    const cantidad = Math.max(0, Math.trunc(normalizarNumero(item.cantidad)))
    item.cantidad = cantidad

    for (let indice = 0; indice < cantidad; indice += 1) {
      const existente = formulario.series.find((serie, posicion) => {
        const seriesPreviasMismaSucursal = formulario.series
          .filter((fila) => fila.sucursalId === item.sucursalId)
        return filaPerteneceAPosicion(seriesPreviasMismaSucursal, serie, indice) && serie.sucursalId === item.sucursalId
      })

      nuevasSeries.push(existente || crearFilaSerie(item.sucursalId))
    }
  })

  formulario.series = nuevasSeries
}

function filaPerteneceAPosicion (seriesSucursal, fila, posicionEsperada) {
  return seriesSucursal[posicionEsperada]?.idTemporal === fila.idTemporal
}

function obtenerNombreSucursal (sucursalId) {
  return sucursales.value.find((sucursal) => sucursal.id === sucursalId)?.label || 'Sucursal'
}

function inicializarDistribucionSucursales () {
  formulario.distribucionSucursales = sucursales.value.map((sucursal, indice) => ({
    sucursalId: sucursal.id,
    sucursal: sucursal.label,
    cantidad: indice === 0 ? 1 : 0
  }))
}

function reiniciarFormulario () {
  Object.assign(formulario, crearFormularioVacio())
  mensajeExito.value = ''
  errorGeneral.value = ''
  inicializarDistribucionSucursales()
}

async function cargarModulo () {
  cargandoDatos.value = true
  errorGeneral.value = ''

  try {
    const datosFormulario = await obtenerDatosFormularioProducto()
    marcas.value = datosFormulario.marcas || []
    categorias.value = datosFormulario.categorias || []
    sucursales.value = datosFormulario.sucursales || []
    inicializarDistribucionSucursales()
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo cargar el modulo de productos.'
  } finally {
    cargandoDatos.value = false
  }
}

async function guardarProducto () {
  guardandoProducto.value = true
  mensajeExito.value = ''
  errorGeneral.value = ''

  try {
    const respuesta = await registrarProducto(formulario)
    mensajeExito.value = respuesta.message || 'Producto registrado correctamente.'
    reiniciarFormulario()
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo registrar el producto.'
  } finally {
    guardandoProducto.value = false
  }
}

async function guardarMarcaNueva () {
  guardandoMarca.value = true

  try {
    const respuesta = await registrarMarca(nuevaMarca.value)
    marcas.value = [...marcas.value, respuesta.marca].sort((a, b) => a.label.localeCompare(b.label))
    formulario.marcaId = respuesta.marca.id
    nuevaMarca.value = ''
    abrirDialogoMarca.value = false
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo registrar la marca.'
  } finally {
    guardandoMarca.value = false
  }
}

async function guardarCategoriaNueva () {
  guardandoCategoria.value = true

  try {
    const respuesta = await registrarCategoria(nuevaCategoria.value)
    categorias.value = [...categorias.value, respuesta.categoria].sort((a, b) => a.label.localeCompare(b.label))
    formulario.categoriaId = respuesta.categoria.id
    nuevaCategoria.value = ''
    abrirDialogoCategoria.value = false
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo registrar la categoria.'
  } finally {
    guardandoCategoria.value = false
  }
}

onMounted(() => {
  cargarModulo()
})
</script>
