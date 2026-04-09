<template>
  <q-page class="pagina-compras q-pa-lg">
    <div>
      <div class="text-caption text-weight-bold texto-resalte-panel">
        Compras
      </div>
      <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
        Registro de compras y pedidos
      </h1>
    </div>

    <q-banner
      v-if="mensajeExito"
      rounded
      class="bg-green-1 text-green-10 q-mt-lg"
    >
      {{ mensajeExito }}
    </q-banner>

    <q-banner v-if="errorGeneral" rounded class="bg-red-1 text-red-10 q-mt-lg">
      {{ errorGeneral }}
    </q-banner>

    <div class="columna-compras q-mt-lg">
      <q-card flat bordered class="tarjeta-compra-principal">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div>
              <div class="text-h6 text-weight-bold">
                {{
                  compraEditandoId
                    ? `Editar compra #${compraEditandoId}`
                    : "Nueva compra / pedido"
                }}
              </div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                La compra se registra por cabecera, detalle y abonos cuando
                corresponda.
              </p>
            </div>

            <div class="row q-gutter-sm">
              <q-btn flat color="grey-8" label="Ir a lista" to="/compras" />
              <q-btn
                flat
                color="grey-8"
                label="Nueva compra"
                @click="reiniciarFormularioCompleto"
              />
              <q-btn
                unelevated
                color="dark"
                text-color="white"
                :label="
                  compraEditandoId ? 'Actualizar compra' : 'Guardar compra'
                "
                :loading="guardando"
                @click="guardarCompra"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="rejilla-compras-simple">
            <q-select
              v-model="formulario.proveedorId"
              outlined
              use-input
              input-debounce="0"
              :input-value="textoProveedorBusqueda"
              :display-value="proveedorEnEdicion ? '' : textoVisibleProveedor"
              emit-value
              map-options
              clearable
              label="Proveedor / persona de compra"
              :options="proveedoresFiltrados"
              option-value="value"
              option-label="label"
              @filter="filtrarProveedores"
              @update:input-value="actualizarTextoProveedorBusqueda"
              @update:model-value="seleccionarProveedorCompra"
              @clear="limpiarProveedorCompra"
              @focus="proveedorEnEdicion = true"
              @blur="proveedorEnEdicion = false"
            >
              <template #after>
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  @click="abrirDialogoProveedor"
                />
              </template>
            </q-select>

            <q-input
              v-model="formulario.fechaPedido"
              outlined
              type="date"
              label="Fecha del pedido"
            />

            <q-select
              v-model="formulario.tipoCompra"
              outlined
              emit-value
              map-options
              label="Tipo de compra"
              :options="tiposCompra"
              option-value="value"
              option-label="label"
              @update:model-value="cambiarTipoCompra"
            />

            <q-input
              v-model.number="formulario.tiempoEntregaDias"
              outlined
              type="number"
              min="0"
              label="Tiempo de entrega (dias)"
            />

            <q-input
              v-model="formulario.observaciones"
              outlined
              label="Observaciones"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div>
              <div class="text-h6 text-weight-bold">Detalle de productos</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Tabla simple para registrar cada producto del pedido.
              </p>
            </div>

            <div class="row q-gutter-sm items-center">
              <q-chip square color="grey-2" text-color="dark">
                Total: $ {{ formatearMonto(totalGeneralUsd) }} / Bs.
                {{ formatearMonto(totalGeneralBs) }}
              </q-chip>
              <q-btn
                flat
                color="primary"
                icon="add"
                label="Agregar fila"
                @click="agregarFilaDetalle"
              />
            </div>
          </div>

          <div class="contenedor-tabla-simple q-mt-lg">
            <q-markup-table flat bordered class="tabla-simple-compras">
                <thead>
                  <tr>
                    <th class="text-left">Cantidad</th>
                    <th class="text-left">Producto existente</th>
                    <th class="text-left">Producto nuevo</th>
                    <th class="text-left">Tipo cambio</th>
                    <th class="text-left">Precio USD</th>
                    <th class="text-left">Precio Bs</th>
                  <th class="text-left">Subtotal USD</th>
                  <th class="text-left">Subtotal Bs</th>
                  <th class="text-left">Observaciones</th>
                  <th class="text-center">Accion</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(detalle, indice) in formulario.detalles"
                  :key="detalle.uid"
                >
                  <td class="columna-tabla-simple">
                    <q-input
                      v-model.number="detalle.cantidad"
                      dense
                      outlined
                      type="number"
                      min="1"
                      @update:model-value="recalcularFila(detalle)"
                    />
                  </td>
                    <td
                      class="columna-tabla-simple columna-tabla-simple--producto"
                    >
                      <q-select
                        v-model="detalle.productoId"
                        dense
                        outlined
                        use-input
                        input-debounce="0"
                        clearable
                        emit-value
                        map-options
                        :options="opcionesProductosFiltradas[indice] || productosPreparados"
                        option-value="value"
                        option-label="label"
                        @filter="
                          (valor, actualizar) =>
                            filtrarProductos(indice, valor, actualizar)
                        "
                        @update:model-value="
                          seleccionarProductoDetalle(detalle, $event)
                        "
                        @clear="limpiarProductoDetalle(detalle)"
                        label="Modelo | Marca | Categoria"
                      />
                    </td>
                    <td class="columna-tabla-simple">
                      <q-input
                        v-model="detalle.productoNuevoTexto"
                        dense
                        outlined
                        label="Escribe si no existe"
                        @update:model-value="
                          actualizarProductoNuevo(detalle, $event)
                        "
                      />
                    </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      v-model.number="detalle.tipoCambioAplicado"
                      dense
                      outlined
                      type="number"
                      min="0.01"
                      step="0.01"
                      @update:model-value="recalcularFila(detalle)"
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="detalle.precioUnitarioUsd"
                      dense
                      outlined
                      type="number"
                      min="0"
                      step="0.01"
                      @update:model-value="
                        actualizarMontoDetalle(detalle, 'usd', $event)
                      "
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="detalle.precioUnitarioBs"
                      dense
                      outlined
                      type="number"
                      min="0"
                      step="0.01"
                      @update:model-value="
                        actualizarMontoDetalle(detalle, 'bs', $event)
                      "
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="formatearMonto(detalle.subtotalUsd)"
                      dense
                      outlined
                      disable
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="formatearMonto(detalle.subtotalBs)"
                      dense
                      outlined
                      disable
                    />
                  </td>
                  <td
                    class="columna-tabla-simple columna-tabla-simple--detalle"
                  >
                    <q-input v-model="detalle.observaciones" dense outlined />
                  </td>
                  <td class="text-center columna-tabla-simple">
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="negative"
                      :disable="formulario.detalles.length === 1"
                      @click="eliminarFilaDetalle(indice)"
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>

        <q-separator v-if="mostrarAbonosDirectos" />

        <q-card-section v-if="mostrarAbonosDirectos" class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div>
              <div class="text-h6 text-weight-bold">Abonos de sucursales</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Pagos directos para compras al contado o pedido.
              </p>
            </div>

            <div class="row q-gutter-sm items-center">
              <q-chip square color="grey-2" text-color="dark">
                Abonos: $ {{ formatearMonto(totalAbonosUsd) }} / Bs.
                {{ formatearMonto(totalAbonosBs) }}
              </q-chip>
              <q-chip square color="grey-2" text-color="dark">
                Saldo: $ {{ formatearMonto(saldoPendienteUsd) }} / Bs.
                {{ formatearMonto(saldoPendienteBs) }}
              </q-chip>
              <q-chip square color="grey-2" text-color="dark">
                Referencia Bs: {{ formatearMonto(referenciaPagadoBs) }}
              </q-chip>
              <q-chip
                square
                :color="
                  diferenciaCambiariaTipo === 'perdida'
                    ? 'red-1'
                    : diferenciaCambiariaTipo === 'ahorro'
                    ? 'green-1'
                    : 'grey-2'
                "
                :text-color="
                  diferenciaCambiariaTipo === 'perdida'
                    ? 'red-10'
                    : diferenciaCambiariaTipo === 'ahorro'
                    ? 'green-10'
                    : 'dark'
                "
              >
                {{ etiquetaDiferenciaCambiaria }}
              </q-chip>
              <q-btn
                flat
                color="primary"
                icon="add"
                label="Agregar abono"
                @click="agregarFilaAbono"
              />
            </div>
          </div>

          <q-banner
            v-if="abonosExcedidos"
            rounded
            class="bg-red-1 text-red-10 q-mt-lg"
          >
            La suma de abonos supera el costo total del pedido en dolares.
            Ajusta los montos antes de guardar.
          </q-banner>
          <q-banner
            v-else-if="
              saldoPendienteUsd <= 0.0001 &&
              Math.abs(diferenciaCambiariaBs) > 0.0001
            "
            rounded
            class="bg-blue-1 text-blue-10 q-mt-lg"
          >
            El pago ya esta completo en dolares. La diferencia en bolivianos
            corresponde solo a la variacion cambiaria.
          </q-banner>

          <div class="contenedor-tabla-simple q-mt-lg">
            <q-markup-table flat bordered class="tabla-simple-compras">
              <thead>
                <tr>
                  <th class="text-left">Sucursal</th>
                  <th class="text-left">Fecha</th>
                  <th class="text-left">Tipo cambio</th>
                  <th class="text-left">Abono USD</th>
                  <th class="text-left">Abono Bs</th>
                  <th class="text-left">Referencia Bs</th>
                  <th class="text-left">Diferencia Bs</th>
                  <th class="text-left">Comprobante</th>
                  <th class="text-left">Observaciones</th>
                  <th class="text-center">Accion</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(abono, indice) in formulario.abonos"
                  :key="abono.uid"
                >
                  <td
                    class="columna-tabla-simple columna-tabla-simple--producto"
                  >
                    <q-select
                      v-model="abono.sucursalId"
                      dense
                      outlined
                      emit-value
                      map-options
                      :options="sucursales"
                      option-value="value"
                      option-label="label"
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      v-model="abono.fechaAbono"
                      dense
                      outlined
                      type="date"
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      v-model.number="abono.tipoCambioAbono"
                      dense
                      outlined
                      type="number"
                      min="0.01"
                      step="0.01"
                      @update:model-value="recalcularAbono(abono)"
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="abono.abonoUsd"
                      dense
                      outlined
                      type="number"
                      min="0"
                      step="0.01"
                      @update:model-value="
                        actualizarMontoAbono(abono, 'usd', $event)
                      "
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="abono.abonoBs"
                      dense
                      outlined
                      type="number"
                      min="0"
                      step="0.01"
                      @update:model-value="
                        actualizarMontoAbono(abono, 'bs', $event)
                      "
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="formatearMonto(referenciaAbonoBs(abono))"
                      dense
                      outlined
                      disable
                    />
                  </td>
                  <td class="columna-tabla-simple">
                    <q-input
                      :model-value="etiquetaDiferenciaAbono(abono)"
                      dense
                      outlined
                      disable
                    />
                  </td>
                  <td
                    class="columna-tabla-simple columna-tabla-simple--detalle"
                  >
                    <q-file
                      v-model="abono.comprobanteFoto"
                      dense
                      outlined
                      clearable
                      accept=".jpg,.jpeg,.png,.webp"
                      label="Foto opcional"
                    />
                  </td>
                  <td
                    class="columna-tabla-simple columna-tabla-simple--detalle"
                  >
                    <q-input v-model="abono.observaciones" dense outlined />
                  </td>
                  <td class="text-center columna-tabla-simple">
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="negative"
                      :disable="formulario.abonos.length === 1"
                      @click="eliminarFilaAbono(indice)"
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="dialogoProveedorAbierto">
      <q-card class="tarjeta-dialogo-transferencia">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold">Registrar proveedor</div>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            Registra solo el nombre de la persona o negocio.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner
            v-if="errorProveedor"
            rounded
            class="bg-red-1 text-red-10 q-mb-lg"
          >
            {{ errorProveedor }}
          </q-banner>

          <q-input
            v-model="formularioProveedor.nombre"
            outlined
            label="Proveedor / persona de compra"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="cerrarDialogoProveedor"
          />
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            label="Guardar proveedor"
            :loading="guardandoProveedor"
            @click="guardarProveedor"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useQuasar } from "quasar";
  import { useRoute, useRouter } from "vue-router";
import {
  actualizarCompra,
  obtenerDetalleCompra,
  obtenerFormularioCompra,
  registrarCompra,
  registrarProveedor,
} from "src/services/compras";

defineOptions({
  name: "ComprasPage",
});

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const guardando = ref(false);
const guardandoProveedor = ref(false);
const proveedores = ref([]);
const sucursales = ref([]);
const productos = ref([]);
const tiposCompra = ref([]);
const compraEditandoId = ref(null);
const dialogoProveedorAbierto = ref(false);
const errorGeneral = ref("");
const errorProveedor = ref("");
const mensajeExito = ref("");
const textoProveedorBusqueda = ref("");
const proveedorEnEdicion = ref(false);
const opcionesProductosFiltradas = reactive({});

const formulario = reactive(crearFormulario());
const formularioProveedor = reactive({ nombre: "" });

const proveedoresFiltrados = computed(() => {
  const termino = textoProveedorBusqueda.value.trim().toLowerCase();
  if (!termino) return proveedores.value;
  return proveedores.value.filter((proveedor) =>
    String(proveedor.label || "")
      .toLowerCase()
      .includes(termino)
  );
});
const textoVisibleProveedor = computed(() => {
  if (!formulario.proveedorId) {
    return textoProveedorBusqueda.value;
  }

  const proveedorSeleccionado = proveedores.value.find(
    (item) => Number(item.value) === Number(formulario.proveedorId)
  );

  return proveedorSeleccionado?.label || textoProveedorBusqueda.value;
});

const productosPreparados = computed(() =>
  productos.value.map((producto) => ({
    ...producto,
    value: producto.value ?? producto.id,
    label: `${producto.modelo || ""} | ${producto.marca || ""} | ${
      producto.categoria || ""
    }`,
  }))
);

const totalGeneralUsd = computed(() =>
  formulario.detalles.reduce(
    (acumulado, detalle) => acumulado + Number(detalle.subtotalUsd || 0),
    0
  )
);

const totalGeneralBs = computed(() =>
  formulario.detalles.reduce(
    (acumulado, detalle) => acumulado + Number(detalle.subtotalBs || 0),
    0
  )
);

const totalAbonosUsd = computed(() =>
  formulario.abonos.reduce(
    (acumulado, abono) => acumulado + Number(abono.abonoUsd || 0),
    0
  )
);

const totalAbonosBs = computed(() =>
  formulario.abonos.reduce(
    (acumulado, abono) => acumulado + Number(abono.abonoBs || 0),
    0
  )
);

const tipoCambioPromedioPedido = computed(() =>
  totalGeneralUsd.value > 0 ? totalGeneralBs.value / totalGeneralUsd.value : 0
);

const saldoPendienteUsd = computed(() =>
  Math.max(0, redondearMonto(totalGeneralUsd.value - totalAbonosUsd.value))
);
const saldoPendienteBs = computed(() => {
  return Math.max(
    0,
    redondearMonto(saldoPendienteUsd.value * tipoCambioPromedioPedido.value)
  );
});
const referenciaPagadoBs = computed(() =>
  redondearMonto(totalAbonosUsd.value * tipoCambioPromedioPedido.value)
);
const abonosExcedidos = computed(
  () => totalAbonosUsd.value > totalGeneralUsd.value + 0.0001
);
const mostrarAbonosDirectos = computed(() =>
  ["contado", "pedido"].includes(formulario.tipoCompra)
);
const diferenciaCambiariaBs = computed(() => {
  return redondearMonto(totalAbonosBs.value - referenciaPagadoBs.value);
});
const diferenciaCambiariaTipo = computed(() => {
  if (diferenciaCambiariaBs.value > 0.0001) return "perdida";
  if (diferenciaCambiariaBs.value < -0.0001) return "ahorro";
  return "sin_diferencia";
});
const etiquetaDiferenciaCambiaria = computed(() => {
  if (diferenciaCambiariaTipo.value === "perdida") {
    return `Perdida cambiaria: Bs. ${formatearMonto(
      diferenciaCambiariaBs.value
    )}`;
  }

  if (diferenciaCambiariaTipo.value === "ahorro") {
    return `Ahorro cambiario: Bs. ${formatearMonto(
      Math.abs(diferenciaCambiariaBs.value)
    )}`;
  }

  return "Sin diferencia cambiaria";
});

function crearFormulario() {
  return {
    proveedorId: null,
    fechaPedido: new Date().toISOString().slice(0, 10),
    tipoCompra: "contado",
    tipoCambioGeneral: 9,
    tiempoEntregaDias: 0,
    observaciones: "",
    detalles: [crearFilaDetalle()],
    abonos: [crearFilaAbono()],
  };
}

function crearFilaDetalle() {
  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
      uid,
      productoId: null,
      detalleTexto: "",
      productoNuevoTexto: "",
      cantidad: 1,
      tipoCambioAplicado: 9,
      monedaReferencia: "usd",
    precioUnitarioUsd: 0,
    precioUnitarioBs: 0,
    subtotalUsd: 0,
    subtotalBs: 0,
    observaciones: "",
  };
}

function crearFilaAbono() {
  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    uid,
    sucursalId: null,
    fechaAbono: new Date().toISOString().slice(0, 10),
    tipoCambioAbono: 9,
    monedaReferencia: "usd",
    abonoUsd: 0,
    abonoBs: 0,
    comprobanteFoto: null,
    observaciones: "",
  };
}

function normalizarNumero(valor) {
  const numero = Number(valor || 0);
  return Number.isFinite(numero) ? numero : 0;
}

function redondearMonto(valor, precision = 2) {
  return Number(normalizarNumero(valor).toFixed(precision));
}

function limitarDosDecimales(valor) {
  return redondearMonto(valor);
}

function formatearMonto(valor) {
  return Number(valor || 0).toFixed(2);
}

function actualizarTextoProveedorBusqueda(valor) {
  textoProveedorBusqueda.value = String(valor || "");
}

function seleccionarProveedorCompra(idProveedor) {
  const proveedor = proveedores.value.find(
    (item) => Number(item.value) === Number(idProveedor)
  );

  formulario.proveedorId = idProveedor;
  if (proveedor) {
    textoProveedorBusqueda.value = proveedor.label || "";
    return;
  }

  if (!idProveedor) {
    formulario.proveedorId = null;
  }
}

function limpiarProveedorCompra() {
  formulario.proveedorId = null;
}

function referenciaAbonoBs(abono) {
  return redondearMonto(
    Number(abono.abonoUsd || 0) * tipoCambioPromedioPedido.value
  );
}

function diferenciaAbonoBs(abono) {
  return redondearMonto(Number(abono.abonoBs || 0) - referenciaAbonoBs(abono));
}

function etiquetaDiferenciaAbono(abono) {
  const diferencia = diferenciaAbonoBs(abono);

  if (diferencia > 0.0001) {
    return `Perdida: Bs. ${formatearMonto(diferencia)}`;
  }

  if (diferencia < -0.0001) {
    return `Ahorro: Bs. ${formatearMonto(Math.abs(diferencia))}`;
  }

  return "Sin diferencia";
}

function mostrarNotificacion(tipo, mensaje) {
  if (typeof $q?.notify === "function") {
    $q.notify({
      type: tipo,
      message: mensaje,
    });
  }
}

function recalcularFila(detalle) {
  const cantidad = Math.max(1, Math.trunc(normalizarNumero(detalle.cantidad)));
  const tipoCambio = Math.max(
      0.01,
      limitarDosDecimales(normalizarNumero(detalle.tipoCambioAplicado))
    );
  detalle.cantidad = cantidad;
  detalle.tipoCambioAplicado = tipoCambio;

  if (detalle.monedaReferencia === "bs") {
    detalle.precioUnitarioBs = redondearMonto(detalle.precioUnitarioBs);
    detalle.precioUnitarioUsd = redondearMonto(
      detalle.precioUnitarioBs / tipoCambio
    );
  } else {
    detalle.monedaReferencia = "usd";
    detalle.precioUnitarioUsd = redondearMonto(detalle.precioUnitarioUsd);
    detalle.precioUnitarioBs = redondearMonto(
      detalle.precioUnitarioUsd * tipoCambio
    );
  }

  detalle.subtotalUsd = redondearMonto(cantidad * detalle.precioUnitarioUsd);
  detalle.subtotalBs = redondearMonto(cantidad * detalle.precioUnitarioBs);
}

function actualizarMontoDetalle(detalle, monedaOrigen, valor) {
  detalle.monedaReferencia = monedaOrigen;
  if (monedaOrigen === "usd") {
    detalle.precioUnitarioUsd = limitarDosDecimales(valor);
  } else {
    detalle.precioUnitarioBs = limitarDosDecimales(valor);
  }
  recalcularFila(detalle);
}

function recalcularAbono(abono) {
  const tipoCambio = Math.max(
    0.01,
    limitarDosDecimales(normalizarNumero(abono.tipoCambioAbono))
  );
  abono.tipoCambioAbono = tipoCambio;

  if (abono.monedaReferencia === "bs") {
    abono.abonoBs = redondearMonto(abono.abonoBs);
    abono.abonoUsd = redondearMonto(abono.abonoBs / tipoCambio);
  } else {
    abono.monedaReferencia = "usd";
    abono.abonoUsd = redondearMonto(abono.abonoUsd);
    abono.abonoBs = redondearMonto(abono.abonoUsd * tipoCambio);
  }
}

function actualizarMontoAbono(abono, monedaOrigen, valor) {
  abono.monedaReferencia = monedaOrigen;
  if (monedaOrigen === "usd") {
    abono.abonoUsd = limitarDosDecimales(valor);
  } else {
    abono.abonoBs = limitarDosDecimales(valor);
  }
  recalcularAbono(abono);
}

function agregarFilaDetalle() {
  formulario.detalles.push(crearFilaDetalle());
}

function agregarFilaAbono() {
  formulario.abonos.push(crearFilaAbono());
}

function eliminarFilaDetalle(indice) {
  if (formulario.detalles.length === 1) return;
  formulario.detalles.splice(indice, 1);
}

function eliminarFilaAbono(indice) {
  if (formulario.abonos.length === 1) return;
  formulario.abonos.splice(indice, 1);
}

function filtrarProductos(indice, valor, actualizar) {
  actualizar(() => {
    const termino = String(valor || "")
      .trim()
      .toLowerCase();
    if (!termino) {
      opcionesProductosFiltradas[indice] = productosPreparados.value;
      return;
      }
      opcionesProductosFiltradas[indice] = productosPreparados.value.filter(
        (producto) => {
          const texto =
            `${producto.modelo || ""} ${producto.marca || ""} ${producto.categoria || ""}`.toLowerCase();
          return texto.includes(termino);
        }
      );
    });
}

function filtrarProveedores(valor, actualizar) {
  actualizar(() => {
    actualizarTextoProveedorBusqueda(valor);
  });
}

function actualizarProductoNuevo(detalle, valor) {
  detalle.productoNuevoTexto = String(valor || "");
  detalle.detalleTexto = detalle.productoNuevoTexto;

  if (detalle.productoNuevoTexto.trim()) {
    detalle.productoId = null;
  }
}

function limpiarProductoDetalle(detalle) {
  detalle.productoId = null;
  detalle.detalleTexto = detalle.productoNuevoTexto || "";
}

function seleccionarProductoDetalle(detalle, idProducto) {
  const producto = productosPreparados.value.find(
    (item) => Number(item.value) === Number(idProducto)
  );
  detalle.productoId = idProducto;
  if (!producto) {
    if (!idProducto) {
      detalle.productoId = null;
    }
    return;
  }

  detalle.productoNuevoTexto = "";
  detalle.detalleTexto = producto.modelo || "";
  detalle.tipoCambioAplicado = Number(producto.tipo_cambio_referencia || 9);
  detalle.precioUnitarioUsd = Number(
    producto.costo_usd || producto.precio_unitario_usd || 0
  );
  detalle.monedaReferencia = "usd";
  recalcularFila(detalle);
}

function cambiarTipoCompra(tipoCompra) {
  formulario.tipoCompra = tipoCompra;
  if (tipoCompra === "a_credito") {
    formulario.abonos = [];
    return;
  }

  if (!formulario.abonos.length) {
    formulario.abonos = [crearFilaAbono()];
  }
}

async function asegurarProveedorSeleccionado() {
  if (formulario.proveedorId) return;
  const nombre = textoProveedorBusqueda.value.trim();
  if (!nombre) return;

  const respuesta = await registrarProveedor({ nombre });
  await cargarFormularioCompras();
  formulario.proveedorId = respuesta.proveedor?.id || null;
  textoProveedorBusqueda.value = respuesta.proveedor?.nombre || nombre;
}

function construirPayloadCompra() {
  const tipoCambioGeneralCalculado =
    tipoCambioPromedioPedido.value > 0
      ? redondearMonto(tipoCambioPromedioPedido.value)
      : 9;

  return {
    proveedor_id: formulario.proveedorId,
    fecha_pedido: formulario.fechaPedido,
    tipo_compra: formulario.tipoCompra,
    tipo_cambio_general: tipoCambioGeneralCalculado,
    tiempo_entrega_dias: Math.max(
      0,
      Math.trunc(Number(formulario.tiempoEntregaDias || 0))
    ),
    observaciones: formulario.observaciones.trim() || null,
    detalles: formulario.detalles.map((detalle) => ({
      producto_id: detalle.productoId || null,
      detalle_texto: detalle.detalleTexto.trim() || null,
      cantidad: Math.max(1, Math.trunc(Number(detalle.cantidad || 0))),
      tipo_cambio_aplicado: Number(detalle.tipoCambioAplicado || 0),
      moneda_referencia: detalle.monedaReferencia,
      precio_unitario_usd: Number(detalle.precioUnitarioUsd || 0),
      precio_unitario_bs: Number(detalle.precioUnitarioBs || 0),
      observaciones: detalle.observaciones.trim() || null,
    })),
    abonos: mostrarAbonosDirectos.value
      ? formulario.abonos.map((abono) => ({
          sucursal_id: abono.sucursalId,
          fecha_abono: abono.fechaAbono || null,
          tipo_cambio_abono: Number(abono.tipoCambioAbono || 0),
          moneda_referencia: abono.monedaReferencia,
          abono_usd: Number(abono.abonoUsd || 0),
          abono_bs: Number(abono.abonoBs || 0),
          comprobante_foto: abono.comprobanteFoto || null,
          observaciones: abono.observaciones.trim() || null,
        }))
      : [],
    cuotas: [],
  };
}

function validarFormularioAntesDeGuardar() {
  if (!formulario.proveedorId && !textoProveedorBusqueda.value.trim()) {
    return "Ingresa o selecciona un proveedor.";
  }

  if (!formulario.fechaPedido) {
    return "La fecha del pedido es obligatoria.";
  }

  const filaInvalida = formulario.detalles.find(
    (detalle) => !detalle.detalleTexto.trim() && !detalle.productoId
  );

  if (filaInvalida) {
    return "Cada fila debe tener un producto seleccionado o un detalle libre.";
  }

  if (mostrarAbonosDirectos.value) {
    const abonoSinSucursal = formulario.abonos.find(
      (abono) => !abono.sucursalId
    );

    if (abonoSinSucursal) {
      return "Cada abono debe tener una sucursal seleccionada.";
    }

    if (totalAbonosUsd.value > totalGeneralUsd.value + 0.0001) {
      return "La suma de abonos no puede superar el costo total del pedido.";
    }
  }

  return "";
}

async function cargarFormularioCompras() {
  const datos = await obtenerFormularioCompra();
  proveedores.value = datos.proveedores || [];
  sucursales.value = datos.sucursales || [];
  productos.value = datos.productos || [];
  tiposCompra.value = datos.tipos_compra || [];

  formulario.detalles.forEach((detalle, indice) => {
    opcionesProductosFiltradas[indice] = productosPreparados.value;
  });
}

function reiniciarFormularioCompleto() {
  Object.assign(formulario, crearFormulario());
  Object.keys(opcionesProductosFiltradas).forEach((clave) => {
    delete opcionesProductosFiltradas[clave];
  });

  formulario.detalles.forEach((detalle, indice) => {
    opcionesProductosFiltradas[indice] = productosPreparados.value;
    recalcularFila(detalle);
  });

  formulario.abonos.forEach((abono) => {
    recalcularAbono(abono);
  });

  compraEditandoId.value = null;
  textoProveedorBusqueda.value = "";
  errorGeneral.value = "";
  mensajeExito.value = "";
}

function abrirDialogoProveedor() {
  errorProveedor.value = "";
  formularioProveedor.nombre = textoProveedorBusqueda.value.trim();
  dialogoProveedorAbierto.value = true;
}

function cargarCompraEnFormularioLocal(compra) {
  Object.assign(formulario, {
    proveedorId: compra.proveedor_id,
    fechaPedido: compra.fecha_pedido_iso,
    tipoCompra: compra.tipo_compra,
    tipoCambioGeneral: Number(compra.tipo_cambio_general || 9),
    tiempoEntregaDias: Number(compra.tiempo_entrega_dias || 0),
    observaciones: compra.observaciones || "",
      detalles: compra.detalles.map((detalle) => ({
        uid: `${detalle.id}-${Math.random().toString(16).slice(2)}`,
        productoId: detalle.producto_id,
        detalleTexto: detalle.detalle_texto || "",
        productoNuevoTexto: detalle.producto_id ? "" : detalle.detalle_texto || "",
        cantidad: Number(detalle.cantidad_pedida || 1),
        tipoCambioAplicado: Number(detalle.tipo_cambio_aplicado || 9),
        monedaReferencia: detalle.moneda_referencia || "usd",
      precioUnitarioUsd: Number(detalle.precio_unitario_usd || 0),
      precioUnitarioBs: Number(detalle.precio_unitario_bs || 0),
      subtotalUsd: Number(detalle.subtotal_usd || 0),
      subtotalBs: Number(detalle.subtotal_bs || 0),
      observaciones: detalle.observaciones || "",
    })),
    abonos:
      compra.tipo_compra === "a_credito"
        ? []
        : (compra.abonos || []).length
        ? compra.abonos.map((abono) => ({
            uid: `${abono.id}-${Math.random().toString(16).slice(2)}`,
            sucursalId: abono.sucursal_id,
            fechaAbono:
              abono.fecha_abono || new Date().toISOString().slice(0, 10),
            tipoCambioAbono: Number(abono.tipo_cambio_abono || 9),
            monedaReferencia: abono.moneda_referencia || "usd",
            abonoUsd: Number(abono.abono_usd || 0),
            abonoBs: Number(abono.abono_bs || 0),
            comprobanteFoto: null,
            observaciones: abono.observaciones || "",
          }))
        : [crearFilaAbono()],
  });

  textoProveedorBusqueda.value = compra.proveedor || "";
}

async function cargarCompraEnFormulario(idCompra) {
  errorGeneral.value = "";

  try {
    const respuesta = await obtenerDetalleCompra(idCompra);
    compraEditandoId.value = idCompra;
    cargarCompraEnFormularioLocal(respuesta.compra);
    mensajeExito.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    errorGeneral.value = error.message || "No se pudo cargar la compra.";
  }
}

async function guardarCompra() {
  errorGeneral.value = "";
  mensajeExito.value = "";

  const errorValidacion = validarFormularioAntesDeGuardar();
  if (errorValidacion) {
    errorGeneral.value = errorValidacion;
    return;
  }

  guardando.value = true;

  try {
    await asegurarProveedorSeleccionado();
    const payload = construirPayloadCompra();
    const respuesta = compraEditandoId.value
      ? await actualizarCompra(compraEditandoId.value, payload)
      : await registrarCompra(payload);

    mensajeExito.value = respuesta.message || "Compra guardada correctamente.";
    await cargarFormularioCompras();

    mostrarNotificacion(
      "positive",
      respuesta.message || "Compra guardada correctamente."
    );
    await router.push("/compras");
  } catch (error) {
    errorGeneral.value = error.message || "No se pudo guardar la compra.";
  } finally {
    guardando.value = false;
  }
}

async function revisarEdicionDesdeRuta() {
  const idCompra = Number(route.query.editar || 0);
  if (idCompra > 0) {
    await cargarCompraEnFormulario(idCompra);
    return;
  }

  if (compraEditandoId.value) {
    reiniciarFormularioCompleto();
  }
}

function cerrarDialogoProveedor() {
  dialogoProveedorAbierto.value = false;
  errorProveedor.value = "";
  formularioProveedor.nombre = "";
}

async function guardarProveedor() {
  errorProveedor.value = "";

  if (!formularioProveedor.nombre.trim()) {
    errorProveedor.value =
      "Ingresa el nombre del proveedor o de la persona de compra.";
    return;
  }

  guardandoProveedor.value = true;

  try {
    const respuesta = await registrarProveedor({
      nombre: formularioProveedor.nombre.trim(),
    });

    await cargarFormularioCompras();
    formulario.proveedorId = respuesta.proveedor?.id || null;
    textoProveedorBusqueda.value = respuesta.proveedor?.nombre || "";
    cerrarDialogoProveedor();
    mostrarNotificacion(
      "positive",
      respuesta.message || "Proveedor registrado correctamente."
    );
  } catch (error) {
    errorProveedor.value =
      error.message || "No se pudo registrar el proveedor.";
  } finally {
    guardandoProveedor.value = false;
  }
}

watch(
  () => route.query.editar,
  () => {
    revisarEdicionDesdeRuta();
  }
);

onMounted(async () => {
  await cargarFormularioCompras();
  formulario.detalles.forEach((detalle) => recalcularFila(detalle));
  formulario.abonos.forEach((abono) => recalcularAbono(abono));
  await revisarEdicionDesdeRuta();
});
</script>
