<template>
  <q-page class="pagina-usuarios q-pa-lg">
    <div class="encabezado-ventas">
      <div class="text-caption text-weight-bold texto-resalte-panel">Cajas</div>
      <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-none">Panel de cajas</h1>
    </div>

    <div class="bloques-usuarios q-mt-lg">
      <q-card flat bordered class="tarjeta-listado-usuarios">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-acciones-ventas">
            <div class="text-h6 text-weight-bold">Acciones</div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                v-if="puedeGestionar || esGerente"
                flat
                color="positive"
                icon="south_west"
                label="Ingreso"
                class="boton-accion-secundaria-ventas"
                @click="abrirModalMovimiento('ingreso')"
              />
              <q-btn
                v-if="puedeGestionar || esGerente"
                flat
                color="negative"
                icon="north_east"
                label="Egreso"
                class="boton-accion-secundaria-ventas"
                @click="abrirModalMovimiento('egreso')"
              />
              <q-btn
                v-if="puedeGestionar"
                flat
                color="dark"
                icon="add"
                label="Nueva caja"
                class="boton-accion-secundaria-ventas"
                @click="abrirModalCaja()"
              />
              <q-btn
                flat
                color="grey-8"
                icon="refresh"
                label="Actualizar"
                class="boton-accion-secundaria-ventas"
                :loading="cargando"
                @click="cargarModulo"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="tarjeta-listado-usuarios">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-listado-usuarios">
            <div class="text-h6 text-weight-bold">Cajas registradas</div>
          </div>

          <div class="rejilla-compras-simple q-mt-lg">
            <q-select
              v-model="filtros.sucursalId"
              outlined
              clearable
              emit-value
              map-options
              label="Filtrar por sucursal"
              :options="opcionesSucursalesFiltro"
              option-value="value"
              option-label="label"
            />
            <q-select
              v-model="filtros.tipoCaja"
              outlined
              clearable
              emit-value
              map-options
              label="Filtrar por tipo de caja"
              :options="opcionesTiposCaja"
              option-value="value"
              option-label="label"
            />
          </div>

          <div
            v-if="!tarjetasVisibles.length && !cargando"
            class="text-grey-7 q-mt-lg"
          >
            No hay resultados para los filtros seleccionados.
          </div>

          <div v-else class="rejilla-cajas-panel q-mt-lg">
            <q-card
              v-for="caja in tarjetasVisibles"
              :key="caja.id || caja.clave"
              flat
              bordered
              class="tarjeta-caja-panel"
              @click="abrirDetalleCaja(caja)"
            >
              <q-card-section class="q-pa-lg">
                <div class="row items-start justify-between q-gutter-md">
                  <div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ esGerente ? caja.etiqueta : caja.nombre }}
                    </div>
                    <div class="text-body2 text-grey-7 q-mt-xs">
                      {{
                        esGerente
                          ? `${caja.totalSucursales} sucursal(es) | ${caja.totalCajas} caja(s)`
                          : caja.sucursal || "Sin sucursal"
                      }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{
                        esGerente
                          ? caja.descripcion
                          : `${caja.metodo_base_label} | ${caja.tipo_moneda_label}`
                      }}
                    </div>
                  </div>

                  <q-badge :color="caja.activa ? 'positive' : 'grey-6'">
                    {{
                      caja.activa ? "Activas disponibles" : "Sin cajas activas"
                    }}
                  </q-badge>
                </div>

                <div class="text-caption text-grey-7 q-mt-lg">Saldo actual</div>
                <div class="text-h3 text-weight-bold q-mt-sm">
                  {{ etiquetaMoneda(caja.tipo_moneda)
                  }}{{ formatearMonto(caja.saldo_actual) }}
                </div>

                <div class="rejilla-resumen-caja q-mt-lg">
                  <div class="item-resumen-caja item-resumen-caja--success">
                    <div class="text-caption text-grey-7">Ingresos</div>
                    <div class="text-subtitle1 text-weight-bold q-mt-xs">
                      {{ etiquetaMoneda(caja.tipo_moneda)
                      }}{{ formatearMonto(caja.total_ingresos) }}
                    </div>
                  </div>
                  <div class="item-resumen-caja item-resumen-caja--warning">
                    <div class="text-caption text-grey-7">Egresos</div>
                    <div class="text-subtitle1 text-weight-bold q-mt-xs">
                      {{ etiquetaMoneda(caja.tipo_moneda)
                      }}{{ formatearMonto(caja.total_egresos) }}
                    </div>
                  </div>
                </div>

                <div class="row items-center justify-between q-mt-lg">
                  <div class="text-caption text-grey-7">
                    {{
                      esGerente
                        ? caja.resumenFiltros
                        : caja.codigo || "Sin codigo interno"
                    }}
                  </div>
                  <div class="row items-center q-gutter-xs">
                    <q-btn
                      v-if="puedeGestionar && !esGerente"
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

      <q-card flat bordered class="tarjeta-listado-usuarios">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-listado-usuarios">
            <div class="text-h6 text-weight-bold">Caja general</div>

            <q-btn
              flat
              icon="refresh"
              label="Actualizar"
              :loading="cargandoMovimientosListado"
              @click="cargarHistorialMovimientos"
            />
          </div>

          <div class="contenedor-tabla-simple q-mt-lg">
            <q-table
              flat
              :rows="movimientosListado"
              :columns="columnasMovimientosPanel"
              row-key="id"
              :loading="cargandoMovimientosListado"
              no-data-label="Aun no hay movimientos de caja general."
              :pagination="{ rowsPerPage: 8 }"
            >
              <template #body-cell-monto="propiedades">
                <q-td :props="propiedades">
                  {{ etiquetaMoneda(propiedades.row.moneda)
                  }}{{ formatearMonto(propiedades.row.monto) }}
                </q-td>
              </template>

              <template #body-cell-saldo_resultante="propiedades">
                <q-td :props="propiedades">
                  {{ etiquetaMoneda(propiedades.row.moneda)
                  }}{{ formatearMonto(propiedades.row.saldo_resultante) }}
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="dialogoCajaAbierto">
      <q-card class="tarjeta-dialogo-transferencia">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente">
            <div class="text-h6 text-weight-bold">
              {{ cajaEditandoId ? "Editar caja" : "Registrar nueva caja" }}
            </div>
            <q-btn flat round dense class="boton-cerrar-modal-compras" icon="close" @click="cerrarModalCaja" />
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

            <div
              class="campo-formulario-usuarios campo-formulario-usuarios--ancho-dos-columnas"
            >
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
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="cerrarModalCaja"
          />
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

    <q-dialog v-model="dialogoMovimientoAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                round
                dense
                icon="close"
                class="boton-cerrar-modal-compras"
                @click="cerrarModalMovimiento"
              />
              <div>
                <div class="text-caption text-weight-bold texto-resalte-panel">
                  Cajas
                </div>
                <div class="text-h5 text-weight-bold q-mt-sm">
                  {{
                    formularioMovimiento.tipoMovimiento === "egreso"
                      ? "Registrar egreso"
                      : "Registrar ingreso"
                  }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="columna-detalle-producto">
            <q-card flat bordered class="tarjeta-detalle-producto">
              <q-card-section class="q-pa-lg">
                <div
                  class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
                >
                  <div>
                    <div class="text-h5 text-weight-bold">
                      {{
                        formularioMovimiento.tipoMovimiento === "egreso"
                          ? "Salida desde caja"
                          : "Ingreso a caja"
                      }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-caption text-grey-7">
                      Fecha de registro
                    </div>
                    <div class="text-subtitle1 text-weight-bold q-mt-xs">
                      {{ fechaMovimientoTexto }}
                    </div>
                  </div>
                </div>

                <div class="rejilla-resumen-detalle-producto q-mt-lg">
                  <div class="item-resumen-detalle-producto">
                    <div class="text-caption text-grey-7">Tipo de caja</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      {{
                        cajaMovimientoSeleccionada?.metodo_base_label ||
                        "Pendiente"
                      }}
                    </div>
                    <div class="text-body2 text-grey-7">
                      {{
                        cajaMovimientoSeleccionada?.nombre ||
                        "Selecciona un tipo de caja"
                      }}
                    </div>
                  </div>

                  <div class="item-resumen-detalle-producto">
                    <div class="text-caption text-grey-7">Moneda</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      {{
                        cajaMovimientoSeleccionada?.tipo_moneda_label ||
                        "Pendiente"
                      }}
                    </div>
                    <div class="text-body2 text-grey-7">
                      Caja general asociada
                    </div>
                  </div>
                </div>

                <div class="formulario-usuarios q-mt-lg">
                  <div class="campo-formulario-usuarios">
                    <q-select
                      v-model="formularioMovimiento.tipoCaja"
                      outlined
                      emit-value
                      map-options
                      label="Tipo de caja"
                      :options="opcionesTiposCajaGestionables"
                      option-value="value"
                      option-label="label"
                      :rules="[reglaRequerida]"
                    />
                  </div>

                  <div class="campo-formulario-usuarios">
                    <q-input
                      v-model="formularioMovimiento.monto"
                      outlined
                      type="number"
                      min="0"
                      step="0.01"
                      label="Monto"
                      :rules="[reglaRequerida]"
                    />
                  </div>

                  <div
                    class="campo-formulario-usuarios campo-formulario-usuarios--ancho-dos-columnas"
                  >
                    <q-input
                      v-model="formularioMovimiento.concepto"
                      outlined
                      maxlength="50"
                      label="Concepto"
                      :rules="[reglaRequerida]"
                    />
                  </div>

                  <div
                    class="campo-formulario-usuarios campo-formulario-usuarios--ancho-dos-columnas"
                  >
                    <q-input
                      v-model="formularioMovimiento.detalle"
                      outlined
                      type="textarea"
                      autogrow
                      maxlength="255"
                      label="Detalle"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="cerrarModalMovimiento"
          />
          <q-btn
            unelevated
            :color="
              formularioMovimiento.tipoMovimiento === 'egreso'
                ? 'negative'
                : 'positive'
            "
            text-color="white"
            :loading="guardandoMovimiento"
            :label="
              formularioMovimiento.tipoMovimiento === 'egreso'
                ? 'Guardar egreso'
                : 'Guardar ingreso'
            "
            @click="guardarMovimientoManual"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoDetalleCajaAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
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
                <div class="text-caption text-weight-bold texto-resalte-panel">
                  Cajas
                </div>
                <div class="text-h5 text-weight-bold q-mt-sm">
                  Detalle de caja
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="detalleAgrupadoSeleccionado" class="q-pa-lg">
          <div class="rejilla-compras-simple">
            <q-input
              :model-value="detalleAgrupadoSeleccionado.etiqueta"
              outlined
              disable
              label="Tipo de caja"
            />
            <q-input
              :model-value="detalleAgrupadoSeleccionado.descripcion"
              outlined
              disable
              label="Configuracion"
            />
            <q-input
              :model-value="detalleAgrupadoSeleccionado.totalSucursales"
              outlined
              disable
              label="Sucursales"
            />
            <q-input
              :model-value="detalleAgrupadoSeleccionado.totalCajas"
              outlined
              disable
              label="Cajas incluidas"
            />
          </div>

          <div class="rejilla-resumen-caja-amplio q-mt-lg">
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral">
              <div class="text-caption text-grey-7">Saldo actual</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ etiquetaMoneda(detalleAgrupadoSeleccionado.tipo_moneda)
                }}{{ formatearMonto(detalleAgrupadoSeleccionado.saldo_actual) }}
              </div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success">
              <div class="text-caption text-grey-7">Ingresos</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ etiquetaMoneda(detalleAgrupadoSeleccionado.tipo_moneda)
                }}{{
                  formatearMonto(detalleAgrupadoSeleccionado.total_ingresos)
                }}
              </div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning">
              <div class="text-caption text-grey-7">Egresos</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ etiquetaMoneda(detalleAgrupadoSeleccionado.tipo_moneda)
                }}{{
                  formatearMonto(detalleAgrupadoSeleccionado.total_egresos)
                }}
              </div>
            </div>
          </div>

          <div class="q-mt-lg">
            <div class="text-subtitle1 text-weight-bold">
              Cajas incluidas en este total
            </div>

            <div class="contenedor-tabla-simple q-mt-md">
              <q-table
                flat
                :rows="detalleAgrupadoSeleccionado.cajas"
                :columns="columnasDetalleAgrupado"
                row-key="id"
                no-data-label="No hay cajas para este grupo."
                :pagination="{ rowsPerPage: 8 }"
              >
                <template #body-cell-total_ingresos="propiedades">
                  <q-td :props="propiedades">
                    {{ etiquetaMoneda(propiedades.row.tipo_moneda)
                    }}{{ formatearMonto(propiedades.row.total_ingresos) }}
                  </q-td>
                </template>

                <template #body-cell-total_egresos="propiedades">
                  <q-td :props="propiedades">
                    {{ etiquetaMoneda(propiedades.row.tipo_moneda)
                    }}{{ formatearMonto(propiedades.row.total_egresos) }}
                  </q-td>
                </template>

                <template #body-cell-saldo_actual="propiedades">
                  <q-td :props="propiedades">
                    {{ etiquetaMoneda(propiedades.row.tipo_moneda)
                    }}{{ formatearMonto(propiedades.row.saldo_actual) }}
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-else-if="cajaSeleccionada" class="q-pa-lg">
          <div class="rejilla-compras-simple">
            <q-input
              :model-value="cajaSeleccionada.nombre"
              outlined
              disable
              label="Caja"
            />
            <q-input
              :model-value="cajaSeleccionada.sucursal"
              outlined
              disable
              label="Sucursal"
            />
            <q-input
              :model-value="cajaSeleccionada.codigo || 'Sin codigo'"
              outlined
              disable
              label="Codigo"
            />
            <q-input
              :model-value="cajaSeleccionada.metodo_base_label"
              outlined
              disable
              label="Metodo base"
            />
            <q-input
              :model-value="cajaSeleccionada.tipo_moneda_label"
              outlined
              disable
              label="Moneda"
            />
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
                {{ etiquetaMoneda(cajaSeleccionada.tipo_moneda)
                }}{{ formatearMonto(cajaSeleccionada.saldo_actual) }}
              </div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success">
              <div class="text-caption text-grey-7">Ingresos</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ etiquetaMoneda(cajaSeleccionada.tipo_moneda)
                }}{{ formatearMonto(cajaSeleccionada.total_ingresos) }}
              </div>
            </div>
            <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning">
              <div class="text-caption text-grey-7">Egresos</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ etiquetaMoneda(cajaSeleccionada.tipo_moneda)
                }}{{ formatearMonto(cajaSeleccionada.total_egresos) }}
              </div>
            </div>
          </div>

          <div class="q-mt-lg">
            <div class="text-subtitle1 text-weight-bold">
              Movimientos de la caja
            </div>

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
                    {{ etiquetaMoneda(propiedades.row.moneda)
                    }}{{ formatearMonto(propiedades.row.monto) }}
                  </q-td>
                </template>

                <template #body-cell-saldo_resultante="propiedades">
                  <q-td :props="propiedades">
                    {{ etiquetaMoneda(propiedades.row.moneda)
                    }}{{ formatearMonto(propiedades.row.saldo_resultante) }}
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>

          <q-input
            class="q-mt-lg"
            :model-value="
              cajaSeleccionada.observaciones || 'Sin observaciones registradas.'
            "
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
import { useQuasar } from "quasar";
import { computed, onMounted, reactive, ref } from "vue";
import { estadoAutenticacion } from "src/services/auth";
import {
  actualizarCaja,
  listarMovimientosCaja,
  obtenerDatosModuloCajas,
  registrarCaja,
  registrarMovimientoCaja,
} from "src/services/cajas";

defineOptions({
  name: "CajasPage",
});

const cargando = ref(false);
const guardando = ref(false);
const guardandoMovimiento = ref(false);
const puedeGestionar = ref(false);
const mensajeExito = ref("");
const errorGeneral = ref("");
const cajaEditandoId = ref(null);
const dialogoCajaAbierto = ref(false);
const dialogoDetalleCajaAbierto = ref(false);
const dialogoMovimientoAbierto = ref(false);
const cajaSeleccionada = ref(null);
const detalleAgrupadoSeleccionado = ref(null);
const cajas = ref([]);
const movimientosCajaSeleccionada = ref([]);
const movimientosListado = ref([]);
const cargandoMovimientosCaja = ref(false);
const cargandoMovimientosListado = ref(false);
const monedas = ref([]);
const metodos = ref([]);
const sucursales = ref([]);
const filtros = reactive({
  sucursalId: null,
  tipoCaja: null,
});

const formulario = reactive(crearFormularioVacio());
const formularioMovimiento = reactive(crearFormularioMovimientoVacio());
const filtrosMovimientos = reactive({
  tipoCaja: null,
  cajaId: null,
  tipoMovimiento: "",
  concepto: "",
  fechaDesde: "",
  fechaHasta: "",
});

const rolActual = computed(() => estadoAutenticacion.usuario?.rol || "");
const esGerente = computed(() => rolActual.value === "gerente");
const $q = useQuasar();

const columnasMovimientosCaja = [
  {
    name: "fecha_movimiento",
    label: "Fecha",
    align: "left",
    field: "fecha_movimiento",
    sortable: true,
  },
  {
    name: "tipo_movimiento_label",
    label: "Tipo",
    align: "left",
    field: "tipo_movimiento_label",
    sortable: true,
  },
  {
    name: "concepto",
    label: "Concepto",
    align: "left",
    field: "concepto",
    sortable: true,
  },
  {
    name: "monto",
    label: "Monto",
    align: "left",
    field: "monto",
    sortable: true,
  },
  {
    name: "saldo_resultante",
    label: "Saldo despues del movimiento",
    align: "left",
    field: "saldo_resultante",
    sortable: true,
  },
  {
    name: "detalle",
    label: "Detalle",
    align: "left",
    field: "detalle",
    sortable: false,
  },
];

const columnasDetalleAgrupado = [
  {
    name: "sucursal",
    label: "Sucursal",
    align: "left",
    field: "sucursal",
    sortable: true,
  },
  {
    name: "nombre",
    label: "Caja",
    align: "left",
    field: "nombre",
    sortable: true,
  },
  {
    name: "codigo",
    label: "Codigo",
    align: "left",
    field: "codigo",
    sortable: true,
  },
  {
    name: "total_ingresos",
    label: "Ingresos",
    align: "left",
    field: "total_ingresos",
    sortable: true,
  },
  {
    name: "total_egresos",
    label: "Egresos",
    align: "left",
    field: "total_egresos",
    sortable: true,
  },
  {
    name: "saldo_actual",
    label: "Saldo",
    align: "left",
    field: "saldo_actual",
    sortable: true,
  },
];

const columnasMovimientosPanel = [
  {
    name: "fecha_movimiento",
    label: "Fecha",
    align: "left",
    field: "fecha_movimiento",
    sortable: true,
  },
  {
    name: "tipo_movimiento_label",
    label: "Tipo",
    align: "left",
    field: "tipo_movimiento_label",
    sortable: true,
  },
  {
    name: "sucursal",
    label: "Sucursal",
    align: "left",
    field: "sucursal",
    sortable: true,
  },
  { name: "caja", label: "Caja", align: "left", field: "caja", sortable: true },
  {
    name: "concepto",
    label: "Concepto",
    align: "left",
    field: "concepto",
    sortable: true,
  },
  {
    name: "detalle",
    label: "Detalle",
    align: "left",
    field: "detalle",
    sortable: false,
  },
  {
    name: "usuario",
    label: "Usuario",
    align: "left",
    field: "usuario",
    sortable: true,
  },
  {
    name: "monto",
    label: "Monto",
    align: "left",
    field: "monto",
    sortable: true,
  },
  {
    name: "saldo_resultante",
    label: "Saldo",
    align: "left",
    field: "saldo_resultante",
    sortable: true,
  },
];

function crearFormularioVacio() {
  return {
    nombre: "",
    codigo: "",
    tipoMoneda: "bs",
    metodoBase: "efectivo",
    activa: true,
    observaciones: "",
  };
}

function crearFormularioMovimientoVacio() {
  return {
    tipoCaja: null,
    tipoMovimiento: "ingreso",
    monto: "",
    concepto: "",
    detalle: "",
  };
}

function reglaRequerida(valor) {
  return !!valor || "Este campo es obligatorio.";
}

function formatearMonto(valor) {
  return Number(valor || 0).toFixed(2);
}

function etiquetaMoneda(moneda) {
  return moneda === "usd" ? "$ " : "Bs. ";
}

function obtenerFechaActualIso() {
  return new Date().toISOString().slice(0, 10);
}

function obtenerClaveTipoCaja(caja) {
  return `${caja.tipo_moneda || "bs"}:${caja.metodo_base || "efectivo"}`;
}

function obtenerEtiquetaTipoCaja(caja) {
  if (caja.tipo_moneda === "usd") {
    return "Dolares";
  }

  return caja.metodo_base_label || caja.tipo_moneda_label || "Caja";
}

function obtenerDescripcionTipoCaja(caja) {
  if (caja.tipo_moneda === "usd") {
    return "Efectivo en dolares";
  }

  return `${caja.metodo_base_label} | ${caja.tipo_moneda_label}`;
}

const opcionesSucursalesFiltro = computed(() => sucursales.value);

const opcionesTiposCaja = computed(() => {
  const mapa = new Map();

  cajas.value.forEach((caja) => {
    const clave = obtenerClaveTipoCaja(caja);

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        value: clave,
        label: obtenerEtiquetaTipoCaja(caja),
      });
    }
  });

  return Array.from(mapa.values()).sort((tipoA, tipoB) =>
    tipoA.label.localeCompare(tipoB.label)
  );
});

const opcionesTiposCajaGestionables = computed(() => {
  const mapa = new Map();

  cajas.value
    .filter((caja) => caja.activa)
    .forEach((caja) => {
      const clave = obtenerClaveTipoCaja(caja);

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          value: clave,
          label: obtenerEtiquetaTipoCaja(caja),
        });
      }
    });

  return Array.from(mapa.values()).sort((tipoA, tipoB) =>
    tipoA.label.localeCompare(tipoB.label)
  );
});

const opcionesCajasFiltroMovimientos = computed(() =>
  cajas.value
    .filter((caja) => {
      if (!filtrosMovimientos.tipoCaja) {
        return true;
      }

      return obtenerClaveTipoCaja(caja) === filtrosMovimientos.tipoCaja;
    })
    .map((caja) => ({
      value: caja.id,
      label: `${caja.nombre} - ${caja.sucursal || "Sin sucursal"}`,
    }))
);

const cajasFiltradas = computed(() =>
  cajas.value.filter((caja) => {
    const coincideSucursal =
      !filtros.sucursalId ||
      Number(caja.sucursal_id) === Number(filtros.sucursalId);
    const coincideTipo =
      !filtros.tipoCaja || obtenerClaveTipoCaja(caja) === filtros.tipoCaja;

    return coincideSucursal && coincideTipo;
  })
);

const tarjetasAgrupadas = computed(() => {
  const grupos = new Map();

  cajasFiltradas.value.forEach((caja) => {
    const clave = obtenerClaveTipoCaja(caja);
    const grupoActual = grupos.get(clave);

    if (!grupoActual) {
      grupos.set(clave, {
        clave,
        etiqueta: obtenerEtiquetaTipoCaja(caja),
        descripcion: obtenerDescripcionTipoCaja(caja),
        tipo_moneda: caja.tipo_moneda,
        metodo_base: caja.metodo_base,
        activa: caja.activa === true,
        total_ingresos: Number(caja.total_ingresos || 0),
        total_egresos: Number(caja.total_egresos || 0),
        saldo_actual: Number(caja.saldo_actual || 0),
        totalCajas: 1,
        totalSucursales: new Set(caja.sucursal_id ? [caja.sucursal_id] : []),
        cajas: [caja],
      });
      return;
    }

    grupoActual.activa = grupoActual.activa || caja.activa === true;
    grupoActual.total_ingresos += Number(caja.total_ingresos || 0);
    grupoActual.total_egresos += Number(caja.total_egresos || 0);
    grupoActual.saldo_actual += Number(caja.saldo_actual || 0);
    grupoActual.totalCajas += 1;

    if (caja.sucursal_id) {
      grupoActual.totalSucursales.add(caja.sucursal_id);
    }

    grupoActual.cajas.push(caja);
  });

  return Array.from(grupos.values())
    .map((grupo) => ({
      ...grupo,
      total_ingresos: roundMonto(grupo.total_ingresos),
      total_egresos: roundMonto(grupo.total_egresos),
      saldo_actual: roundMonto(grupo.saldo_actual),
      totalSucursales: grupo.totalSucursales.size,
      resumenFiltros: filtros.sucursalId
        ? `Filtrado por 1 sucursal`
        : `${grupo.totalSucursales.size} sucursal(es) incluidas`,
      cajas: [...grupo.cajas].sort((cajaA, cajaB) => {
        const sucursalA = cajaA.sucursal || "";
        const sucursalB = cajaB.sucursal || "";
        return (
          sucursalA.localeCompare(sucursalB) ||
          (cajaA.nombre || "").localeCompare(cajaB.nombre || "")
        );
      }),
    }))
    .sort((grupoA, grupoB) => grupoA.etiqueta.localeCompare(grupoB.etiqueta));
});

const tarjetasVisibles = computed(() =>
  esGerente.value ? tarjetasAgrupadas.value : cajasFiltradas.value
);

const cajaMovimientoSeleccionada = computed(
  () =>
    cajas.value.find(
      (item) =>
        item.activa &&
        obtenerClaveTipoCaja(item) === formularioMovimiento.tipoCaja
    ) || null
);

const fechaMovimientoTexto = computed(() => {
  const fecha = new Date();
  return fecha.toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
});

function reiniciarFormulario() {
  Object.assign(formulario, crearFormularioVacio());
  cajaEditandoId.value = null;
  mensajeExito.value = "";
  errorGeneral.value = "";
}

function reiniciarFormularioMovimiento() {
  Object.assign(formularioMovimiento, crearFormularioMovimientoVacio());
  errorGeneral.value = "";
}

function roundMonto(valor) {
  return Number(Number(valor || 0).toFixed(2));
}

function abrirModalCaja(caja = null) {
  if (caja) {
    cajaEditandoId.value = caja.id;
    formulario.nombre = caja.nombre || "";
    formulario.codigo = caja.codigo || "";
    formulario.tipoMoneda = caja.tipo_moneda || "bs";
    formulario.metodoBase = caja.metodo_base || "efectivo";
    formulario.activa = caja.activa === true;
    formulario.observaciones = caja.observaciones || "";
  } else {
    reiniciarFormulario();
  }

  mensajeExito.value = "";
  errorGeneral.value = "";
  dialogoCajaAbierto.value = true;
}

function cerrarModalCaja() {
  dialogoCajaAbierto.value = false;
  reiniciarFormulario();
}

function abrirModalMovimiento(tipoMovimiento = "ingreso", caja = null) {
  reiniciarFormularioMovimiento();
  formularioMovimiento.tipoMovimiento = tipoMovimiento;
  formularioMovimiento.tipoCaja = caja ? obtenerClaveTipoCaja(caja) : null;
  dialogoMovimientoAbierto.value = true;
}

function cerrarModalMovimiento() {
  dialogoMovimientoAbierto.value = false;
  reiniciarFormularioMovimiento();
}

function abrirDetalleCaja(caja) {
  if (esGerente.value) {
    detalleAgrupadoSeleccionado.value = caja;
    cajaSeleccionada.value = null;
    movimientosCajaSeleccionada.value = [];
    dialogoDetalleCajaAbierto.value = true;
    return;
  }

  detalleAgrupadoSeleccionado.value = null;
  cajaSeleccionada.value = caja;
  dialogoDetalleCajaAbierto.value = true;
  cargarMovimientosCaja(caja.id);
}

async function cargarMovimientosCaja(idCaja) {
  cargandoMovimientosCaja.value = true;

  try {
    const datos = await listarMovimientosCaja({
      cajaId: idCaja,
      referenciaTipos: ["caja_general", "compra_abono"],
    });
    movimientosCajaSeleccionada.value = datos.movimientos || [];
  } catch (error) {
    movimientosCajaSeleccionada.value = [];
    errorGeneral.value =
      error.message ||
      "No se pudo cargar el detalle de movimientos de la caja.";
  } finally {
    cargandoMovimientosCaja.value = false;
  }
}

function obtenerFiltrosMovimientoApi() {
  const [tipoMoneda, metodoBase] = String(
    filtrosMovimientos.tipoCaja || ""
  ).split(":");

  return {
    cajaId: filtrosMovimientos.cajaId,
    fechaDesde: filtrosMovimientos.fechaDesde,
    fechaHasta: filtrosMovimientos.fechaHasta,
    concepto: filtrosMovimientos.concepto,
    referenciaTipos: ["caja_general", "compra_abono"],
    tipoMovimiento: filtrosMovimientos.tipoMovimiento,
    metodoBase: metodoBase || "",
    tipoMoneda: tipoMoneda || "",
  };
}

async function cargarHistorialMovimientos() {
  cargandoMovimientosListado.value = true;

  try {
    const datos = await listarMovimientosCaja(obtenerFiltrosMovimientoApi());
    movimientosListado.value = datos.movimientos || [];
  } catch (error) {
    movimientosListado.value = [];
    errorGeneral.value =
      error.message || "No se pudo cargar el historial de movimientos.";
  } finally {
    cargandoMovimientosListado.value = false;
  }
}

function limpiarFiltrosMovimientos() {
  filtrosMovimientos.tipoCaja = null;
  filtrosMovimientos.cajaId = null;
  filtrosMovimientos.tipoMovimiento = "";
  filtrosMovimientos.concepto = "";
  filtrosMovimientos.fechaDesde = "";
  filtrosMovimientos.fechaHasta = "";
  cargarHistorialMovimientos();
}

function sincronizarDetalleSeleccionado() {
  if (cajaSeleccionada.value) {
    cajaSeleccionada.value =
      cajas.value.find(
        (item) => Number(item.id) === Number(cajaSeleccionada.value.id)
      ) || null;
  }

  if (detalleAgrupadoSeleccionado.value) {
    detalleAgrupadoSeleccionado.value =
      tarjetasAgrupadas.value.find(
        (item) => item.clave === detalleAgrupadoSeleccionado.value.clave
      ) || null;
  }
}

async function cargarModulo() {
  cargando.value = true;
  errorGeneral.value = "";

  try {
    const datos = await obtenerDatosModuloCajas();
    monedas.value = datos.monedas;
    metodos.value = datos.metodos;
    sucursales.value = datos.sucursales;
    cajas.value = datos.cajas;
    puedeGestionar.value = datos.puedeGestionar === true;
    sincronizarDetalleSeleccionado();
  } catch (error) {
    errorGeneral.value =
      error.message || "No se pudo cargar el modulo de cajas.";
  } finally {
    cargando.value = false;
  }
}

async function guardarCaja() {
  if (!puedeGestionar.value) {
    return;
  }

  guardando.value = true;
  mensajeExito.value = "";
  errorGeneral.value = "";

  try {
    const respuesta = cajaEditandoId.value
      ? await actualizarCaja(cajaEditandoId.value, formulario)
      : await registrarCaja(formulario);

    await cargarModulo();
    cerrarModalCaja();
    mensajeExito.value = respuesta.message || "Caja guardada correctamente.";
  } catch (error) {
    errorGeneral.value = error.message || "No se pudo guardar la caja.";
  } finally {
    guardando.value = false;
  }
}

async function guardarMovimientoManual() {
  if (!puedeGestionar.value && !esGerente.value) {
    return;
  }

  if (!cajaMovimientoSeleccionada.value) {
    errorGeneral.value =
      "Selecciona un tipo de caja valido para registrar el movimiento.";
    return;
  }

  guardandoMovimiento.value = true;
  mensajeExito.value = "";
  errorGeneral.value = "";

  try {
    const tipoMovimientoRegistrado = formularioMovimiento.tipoMovimiento;
    const respuesta = await registrarMovimientoCaja({
      ...formularioMovimiento,
      cajaId: cajaMovimientoSeleccionada.value.id,
    });

    await cargarModulo();
    await cargarHistorialMovimientos();

    if (cajaSeleccionada.value?.id) {
      await cargarMovimientosCaja(cajaSeleccionada.value.id);
    }

    cerrarModalMovimiento();
    mensajeExito.value =
      respuesta.message || "Movimiento registrado correctamente.";
    $q.notify({
      type: "positive",
      message:
        tipoMovimientoRegistrado === "egreso"
          ? "Egreso registrado correctamente."
          : "Ingreso registrado correctamente.",
      position: "top-right",
    });
  } catch (error) {
    errorGeneral.value = error.message || "No se pudo registrar el movimiento.";
  } finally {
    guardandoMovimiento.value = false;
  }
}

onMounted(() => {
  cargarModulo();
  cargarHistorialMovimientos();
});
</script>
