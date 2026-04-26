<template>
  <q-page class="pagina-compras q-pa-lg">
    <div>
      <div class="text-caption text-weight-bold texto-resalte-panel">
        Compras
      </div>
      <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
        Lista de compras y pedidos
      </h1>
    </div>

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
              <div class="text-h6 text-weight-bold">Listado de compras</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Busca una compra y usa las acciones sin tener que volver al
                formulario.
              </p>
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                flat
                color="grey-8"
                icon="refresh"
                label="Recargar"
                @click="cargarCompras"
              />
              <q-btn
                unelevated
                color="dark"
                text-color="white"
                label="Nueva compra"
                to="/compras/nueva"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="rejilla-compras-simple">
            <q-input
              v-model="filtros.nroPedido"
              outlined
              label="Buscar por nro compra"
              @update:model-value="cargarCompras"
            />
            <q-input
              v-model="filtros.proveedor"
              outlined
              label="Buscar por proveedor"
              @update:model-value="cargarCompras"
            />
            <q-select
              v-model="filtros.tipoCompra"
              outlined
              emit-value
              map-options
              clearable
              label="Tipo de compra"
              :options="tiposCompra"
              option-value="value"
              option-label="label"
              @update:model-value="cargarCompras"
            />
            <q-select
              v-model="filtros.estado"
              outlined
              emit-value
              map-options
              clearable
              label="Estado"
              :options="estadosCompra"
              option-value="value"
              option-label="label"
              @update:model-value="cargarCompras"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none">
          <q-table
            flat
            :rows="comprasFiltradas"
            :columns="columnasCompras"
            row-key="id"
            :loading="cargandoCompras"
            no-data-label="Aun no hay compras registradas."
            :rows-per-page-options="[10, 20, 50]"
          >
            <template #body-cell-total_productos="propiedades">
              <q-td :props="propiedades">
                $ {{ formatearMonto(propiedades.row.total_productos_usd) }}
                <span class="text-grey-7"
                  >(Bs.
                  {{
                    formatearMonto(propiedades.row.total_productos_bs)
                  }})</span
                >
              </q-td>
            </template>

            <template #body-cell-estado="propiedades">
              <q-td :props="propiedades">
                <q-badge
                  rounded
                  :class="claseEstadoCompra(propiedades.row.estado)"
                >
                  {{ propiedades.row.estado_label }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-estado_pago="propiedades">
              <q-td :props="propiedades">
                <q-badge
                  rounded
                  :class="claseEstadoPago(propiedades.row.estado_pago)"
                >
                  {{ propiedades.row.estado_pago_label }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-acciones="propiedades">
              <q-td :props="propiedades">
                <div class="row items-center q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    color="grey-8"
                    icon="visibility"
                    @click="abrirDetalle(propiedades.row.id)"
                  >
                    <q-tooltip>Ver detalle</q-tooltip>
                  </q-btn>
                    <q-btn
                      v-if="puedeEditarCompra(propiedades.row)"
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                    :to="`/compras/nueva?editar=${propiedades.row.id}`"
                  >
                    <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="Number(propiedades.row.tiempo_entrega_dias || 0) > 0"
                      flat
                      round
                    dense
                    color="secondary"
                    icon="local_shipping"
                    @click="abrirGuias(propiedades.row.id)"
                  >
                    <q-tooltip>Guias</q-tooltip>
                  </q-btn>
                    <q-btn
                      v-if="propiedades.row.tipo_compra === 'a_credito'"
                      flat
                      round
                      dense
                    color="dark"
                    icon="payments"
                    @click="abrirPagosCredito(propiedades.row.id)"
                  >
                    <q-tooltip>Pagos de credito</q-tooltip>
                  </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                    color="positive"
                    icon="inventory_2"
                    @click="abrirRecepcion(propiedades.row.id)"
                  >
                    <q-tooltip>Recepcion</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="
                      [
                        'pendiente_ingreso_inventario',
                        'parcial',
                        'incompleto',
                      ].includes(propiedades.row.estado)
                    "
                    flat
                    round
                    dense
                    color="teal"
                    icon="move_to_inbox"
                    @click="abrirIngresoInventario(propiedades.row.id)"
                  >
                    <q-tooltip>Ingreso a inventario</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="dialogoDetalleAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div>
              <div class="text-h6 text-weight-bold">Detalle de compra</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Resumen rapido para revisar la compra sin salir de la lista.
              </p>
            </div>
            <q-btn
              flat
              round
              dense
              class="boton-cerrar-modal-compras"
              icon="close"
              @click="dialogoDetalleAbierto = false"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="cargandoDetalle" class="estado-detalle-producto">
            <q-spinner color="primary" size="42px" />
          </div>

            <div v-else-if="detalleCompraSeleccionada" class="columna-compras">
              <div class="rejilla-compras-simple">
                <q-input
                  :model-value="detalleCompraSeleccionada.nro_pedido"
                  outlined
                label="Nro compra"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.proveedor"
                outlined
                label="Proveedor"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.fecha_pedido"
                outlined
                label="Fecha"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.tipo_compra_label"
                outlined
                label="Tipo"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.estado_label"
                outlined
                label="Estado"
                disable
              />
                <q-input
                  :model-value="`$ ${formatearMonto(
                    detalleCompraSeleccionada.total_productos_usd
                  )} / Bs. ${formatearMonto(
                    detalleCompraSeleccionada.total_productos_bs
                  )}`"
                  outlined
                  label="Total"
                  disable
                />
              </div>

              <div class="rejilla-resumen-pagos-credito">
                <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral">
                  <div class="text-caption text-grey-7">Estado de pago</div>
                  <div class="text-h6 text-weight-bold">
                    {{ detalleCompraSeleccionada.estado_pago_label }}
                  </div>
                  <div class="text-body2 text-grey-8">
                    Saldo: $ {{ formatearMonto(detalleCompraSeleccionada.saldo_pendiente_usd) }}
                  </div>
                </div>
                <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success">
                  <div class="text-caption text-grey-7">Total pagado</div>
                  <div class="text-h6 text-weight-bold">
                    $ {{ formatearMonto(detalleCompraSeleccionada.total_pagado_usd) }}
                  </div>
                  <div class="text-body2 text-grey-8">
                    Bs. {{ formatearMonto(detalleCompraSeleccionada.total_pagado_bs) }}
                  </div>
                </div>
                <div
                  class="tarjeta-resumen-pago"
                  :class="claseTarjetaDiferenciaCambiaria(detalleCompraSeleccionada.diferencia_cambiaria_total_tipo)"
                >
                  <div class="text-caption text-grey-7">
                    {{ etiquetaDiferenciaCambiaria(detalleCompraSeleccionada.diferencia_cambiaria_total_tipo) }}
                  </div>
                  <div class="text-h6 text-weight-bold">
                    Bs. {{ formatearMontoAbsoluto(detalleCompraSeleccionada.diferencia_cambiaria_total_bs) }}
                  </div>
                  <div class="text-body2 text-grey-8">
                    Referencia: Bs. {{ formatearMonto(detalleCompraSeleccionada.referencia_pagado_bs) }}
                  </div>
                </div>
                <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning">
                  <div class="text-caption text-grey-7">Devolucion pendiente</div>
                  <div class="text-h6 text-weight-bold">
                    $ {{ formatearMonto(detalleCompraSeleccionada.devolucion_pendiente_usd) }}
                  </div>
                  <div class="text-body2 text-grey-8">
                    Bs. {{ formatearMonto(detalleCompraSeleccionada.devolucion_pendiente_bs) }}
                  </div>
                </div>
              </div>

              <div class="contenedor-tabla-simple">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">
                  Productos del pedido
                </div>
                <q-markup-table flat bordered class="tabla-simple-compras">
                  <thead>
                    <tr>
                      <th class="text-left">Detalle</th>
                      <th class="text-left">Pedida</th>
                      <th class="text-left">Recibida</th>
                      <th class="text-left">Pendiente</th>
                      <th class="text-left">Precio USD</th>
                      <th class="text-left">Precio Bs</th>
                      <th class="text-left">Subtotal USD</th>
                      <th class="text-left">Subtotal Bs</th>
                      <th class="text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="detalle in detalleCompraSeleccionada.detalles"
                      :key="detalle.id"
                    >
                      <td>{{ detalle.detalle_texto }}</td>
                      <td>{{ detalle.cantidad_pedida }}</td>
                      <td>{{ detalle.cantidad_recibida_acumulada }}</td>
                      <td>{{ detalle.cantidad_pendiente }}</td>
                      <td>{{ formatearMonto(detalle.precio_unitario_usd) }}</td>
                      <td>{{ formatearMonto(detalle.precio_unitario_bs) }}</td>
                      <td>{{ formatearMonto(detalle.subtotal_usd) }}</td>
                      <td>{{ formatearMonto(detalle.subtotal_bs) }}</td>
                      <td>{{ detalle.estado_linea }}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>

              <div class="contenedor-tabla-simple">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">
                  Pagos y abonos
                </div>
                <q-markup-table flat bordered class="tabla-simple-compras">
                  <thead>
                    <tr>
                      <th class="text-left">Sucursal</th>
                      <th class="text-left">Caja</th>
                      <th class="text-left">Fecha</th>
                      <th class="text-left">Tipo cambio</th>
                      <th class="text-left">Pago USD</th>
                      <th class="text-left">Pago Bs</th>
                      <th class="text-left">Referencia Bs</th>
                      <th class="text-left">Diferencia Bs</th>
                      <th class="text-left">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!detalleCompraSeleccionada.abonos?.length">
                      <td colspan="9" class="text-center text-grey-7">
                        Aun no hay pagos o abonos registrados.
                      </td>
                    </tr>
                    <tr
                      v-for="abono in detalleCompraSeleccionada.abonos"
                      :key="abono.id"
                    >
                      <td>{{ abono.sucursal || "-" }}</td>
                      <td>{{ abono.caja || "-" }}</td>
                      <td>{{ abono.fecha_abono || "-" }}</td>
                      <td>{{ formatearMonto(abono.tipo_cambio_abono) }}</td>
                      <td>{{ formatearMonto(abono.abono_usd) }}</td>
                      <td>{{ formatearMonto(abono.abono_bs) }}</td>
                      <td>{{ formatearMonto(abono.referencia_bs) }}</td>
                      <td :class="claseTextoDiferenciaCambiaria(abono.diferencia_cambiaria_tipo)">
                        {{ etiquetaDiferenciaCambiaria(abono.diferencia_cambiaria_tipo) }}:
                        Bs. {{ formatearMontoAbsoluto(abono.diferencia_cambiaria_bs) }}
                      </td>
                      <td>{{ abono.observaciones || "-" }}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>

              <div class="contenedor-tabla-simple">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">
                  Guias registradas
                </div>
                <q-markup-table flat bordered class="tabla-simple-compras">
                  <thead>
                    <tr>
                      <th class="text-left">Fecha</th>
                      <th class="text-left">Monto Bs</th>
                      <th class="text-left">Estado</th>
                      <th class="text-left">Pagado</th>
                      <th class="text-left">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!detalleCompraSeleccionada.guias?.length">
                      <td colspan="5" class="text-center text-grey-7">
                        Aun no hay guias registradas.
                      </td>
                    </tr>
                    <tr
                      v-for="guia in detalleCompraSeleccionada.guias"
                      :key="guia.id"
                    >
                      <td>{{ guia.fecha_registro }}</td>
                      <td>{{ formatearMonto(guia.monto_bs) }}</td>
                      <td>{{ guia.estado_label }}</td>
                      <td>{{ guia.pagado ? "Si" : "No" }}</td>
                      <td>{{ guia.observaciones || "-" }}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>

              <div class="contenedor-tabla-simple">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">
                  Recepciones e ingreso a inventario
                </div>
                <q-markup-table flat bordered class="tabla-simple-compras">
                  <thead>
                    <tr>
                      <th class="text-left">Fecha recepcion</th>
                      <th class="text-left">Estado recepcion</th>
                      <th class="text-left">Guia asociada</th>
                      <th class="text-left">Ingreso a inventario</th>
                      <th class="text-left">Fecha ingreso</th>
                      <th class="text-left">Detalle recepcionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!detalleCompraSeleccionada.recepciones?.length">
                      <td colspan="6" class="text-center text-grey-7">
                        Aun no hay recepciones registradas.
                      </td>
                    </tr>
                    <tr
                      v-for="recepcion in detalleCompraSeleccionada.recepciones"
                      :key="recepcion.id"
                    >
                      <td>{{ recepcion.fecha_recepcion }}</td>
                      <td>{{ recepcion.estado_recepcion_label }}</td>
                      <td>
                        {{
                          detalleCompraSeleccionada.guias.find(
                            (guia) => guia.id === recepcion.compra_guia_id
                          )?.fecha_registro || "-"
                        }}
                      </td>
                      <td>
                        {{ recepcion.ingresado_inventario ? "Si" : "No" }}
                      </td>
                      <td>{{ recepcion.fecha_ingreso_inventario || "-" }}</td>
                      <td>
                        <div
                          v-for="detalle in recepcion.detalles"
                          :key="detalle.id"
                        >
                          {{ detalle.detalle_texto }}: {{ detalle.cantidad_recibida }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoPagosCreditoAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div>
              <div class="text-h6 text-weight-bold">Pagos de credito</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Registra pagos por sucursal y revisa cuanto falta por cancelar.
              </p>
            </div>
            <q-btn
              flat
              round
              dense
              class="boton-cerrar-modal-compras"
              icon="close"
              @click="dialogoPagosCreditoAbierto = false"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="cargandoDetalle" class="estado-detalle-producto">
            <q-spinner color="primary" size="42px" />
          </div>

          <div v-else-if="detalleCompraSeleccionada" class="columna-compras">
            <div class="rejilla-compras-simple">
              <q-input
                :model-value="detalleCompraSeleccionada.nro_pedido"
                outlined
                label="Nro compra"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.proveedor"
                outlined
                label="Proveedor"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.fecha_pedido"
                outlined
                label="Fecha"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.tipo_compra_label"
                outlined
                label="Tipo"
                disable
              />
              <div class="bloque-estado-pago">
                <div class="text-caption text-grey-7">Estado de pago</div>
                <q-badge
                  rounded
                  :class="
                    claseEstadoPago(detalleCompraSeleccionada.estado_pago)
                  "
                >
                  {{ detalleCompraSeleccionada.estado_pago_label }}
                </q-badge>
              </div>
            </div>

            <div class="rejilla-resumen-pagos-credito">
              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--neutral">
                <div class="text-caption text-grey-7">Total compra</div>
                <div class="text-h6 text-weight-bold">
                  $
                  {{
                    formatearMonto(
                      detalleCompraSeleccionada.total_productos_usd
                    )
                  }}
                </div>
                <div class="text-body2 text-grey-8">
                  Bs.
                  {{
                    formatearMonto(detalleCompraSeleccionada.total_productos_bs)
                  }}
                </div>
              </div>

              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--success">
                <div class="text-caption text-grey-7">Total pagado</div>
                <div class="text-h6 text-weight-bold">
                  $
                  {{
                    formatearMonto(detalleCompraSeleccionada.total_pagado_usd)
                  }}
                </div>
                <div class="text-body2 text-grey-8">
                  Bs.
                  {{
                    formatearMonto(detalleCompraSeleccionada.total_pagado_bs)
                  }}
                </div>
              </div>

              <div class="tarjeta-resumen-pago tarjeta-resumen-pago--warning">
                <div class="text-caption text-grey-7">Saldo pendiente</div>
                <div class="text-h6 text-weight-bold">
                  $ {{ formatearMonto(saldoPendientePreviewUsd) }}
                </div>
                <div class="text-body2 text-grey-8">
                  Bs. {{ formatearMonto(saldoPendientePreviewBs) }}
                </div>
              </div>

              <div
                class="tarjeta-resumen-pago"
                :class="claseTarjetaDiferenciaCambiaria(diferenciaCambiariaPreviewTipo)"
              >
                <div class="text-caption text-grey-7">
                  {{ etiquetaDiferenciaCambiaria(diferenciaCambiariaPreviewTipo) }}
                </div>
                <div class="text-h6 text-weight-bold">
                  Bs. {{ formatearMontoAbsoluto(diferenciaCambiariaPreviewBs) }}
                </div>
                <div class="text-body2 text-grey-8">
                  Referencia: Bs. {{ formatearMonto(referenciaPagadoPreviewBs) }}
                </div>
              </div>
            </div>

              <q-banner
                v-if="errorPagoCredito"
                rounded
                class="bg-red-1 text-red-10"
              >
                {{ errorPagoCredito }}
              </q-banner>
                <q-banner
                  v-else-if="
                    pagoCreditoPreviewUsd >
                    Number(detalleCompraSeleccionada.saldo_pendiente_usd || 0) +
                      0.0001
                "
                rounded
                class="bg-red-1 text-red-10"
                >
                  La suma de abonos supera el saldo pendiente de la compra.
                </q-banner>
                <q-banner
                  v-else-if="!puedeRegistrarPagoCredito"
                  rounded
                  class="bg-blue-1 text-blue-10"
                >
                  Esta compra ya fue pagada por completo.
                </q-banner>

            <q-card flat bordered class="tarjeta-compra-principal">
              <q-card-section class="q-pa-lg">
                <div
                  class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
                >
                  <div>
                    <div class="text-subtitle1 text-weight-bold">
                      Registrar pago
                    </div>
                    <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                      Cada sucursal puede ir abonando poco a poco hasta
                      completar la compra.
                    </p>
                  </div>

                    <div class="row q-gutter-sm">
                      <q-btn
                        v-if="puedeRegistrarPagoCredito"
                        flat
                        color="primary"
                        icon="add"
                        label="Agregar abono"
                        @click="agregarFilaPagoCredito"
                      />
                      <q-btn
                        v-if="puedeRegistrarPagoCredito"
                        unelevated
                        color="dark"
                        text-color="white"
                        label="Guardar pago"
                        :loading="guardandoPagoCredito"
                        @click="guardarPagoCredito"
                      />
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pa-lg">
                  <div class="columna-compras q-gutter-md">
                    <div
                      v-for="(pago, indice) in formularioPagoCredito.pagos"
                      :key="pago.uid"
                      class="rejilla-pagos-simple"
                    >
                      <q-select
                        v-model="pago.sucursalId"
                        outlined
                        emit-value
                        map-options
                        label="Sucursal"
                        :options="sucursales"
                        option-value="value"
                        option-label="label"
                        @update:model-value="pago.cajaId = null"
                      />
                      <q-select
                        v-model="pago.cajaId"
                        outlined
                        emit-value
                        map-options
                        label="Caja"
                        :options="opcionesCajasPagoCredito(pago.sucursalId)"
                        option-value="value"
                        option-label="label"
                      />
                      <q-input
                        v-model="pago.fechaAbono"
                        outlined
                        type="date"
                        label="Fecha de pago"
                      />
                      <q-input
                        v-model.number="pago.tipoCambioAbono"
                        outlined
                        type="number"
                        min="0.01"
                        step="0.01"
                        label="Tipo de cambio"
                        @update:model-value="recalcularPagoCredito(pago)"
                      />
                      <q-input
                        :model-value="pago.abonoUsd"
                        outlined
                        type="number"
                        min="0"
                        step="0.01"
                        label="Pago USD"
                        @update:model-value="
                          actualizarMontoPagoCredito(pago, 'usd', $event)
                        "
                      />
                      <q-input
                        :model-value="pago.abonoBs"
                        outlined
                        type="number"
                        min="0"
                        step="0.01"
                        label="Pago Bs"
                        @update:model-value="
                          actualizarMontoPagoCredito(pago, 'bs', $event)
                        "
                      />
                      <q-input
                        v-model="pago.observaciones"
                        outlined
                        label="Observaciones"
                      />
                      <div class="campo-pago-accion">
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          :disable="formularioPagoCredito.pagos.length === 1"
                          @click="eliminarFilaPagoCredito(indice)"
                        />
                      </div>
                      <div class="resumen-diferencia-fila">
                        <span class="text-caption text-grey-7">
                          Referencia Bs:
                          {{ formatearMonto(referenciaPagoCreditoFila(pago)) }}
                        </span>
                        <span
                          class="text-caption text-weight-medium"
                          :class="claseTextoDiferenciaCambiaria(diferenciaPagoCreditoFilaTipo(pago))"
                        >
                          {{ etiquetaDiferenciaCambiaria(diferenciaPagoCreditoFilaTipo(pago)) }}:
                          Bs. {{ formatearMontoAbsoluto(diferenciaPagoCreditoFila(pago)) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </q-card-section>
            </q-card>

            <div class="contenedor-tabla-simple">
              <q-markup-table flat bordered class="tabla-simple-compras">
                <thead>
                  <tr>
                    <th class="text-left">Sucursal</th>
                    <th class="text-left">Caja</th>
                    <th class="text-left">Fecha</th>
                    <th class="text-left">Tipo cambio</th>
                    <th class="text-left">Pago USD</th>
                    <th class="text-left">Pago Bs</th>
                    <th class="text-left">Referencia Bs</th>
                    <th class="text-left">Diferencia Bs</th>
                    <th class="text-left">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!detalleCompraSeleccionada.abonos?.length">
                    <td colspan="9" class="text-center text-grey-7">
                      Aun no hay pagos registrados para esta compra.
                    </td>
                  </tr>
                  <tr
                    v-for="abono in detalleCompraSeleccionada.abonos"
                    :key="abono.id"
                  >
                    <td>{{ abono.sucursal }}</td>
                    <td>{{ abono.caja || "-" }}</td>
                    <td>{{ abono.fecha_abono }}</td>
                    <td>{{ formatearMonto(abono.tipo_cambio_abono) }}</td>
                    <td>{{ formatearMonto(abono.abono_usd) }}</td>
                    <td>{{ formatearMonto(abono.abono_bs) }}</td>
                    <td>{{ formatearMonto(abono.referencia_bs) }}</td>
                    <td :class="claseTextoDiferenciaCambiaria(abono.diferencia_cambiaria_tipo)">
                      {{ etiquetaDiferenciaCambiaria(abono.diferencia_cambiaria_tipo) }}:
                      Bs. {{ formatearMontoAbsoluto(abono.diferencia_cambiaria_bs) }}
                    </td>
                    <td>{{ abono.observaciones || "-" }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoGuiasAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div>
              <div class="text-h6 text-weight-bold">Control de guias</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Registra las guias de traslado de esta compra y revisa su
                historial.
              </p>
            </div>
            <q-btn
              flat
              round
              dense
              class="boton-cerrar-modal-compras"
              icon="close"
              @click="dialogoGuiasAbierto = false"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="cargandoDetalle" class="estado-detalle-producto">
            <q-spinner color="primary" size="42px" />
          </div>

          <div v-else-if="detalleCompraSeleccionada" class="columna-compras">
            <div class="rejilla-compras-simple">
              <q-input
                :model-value="detalleCompraSeleccionada.nro_pedido"
                outlined
                label="Nro compra"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.proveedor"
                outlined
                label="Proveedor"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.fecha_pedido"
                outlined
                label="Fecha"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.estado_label"
                outlined
                label="Estado logístico"
                disable
              />
              <q-input
                :model-value="`Bs. ${formatearMonto(
                  detalleCompraSeleccionada.total_guias_bs
                )}`"
                outlined
                label="Total guias"
                disable
              />
            </div>

            <q-banner v-if="errorGuia" rounded class="bg-red-1 text-red-10">
              {{ errorGuia }}
            </q-banner>

            <q-card flat bordered class="tarjeta-compra-principal">
              <q-card-section class="q-pa-lg">
                <div
                  class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
                >
                  <div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ guiaEditandoId ? "Editar guia" : "Registrar guia" }}
                    </div>
                    <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                      Las guias se registran solo en bolivianos y pueden quedar
                      en transito o recogidas.
                    </p>
                  </div>

                    <div class="row q-gutter-sm">
                      <q-btn
                        v-if="guiaEditandoId"
                        flat
                        color="grey-8"
                      label="Cancelar edicion"
                      @click="reiniciarFormularioGuia"
                      />
                      <q-btn
                        v-if="puedeRegistrarGuias"
                        unelevated
                        color="dark"
                        text-color="white"
                        :label="
                        guiaEditandoId ? 'Actualizar guia' : 'Guardar guia'
                      "
                      :loading="guardandoGuia"
                      @click="guardarGuia"
                    />
                  </div>
                </div>
              </q-card-section>

              <q-separator />

                  <q-card-section class="q-pa-lg">
                    <div v-if="puedeRegistrarGuias" class="rejilla-guias-simple">
                      <q-input
                      v-model="formularioGuia.fechaRegistro"
                      outlined
                      type="date"
                      class="campo-guia"
                      label="Fecha de guia"
                    />
                    <q-input
                      v-model.number="formularioGuia.montoBs"
                      outlined
                      type="number"
                      min="0"
                      step="0.01"
                      class="campo-guia"
                      label="Monto Bs"
                    />
                    <q-select
                      v-model="formularioGuia.estado"
                      outlined
                      emit-value
                      map-options
                      class="campo-guia"
                      label="Estado"
                      :options="estadosGuia"
                      option-value="value"
                      option-label="label"
                    />
                    <div class="campo-guia campo-guia--toggle">
                      <q-toggle
                        v-model="formularioGuia.pagado"
                        label="Guia pagada"
                        color="primary"
                        left-label
                      />
                    </div>
                    <q-input
                      v-model="formularioGuia.observaciones"
                      outlined
                      class="campo-guia"
                      label="Observaciones"
                    />
                    <div class="columna-campo-archivo campo-guia">
                      <q-file
                        v-model="formularioGuia.fotoGuia"
                        outlined
                        clearable
                        accept=".jpg,.jpeg,.png,.webp"
                        label="Foto de guia opcional"
                      />
                      <a
                        v-if="formularioGuia.fotoUrlActual && !formularioGuia.fotoGuia"
                        :href="resolverUrlArchivo(formularioGuia.fotoUrlActual)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="enlace-comprobante"
                      >
                        Ver foto actual
                        </a>
                      </div>
                    </div>
                    <q-banner
                      v-else
                      rounded
                      class="bg-blue-1 text-blue-10"
                    >
                      Esta compra ya no necesita registrar mas guias.
                    </q-banner>
                  </q-card-section>
                </q-card>

            <div class="contenedor-tabla-simple">
              <q-markup-table flat bordered class="tabla-simple-compras">
                <thead>
                    <tr>
                      <th class="text-left">Fecha</th>
                      <th class="text-left">Monto Bs</th>
                      <th class="text-left">Estado</th>
                      <th class="text-left">Pagado</th>
                      <th class="text-left">Foto</th>
                      <th class="text-left">Observaciones</th>
                      <th class="text-left">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!detalleCompraSeleccionada.guias?.length">
                      <td colspan="7" class="text-center text-grey-7">
                        Aun no hay guias registradas para esta compra.
                      </td>
                    </tr>
                  <tr
                    v-for="guia in detalleCompraSeleccionada.guias"
                    :key="guia.id"
                  >
                    <td>{{ guia.fecha_registro }}</td>
                      <td>{{ formatearMonto(guia.monto_bs) }}</td>
                      <td>{{ guia.estado_label }}</td>
                      <td>{{ guia.pagado ? "Si" : "No" }}</td>
                      <td>
                        <a
                          v-if="guia.foto_url"
                          :href="resolverUrlArchivo(guia.foto_url)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="enlace-comprobante"
                        >
                          Ver foto
                        </a>
                        <span v-else>-</span>
                      </td>
                      <td>{{ guia.observaciones || "-" }}</td>
                      <td>
                        <q-btn
                          flat
                          dense
                          :color="guiaYaRecepcionada(guia) ? 'grey-6' : 'primary'"
                          :disable="guiaYaRecepcionada(guia)"
                          :label="guiaYaRecepcionada(guia) ? 'Bloqueada' : 'Editar'"
                          @click="editarGuia(guia)"
                        >
                          <q-tooltip v-if="guiaYaRecepcionada(guia)">
                            Esta guia ya fue usada en una recepcion
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          dense
                          color="negative"
                          class="q-ml-sm"
                          :disable="guiaYaRecepcionada(guia)"
                          label="Eliminar"
                          @click="eliminarGuia(guia)"
                        >
                          <q-tooltip v-if="guiaYaRecepcionada(guia)">
                            Esta guia ya fue usada en una recepcion
                          </q-tooltip>
                        </q-btn>
                      </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoRecepcionAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div>
              <div class="text-h6 text-weight-bold">Recepcion de compra</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Registra lo que llego hoy y el sistema lo acumulara sobre el
                pedido.
              </p>
            </div>
            <q-btn
              flat
              round
              dense
              class="boton-cerrar-modal-compras"
              icon="close"
              @click="dialogoRecepcionAbierto = false"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="cargandoDetalle" class="estado-detalle-producto">
            <q-spinner color="primary" size="42px" />
          </div>

          <div v-else-if="detalleCompraSeleccionada" class="columna-compras">
            <div class="rejilla-compras-simple">
              <q-input
                :model-value="detalleCompraSeleccionada.nro_pedido"
                outlined
                label="Nro compra"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.proveedor"
                outlined
                label="Proveedor"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.estado_label"
                outlined
                label="Estado actual"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.fecha_pedido"
                outlined
                label="Fecha del pedido"
                disable
              />
              <q-input
                :model-value="cantidadRecibidaTotal"
                outlined
                label="Total recibido"
                disable
              />
              <q-input
                :model-value="cantidadPendienteTotal"
                outlined
                label="Total pendiente"
                disable
              />
            </div>

            <q-banner
              v-if="errorRecepcion"
              rounded
              class="bg-red-1 text-red-10"
            >
              {{ errorRecepcion }}
            </q-banner>

            <q-card flat bordered class="tarjeta-compra-principal">
              <q-card-section class="q-pa-lg">
                <div
                  class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
                >
                  <div>
                    <div class="text-subtitle1 text-weight-bold">
                      Registrar recepcion
                    </div>
                    <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                      Usa “Cantidad que llego hoy” para registrar esta tanda de
                      entrega.
                    </p>
                  </div>

                  <div class="row q-gutter-sm">
                      <q-btn
                        v-if="
                          puedeRegistrarRecepcion &&
                          cantidadPendienteTotal > 0 &&
                          detalleCompraSeleccionada.estado !== 'incompleto'
                        "
                      outline
                      color="negative"
                      label="Cerrar incompleto"
                      @click="dialogoCerrarIncompletoAbierto = true"
                      />
                      <q-btn
                        v-if="puedeRegistrarRecepcion"
                        unelevated
                        color="dark"
                        text-color="white"
                        label="Guardar recepcion"
                      :loading="guardandoRecepcion"
                      @click="guardarRecepcion"
                    />
                  </div>
                </div>
              </q-card-section>

              <q-separator />

                <q-card-section class="q-pa-lg">
                  <div v-if="puedeRegistrarRecepcion" class="rejilla-compras-simple">
                    <q-input
                    v-model="formularioRecepcion.fechaRecepcion"
                    outlined
                    type="date"
                    label="Fecha de recepcion"
                  />
                    <q-select
                      v-model="formularioRecepcion.compraGuiaId"
                      outlined
                      emit-value
                      map-options
                      clearable
                      label="Guia recogida"
                      :options="guiasRecogidasDisponibles"
                      option-disable="disable"
                      option-value="value"
                      option-label="label"
                    />
                    <q-input
                      v-model="formularioRecepcion.observaciones"
                      outlined
                      label="Observaciones generales"
                    />
                  </div>
                  <q-banner
                    v-else
                    rounded
                    class="bg-blue-1 text-blue-10"
                  >
                    Esta compra ya no tiene cantidades pendientes por recepcionar.
                  </q-banner>
                </q-card-section>

                <q-separator />

                <q-card-section v-if="puedeRegistrarRecepcion" class="q-pa-lg">
                  <div class="contenedor-tabla-simple">
                  <q-markup-table flat bordered class="tabla-simple-compras">
                    <thead>
                      <tr>
                        <th class="text-left">Detalle</th>
                        <th class="text-left">Pedida</th>
                        <th class="text-left">Recibida acumulada</th>
                        <th class="text-left">Pendiente</th>
                        <th class="text-left">Cantidad que llego hoy</th>
                        <th class="text-left">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="detalle in formularioRecepcion.detalles"
                        :key="detalle.compraDetalleId"
                      >
                        <td>{{ detalle.detalleTexto }}</td>
                        <td>{{ detalle.cantidadPedida }}</td>
                        <td>{{ detalle.cantidadRecibidaAcumulada }}</td>
                        <td>{{ detalle.cantidadPendiente }}</td>
                        <td class="columna-tabla-simple">
                          <q-input
                            v-model.number="detalle.cantidadRecibida"
                            outlined
                            dense
                            type="number"
                            min="0"
                            :max="detalle.cantidadPendiente"
                          />
                        </td>
                        <td
                          class="columna-tabla-simple columna-tabla-simple--detalle"
                        >
                          <q-input
                            v-model="detalle.observaciones"
                            outlined
                            dense
                          />
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </div>
              </q-card-section>
            </q-card>

            <q-banner
              v-if="detalleCompraSeleccionada.estado === 'incompleto'"
              rounded
              class="bg-orange-1 text-orange-10"
            >
              Devolucion pendiente del proveedor: $
              {{
                formatearMonto(
                  detalleCompraSeleccionada.devolucion_pendiente_usd
                )
              }}
              / Bs.
              {{
                formatearMonto(
                  detalleCompraSeleccionada.devolucion_pendiente_bs
                )
              }}
            </q-banner>

            <div class="contenedor-tabla-simple">
              <q-markup-table flat bordered class="tabla-simple-compras">
                <thead>
                  <tr>
                    <th class="text-left">Fecha</th>
                    <th class="text-left">Estado</th>
                    <th class="text-left">Observaciones</th>
                    <th class="text-left">Detalle recepcionado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!detalleCompraSeleccionada.recepciones?.length">
                    <td colspan="4" class="text-center text-grey-7">
                      Aun no hay recepciones registradas para esta compra.
                    </td>
                  </tr>
                  <tr
                    v-for="recepcion in detalleCompraSeleccionada.recepciones"
                    :key="recepcion.id"
                  >
                    <td>{{ recepcion.fecha_recepcion }}</td>
                    <td>{{ recepcion.estado_recepcion_label }}</td>
                    <td>{{ recepcion.observaciones || "-" }}</td>
                    <td>
                      <div
                        v-for="detalle in recepcion.detalles"
                        :key="detalle.id"
                      >
                        {{ detalle.detalle_texto }}:
                        {{ detalle.cantidad_recibida }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoIngresoInventarioAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div>
              <div class="text-h6 text-weight-bold">Ingreso a inventario</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Ingresa al inventario lo que ya fue recepcionado, aunque la
                compra siga incompleta.
              </p>
            </div>
            <q-btn
              flat
              round
              dense
              class="boton-cerrar-modal-compras"
              icon="close"
              @click="dialogoIngresoInventarioAbierto = false"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="cargandoDetalle" class="estado-detalle-producto">
            <q-spinner color="primary" size="42px" />
          </div>

          <div v-else-if="detalleCompraSeleccionada" class="columna-compras">
            <div class="rejilla-compras-simple">
              <q-input
                :model-value="detalleCompraSeleccionada.nro_pedido"
                outlined
                label="Nro compra"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.proveedor"
                outlined
                label="Proveedor"
                disable
              />
              <q-input
                :model-value="detalleCompraSeleccionada.estado_label"
                outlined
                label="Estado actual"
                disable
              />
              <q-select
                v-model="formularioIngresoInventario.recepcionId"
                outlined
                emit-value
                map-options
                label="Recepcion pendiente"
                :options="opcionesRecepcionesPendientes"
                option-value="value"
                option-label="label"
                @update:model-value="actualizarRecepcionIngreso"
              />
            </div>

            <q-banner
              v-if="errorIngresoInventario"
              rounded
              class="bg-red-1 text-red-10"
            >
              {{ errorIngresoInventario }}
            </q-banner>

            <q-banner
              v-if="!recepcionesPendientesIngreso.length"
              rounded
              class="bg-blue-1 text-blue-10"
            >
              Esta compra no tiene recepciones pendientes de ingreso a
              inventario.
            </q-banner>

            <div v-else class="columna-compras">
              <q-card
                v-for="detalle in formularioIngresoInventario.detalles"
                :key="detalle.recepcionDetalleId"
                flat
                bordered
                class="tarjeta-compra-principal"
              >
                <q-card-section class="q-pa-lg">
                  <div
                    class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
                  >
                    <div>
                      <div class="text-subtitle1 text-weight-bold">
                        {{ detalle.detalleTexto }}
                      </div>
                      <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                        Cantidad recepcionada: {{ detalle.cantidadRecibida }} |
                        Costo: $ {{ formatearMonto(detalle.costoUsd) }} / Bs.
                        {{ formatearMonto(detalle.costoBs) }}
                      </p>
                    </div>
                    <q-toggle
                      v-model="detalle.crearProducto"
                      color="primary"
                      label="Crear producto nuevo"
                      left-label
                    />
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pa-lg">
                  <div class="rejilla-compras-simple">
                    <q-select
                      v-if="!detalle.crearProducto"
                      v-model="detalle.productoId"
                      outlined
                      emit-value
                      map-options
                      clearable
                      use-input
                      input-debounce="0"
                      label="Producto existente"
                      :options="opcionesProductosInventario"
                      option-value="value"
                      option-label="label"
                      @update:model-value="
                        seleccionarProductoExistenteIngreso(detalle, $event)
                      "
                    />
                    <q-input
                      v-model="detalle.modelo"
                      outlined
                      :disable="!detalle.crearProducto"
                      label="Modelo"
                    />
                    <div class="row items-center no-wrap q-gutter-sm">
                      <q-select
                        v-model="detalle.marcaId"
                        class="col"
                        outlined
                        emit-value
                        map-options
                        :disable="!detalle.crearProducto"
                        label="Marca"
                        :options="marcas"
                        option-value="value"
                        option-label="label"
                      />
                      <q-btn
                        v-if="detalle.crearProducto"
                        flat
                        round
                        dense
                        color="primary"
                        icon="add"
                        @click="dialogoMarcaAbierto = true"
                      >
                        <q-tooltip>Nueva marca</q-tooltip>
                      </q-btn>
                    </div>
                    <div class="row items-center no-wrap q-gutter-sm">
                      <q-select
                        v-model="detalle.categoriaId"
                        class="col"
                        outlined
                        emit-value
                        map-options
                        :disable="!detalle.crearProducto"
                        label="Categoria"
                        :options="categorias"
                        option-value="value"
                        option-label="label"
                      />
                      <q-btn
                        v-if="detalle.crearProducto"
                        flat
                        round
                        dense
                        color="primary"
                        icon="add"
                        @click="dialogoCategoriaAbierto = true"
                      >
                        <q-tooltip>Nueva categoria</q-tooltip>
                      </q-btn>
                    </div>
                    <q-input
                      :model-value="detalle.costoUsd"
                      outlined
                      disable
                      label="Costo USD"
                    />
                      <q-input
                        :model-value="detalle.costoBs"
                        outlined
                        disable
                        label="Costo Bs"
                      />
                    </div>

                    <div
                      v-if="!detalle.crearProducto && detalle.productoId"
                      class="rejilla-resumen-ingreso rejilla-resumen-ingreso--costos q-mt-md"
                    >
                      <div class="tarjeta-resumen-ingreso tarjeta-resumen-ingreso--neutral">
                        <div class="text-caption text-grey-7">Stock actual</div>
                        <div class="text-h6 text-weight-bold">
                          {{ detalle.stockActual }}
                        </div>
                      </div>
                      <div class="tarjeta-resumen-ingreso tarjeta-resumen-ingreso--done">
                        <div class="text-caption text-grey-7">Nuevo promedio estimado</div>
                        <div class="text-h6 text-weight-bold">
                          $ {{ formatearMonto(detalle.costoPromedioEstimadoUsd) }}
                        </div>
                        <div class="text-body2 text-grey-7">
                          Bs. {{ formatearMonto(detalle.costoPromedioEstimadoBs) }}
                        </div>
                      </div>
                      <div class="tarjeta-resumen-ingreso tarjeta-resumen-ingreso--neutral">
                        <div class="text-caption text-grey-7">Costo promedio actual</div>
                        <div class="text-h6 text-weight-bold">
                          $ {{ formatearMonto(detalle.costoPromedioActualUsd) }}
                        </div>
                        <div class="text-body2 text-grey-7">
                          Bs. {{ formatearMonto(detalle.costoPromedioActualBs) }}
                        </div>
                      </div>
                      <div class="tarjeta-resumen-ingreso tarjeta-resumen-ingreso--warning">
                        <div class="text-caption text-grey-7">Costo de esta compra</div>
                        <div class="text-h6 text-weight-bold">
                          $ {{ formatearMonto(detalle.costoUsd) }}
                        </div>
                        <div class="text-body2 text-grey-7">
                          Bs. {{ formatearMonto(detalle.costoBs) }}
                        </div>
                      </div>
                    </div>

                      <div
                        v-if="detalle.crearProducto"
                      class="columna-compras q-mt-md"
                    >
                    <div class="rejilla-compras-simple">
                      <q-input
                        v-model.number="detalle.tipoCambioVenta"
                        outlined
                        type="number"
                        min="0.0001"
                        step="0.01"
                        disable
                        label="Tipo cambio de compra"
                      />
                      <q-input
                        :model-value="detalle.precioUnitarioUsd"
                        outlined
                        type="number"
                        min="0"
                        step="0.01"
                        label="Precio unitario USD"
                        @update:model-value="
                          actualizarMontoVentaIngreso(
                            detalle,
                            'precioUnitario',
                            'usd',
                            $event
                          )
                        "
                      />
                      <q-input
                        :model-value="detalle.precioUnitarioBs"
                        outlined
                        type="number"
                        min="0"
                        step="0.01"
                        label="Precio unitario Bs"
                        @update:model-value="
                          actualizarMontoVentaIngreso(
                            detalle,
                            'precioUnitario',
                            'bs',
                            $event
                          )
                        "
                      />
                      <q-input
                        :model-value="detalle.precioMayoristaUsd"
                        outlined
                        type="number"
                        min="0"
                        step="0.01"
                        label="Precio mayorista USD"
                        @update:model-value="
                          actualizarMontoVentaIngreso(
                            detalle,
                            'precioMayorista',
                            'usd',
                            $event
                          )
                        "
                      />
                      <q-input
                        :model-value="detalle.precioMayoristaBs"
                        outlined
                        type="number"
                        min="0"
                        step="0.01"
                        label="Precio mayorista Bs"
                        @update:model-value="
                          actualizarMontoVentaIngreso(
                            detalle,
                            'precioMayorista',
                            'bs',
                            $event
                          )
                        "
                      />
                    </div>
                  </div>

                    <div class="rejilla-resumen-ingreso rejilla-resumen-ingreso--cantidades q-mt-md">
                    <div class="tarjeta-resumen-ingreso tarjeta-resumen-ingreso--neutral">
                      <div class="text-caption text-grey-7">Cantidad a ingresar</div>
                      <div class="text-h6 text-weight-bold">
                        {{ detalle.cantidadRecibida }}
                      </div>
                    </div>
                    <div class="tarjeta-resumen-ingreso tarjeta-resumen-ingreso--success">
                      <div class="text-caption text-grey-7">Distribuido</div>
                      <div class="text-h6 text-weight-bold">
                        {{ totalDistribuidoIngreso(detalle) }}
                      </div>
                    </div>
                    <div
                      class="tarjeta-resumen-ingreso"
                      :class="
                        cantidadPendienteDistribucion(detalle) > 0
                          ? 'tarjeta-resumen-ingreso--warning'
                          : 'tarjeta-resumen-ingreso--done'
                      "
                    >
                      <div class="text-caption text-grey-7">Pendiente distribuir</div>
                      <div class="text-h6 text-weight-bold">
                        {{ cantidadPendienteDistribucion(detalle) }}
                      </div>
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pa-lg">
                  <div class="text-subtitle2 text-weight-bold q-mb-md">
                    Distribucion por sucursal
                  </div>
                  <div class="rejilla-distribucion-sucursales">
                    <div
                      v-for="item in detalle.distribucionSucursales"
                      :key="`${detalle.recepcionDetalleId}-${item.sucursalId}`"
                      class="tarjeta-distribucion-sucursal"
                    >
                      <div class="text-subtitle2 text-weight-bold">
                        {{ item.sucursal }}
                      </div>
                      <div class="rejilla-distribucion-sucursal-campos q-mt-md">
                        <q-input
                          :model-value="item.cantidad"
                          outlined
                          dense
                          type="number"
                          min="0"
                          :max="detalle.cantidadRecibida"
                          label="Cantidad"
                          @update:model-value="
                            actualizarDistribucionIngreso(
                              detalle,
                              item.sucursalId,
                              $event
                            )
                          "
                        />
                        <q-input
                          v-model="item.observaciones"
                          outlined
                          dense
                          label="Observaciones"
                        />
                      </div>
                    </div>
                  </div>
                  <q-banner
                    v-if="cantidadPendienteDistribucion(detalle) > 0"
                    rounded
                    class="bg-amber-1 text-amber-10 q-mt-md"
                  >
                    Todavia faltan
                    {{ cantidadPendienteDistribucion(detalle) }}
                    unidad(es) por asignar a sucursales.
                  </q-banner>

                  <q-toggle
                    v-model="detalle.registrarSeries"
                    color="primary"
                    label="Registrar series"
                    left-label
                    class="q-mt-md"
                    @update:model-value="sincronizarSeriesIngreso(detalle)"
                  />

                  <div
                    v-if="detalle.registrarSeries"
                    class="contenedor-tabla-simple q-mt-md"
                  >
                    <q-markup-table flat bordered class="tabla-simple-compras">
                      <thead>
                        <tr>
                          <th class="text-left">Sucursal</th>
                          <th class="text-left">Numero de serie</th>
                          <th class="text-left">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="serie in detalle.series"
                          :key="serie.idTemporal"
                        >
                          <td>
                            {{
                              sucursales.find(
                                (item) => item.id === serie.sucursalId
                              )?.label || "Sucursal"
                            }}
                          </td>
                          <td class="columna-tabla-simple">
                            <q-input
                              v-model="serie.numeroSerie"
                              outlined
                              dense
                            />
                          </td>
                          <td
                            class="columna-tabla-simple columna-tabla-simple--detalle"
                          >
                            <q-input
                              v-model="serie.observaciones"
                              outlined
                              dense
                            />
                          </td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </div>
                </q-card-section>
              </q-card>

              <div class="row justify-end">
                <q-btn
                  unelevated
                  color="dark"
                  text-color="white"
                  label="Ingresar a inventario"
                  :loading="ingresandoInventario"
                  @click="guardarIngresoInventario"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoCerrarIncompletoAbierto">
      <q-card style="width: min(92vw, 560px)">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold">
              Cerrar compra como incompleta
            </div>
            <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
              Usa esta opcion solo si el proveedor ya no enviara lo pendiente.
            </p>
          </div>
            <q-btn
              flat
              round
              dense
              class="boton-cerrar-modal-compras"
              icon="close"
              @click="dialogoCerrarIncompletoAbierto = false"
            />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-banner
            v-if="errorCerrarIncompleto"
            rounded
            class="bg-red-1 text-red-10"
          >
            {{ errorCerrarIncompleto }}
          </q-banner>

          <q-input
            v-model="formularioCerrarIncompleto.observaciones"
            outlined
            type="textarea"
            autogrow
            label="Observaciones del cierre"
          />

          <q-banner rounded class="bg-grey-1 text-grey-9">
            Se calculara la devolucion pendiente con base en las cantidades
            faltantes y el precio original del pedido.
          </q-banner>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="dialogoCerrarIncompletoAbierto = false"
          />
          <q-btn
            unelevated
            color="negative"
            label="Confirmar cierre"
            :loading="cerrandoIncompleto"
            @click="cerrarIncompleto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoMarcaAbierto">
      <q-card style="width: min(92vw, 420px)">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Nueva marca</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="nuevaMarca" outlined label="Nombre de la marca" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="dialogoMarcaAbierto = false"
          />
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

    <q-dialog v-model="dialogoCategoriaAbierto">
      <q-card style="width: min(92vw, 420px)">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Nueva categoria</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="nuevaCategoria"
            outlined
            label="Nombre de la categoria"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="dialogoCategoriaAbierto = false"
          />
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

    <q-dialog v-model="dialogoAlertaCostoElevadoAbierto" persistent>
      <q-card style="width: min(92vw, 520px)">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div>
            <div class="text-h6 text-weight-bold text-red-10">Costo mas elevado</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="boton-cerrar-modal-compras"
            @click="dialogoAlertaCostoElevadoAbierto = false"
          />
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-red-1 text-red-10 text-h6 text-weight-bold">
            {{ alertaCostoElevadoMensaje }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            unelevated
            color="primary"
            label="Entendido"
            @click="dialogoAlertaCostoElevadoAbierto = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { computed, nextTick, onMounted, reactive, ref } from "vue";
  import { useQuasar } from "quasar";
  import { useRouter } from "vue-router";
  import { resolverUrlArchivo } from "src/services/auth";
import {
  actualizarGuiaCompra,
  cerrarCompraIncompleta,
  eliminarGuiaCompra,
  ingresarRecepcionInventario,
  listarCompras,
  obtenerDetalleCompra,
  obtenerFormularioCompra,
  registrarGuiaCompra,
  registrarPagoCredito,
  registrarRecepcionCompra,
} from "src/services/compras";
import {
  listarProductos,
  obtenerDatosFormularioProducto,
  registrarCategoria,
  registrarMarca,
} from "src/services/productos";

defineOptions({
  name: "ComprasListaPage",
});

const cargandoCompras = ref(false);
const cargandoDetalle = ref(false);
const guardandoPagoCredito = ref(false);
const guardandoGuia = ref(false);
const guardandoRecepcion = ref(false);
const cerrandoIncompleto = ref(false);
const ingresandoInventario = ref(false);
const errorGeneral = ref("");
const errorPagoCredito = ref("");
const errorGuia = ref("");
const errorRecepcion = ref("");
const errorCerrarIncompleto = ref("");
const errorIngresoInventario = ref("");
const compras = ref([]);
const tiposCompra = ref([]);
const sucursales = ref([]);
const cajas = ref([]);
const marcas = ref([]);
const categorias = ref([]);
const productosInventario = ref([]);
const dialogoDetalleAbierto = ref(false);
const dialogoPagosCreditoAbierto = ref(false);
const dialogoGuiasAbierto = ref(false);
const dialogoRecepcionAbierto = ref(false);
const dialogoCerrarIncompletoAbierto = ref(false);
const dialogoIngresoInventarioAbierto = ref(false);
const dialogoMarcaAbierto = ref(false);
const dialogoCategoriaAbierto = ref(false);
const dialogoAlertaCostoElevadoAbierto = ref(false);
const alertaCostoElevadoMensaje = ref("");
const detalleCompraSeleccionada = ref(null);
const $q = useQuasar();
const router = useRouter();
const guiaEditandoId = ref(null);
const guardandoMarca = ref(false);
const guardandoCategoria = ref(false);
const nuevaMarca = ref("");
const nuevaCategoria = ref("");
const filtros = reactive({
  nroPedido: "",
  proveedor: "",
  tipoCompra: null,
  estado: null,
});
const formularioPagoCredito = reactive(crearFormularioPagoCredito());
const formularioGuia = reactive(crearFormularioGuia());
const formularioRecepcion = reactive(crearFormularioRecepcion());
const formularioCerrarIncompleto = reactive(crearFormularioCerrarIncompleto());
const formularioIngresoInventario = reactive(
  crearFormularioIngresoInventario()
);

const columnasCompras = [
  {
    name: "nro_pedido",
    label: "Nro compra",
    align: "left",
    field: "nro_pedido",
  },
  { name: "proveedor", label: "Proveedor", align: "left", field: "proveedor" },
  {
    name: "fecha_pedido",
    label: "Fecha",
    align: "left",
    field: "fecha_pedido",
  },
  {
    name: "tipo_compra",
    label: "Tipo",
    align: "left",
    field: "tipo_compra_label",
  },
  { name: "estado", label: "Estado", align: "left", field: "estado_label" },
  {
    name: "estado_pago",
    label: "Pago",
    align: "left",
    field: "estado_pago_label",
  },
  {
    name: "total_productos",
    label: "Total",
    align: "left",
    field: "total_productos_usd",
  },
  { name: "acciones", label: "Acciones", align: "left", field: "id" },
];

const estadosCompra = [
  { value: "registrado", label: "Registrado" },
  {
    value: "pendiente_ingreso_inventario",
    label: "Pendiente de ingreso a inventario",
  },
  { value: "en_transito", label: "En transito" },
  { value: "pendiente_recepcion", label: "Pendiente de recepcion" },
  { value: "parcial", label: "Parcial" },
  { value: "completado", label: "Completado" },
  { value: "incompleto", label: "Incompleto" },
  { value: "cerrado", label: "Cerrado" },
];
const estadosGuia = [
  { value: "en_transito", label: "En transito" },
  { value: "recogido", label: "Recogido" },
];

const comprasFiltradas = computed(() => {
  const terminoProveedor = filtros.proveedor.trim().toLowerCase();
  const terminoNro = filtros.nroPedido.trim().toLowerCase();

  return compras.value.filter((compra) => {
    const coincideProveedor =
      !terminoProveedor ||
      String(compra.proveedor || "")
        .toLowerCase()
        .includes(terminoProveedor);
    const coincideNro =
      !terminoNro ||
      String(compra.nro_pedido || "")
        .toLowerCase()
        .includes(terminoNro);
    const coincideTipo =
      !filtros.tipoCompra || compra.tipo_compra === filtros.tipoCompra;
    const coincideEstado = !filtros.estado || compra.estado === filtros.estado;

    return coincideProveedor && coincideNro && coincideTipo && coincideEstado;
  });
});

const pagoCreditoPreviewUsd = computed(() =>
  formularioPagoCredito.pagos.reduce(
    (acumulado, pago) => acumulado + Number(pago.abonoUsd || 0),
    0
  )
);
const pagoCreditoPreviewBs = computed(() =>
  formularioPagoCredito.pagos.reduce(
    (acumulado, pago) => acumulado + Number(pago.abonoBs || 0),
    0
  )
);
const tipoCambioReferenciaCompra = computed(() => {
  const totalUsd = Number(detalleCompraSeleccionada.value?.total_productos_usd || 0);
  const totalBs = Number(detalleCompraSeleccionada.value?.total_productos_bs || 0);

  if (totalUsd > 0 && totalBs > 0) {
    return redondearMonto(totalBs / totalUsd);
  }

  return redondearMonto(
    Number(detalleCompraSeleccionada.value?.tipo_cambio_general || 0),
    6
  );
});
const referenciaPagoCreditoPreviewBs = computed(() =>
  formularioPagoCredito.pagos.reduce(
    (acumulado, pago) => acumulado + referenciaPagoCreditoFila(pago),
    0
  )
);
const saldoPendientePreviewUsd = computed(() => {
  const saldoActual = Number(
    detalleCompraSeleccionada.value?.saldo_pendiente_usd || 0
  );
  return Math.max(0, redondearMonto(saldoActual - pagoCreditoPreviewUsd.value));
});
const saldoPendientePreviewBs = computed(() => {
  const saldoActual = Number(
    detalleCompraSeleccionada.value?.saldo_pendiente_bs || 0
  );
  return Math.max(0, redondearMonto(saldoActual - pagoCreditoPreviewBs.value));
});
const referenciaPagadoPreviewBs = computed(() =>
  redondearMonto(
    Number(detalleCompraSeleccionada.value?.referencia_pagado_bs || 0) +
      referenciaPagoCreditoPreviewBs.value
  )
);
const diferenciaCambiariaPreviewBs = computed(() =>
  redondearMonto(
    Number(detalleCompraSeleccionada.value?.diferencia_cambiaria_total_bs || 0) +
      pagoCreditoPreviewBs.value -
      referenciaPagoCreditoPreviewBs.value
  )
);
const diferenciaCambiariaPreviewTipo = computed(() =>
  determinarTipoDiferenciaCambiaria(diferenciaCambiariaPreviewBs.value)
);
const guiasUsadasEnRecepcion = computed(() =>
  new Set(
    (detalleCompraSeleccionada.value?.recepciones || [])
      .map((recepcion) => recepcion.compra_guia_id)
      .filter(Boolean)
  )
);
const guiasRecogidasDisponibles = computed(() =>
  (detalleCompraSeleccionada.value?.guias || [])
    .filter((guia) => guia.estado === "recogido")
    .map((guia) => {
      const usada = guiasUsadasEnRecepcion.value.has(guia.id);
      return {
        value: guia.id,
        label: `${guia.fecha_registro} - Bs. ${formatearMonto(guia.monto_bs)}${
          usada ? " | Ya usada en recepcion" : ""
        }`,
        disable: usada,
      };
    })
);
const cantidadRecibidaTotal = computed(() =>
  (detalleCompraSeleccionada.value?.detalles || []).reduce(
    (acumulado, detalle) =>
      acumulado + Number(detalle.cantidad_recibida_acumulada || 0),
    0
  )
);
const cantidadPendienteTotal = computed(() =>
  (detalleCompraSeleccionada.value?.detalles || []).reduce(
    (acumulado, detalle) => acumulado + Number(detalle.cantidad_pendiente || 0),
    0
  )
);
const puedeRegistrarPagoCredito = computed(
  () =>
    detalleCompraSeleccionada.value?.tipo_compra === "a_credito" &&
    Number(detalleCompraSeleccionada.value?.saldo_pendiente_usd || 0) > 0.0001 &&
    detalleCompraSeleccionada.value?.estado_pago !== "pagado"
);
const puedeRegistrarGuias = computed(
  () =>
    Number(detalleCompraSeleccionada.value?.tiempo_entrega_dias || 0) > 0 &&
    Number(cantidadPendienteTotal.value || 0) > 0 &&
    !["completado", "incompleto", "cerrado"].includes(
      detalleCompraSeleccionada.value?.estado
    )
);
const puedeRegistrarRecepcion = computed(
  () =>
    Number(cantidadPendienteTotal.value || 0) > 0 &&
    !["completado", "incompleto", "cerrado"].includes(
      detalleCompraSeleccionada.value?.estado
    )
);
const opcionesProductosInventario = computed(() =>
  productosInventario.value.map((producto) => ({
    ...producto,
    value: producto.id,
    label: `${producto.modelo} | ${producto.marca} | ${producto.categoria}`,
    busqueda:
      `${producto.modelo} ${producto.marca} ${producto.categoria}`.toLowerCase(),
  }))
);
const recepcionesPendientesIngreso = computed(() =>
  (detalleCompraSeleccionada.value?.recepciones || []).filter(
    (recepcion) => recepcion.ingresado_inventario !== true
  )
);
const opcionesRecepcionesPendientes = computed(() =>
  recepcionesPendientesIngreso.value.map((recepcion) => ({
    value: recepcion.id,
    label: `${recepcion.fecha_recepcion} - ${recepcion.estado_recepcion_label}`,
  }))
);
const recepcionSeleccionadaIngreso = computed(
  () =>
    recepcionesPendientesIngreso.value.find(
      (recepcion) => recepcion.id === formularioIngresoInventario.recepcionId
    ) || null
);

function formatearMonto(valor) {
  return Number(valor || 0).toFixed(2);
}

function formatearMontoAbsoluto(valor) {
  return formatearMonto(Math.abs(Number(valor || 0)));
}

function determinarTipoDiferenciaCambiaria(diferenciaBs) {
  const diferencia = Number(diferenciaBs || 0);
  if (diferencia > 0.0001) return "perdida";
  if (diferencia < -0.0001) return "ahorro";
  return "sin_diferencia";
}

function etiquetaDiferenciaCambiaria(tipo) {
  if (tipo === "perdida") return "Perdida cambiaria";
  if (tipo === "ahorro") return "Ahorro cambiario";
  return "Sin diferencia cambiaria";
}

function claseTarjetaDiferenciaCambiaria(tipo) {
  if (tipo === "perdida") return "tarjeta-resumen-pago--danger";
  if (tipo === "ahorro") return "tarjeta-resumen-pago--success";
  return "tarjeta-resumen-pago--neutral";
}

function claseTextoDiferenciaCambiaria(tipo) {
  if (tipo === "perdida") return "text-negative";
  if (tipo === "ahorro") return "text-positive";
  return "text-grey-8";
}

function referenciaPagoCreditoFila(pago) {
  const tipoCambioReferencia = Number(tipoCambioReferenciaCompra.value || 0);
  return redondearMonto(Number(pago?.abonoUsd || 0) * tipoCambioReferencia);
}

function diferenciaPagoCreditoFila(pago) {
  return redondearMonto(
    Number(pago?.abonoBs || 0) - referenciaPagoCreditoFila(pago)
  );
}

function diferenciaPagoCreditoFilaTipo(pago) {
  return determinarTipoDiferenciaCambiaria(diferenciaPagoCreditoFila(pago));
}

function claseEstadoPago(estadoPago) {
  if (estadoPago === "pagado") return "badge-estado badge-estado--pagado";
  if (estadoPago === "pago_parcial")
    return "badge-estado badge-estado--parcial";
  return "badge-estado badge-estado--pendiente";
}

function claseEstadoCompra(estadoCompra) {
  if (estadoCompra === "completado") {
    return "badge-estado badge-estado--pagado";
  }

  if (estadoCompra === "incompleto") {
    return "badge-estado badge-estado--pendiente";
  }

  if (estadoCompra === "parcial") {
    return "badge-estado badge-estado--parcial";
  }

  if (estadoCompra === "pendiente_ingreso_inventario") {
    return "badge-estado badge-estado--inventario";
  }

  return "badge-estado badge-estado--neutro";
}

function puedeEditarCompra(compra) {
  return ["registrado", "pendiente_ingreso_inventario"].includes(
    compra?.estado
  );
}

function crearFormularioPagoCredito() {
  return {
    pagos: [crearFilaPagoCredito()],
  };
}

function crearFilaPagoCredito() {
  return {
    uid: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sucursalId: null,
    cajaId: null,
    fechaAbono: new Date().toISOString().slice(0, 10),
    tipoCambioAbono: 9,
    monedaReferencia: "usd",
    abonoUsd: 0,
    abonoBs: 0,
    observaciones: "",
  };
}

function crearFormularioGuia() {
  return {
    fechaRegistro: new Date().toISOString().slice(0, 10),
    montoBs: 0,
    estado: "en_transito",
    pagado: false,
    observaciones: "",
    fotoGuia: null,
    fotoUrlActual: "",
  };
}

function crearFormularioRecepcion() {
  return {
    compraGuiaId: null,
    fechaRecepcion: new Date().toISOString().slice(0, 10),
    observaciones: "",
    detalles: [],
  };
}

function crearFormularioCerrarIncompleto() {
  return {
    observaciones: "",
  };
}

function crearFormularioIngresoInventario() {
  return {
    recepcionId: null,
    detalles: [],
  };
}

function crearDetalleIngresoInventario(detalleRecepcion) {
  const detalleCompra = (detalleCompraSeleccionada.value?.detalles || []).find(
    (detalle) => detalle.id === detalleRecepcion.compra_detalle_id
  );
  const tipoCambioBase =
    Number(detalleCompra?.tipo_cambio_aplicado || 0) > 0
      ? redondearMonto(Number(detalleCompra?.tipo_cambio_aplicado || 0))
      : Number(detalleCompra?.precio_unitario_usd || 0) > 0
        ? redondearMonto(
            Number(detalleCompra?.precio_unitario_bs || 0) /
              Number(detalleCompra?.precio_unitario_usd || 1),
            6
          )
        : Number(tipoCambioReferenciaCompra.value || 9);

  const productoId = detalleCompra?.producto_id || null;
  const productoExistente = productoId
    ? productosInventario.value.find(
        (producto) => Number(producto.id) === Number(productoId)
      )
    : null;
  const sucursalesOrdenadas = ordenarSucursalesParaDistribucion(sucursales.value);

    const detalle = {
      recepcionDetalleId: detalleRecepcion.id,
      compraDetalleId: detalleRecepcion.compra_detalle_id,
      cantidadRecibida: Number(detalleRecepcion.cantidad_recibida || 0),
      detalleTexto: detalleRecepcion.detalle_texto,
    productoId,
    crearProducto: !productoId,
    modelo:
      productoExistente?.modelo ||
      detalleCompra?.producto_modelo ||
      detalleRecepcion.detalle_texto ||
      "",
    marcaId: productoExistente?.marca_id || detalleCompra?.marca_id || null,
    categoriaId:
      productoExistente?.categoria_id || detalleCompra?.categoria_id || null,
      costoUsd: Number(detalleCompra?.precio_unitario_usd || 0),
      costoBs: Number(detalleCompra?.precio_unitario_bs || 0),
      stockActual: Number(
        productoExistente?.existencias_totales ||
          productoExistente?.existencias_disponibles ||
          0
      ),
        costoPromedioActualUsd: Number(productoExistente?.costo_usd || 0),
        costoPromedioActualBs: Number(productoExistente?.costo_bs || 0),
        costoPromedioEstimadoUsd: 0,
        costoPromedioEstimadoBs: 0,
        alertaCostoElevadoMostrada: false,
        tipoCambioVenta: tipoCambioBase > 0 ? tipoCambioBase : 9,
        precioUnitarioUsd: 0,
        precioUnitarioBs: 0,
    precioMayoristaUsd: 0,
    precioMayoristaBs: 0,
    registrarSeries: false,
      distribucionSucursales: sucursalesOrdenadas.map((sucursal, indice) => ({
        sucursalId: sucursal.id,
        sucursal: sucursal.label,
        cantidad: 0,
        observaciones: "",
        })),
        series: [],
      };

    recalcularPromedioEstimadoIngreso(detalle);

    return detalle;
  }

  function recalcularPromedioEstimadoIngreso(detalle) {
    const stockActual = Number(detalle.stockActual || 0);
    const cantidadEntrante = Number(detalle.cantidadRecibida || 0);
    const costoActualUsd = Number(detalle.costoPromedioActualUsd || 0);
    const costoActualBs = Number(detalle.costoPromedioActualBs || 0);
    const costoCompraUsd = Number(detalle.costoUsd || 0);
    const costoCompraBs = Number(detalle.costoBs || 0);

    if (cantidadEntrante <= 0) {
      detalle.costoPromedioEstimadoUsd = redondearMonto(costoActualUsd);
      detalle.costoPromedioEstimadoBs = redondearMonto(costoActualBs);
      return;
    }

    if (stockActual <= 0) {
      detalle.costoPromedioEstimadoUsd = redondearMonto(costoCompraUsd);
      detalle.costoPromedioEstimadoBs = redondearMonto(costoCompraBs);
      return;
    }

    detalle.costoPromedioEstimadoUsd = redondearMonto(
      ((stockActual * costoActualUsd) + (cantidadEntrante * costoCompraUsd)) /
        (stockActual + cantidadEntrante)
    );
    detalle.costoPromedioEstimadoBs = redondearMonto(
      ((stockActual * costoActualBs) + (cantidadEntrante * costoCompraBs)) /
        (stockActual + cantidadEntrante)
    );
  }

  function costoCompraElevado(detalle) {
    const costoCompraUsd = Number(detalle?.costoUsd || 0);
    const costoActualUsd = Number(detalle?.costoPromedioActualUsd || 0);

    if (costoCompraUsd > 0 && costoActualUsd > 0) {
      return costoCompraUsd > costoActualUsd;
    }

    const costoCompraBs = Number(detalle?.costoBs || 0);
    const costoActualBs = Number(detalle?.costoPromedioActualBs || 0);

    if (costoCompraBs > 0 && costoActualBs > 0) {
      return costoCompraBs > costoActualBs;
    }

    return false;
  }

  function evaluarAlertaCostoElevado(detalle) {
    if (!costoCompraElevado(detalle)) {
      detalle.alertaCostoElevadoMostrada = false;
      return;
    }

    if (detalle.alertaCostoElevadoMostrada) {
      return;
    }

    detalle.alertaCostoElevadoMostrada = true;
    mostrarAlertaCostoElevado(detalle);
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

function ordenarSucursalesParaDistribucion(listaSucursales) {
  return [...listaSucursales].sort((a, b) => {
    const nombreA = String(a.label || a.nombre || "").toUpperCase();
    const nombreB = String(b.label || b.nombre || "").toUpperCase();
    const esRmaA = nombreA.includes("RMA");
    const esRmaB = nombreB.includes("RMA");

    if (esRmaA && !esRmaB) return -1;
    if (!esRmaA && esRmaB) return 1;

    return nombreA.localeCompare(nombreB);
  });
}

function opcionesCajasPagoCredito(sucursalId) {
  if (!sucursalId) {
    return [];
  }

  return cajas.value
    .filter((caja) => Number(caja.sucursal_id) === Number(sucursalId))
    .map((caja) => ({
      value: caja.id,
      label: `${caja.nombre} | ${caja.metodo_base_label} | ${caja.tipo_moneda_label} | Saldo ${caja.tipo_moneda === "usd" ? "$" : "Bs."} ${formatearMonto(caja.saldo_actual)}`,
    }));
}

  function mostrarNotificacion(tipo, mensaje) {
    if (typeof $q?.notify === "function") {
      $q.notify({
        type: tipo,
        message: mensaje,
      });
    }
  }

  function mostrarAlertaCostoElevado(detalle = null) {
    alertaCostoElevadoMensaje.value =
      "Solo se sugiere reajustar costos de venta.";
    dialogoAlertaCostoElevadoAbierto.value = true;
  }

function reiniciarFormularioPagoCredito() {
  Object.assign(formularioPagoCredito, crearFormularioPagoCredito());
}

function agregarFilaPagoCredito() {
  formularioPagoCredito.pagos.push(crearFilaPagoCredito());
}

function eliminarFilaPagoCredito(indice) {
  if (formularioPagoCredito.pagos.length === 1) {
    return;
  }

  formularioPagoCredito.pagos.splice(indice, 1);
}

function reiniciarFormularioGuia() {
  Object.assign(formularioGuia, crearFormularioGuia());
  guiaEditandoId.value = null;
}

function guiaYaRecepcionada(guia) {
  return guiasUsadasEnRecepcion.value.has(guia.id);
}

function reiniciarFormularioCerrarIncompleto() {
  Object.assign(formularioCerrarIncompleto, crearFormularioCerrarIncompleto());
}

function reiniciarFormularioIngresoInventario() {
  Object.assign(
    formularioIngresoInventario,
    crearFormularioIngresoInventario()
  );
}

function cargarFormularioRecepcionDesdeCompra() {
  Object.assign(formularioRecepcion, {
    ...crearFormularioRecepcion(),
    detalles: (detalleCompraSeleccionada.value?.detalles || []).map(
      (detalle) => ({
        compraDetalleId: detalle.id,
        detalleTexto: detalle.detalle_texto,
        cantidadPedida: Number(detalle.cantidad_pedida || 0),
        cantidadRecibidaAcumulada: Number(
          detalle.cantidad_recibida_acumulada || 0
        ),
        cantidadPendiente: Number(detalle.cantidad_pendiente || 0),
        cantidadRecibida: 0,
        observaciones: "",
      })
    ),
  });
}

function cargarFormularioIngresoInventarioDesdeCompra() {
  const recepcionPendiente = recepcionesPendientesIngreso.value[0] || null;

  Object.assign(formularioIngresoInventario, {
    ...crearFormularioIngresoInventario(),
    recepcionId: recepcionPendiente?.id || null,
    detalles: (recepcionPendiente?.detalles || []).map((detalleRecepcion) =>
      crearDetalleIngresoInventario(detalleRecepcion)
    ),
  });
}

function actualizarRecepcionIngreso(recepcionId) {
  const recepcion =
    recepcionesPendientesIngreso.value.find(
      (item) => item.id === recepcionId
    ) || null;
  formularioIngresoInventario.recepcionId = recepcionId;
  formularioIngresoInventario.detalles = (recepcion?.detalles || []).map(
    (detalleRecepcion) => crearDetalleIngresoInventario(detalleRecepcion)
  );
}

function sincronizarSeriesIngreso(detalle) {
  if (!detalle.registrarSeries) {
    detalle.series = [];
    return;
  }

  const nuevasSeries = [];

  detalle.distribucionSucursales.forEach((item) => {
    const cantidad = Math.max(0, Math.trunc(normalizarNumero(item.cantidad)));
    item.cantidad = cantidad;

    for (let indice = 0; indice < cantidad; indice += 1) {
      const existentesSucursal = detalle.series.filter(
        (serie) => serie.sucursalId === item.sucursalId
      );
      const existente = existentesSucursal[indice];

      nuevasSeries.push(
        existente || {
          idTemporal: `${detalle.recepcionDetalleId}-${item.sucursalId}-${indice}`,
          sucursalId: item.sucursalId,
          numeroSerie: "",
          observaciones: "",
        }
      );
    }
  });

  detalle.series = nuevasSeries;
}

function actualizarDistribucionIngreso(detalle, sucursalId, valor) {
  const fila = detalle.distribucionSucursales.find(
    (item) => item.sucursalId === sucursalId
  );
  if (!fila) {
    return;
  }

  const cantidadSolicitada = Math.max(0, Math.trunc(normalizarNumero(valor)));
  const totalOtrasSucursales = detalle.distribucionSucursales.reduce(
    (total, item) =>
      item.sucursalId === sucursalId ? total : total + Number(item.cantidad || 0),
    0
  );
  const cantidadDisponible = Math.max(
    0,
    Number(detalle.cantidadRecibida || 0) - totalOtrasSucursales
  );
  const cantidadFinal = Math.min(cantidadSolicitada, cantidadDisponible);

  fila.cantidad = cantidadFinal;

  if (cantidadSolicitada > cantidadDisponible) {
    mostrarNotificacion(
      "warning",
      `No puedes asignar mas de ${cantidadDisponible} unidad(es) a "${fila.sucursal}" en "${detalle.detalleTexto}".`
    );
  }

  sincronizarSeriesIngreso(detalle);
}

  function totalDistribuidoIngreso(detalle) {
    return detalle.distribucionSucursales.reduce(
      (total, item) => total + Number(item.cantidad || 0),
      0
    );
  }

  function cantidadPendienteDistribucion(detalle) {
    return Math.max(
      0,
      Number(detalle.cantidadRecibida || 0) - totalDistribuidoIngreso(detalle)
    );
  }

function actualizarMontoVentaIngreso(detalle, prefijo, monedaOrigen, valor) {
  const tipoCambio = Math.max(
      0.01,
      limitarDosDecimales(normalizarNumero(detalle.tipoCambioVenta))
    );
  detalle.tipoCambioVenta = tipoCambio;
  const monto = limitarDosDecimales(valor);

  if (monedaOrigen === "usd") {
    detalle[`${prefijo}Usd`] = monto;
    detalle[`${prefijo}Bs`] = redondearMonto(monto * tipoCambio);
    return;
  }

  detalle[`${prefijo}Bs`] = monto;
  detalle[`${prefijo}Usd`] = redondearMonto(monto / tipoCambio);
}

function sincronizarMontosVentaDesdeTipoCambio(detalle) {
  actualizarMontoVentaIngreso(
    detalle,
    "precioUnitario",
    "usd",
    detalle.precioUnitarioUsd
  );
  actualizarMontoVentaIngreso(
    detalle,
    "precioMayorista",
    "usd",
    detalle.precioMayoristaUsd
  );
}

  function seleccionarProductoExistenteIngreso(detalle, productoId) {
    detalle.productoId = productoId;
    const producto = productosInventario.value.find(
      (item) => Number(item.id) === Number(productoId)
    );

    if (!producto) {
      detalle.crearProducto = true;
      detalle.stockActual = 0;
      detalle.costoPromedioActualUsd = 0;
      detalle.costoPromedioActualBs = 0;
      detalle.costoPromedioEstimadoUsd = 0;
      detalle.costoPromedioEstimadoBs = 0;
      return;
    }

    detalle.crearProducto = false;
    detalle.modelo = producto.modelo;
    detalle.marcaId = producto.marca_id;
    detalle.categoriaId = producto.categoria_id;
    detalle.stockActual = Number(
      producto.existencias_totales || producto.existencias_disponibles || 0
    );
    detalle.costoPromedioActualUsd = Number(producto.costo_usd || 0);
    detalle.costoPromedioActualBs = Number(producto.costo_bs || 0);
    recalcularPromedioEstimadoIngreso(detalle);
    evaluarAlertaCostoElevado(detalle);
  }

function recalcularPagoCredito(pago) {
  const tipoCambio = Math.max(
      0.01,
      limitarDosDecimales(normalizarNumero(pago.tipoCambioAbono))
    );
  pago.tipoCambioAbono = tipoCambio;

  if (pago.monedaReferencia === "bs") {
    pago.abonoBs = redondearMonto(pago.abonoBs);
    pago.abonoUsd = redondearMonto(pago.abonoBs / tipoCambio);
  } else {
    pago.monedaReferencia = "usd";
    pago.abonoUsd = redondearMonto(pago.abonoUsd);
    pago.abonoBs = redondearMonto(pago.abonoUsd * tipoCambio);
  }
}

function actualizarMontoPagoCredito(pago, monedaOrigen, valor) {
  pago.monedaReferencia = monedaOrigen;
  if (monedaOrigen === "usd") {
    pago.abonoUsd = limitarDosDecimales(valor);
  } else {
    pago.abonoBs = limitarDosDecimales(valor);
  }

  recalcularPagoCredito(pago);
}

function validarPagoCredito() {
  const filaSinSucursal = formularioPagoCredito.pagos.find(
    (pago) => !pago.sucursalId
  );
  if (filaSinSucursal) {
    return "Selecciona la sucursal en cada abono.";
  }

  const filaSinCaja = formularioPagoCredito.pagos.find(
    (pago) => !pago.cajaId
  );
  if (filaSinCaja) {
    return "Selecciona la caja en cada abono.";
  }

  const filaSinFecha = formularioPagoCredito.pagos.find(
    (pago) => !pago.fechaAbono
  );
  if (filaSinFecha) {
    return "La fecha del pago es obligatoria en cada abono.";
  }

  const filaMontoInvalido = formularioPagoCredito.pagos.find(
    (pago) => Number(pago.abonoUsd || 0) <= 0
  );
  if (filaMontoInvalido) {
    return "Cada abono debe ser mayor a cero en USD.";
  }

  if (
    pagoCreditoPreviewUsd.value >
    Number(detalleCompraSeleccionada.value?.saldo_pendiente_usd || 0) + 0.0001
  ) {
    return "La suma de abonos no puede sobrepasar el saldo pendiente.";
  }

  return "";
}

function validarGuia() {
  if (!formularioGuia.fechaRegistro) {
    return "La fecha de la guia es obligatoria.";
  }

  if (Number(formularioGuia.montoBs || 0) < 0) {
    return "El monto de la guia no puede ser negativo.";
  }

  return "";
}

function validarRecepcion() {
  if (!formularioRecepcion.fechaRecepcion) {
    return "La fecha de recepcion es obligatoria.";
  }

  if (
    Number(detalleCompraSeleccionada.value?.tiempo_entrega_dias || 0) > 0 &&
    !formularioRecepcion.compraGuiaId
  ) {
    return "Debes seleccionar una guia recogida para registrar esta recepcion.";
  }

  const tieneCantidades = formularioRecepcion.detalles.some(
    (detalle) => Number(detalle.cantidadRecibida || 0) > 0
  );
  if (!tieneCantidades) {
    return "Debes registrar al menos una cantidad que llego hoy.";
  }

  const detalleExcedido = formularioRecepcion.detalles.find(
    (detalle) =>
      Number(detalle.cantidadRecibida || 0) >
      Number(detalle.cantidadPendiente || 0)
  );
  if (detalleExcedido) {
    return "Una de las lineas supera la cantidad pendiente por recepcionar.";
  }

  return "";
}

async function cargarCompras() {
  cargandoCompras.value = true;
  errorGeneral.value = "";

  try {
    const datos = await listarCompras();
    compras.value = datos.compras || [];
  } catch (error) {
    errorGeneral.value =
      error.message || "No se pudo cargar la lista de compras.";
  } finally {
    cargandoCompras.value = false;
  }
}

async function cargarFormularioBasico() {
  const [datosCompras, datosProductos, productos] = await Promise.all([
    obtenerFormularioCompra(),
    obtenerDatosFormularioProducto(),
    listarProductos(),
  ]);

  tiposCompra.value = datosCompras.tipos_compra || [];
  sucursales.value = datosCompras.sucursales || datosProductos.sucursales || [];
  cajas.value = datosCompras.cajas || [];
  marcas.value = datosProductos.marcas || [];
  categorias.value = datosProductos.categorias || [];
  productosInventario.value = productos.productos || [];
}

async function abrirDetalle(idCompra) {
  dialogoDetalleAbierto.value = true;
  dialogoPagosCreditoAbierto.value = false;
  dialogoGuiasAbierto.value = false;
  dialogoRecepcionAbierto.value = false;
  dialogoIngresoInventarioAbierto.value = false;
  cargandoDetalle.value = true;
  detalleCompraSeleccionada.value = null;

  try {
    const respuesta = await obtenerDetalleCompra(idCompra);
    detalleCompraSeleccionada.value = respuesta.compra || null;
  } catch (error) {
    errorGeneral.value =
      error.message || "No se pudo cargar el detalle de la compra.";
    dialogoDetalleAbierto.value = false;
  } finally {
    cargandoDetalle.value = false;
  }
}

async function abrirPagosCredito(idCompra) {
  dialogoPagosCreditoAbierto.value = true;
  dialogoDetalleAbierto.value = false;
  dialogoGuiasAbierto.value = false;
  dialogoRecepcionAbierto.value = false;
  dialogoIngresoInventarioAbierto.value = false;
  cargandoDetalle.value = true;
  detalleCompraSeleccionada.value = null;
  errorPagoCredito.value = "";
  reiniciarFormularioPagoCredito();

  try {
    const respuesta = await obtenerDetalleCompra(idCompra);
    detalleCompraSeleccionada.value = respuesta.compra || null;
  } catch (error) {
    errorGeneral.value =
      error.message || "No se pudo cargar los pagos de la compra.";
    dialogoPagosCreditoAbierto.value = false;
  } finally {
    cargandoDetalle.value = false;
  }
}

async function abrirGuias(idCompra) {
  dialogoGuiasAbierto.value = true;
  dialogoDetalleAbierto.value = false;
  dialogoPagosCreditoAbierto.value = false;
  dialogoRecepcionAbierto.value = false;
  dialogoIngresoInventarioAbierto.value = false;
  cargandoDetalle.value = true;
  detalleCompraSeleccionada.value = null;
  errorGuia.value = "";
  reiniciarFormularioGuia();

  try {
    const respuesta = await obtenerDetalleCompra(idCompra);
    detalleCompraSeleccionada.value = respuesta.compra || null;
  } catch (error) {
    errorGeneral.value =
      error.message || "No se pudo cargar las guias de la compra.";
    dialogoGuiasAbierto.value = false;
  } finally {
    cargandoDetalle.value = false;
  }
}

async function abrirRecepcion(idCompra) {
  dialogoRecepcionAbierto.value = true;
  dialogoDetalleAbierto.value = false;
  dialogoPagosCreditoAbierto.value = false;
  dialogoGuiasAbierto.value = false;
  dialogoCerrarIncompletoAbierto.value = false;
  dialogoIngresoInventarioAbierto.value = false;
  cargandoDetalle.value = true;
  detalleCompraSeleccionada.value = null;
  errorRecepcion.value = "";
  errorCerrarIncompleto.value = "";
  reiniciarFormularioCerrarIncompleto();

  try {
    const respuesta = await obtenerDetalleCompra(idCompra);
    detalleCompraSeleccionada.value = respuesta.compra || null;
    cargarFormularioRecepcionDesdeCompra();
  } catch (error) {
    errorGeneral.value =
      error.message || "No se pudo cargar la recepcion de la compra.";
    dialogoRecepcionAbierto.value = false;
  } finally {
    cargandoDetalle.value = false;
  }
}

  async function abrirIngresoInventario(idCompra) {
    dialogoIngresoInventarioAbierto.value = true;
  dialogoDetalleAbierto.value = false;
  dialogoPagosCreditoAbierto.value = false;
  dialogoGuiasAbierto.value = false;
  dialogoRecepcionAbierto.value = false;
  dialogoCerrarIncompletoAbierto.value = false;
  cargandoDetalle.value = true;
  detalleCompraSeleccionada.value = null;
  errorIngresoInventario.value = "";
  reiniciarFormularioIngresoInventario();

    try {
      await cargarFormularioBasico();
      const respuesta = await obtenerDetalleCompra(idCompra);
      detalleCompraSeleccionada.value = respuesta.compra || null;
      cargarFormularioIngresoInventarioDesdeCompra();
      await nextTick();
      formularioIngresoInventario.detalles.forEach((detalle) => {
        detalle.alertaCostoElevadoMostrada = false;
        evaluarAlertaCostoElevado(detalle);
      });
    } catch (error) {
      errorGeneral.value =
        error.message ||
      "No se pudo cargar el ingreso a inventario de la compra.";
    dialogoIngresoInventarioAbierto.value = false;
  } finally {
    cargandoDetalle.value = false;
  }
}

async function guardarPagoCredito() {
  errorPagoCredito.value = "";

  const errorValidacion = validarPagoCredito();
  if (errorValidacion) {
    errorPagoCredito.value = errorValidacion;
    return;
  }

  if (!detalleCompraSeleccionada.value?.id) {
    errorPagoCredito.value = "No se encontro la compra a pagar.";
    return;
  }

  guardandoPagoCredito.value = true;

  try {
    let respuesta = null;

    for (const pago of formularioPagoCredito.pagos) {
      respuesta = await registrarPagoCredito(detalleCompraSeleccionada.value.id, {
        sucursal_id: pago.sucursalId,
        caja_id: pago.cajaId,
        fecha_abono: pago.fechaAbono,
        tipo_cambio_abono: Number(pago.tipoCambioAbono || 0),
        moneda_referencia: pago.monedaReferencia,
        abono_usd: Number(pago.abonoUsd || 0),
        abono_bs: Number(pago.abonoBs || 0),
        observaciones: pago.observaciones.trim() || null,
      });
    }

    detalleCompraSeleccionada.value = respuesta?.compra || null;
    await cargarCompras();
    reiniciarFormularioPagoCredito();
    mostrarNotificacion(
      "positive",
      respuesta?.message || "Pagos registrados correctamente."
    );
  } catch (error) {
    errorPagoCredito.value = error.message || "No se pudo registrar el pago.";
  } finally {
    guardandoPagoCredito.value = false;
  }
}

async function guardarGuia() {
  errorGuia.value = "";
  const esEdicion = Boolean(guiaEditandoId.value);

  const errorValidacion = validarGuia();
  if (errorValidacion) {
    errorGuia.value = errorValidacion;
    return;
  }

  if (!detalleCompraSeleccionada.value?.id) {
    errorGuia.value = "No se encontro la compra para registrar la guia.";
    return;
  }

  guardandoGuia.value = true;

  try {
      const payload = {
        fecha_registro: formularioGuia.fechaRegistro,
        monto_bs: Number(formularioGuia.montoBs || 0),
        estado: formularioGuia.estado,
        pagado: formularioGuia.pagado,
        observaciones: formularioGuia.observaciones.trim() || null,
        foto_guia: formularioGuia.fotoGuia || null,
      };

    const respuesta = guiaEditandoId.value
      ? await actualizarGuiaCompra(guiaEditandoId.value, payload)
      : await registrarGuiaCompra(detalleCompraSeleccionada.value.id, payload);

    detalleCompraSeleccionada.value = respuesta.compra || null;
    await cargarCompras();
    reiniciarFormularioGuia();
    mostrarNotificacion(
      "positive",
      respuesta.message ||
        (esEdicion
          ? "Guia actualizada correctamente."
          : "Guia guardada correctamente.")
    );
    dialogoGuiasAbierto.value = false;
  } catch (error) {
    errorGuia.value = error.message || "No se pudo registrar la guia.";
  } finally {
    guardandoGuia.value = false;
  }
}

function editarGuia(guia) {
  if (guiaYaRecepcionada(guia)) {
    mostrarNotificacion(
      "warning",
      "Esta guia ya fue usada en una recepcion y no se puede editar."
    );
    return;
  }

  guiaEditandoId.value = guia.id;
  Object.assign(formularioGuia, {
    fechaRegistro: guia.fecha_registro || new Date().toISOString().slice(0, 10),
    montoBs: Number(guia.monto_bs || 0),
    estado: guia.estado || "en_transito",
    pagado: Boolean(guia.pagado),
    observaciones: guia.observaciones || "",
    fotoGuia: null,
    fotoUrlActual: guia.foto_url || "",
  });
}

function eliminarGuia(guia) {
  if (guiaYaRecepcionada(guia)) {
    mostrarNotificacion(
      "warning",
      "Esta guia ya fue usada en una recepcion y no se puede eliminar."
    );
    return;
  }

  $q.dialog({
    title: "Eliminar guia",
    message: "Esta accion eliminara la guia seleccionada. Deseas continuar?",
    cancel: true,
    persistent: true,
    ok: {
      color: "negative",
      label: "Eliminar",
      unelevated: true,
    },
    cancel: {
      flat: true,
      label: "Cancelar",
    },
  }).onOk(async () => {
    try {
      const respuesta = await eliminarGuiaCompra(guia.id);
      detalleCompraSeleccionada.value = respuesta.compra || null;
      await cargarCompras();
      mostrarNotificacion(
        "positive",
        respuesta.message || "Guia eliminada correctamente."
      );
    } catch (error) {
      mostrarNotificacion(
        "negative",
        error.message || "No se pudo eliminar la guia."
      );
    }
  });
}

async function guardarRecepcion() {
  errorRecepcion.value = "";

  const errorValidacion = validarRecepcion();
  if (errorValidacion) {
    errorRecepcion.value = errorValidacion;
    return;
  }

  if (!detalleCompraSeleccionada.value?.id) {
    errorRecepcion.value =
      "No se encontro la compra para registrar la recepcion.";
    return;
  }

  guardandoRecepcion.value = true;

  try {
    const respuesta = await registrarRecepcionCompra(
      detalleCompraSeleccionada.value.id,
      {
        compra_guia_id: formularioRecepcion.compraGuiaId || null,
        fecha_recepcion: formularioRecepcion.fechaRecepcion,
        observaciones: formularioRecepcion.observaciones.trim() || null,
        detalles: formularioRecepcion.detalles
          .filter((detalle) => Number(detalle.cantidadRecibida || 0) > 0)
          .map((detalle) => ({
            compra_detalle_id: detalle.compraDetalleId,
            cantidad_recibida: Number(detalle.cantidadRecibida || 0),
            observaciones: detalle.observaciones.trim() || null,
          })),
      }
    );

    detalleCompraSeleccionada.value = respuesta.compra || null;
    await cargarCompras();
    cargarFormularioRecepcionDesdeCompra();
    mostrarNotificacion(
      "positive",
      respuesta.message || "Recepcion registrada correctamente."
    );
  } catch (error) {
    errorRecepcion.value =
      error.message || "No se pudo registrar la recepcion.";
  } finally {
    guardandoRecepcion.value = false;
  }
}

async function cerrarIncompleto() {
  errorCerrarIncompleto.value = "";

  if (!detalleCompraSeleccionada.value?.id) {
    errorCerrarIncompleto.value =
      "No se encontro la compra para cerrar como incompleta.";
    return;
  }

  if (Number(cantidadPendienteTotal.value || 0) <= 0) {
    errorCerrarIncompleto.value =
      "La compra ya no tiene cantidades pendientes.";
    return;
  }

  cerrandoIncompleto.value = true;

  try {
    const respuesta = await cerrarCompraIncompleta(
      detalleCompraSeleccionada.value.id,
      {
        confirmar_cierre: true,
        observaciones: formularioCerrarIncompleto.observaciones.trim() || null,
      }
    );

    detalleCompraSeleccionada.value = respuesta.compra || null;
    await cargarCompras();
    dialogoCerrarIncompletoAbierto.value = false;
    reiniciarFormularioCerrarIncompleto();
    mostrarNotificacion(
      "positive",
      respuesta.message || "Compra cerrada como incompleta."
    );
  } catch (error) {
    errorCerrarIncompleto.value =
      error.message || "No se pudo cerrar la compra como incompleta.";
  } finally {
    cerrandoIncompleto.value = false;
  }
}

function validarIngresoInventario() {
  if (!formularioIngresoInventario.recepcionId) {
    return "Selecciona una recepcion pendiente para ingresar al inventario.";
  }

  if (!formularioIngresoInventario.detalles.length) {
    return "La recepcion seleccionada no tiene lineas para ingresar.";
  }

  for (const detalle of formularioIngresoInventario.detalles) {
    const cantidadDistribuida = detalle.distribucionSucursales.reduce(
      (total, item) => total + Number(item.cantidad || 0),
      0
    );

    if (cantidadDistribuida !== Number(detalle.cantidadRecibida || 0)) {
      return `La distribucion del detalle "${detalle.detalleTexto}" debe coincidir con la cantidad recibida.`;
    }

    if (detalle.crearProducto) {
      if (!detalle.modelo || !detalle.marcaId || !detalle.categoriaId) {
        return `Completa modelo, marca y categoria para el detalle "${detalle.detalleTexto}".`;
      }

      if (
        Number(detalle.precioUnitarioUsd || 0) < 0 ||
        Number(detalle.precioUnitarioBs || 0) < 0
      ) {
        return `Los precios unitarios del detalle "${detalle.detalleTexto}" no son validos.`;
      }
    } else if (!detalle.productoId) {
      return `Selecciona un producto existente o marca crear producto para "${detalle.detalleTexto}".`;
    }

    if (
      detalle.registrarSeries &&
      detalle.series.length !== Number(detalle.cantidadRecibida || 0)
    ) {
      return `Debes registrar una serie por cada unidad del detalle "${detalle.detalleTexto}".`;
    }
  }

  return "";
}

async function guardarIngresoInventario() {
  errorIngresoInventario.value = "";

  const errorValidacion = validarIngresoInventario();
  if (errorValidacion) {
    errorIngresoInventario.value = errorValidacion;
    return;
  }

  ingresandoInventario.value = true;

  try {
    const respuesta = await ingresarRecepcionInventario(
      formularioIngresoInventario.recepcionId,
      {
        detalles: formularioIngresoInventario.detalles.map((detalle) => ({
          recepcion_detalle_id: detalle.recepcionDetalleId,
          producto_id: detalle.crearProducto ? null : detalle.productoId,
          crear_producto: detalle.crearProducto === true,
          modelo: detalle.crearProducto ? detalle.modelo.trim() : null,
          marca_id: detalle.crearProducto ? detalle.marcaId : null,
          categoria_id: detalle.crearProducto ? detalle.categoriaId : null,
          tipo_cambio_venta: detalle.crearProducto
            ? Number(detalle.tipoCambioVenta || 0)
            : null,
          precio_unitario_usd: detalle.crearProducto
            ? Number(detalle.precioUnitarioUsd || 0)
            : null,
          precio_unitario_bs: detalle.crearProducto
            ? Number(detalle.precioUnitarioBs || 0)
            : null,
          precio_mayorista_usd: detalle.crearProducto
            ? Number(detalle.precioMayoristaUsd || 0)
            : null,
          precio_mayorista_bs: detalle.crearProducto
            ? Number(detalle.precioMayoristaBs || 0)
            : null,
          registrar_series: detalle.registrarSeries === true,
          distribucion_sucursales: detalle.distribucionSucursales.map(
            (item) => ({
              sucursal_id: item.sucursalId,
              cantidad: Number(item.cantidad || 0),
            })
          ),
          series: detalle.series.map((serie) => ({
            sucursal_id: serie.sucursalId,
            numero_serie: serie.numeroSerie || null,
            observaciones: serie.observaciones || null,
          })),
        })),
      }
    );

      detalleCompraSeleccionada.value = respuesta.compra || null;
      await Promise.all([cargarCompras(), cargarFormularioBasico()]);
      mostrarNotificacion(
        "positive",
        respuesta.message || "Productos enviados al inventario correctamente."
      );
      dialogoIngresoInventarioAbierto.value = false;
      reiniciarFormularioIngresoInventario();
      await router.push("/inventario");
    } catch (error) {
    errorIngresoInventario.value =
      error.message || "No se pudo ingresar la recepcion al inventario.";
  } finally {
    ingresandoInventario.value = false;
  }
}

async function guardarMarcaNueva() {
  if (!nuevaMarca.value.trim()) {
    errorIngresoInventario.value = "Ingresa el nombre de la marca.";
    return;
  }

  guardandoMarca.value = true;

  try {
    const respuesta = await registrarMarca(nuevaMarca.value.trim());
    marcas.value = [...marcas.value, respuesta.marca].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    nuevaMarca.value = "";
    dialogoMarcaAbierto.value = false;
    mostrarNotificacion(
      "positive",
      respuesta.message || "Marca registrada correctamente."
    );
  } catch (error) {
    errorIngresoInventario.value =
      error.message || "No se pudo registrar la marca.";
  } finally {
    guardandoMarca.value = false;
  }
}

async function guardarCategoriaNueva() {
  if (!nuevaCategoria.value.trim()) {
    errorIngresoInventario.value = "Ingresa el nombre de la categoria.";
    return;
  }

  guardandoCategoria.value = true;

  try {
    const respuesta = await registrarCategoria(nuevaCategoria.value.trim());
    categorias.value = [...categorias.value, respuesta.categoria].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    nuevaCategoria.value = "";
    dialogoCategoriaAbierto.value = false;
    mostrarNotificacion(
      "positive",
      respuesta.message || "Categoria registrada correctamente."
    );
  } catch (error) {
    errorIngresoInventario.value =
      error.message || "No se pudo registrar la categoria.";
  } finally {
    guardandoCategoria.value = false;
  }
}

onMounted(async () => {
  await Promise.all([cargarFormularioBasico(), cargarCompras()]);
});
</script>
