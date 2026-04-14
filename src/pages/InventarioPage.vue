<template>
  <q-page class="pagina-inventario q-pa-lg">
    <q-card flat bordered class="tarjeta-busqueda-inventario">
      <q-card-section class="q-pa-md">
        <div class="cabecera-superior-inventario">
          <q-input
            v-model="busqueda"
            outlined
            dense
            label="Buscar"
            clearable
            class="buscador-inventario"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>

          <div class="acciones-superiores-inventario">
            <q-chip square color="grey-2" text-color="dark" icon="store">
              {{ sucursalActual || "Sin sucursal asignada" }}
            </q-chip>

            <q-btn
              v-if="puedeVender"
              flat
              round
              color="grey-8"
              icon="shopping_cart"
              @click="irAVentas"
            >
              <q-badge
                v-if="cantidadItemsCarrito > 0"
                floating
                rounded
                color="primary"
              >
                {{ cantidadItemsCarrito }}
              </q-badge>
              <q-tooltip>Carrito de ventas</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="grey-8"
              icon="notifications"
              @click="abrirDialogoSolicitudes"
            >
              <q-badge
                v-if="cantidadNotificacionesPendientes > 0"
                floating
                rounded
                color="negative"
              >
                {{ cantidadNotificacionesPendientes }}
              </q-badge>
              <q-tooltip>Solicitudes y notificaciones</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="tarjeta-inventario q-mt-lg">
      <q-card-section class="q-pa-none">
        <div class="cabecera-inventario q-pa-md">
          <div>
            <div class="text-h6 text-weight-bold">Inventario general</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              Cada fila representa un producto y las sucursales se muestran como
              columnas de existencias.
            </div>
          </div>

          <q-badge color="grey-9" rounded>
            {{ filasInventario.length }} resultados
          </q-badge>
        </div>

        <div class="contenedor-tabla-inventario">
          <q-table
            flat
            :rows="filasInventario"
            :columns="columnasInventario"
            row-key="id"
            :loading="cargando"
            hide-pagination
            :rows-per-page-options="[0]"
            no-data-label="No hay productos para mostrar en inventario."
            table-class="tabla-inventario"
          >
            <template
              v-for="sucursal in sucursalesOrdenadas"
              :key="`encabezado-${sucursal.id}`"
              #[`header-cell-sucursal_${sucursal.id}`]="propiedades"
            >
              <q-th
                :props="propiedades"
                :class="[
                  'encabezado-sucursal-inventario',
                  claseSucursal(sucursal.nombre),
                ]"
              >
                {{ propiedades.col.label }}
              </q-th>
            </template>

            <template #body-cell-acciones="propiedades">
              <q-td :props="propiedades" class="celda-acciones-inventario">
                <q-btn
                  v-if="puedeVender"
                  flat
                  round
                  dense
                  icon="add_shopping_cart"
                  color="primary"
                  :disable="!puedeAgregarCarrito(propiedades.row)"
                  @click="agregarProductoCarritoDesdeInventario(propiedades.row)"
                >
                  <q-tooltip>
                    {{ tooltipCarrito(propiedades.row) }}
                  </q-tooltip>
                </q-btn>

                <q-btn
                  v-if="puedeGestionarProductos"
                  flat
                  round
                  dense
                  icon="edit"
                  color="grey-8"
                  @click="abrirDialogoEdicion(propiedades.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="puedeGestionarProductos"
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="abrirDialogoEliminacion(propiedades.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>

                  <q-btn
                    v-if="puedeTransferirDirecto || !puedeGestionarProductos"
                    flat
                    round
                    dense
                    icon="swap_horiz"
                    color="grey-8"
                    :disable="!puedeAbrirTransferencia(propiedades.row)"
                    @click="abrirDialogoSolicitud(propiedades.row)"
                  >
                    <q-tooltip>
                      {{ tooltipTransferencia(propiedades.row) }}
                    </q-tooltip>
                  </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="info"
                  color="grey-8"
                  @click="verDetalles(propiedades.row.id)"
                >
                  <q-tooltip>Ver detalles</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template #body-cell-modelo="propiedades">
              <q-td :props="propiedades" class="celda-destacada-inventario">
                {{ propiedades.row.modelo }}
              </q-td>
            </template>

            <template #body-cell-marca="propiedades">
              <q-td :props="propiedades" class="celda-secundaria-inventario">
                {{ propiedades.row.marca }}
              </q-td>
            </template>

            <template #body-cell-categoria="propiedades">
              <q-td :props="propiedades" class="celda-secundaria-inventario">
                {{ propiedades.row.categoria }}
              </q-td>
            </template>

            <template #body-cell-precio_unitario="propiedades">
              <q-td :props="propiedades" class="celda-secundaria-inventario">
                $ {{ formatearMonto(propiedades.row.precio_unitario_usd) }}
                <span class="text-grey-7"
                  >(Bs.
                  {{
                    formatearMonto(propiedades.row.precio_unitario_bs)
                  }})</span
                >
              </q-td>
            </template>

            <template #body-cell-existencias_totales="propiedades">
              <q-td :props="propiedades" class="celda-secundaria-inventario">
                <q-badge color="blue-1" text-color="primary" rounded>
                  {{ propiedades.row.existencias_totales }}
                </q-badge>
              </q-td>
            </template>

            <template
              v-for="sucursal in sucursalesOrdenadas"
              :key="`sucursal-${sucursal.id}`"
              #[`body-cell-sucursal_${sucursal.id}`]="propiedades"
            >
              <q-td
                :props="propiedades"
                :class="[
                  'celda-sucursal-inventario',
                  claseSucursal(sucursal.nombre),
                ]"
              >
                <div class="contenido-celda-sucursal">
                  <span>{{
                    obtenerCantidadSucursal(propiedades.row, sucursal.id)
                  }}</span>
                </div>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogoSolicitudAbierto">
      <q-card class="tarjeta-dialogo-transferencia">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold">
            {{
              puedeTransferirDirecto
                ? "Transferencia directa"
                : "Solicitar transferencia"
            }}
          </div>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            {{
              puedeTransferirDirecto
                ? "Mueve unidades directamente entre sucursales sin pasar por solicitud."
                : "Registra una solicitud para pedir unidades a otra sucursal."
            }}
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner
            v-if="errorSolicitud"
            rounded
            class="bg-red-1 text-red-10 q-mb-lg"
          >
            {{ errorSolicitud }}
          </q-banner>

          <div v-if="productoSolicitud" class="formulario-transferencia">
            <q-input
              :model-value="productoSolicitud.modelo"
              outlined
              disable
              label="Producto"
            />

              <q-input
                :model-value="
                  puedeTransferirDirecto
                    ? 'Seleccion manual de sucursales'
                    : sucursalActual || 'Sin sucursal asignada'
                "
                outlined
                disable
                :label="
                  puedeTransferirDirecto
                    ? 'Modo de transferencia'
                    : 'Sucursal solicitante'
                "
              />

              <q-select
                v-model="formularioSolicitud.sucursalOrigenId"
                outlined
                emit-value
                map-options
                :label="
                  puedeTransferirDirecto
                    ? 'Sucursal origen'
                    : 'Sucursal proveedora'
                "
                :options="
                  puedeTransferirDirecto
                    ? opcionesSucursalesOrigenDirectas
                    : opcionesSucursalesDisponibles
                "
                option-value="value"
                option-label="label"
                @update:model-value="
                  puedeTransferirDirecto &&
                    (formularioSolicitud.sucursalDestinoId =
                      opcionesSucursalesDestinoDirectas[0]?.value || null)
                "
              />

              <q-select
                v-if="puedeTransferirDirecto"
                v-model="formularioSolicitud.sucursalDestinoId"
                outlined
                emit-value
                map-options
                label="Sucursal destino"
                :options="opcionesSucursalesDestinoDirectas"
                option-value="value"
                option-label="label"
              />

              <q-input
                :model-value="fechaSolicitudActual"
              outlined
              disable
              label="Fecha de registro"
            />

            <q-input
              v-model.number="formularioSolicitud.cantidadSolicitada"
              outlined
              type="number"
              min="1"
              label="Cantidad de piezas"
            />

              <q-input
                :model-value="stockSucursalSeleccionada"
                outlined
                disable
                :label="
                  puedeTransferirDirecto
                    ? 'Stock disponible en sucursal origen'
                    : 'Stock disponible en sucursal proveedora'
                "
              />

            <q-input
              v-model="formularioSolicitud.detalle"
              outlined
              autogrow
              type="textarea"
              label="Detalle opcional"
              class="campo-transferencia-ancho-completo"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="cerrarDialogoSolicitud"
          />
            <q-btn
              unelevated
              color="dark"
              text-color="white"
              :label="
                puedeTransferirDirecto
                  ? 'Registrar transferencia'
                  : 'Registrar solicitud'
              "
              @click="registrarSolicitud"
            />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoEdicionAbierto">
      <q-card class="tarjeta-dialogo-transferencia">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold">Editar producto</div>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            Corrige los datos generales y comerciales del producto seleccionado.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner
            v-if="errorEdicion"
            rounded
            class="bg-red-1 text-red-10 q-mb-lg"
          >
            {{ errorEdicion }}
          </q-banner>

          <div v-if="productoEdicion" class="formulario-transferencia">
            <q-input
              v-model="formularioEdicion.modelo"
              outlined
              label="Modelo"
            />

            <q-select
              v-model="formularioEdicion.marcaId"
              outlined
              emit-value
              map-options
              label="Marca"
              :options="marcasEdicion"
              option-value="value"
              option-label="label"
            />

            <q-select
              v-model="formularioEdicion.categoriaId"
              outlined
              emit-value
              map-options
              label="Categoria"
              :options="categoriasEdicion"
              option-value="value"
              option-label="label"
            />

            <q-input
              v-model.number="formularioEdicion.tipoCambio"
              outlined
              type="number"
              min="0.01"
              step="0.01"
              label="Tipo de cambio"
              @update:model-value="recalcularMontosEdicionDesdeTipoCambio"
            />

            <q-input
              :model-value="formularioEdicion.precioUnitarioUsd"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Precio unitario ($us)"
              @update:model-value="
                actualizarMontoEdicion('precioUnitario', 'usd', $event)
              "
            />

            <q-input
              :model-value="formularioEdicion.precioUnitarioBs"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Precio unitario (Bs)"
              @update:model-value="
                actualizarMontoEdicion('precioUnitario', 'bs', $event)
              "
            />

            <q-input
              :model-value="formularioEdicion.precioMayoristaUsd"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Precio mayorista ($us)"
              @update:model-value="
                actualizarMontoEdicion('precioMayorista', 'usd', $event)
              "
            />

            <q-input
              :model-value="formularioEdicion.precioMayoristaBs"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Precio mayorista (Bs)"
              @update:model-value="
                actualizarMontoEdicion('precioMayorista', 'bs', $event)
              "
            />

            <q-input
              :model-value="formularioEdicion.costoUsd"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Costo ($us)"
              @update:model-value="
                actualizarMontoEdicion('costo', 'usd', $event)
              "
            />

            <q-input
              :model-value="formularioEdicion.costoBs"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Costo (Bs)"
              @update:model-value="
                actualizarMontoEdicion('costo', 'bs', $event)
              "
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="cerrarDialogoEdicion"
          />
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            label="Guardar cambios"
            :loading="guardandoEdicion"
            @click="guardarEdicionProducto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoEliminacionAbierto">
      <q-card class="tarjeta-dialogo-confirmacion">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold">Eliminar producto</div>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            Esta accion ocultara el producto del inventario y desactivara sus
            unidades.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner
            v-if="errorEliminacion"
            rounded
            class="bg-red-1 text-red-10 q-mb-lg"
          >
            {{ errorEliminacion }}
          </q-banner>

          <div v-if="productoEliminacion" class="bloque-detalle-solicitud">
            <div class="text-caption text-grey-7">Producto seleccionado</div>
            <div class="text-subtitle1 text-weight-bold q-mt-xs">
              {{ productoEliminacion.modelo }}
            </div>
            <div class="text-body2 text-grey-7 q-mt-sm">
              {{ productoEliminacion.marca }} /
              {{ productoEliminacion.categoria }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            @click="cerrarDialogoEliminacion"
          />
          <q-btn
            unelevated
            color="negative"
            label="Eliminar"
            :loading="eliminandoProducto"
            @click="confirmarEliminacionProducto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoSolicitudesAbierto" maximized>
      <q-card class="dialogo-solicitudes-transferencia">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                round
                icon="close"
                color="grey-8"
                @click="cerrarDialogoSolicitudes"
              />
              <div>
                <div class="text-caption text-weight-bold texto-resalte-panel">
                  Transferencias
                </div>
                <div class="text-h5 text-weight-bold q-mt-sm">
                  Solicitudes y notificaciones
                </div>
                <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                  Revisa solicitudes pendientes, aprobaciones, rechazos y
                  respuestas entre sucursales.
                </p>
              </div>
            </div>

            <q-chip square color="grey-2" text-color="dark" icon="badge">
              {{ estadoAutenticacion.usuario?.nombre_completo || "Usuario" }}
            </q-chip>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner
            v-if="errorSolicitudes"
            rounded
            class="bg-red-1 text-red-10 q-mb-lg"
          >
            {{ errorSolicitudes }}
          </q-banner>

          <q-tabs
            v-model="tabSolicitudesActiva"
            align="left"
            inline-label
            active-color="primary"
            indicator-color="primary"
            class="tabs-solicitudes-transferencia"
          >
            <q-tab
              v-if="puedeRevisarSolicitudes"
              name="por_revisar"
              icon="assignment_late"
              :label="`Por revisar (${solicitudesPendientesPorRevisar.length})`"
            />
            <q-tab
              name="mis_solicitudes"
              icon="notifications_active"
              :label="`Mi sucursal (${misSolicitudesSucursal.length})`"
            />
            <q-tab
              name="bandeja"
              icon="mail"
              :label="`Bandeja (${bandejaNotificaciones.length})`"
            />
          </q-tabs>

          <q-tab-panels
            v-model="tabSolicitudesActiva"
            animated
            class="q-mt-lg paneles-solicitudes-transferencia"
          >
            <q-tab-panel
              v-if="puedeRevisarSolicitudes"
              name="por_revisar"
              class="q-pa-none"
            >
              <div
                v-if="solicitudesPendientesPorRevisar.length"
                class="lista-solicitudes-transferencia"
              >
                <q-card
                  v-for="solicitud in solicitudesPendientesPorRevisar"
                  :key="solicitud.id"
                  flat
                  bordered
                  class="tarjeta-solicitud-transferencia"
                >
                  <q-card-section class="q-pa-lg">
                    <div class="cabecera-solicitud-transferencia">
                      <div>
                        <div class="text-h6 text-weight-bold">
                          {{ solicitud.producto_modelo }}
                        </div>
                        <div class="text-body2 text-grey-7 q-mt-xs">
                          {{ solicitud.usuario_solicitante }} desde
                          {{ solicitud.sucursal_solicitante }}
                        </div>
                      </div>

                      <q-badge color="orange-2" text-color="dark" rounded>
                        Pendiente
                      </q-badge>
                    </div>

                    <div class="rejilla-datos-solicitud q-mt-lg">
                      <div class="item-resumen-detalle-producto">
                        <div class="text-caption text-grey-7">
                          Sucursal proveedora
                        </div>
                        <div class="text-subtitle1 text-weight-bold q-mt-xs">
                          {{ solicitud.sucursal_origen }}
                        </div>
                      </div>

                      <div class="item-resumen-detalle-producto">
                        <div class="text-caption text-grey-7">
                          Cantidad solicitada
                        </div>
                        <div class="text-subtitle1 text-weight-bold q-mt-xs">
                          {{ solicitud.cantidad_solicitada }}
                        </div>
                      </div>

                      <div class="item-resumen-detalle-producto">
                        <div class="text-caption text-grey-7">Fecha</div>
                        <div class="text-subtitle1 text-weight-bold q-mt-xs">
                          {{ solicitud.fecha_solicitud }}
                        </div>
                      </div>

                      <div class="item-resumen-detalle-producto">
                        <div class="text-caption text-grey-7">
                          Disponible actual
                        </div>
                        <div class="text-subtitle1 text-weight-bold q-mt-xs">
                          {{ stockDisponibleParaSolicitud(solicitud) }}
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="solicitud.detalle_solicitud"
                      class="bloque-detalle-solicitud q-mt-lg"
                    >
                      <div class="text-caption text-grey-7">
                        Detalle de la solicitud
                      </div>
                      <div class="text-body2 q-mt-xs">
                        {{ solicitud.detalle_solicitud }}
                      </div>
                    </div>

                    <div class="formulario-respuesta-transferencia q-mt-lg">
                      <q-input
                        v-model.number="
                          respuestaSolicitudes[solicitud.id].cantidadAprobada
                        "
                        outlined
                        type="number"
                        min="1"
                        :max="stockDisponibleParaSolicitud(solicitud)"
                        label="Cantidad a transferir"
                      />

                      <q-input
                        v-model="
                          respuestaSolicitudes[solicitud.id].detalleRespuesta
                        "
                        outlined
                        autogrow
                        type="textarea"
                        label="Detalle o justificacion"
                        class="campo-transferencia-ancho-completo"
                      />
                    </div>
                  </q-card-section>

                  <q-card-actions align="right" class="q-pa-lg">
                    <q-btn
                      flat
                      color="negative"
                      label="Rechazar"
                      @click="rechazarSolicitud(solicitud)"
                    />
                    <q-btn
                      unelevated
                      color="dark"
                      text-color="white"
                      label="Aceptar"
                      @click="aprobarSolicitud(solicitud)"
                    />
                  </q-card-actions>
                </q-card>
              </div>

              <q-banner v-else rounded class="bg-grey-2 text-grey-8">
                No tienes solicitudes pendientes por revisar en tu sucursal.
              </q-banner>
            </q-tab-panel>

            <q-tab-panel name="mis_solicitudes" class="q-pa-none">
              <div
                v-if="misSolicitudesSucursal.length"
                class="lista-solicitudes-transferencia"
              >
                <q-card
                  v-for="solicitud in misSolicitudesSucursal"
                  :key="solicitud.id"
                  flat
                  bordered
                  class="tarjeta-solicitud-transferencia"
                >
                  <q-card-section class="q-pa-lg">
                    <div class="cabecera-solicitud-transferencia">
                      <div>
                        <div class="text-h6 text-weight-bold">
                          {{ solicitud.producto_modelo }}
                        </div>
                        <div class="text-body2 text-grey-7 q-mt-xs">
                          Solicitado a {{ solicitud.sucursal_origen }} el
                          {{ solicitud.fecha_solicitud }}
                        </div>
                      </div>

                      <q-badge
                        :color="colorEstadoSolicitud(solicitud.estado)"
                        text-color="dark"
                        rounded
                      >
                        {{ etiquetaEstadoSolicitud(solicitud.estado) }}
                      </q-badge>
                    </div>

                    <div class="rejilla-datos-solicitud q-mt-lg">
                      <div class="item-resumen-detalle-producto">
                        <div class="text-caption text-grey-7">
                          Cantidad solicitada
                        </div>
                        <div class="text-subtitle1 text-weight-bold q-mt-xs">
                          {{ solicitud.cantidad_solicitada }}
                        </div>
                      </div>

                      <div class="item-resumen-detalle-producto">
                        <div class="text-caption text-grey-7">
                          Cantidad respondida
                        </div>
                        <div class="text-subtitle1 text-weight-bold q-mt-xs">
                          {{ solicitud.cantidad_aprobada ?? "-" }}
                        </div>
                      </div>

                      <div class="item-resumen-detalle-producto">
                        <div class="text-caption text-grey-7">Solicitante</div>
                        <div class="text-subtitle1 text-weight-bold q-mt-xs">
                          {{ solicitud.usuario_solicitante }}
                        </div>
                      </div>

                      <div class="item-resumen-detalle-producto">
                        <div class="text-caption text-grey-7">Respondio</div>
                        <div class="text-subtitle1 text-weight-bold q-mt-xs">
                          {{ solicitud.usuario_revisor || "-" }}
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="solicitud.detalle_solicitud"
                      class="bloque-detalle-solicitud q-mt-lg"
                    >
                      <div class="text-caption text-grey-7">
                        Detalle de la solicitud
                      </div>
                      <div class="text-body2 q-mt-xs">
                        {{ solicitud.detalle_solicitud }}
                      </div>
                    </div>

                    <div
                      v-if="
                        solicitud.detalle_respuesta || solicitud.fecha_respuesta
                      "
                      class="bloque-detalle-solicitud q-mt-lg bloque-detalle-solicitud--respuesta"
                    >
                      <div class="text-caption text-grey-7">
                        Respuesta de la sucursal proveedora
                      </div>
                      <div
                        v-if="solicitud.detalle_respuesta"
                        class="text-body2 q-mt-xs"
                      >
                        {{ solicitud.detalle_respuesta }}
                      </div>
                      <div
                        v-if="solicitud.fecha_respuesta"
                        class="text-caption text-grey-7 q-mt-sm"
                      >
                        Respondido el {{ solicitud.fecha_respuesta }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <q-banner v-else rounded class="bg-grey-2 text-grey-8">
                Tu sucursal aun no tiene solicitudes registradas.
              </q-banner>
            </q-tab-panel>

            <q-tab-panel name="bandeja" class="q-pa-none">
              <div
                v-if="bandejaNotificaciones.length"
                class="lista-solicitudes-transferencia"
              >
                <q-card
                  v-for="notificacion in bandejaNotificaciones"
                  :key="notificacion.id"
                  flat
                  bordered
                  class="tarjeta-solicitud-transferencia"
                >
                  <q-card-section class="q-pa-lg">
                    <div class="cabecera-solicitud-transferencia">
                      <div>
                        <div class="text-h6 text-weight-bold">
                          {{ notificacion.titulo }}
                        </div>
                        <div class="text-body2 text-grey-7 q-mt-xs">
                          {{ notificacion.fecha_texto }}
                        </div>
                      </div>

                      <q-badge
                        :color="colorEstadoSolicitud(notificacion.estado)"
                        text-color="dark"
                        rounded
                      >
                        {{ etiquetaEstadoSolicitud(notificacion.estado) }}
                      </q-badge>
                    </div>

                    <div class="bloque-detalle-solicitud q-mt-lg">
                      <div class="text-body2">
                        {{ notificacion.descripcion }}
                      </div>
                    </div>

                    <div
                      v-if="
                        notificacion.solicitud.detalle_solicitud ||
                        notificacion.solicitud.detalle_respuesta
                      "
                      class="bloque-detalle-solicitud q-mt-lg bloque-detalle-solicitud--respuesta"
                    >
                      <div
                        v-if="notificacion.solicitud.detalle_solicitud"
                        class="text-caption text-grey-7"
                      >
                        Detalle de solicitud
                      </div>
                      <div
                        v-if="notificacion.solicitud.detalle_solicitud"
                        class="text-body2 q-mt-xs"
                      >
                        {{ notificacion.solicitud.detalle_solicitud }}
                      </div>
                      <div
                        v-if="notificacion.solicitud.detalle_respuesta"
                        class="text-caption text-grey-7"
                        :class="
                          notificacion.solicitud.detalle_solicitud
                            ? 'q-mt-md'
                            : ''
                        "
                      >
                        Detalle de respuesta
                      </div>
                      <div
                        v-if="notificacion.solicitud.detalle_respuesta"
                        class="text-body2 q-mt-xs"
                      >
                        {{ notificacion.solicitud.detalle_respuesta }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <q-banner v-else rounded class="bg-grey-2 text-grey-8">
                Aun no tienes notificaciones en tu bandeja.
              </q-banner>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoDetalleAbierto" maximized>
      <q-card class="dialogo-detalle-producto">
        <q-card-section class="q-pa-lg">
          <div
            class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
          >
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                round
                icon="close"
                color="grey-8"
                @click="cerrarDetalles"
              />
              <div>
                <div class="text-caption text-weight-bold texto-resalte-panel">
                  Inventario
                </div>
                <div class="text-h5 text-weight-bold q-mt-sm">
                  Detalle del producto
                </div>
                <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                  Consulta el resumen del producto, sus unidades fisicas y las
                  operaciones reales disponibles.
                </p>
              </div>
            </div>

            <q-badge
              v-if="productoDetalle"
              color="blue-1"
              text-color="primary"
              rounded
              class="q-px-md q-py-sm"
            >
              ID {{ productoDetalle.id }}
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner
            v-if="errorDetalle"
            rounded
            class="bg-red-1 text-red-10 q-mb-lg"
          >
            {{ errorDetalle }}
          </q-banner>

          <div v-if="cargandoDetalle" class="estado-detalle-producto">
            <q-spinner color="primary" size="42px" />
            <div class="text-body1 text-grey-7 q-mt-md">
              Cargando detalle real del producto...
            </div>
          </div>

          <div v-if="productoDetalle" class="columna-detalle-producto">
            <q-card flat bordered class="tarjeta-detalle-producto">
              <q-card-section class="q-pa-lg">
                <div class="cabecera-tarjeta-detalle">
                  <div>
                    <div class="text-h5 text-weight-bold">
                      {{ productoDetalle.modelo }}
                    </div>
                    <div class="text-body1 text-grey-7 q-mt-sm">
                      {{ productoDetalle.marca }} /
                      {{ productoDetalle.categoria }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-caption text-grey-7">
                      Existencias totales
                    </div>
                    <div class="text-h4 text-weight-bold q-mt-xs">
                      {{ productoDetalle.existencias_totales }}
                    </div>
                    <div class="text-body2 text-grey-7 q-mt-sm">
                      {{ resumenSucursalesDetalle }}
                    </div>
                  </div>
                </div>

                <div class="rejilla-resumen-detalle-producto q-mt-lg">
                  <div class="item-resumen-detalle-producto">
                    <div class="text-caption text-grey-7">Precio unitario</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      $
                      {{ formatearMonto(productoDetalle.precio_unitario_usd) }}
                    </div>
                    <div class="text-body2 text-grey-7">
                      Bs.
                      {{ formatearMonto(productoDetalle.precio_unitario_bs) }}
                    </div>
                  </div>

                  <div class="item-resumen-detalle-producto">
                    <div class="text-caption text-grey-7">Precio mayorista</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      $
                      {{ formatearMonto(productoDetalle.precio_mayorista_usd) }}
                    </div>
                    <div class="text-body2 text-grey-7">
                      Bs.
                      {{ formatearMonto(productoDetalle.precio_mayorista_bs) }}
                    </div>
                  </div>

                  <div class="item-resumen-detalle-producto">
                    <div class="text-caption text-grey-7">Costo</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      $ {{ formatearMonto(productoDetalle.costo_usd) }}
                    </div>
                    <div class="text-body2 text-grey-7">
                      Bs. {{ formatearMonto(productoDetalle.costo_bs) }}
                    </div>
                  </div>

                  <div class="item-resumen-detalle-producto">
                    <div class="text-caption text-grey-7">Stock total</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      {{ productoDetalle.existencias_totales }}
                    </div>
                    <div class="text-body2 text-grey-7">
                      Disponible actualmente en sucursales
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="tarjeta-detalle-producto">
              <q-card-section class="q-pa-lg">
                <div
                  class="cabecera-tarjeta-detalle cabecera-tarjeta-detalle--envolvente"
                >
                  <div>
                    <div class="text-h6 text-weight-bold">
                      Registro de operaciones
                    </div>
                    <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                      Transferencias y adquisiciones reales disponibles en
                      backend. Las ventas se mostraran cuando exista ese modulo.
                    </p>
                  </div>

                  <div class="filtros-operaciones-detalle">
                    <q-chip
                      clickable
                      :outline="
                        !tiposOperacionSeleccionados.includes('adquisicion')
                      "
                      color="orange-2"
                      text-color="dark"
                      icon="done"
                      @click="alternarTipoOperacion('adquisicion')"
                    >
                      Adquisiciones
                    </q-chip>
                    <q-chip
                      clickable
                      :outline="!tiposOperacionSeleccionados.includes('venta')"
                      color="green-2"
                      text-color="dark"
                      icon="done"
                      @click="alternarTipoOperacion('venta')"
                    >
                      Ventas
                    </q-chip>
                    <q-chip
                      clickable
                      :outline="
                        !tiposOperacionSeleccionados.includes('transferencia')
                      "
                      color="blue-2"
                      text-color="dark"
                      icon="done"
                      @click="alternarTipoOperacion('transferencia')"
                    >
                      Transferencias
                    </q-chip>
                  </div>
                </div>

                <div class="rejilla-totales-operacion q-mt-lg">
                  <div
                    class="item-total-operacion item-total-operacion--adquisicion"
                  >
                    <div class="text-caption text-grey-8">Adquisiciones</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      {{ resumenOperacionesDetalle.adquisicion }}
                    </div>
                  </div>
                  <div class="item-total-operacion item-total-operacion--venta">
                    <div class="text-caption text-grey-8">Ventas</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      {{ resumenOperacionesDetalle.venta }}
                    </div>
                  </div>
                  <div
                    class="item-total-operacion item-total-operacion--transferencia"
                  >
                    <div class="text-caption text-grey-8">Transferencias</div>
                    <div class="text-h6 text-weight-bold q-mt-xs">
                      {{ resumenOperacionesDetalle.transferencia }}
                    </div>
                  </div>
                </div>

                <q-banner rounded class="bg-grey-1 text-grey-8 q-mt-lg">
                  El detalle ya esta conectado a adquisiciones y transferencias
                  reales. Las ventas apareceran cuando ese modulo exista.
                </q-banner>

                <div
                  v-if="operacionesDetalleFiltradas.length"
                  class="lista-operaciones-detalle q-mt-lg"
                >
                  <div
                    v-for="operacion in operacionesDetalleFiltradas"
                    :key="operacion.id"
                    :class="[
                      'item-operacion-detalle',
                      `item-operacion-detalle--${operacion.tipo}`,
                    ]"
                  >
                    {{ operacion.descripcion }}
                  </div>
                </div>

                <q-banner v-else rounded class="bg-grey-2 text-grey-8 q-mt-lg">
                  No hay operaciones reales registradas para los filtros
                  seleccionados.
                </q-banner>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Notify, useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { estadoAutenticacion } from "src/services/auth";
import {
  agregarProductoAlCarrito,
  cantidadItemsCarrito,
} from "src/composables/useCarritoVentas";
import {
  actualizarProducto,
  eliminarProducto,
  listarProductos,
  obtenerDetalleProducto,
  obtenerDatosFormularioProducto,
} from "src/services/productos";
import {
  listarSolicitudesTransferencia,
  registrarSolicitudTransferencia,
  registrarTransferenciaDirecta,
  responderSolicitudTransferencia,
} from "src/services/transferencias";

defineOptions({
  name: "InventarioPage",
});

const ROLES_QUE_SOLICITAN = ["supervisor_sucursal", "vendedor"];
const ESTADOS_RESPUESTA = ["aprobada", "rechazada", "aprobada_parcial"];

const cargando = ref(false);
const busqueda = ref("");
const productos = ref([]);
const sucursales = ref([]);
const misSolicitudes = ref([]);
const solicitudesPorRevisar = ref([]);
const historialRecibidas = ref([]);
const dialogoDetalleAbierto = ref(false);
const dialogoSolicitudAbierto = ref(false);
const dialogoSolicitudesAbierto = ref(false);
const dialogoEdicionAbierto = ref(false);
const dialogoEliminacionAbierto = ref(false);
const cargandoDetalle = ref(false);
const productoDetalle = ref(null);
const productoSolicitud = ref(null);
const productoEdicion = ref(null);
const productoEliminacion = ref(null);
const operacionesDetalle = ref([]);
const idProductoDetalleAbierto = ref(null);
const errorDetalle = ref("");
const errorSolicitud = ref("");
const errorSolicitudes = ref("");
const errorEdicion = ref("");
const errorEliminacion = ref("");
const guardandoEdicion = ref(false);
const eliminandoProducto = ref(false);
const tabSolicitudesActiva = ref("mis_solicitudes");
const tiposOperacionSeleccionados = ref([
  "adquisicion",
  "venta",
  "transferencia",
]);
const respuestaSolicitudes = reactive({});
const formularioSolicitud = reactive(crearFormularioSolicitudVacio());
const formularioEdicion = reactive(crearFormularioEdicionVacio());
const marcasEdicion = ref([]);
const categoriasEdicion = ref([]);
const $q = useQuasar();
const router = useRouter();

function mostrarNotificacion(tipo, message) {
  if (typeof $q?.notify === "function") {
    $q.notify({
      type: tipo,
      message,
    });
    return;
  }

  if (typeof Notify?.create === "function") {
    Notify.create({
      type: tipo,
      message,
    });
  }
}

const rolActual = computed(() => estadoAutenticacion.usuario?.rol || "");
const sucursalActual = computed(
  () => estadoAutenticacion.usuario?.sucursal || ""
);
const puedeSolicitarTransferencias = computed(() =>
  ROLES_QUE_SOLICITAN.includes(rolActual.value)
);
const puedeVender = computed(() =>
  ["vendedor", "supervisor_sucursal"].includes(rolActual.value)
);
const puedeTransferirDirecto = computed(() =>
  ["gerente", "auxiliar_administrativo"].includes(rolActual.value)
);
const puedeRevisarSolicitudes = computed(
  () => rolActual.value === "supervisor_sucursal"
);
const puedeGestionarProductos = computed(() =>
  ["gerente", "auxiliar_administrativo"].includes(rolActual.value)
);

const filasInventario = computed(() => {
  const termino = busqueda.value.trim().toLowerCase();

  if (!termino) {
    return productos.value;
  }

  return productos.value.filter((producto) => {
    const texto = [producto.modelo, producto.marca, producto.categoria]
      .join(" ")
      .toLowerCase();

    return texto.includes(termino);
  });
});

const columnasInventario = computed(() => {
  const columnasBase = [
    { name: "acciones", label: "Acciones", align: "left", field: "id" },
    {
      name: "modelo",
      label: "Modelo",
      align: "left",
      field: "modelo",
      sortable: true,
    },
    {
      name: "marca",
      label: "Marca",
      align: "left",
      field: "marca",
      sortable: true,
    },
    {
      name: "categoria",
      label: "Categoria",
      align: "left",
      field: "categoria",
      sortable: true,
    },
    {
      name: "precio_unitario",
      label: "Precio unitario",
      align: "left",
      field: "precio_unitario_usd",
    },
    {
      name: "existencias_totales",
      label: "Existencias totales",
      align: "left",
      field: "existencias_totales",
      sortable: true,
    },
  ];

  const columnasSucursales = sucursalesOrdenadas.value.map((sucursal) => ({
    name: `sucursal_${sucursal.id}`,
    label: sucursal.nombre,
    align: "center",
    field: `sucursal_${sucursal.id}`,
  }));

  return [...columnasBase, ...columnasSucursales];
});

const sucursalesOrdenadas = computed(() => {
  const nombreSucursalActual = normalizarTexto(sucursalActual.value);

  return [...sucursales.value].sort((sucursalA, sucursalB) => {
    const esSucursalActualA =
      normalizarTexto(sucursalA.nombre) === nombreSucursalActual;
    const esSucursalActualB =
      normalizarTexto(sucursalB.nombre) === nombreSucursalActual;

    if (esSucursalActualA && !esSucursalActualB) {
      return -1;
    }

    if (!esSucursalActualA && esSucursalActualB) {
      return 1;
    }

    return sucursalA.nombre.localeCompare(sucursalB.nombre);
  });
});

const opcionesSucursalesDisponibles = computed(() => {
  if (!productoSolicitud.value) {
    return [];
  }

  return (productoSolicitud.value.existencias_por_sucursal || [])
    .filter(
      (sucursal) =>
        normalizarTexto(sucursal.sucursal) !==
          normalizarTexto(sucursalActual.value) &&
        Number(sucursal.cantidad || 0) > 0
    )
      .map((sucursal) => ({
        label: `${sucursal.sucursal} (${sucursal.cantidad} disponibles)`,
        value: sucursal.sucursal_id,
      }));
});

const opcionesSucursalesOrigenDirectas = computed(() => {
  if (!productoSolicitud.value) {
    return [];
  }

  return (productoSolicitud.value.existencias_por_sucursal || [])
    .filter((sucursal) => Number(sucursal.cantidad || 0) > 0)
    .map((sucursal) => ({
      label: `${sucursal.sucursal} (${sucursal.cantidad} disponibles)`,
      value: sucursal.sucursal_id,
    }));
});

const opcionesSucursalesDestinoDirectas = computed(() =>
  sucursales.value
    .filter(
      (sucursal) =>
        Number(sucursal.id) !== Number(formularioSolicitud.sucursalOrigenId)
    )
    .map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
    }))
);

const stockSucursalSeleccionada = computed(() => {
  if (!productoSolicitud.value || !formularioSolicitud.sucursalOrigenId) {
    return 0;
  }

  return obtenerCantidadSucursal(
    productoSolicitud.value,
    formularioSolicitud.sucursalOrigenId
  );
});

const resumenSucursalesDetalle = computed(() => {
  const cantidad = (
    productoDetalle.value?.existencias_por_sucursal || []
  ).filter((sucursal) => Number(sucursal.cantidad || 0) > 0).length;

  return cantidad === 1
    ? "1 sucursal con stock"
    : `${cantidad} sucursales con stock`;
});

const unidadesDetalleOrdenadas = computed(() => {
  return [...(productoDetalle.value?.unidades || [])].sort(
    (unidadA, unidadB) => {
      const sucursalA = unidadA.sucursal || "";
      const sucursalB = unidadB.sucursal || "";

      if (sucursalA !== sucursalB) {
        return sucursalA.localeCompare(sucursalB);
      }

      const fechaA = new Date(unidadA.fecha_ingreso || 0).getTime();
      const fechaB = new Date(unidadB.fecha_ingreso || 0).getTime();

      return fechaB - fechaA;
    }
  );
});

const operacionesDetalleFiltradas = computed(() =>
  operacionesDetalle.value.filter((operacion) =>
    tiposOperacionSeleccionados.value.includes(operacion.tipo)
  )
);

const resumenOperacionesDetalle = computed(() => ({
  adquisicion: operacionesDetalle.value.filter(
    (operacion) => operacion.tipo === "adquisicion"
  ).length,
  venta: operacionesDetalle.value.filter(
    (operacion) => operacion.tipo === "venta"
  ).length,
  transferencia: operacionesDetalle.value.filter(
    (operacion) => operacion.tipo === "transferencia"
  ).length,
}));

const solicitudesPendientesPorRevisar = computed(
  () => solicitudesPorRevisar.value
);

const misSolicitudesSucursal = computed(() => misSolicitudes.value);

const claveNotificacionesVistas = computed(
  () =>
    `punto_tecnologico_notificaciones_vistas_${
      estadoAutenticacion.usuario?.id ||
      estadoAutenticacion.usuario?.nombre_usuario ||
      "usuario"
    }`
);

const notificacionesVistas = ref([]);

const bandejaNotificaciones = computed(() => {
  const mapa = new Map();

  misSolicitudes.value.forEach((solicitud) => {
    mapa.set(
      `enviada-${solicitud.id}-${solicitud.estado}-${
        solicitud.fecha_respuesta_iso || "sin_respuesta"
      }`,
      {
        id: `enviada-${solicitud.id}-${solicitud.estado}-${
          solicitud.fecha_respuesta_iso || "sin_respuesta"
        }`,
        tipo: "enviada",
        fecha: solicitud.fecha_respuesta_iso || solicitud.fecha_solicitud_iso,
        fecha_texto: solicitud.fecha_respuesta || solicitud.fecha_solicitud,
        titulo: `Solicitud enviada: ${solicitud.producto_modelo}`,
        descripcion:
          solicitud.estado === "pendiente"
            ? `Solicitaste ${solicitud.cantidad_solicitada} unidad(es) a ${solicitud.sucursal_origen}.`
            : `Tu solicitud a ${
                solicitud.sucursal_origen
              } fue ${etiquetaEstadoSolicitud(
                solicitud.estado
              ).toLowerCase()}.`,
        estado: solicitud.estado,
        solicitud,
      }
    );
  });

  historialRecibidas.value.forEach((solicitud) => {
    mapa.set(
      `recibida-${solicitud.id}-${solicitud.estado}-${
        solicitud.fecha_respuesta_iso || "sin_respuesta"
      }`,
      {
        id: `recibida-${solicitud.id}-${solicitud.estado}-${
          solicitud.fecha_respuesta_iso || "sin_respuesta"
        }`,
        tipo: solicitud.estado === "pendiente" ? "pendiente" : "atendida",
        fecha: solicitud.fecha_respuesta_iso || solicitud.fecha_solicitud_iso,
        fecha_texto: solicitud.fecha_respuesta || solicitud.fecha_solicitud,
        titulo:
          solicitud.estado === "pendiente"
            ? `Solicitud recibida: ${solicitud.producto_modelo}`
            : `Solicitud atendida: ${solicitud.producto_modelo}`,
        descripcion:
          solicitud.estado === "pendiente"
            ? `${solicitud.usuario_solicitante} solicito ${solicitud.cantidad_solicitada} unidad(es) desde ${solicitud.sucursal_solicitante}.`
            : `La solicitud de ${solicitud.usuario_solicitante} desde ${
                solicitud.sucursal_solicitante
              } fue ${etiquetaEstadoSolicitud(
                solicitud.estado
              ).toLowerCase()}.`,
        estado: solicitud.estado,
        solicitud,
      }
    );
  });

  return Array.from(mapa.values()).sort((a, b) => {
    const fechaA = new Date(a.fecha || 0).getTime();
    const fechaB = new Date(b.fecha || 0).getTime();
    return fechaB - fechaA;
  });
});

const cantidadNotificacionesPendientes = computed(() => {
  return bandejaNotificaciones.value.filter(
    (notificacion) => !notificacionesVistas.value.includes(notificacion.id)
  ).length;
});

const fechaSolicitudActual = computed(() => formatearFechaHora(new Date()));

function crearFormularioSolicitudVacio() {
  return {
    sucursalOrigenId: null,
    sucursalDestinoId: null,
    cantidadSolicitada: 1,
    detalle: "",
  };
}

function crearFormularioEdicionVacio() {
  return {
    modelo: "",
    marcaId: null,
    categoriaId: null,
    tipoCambio: 1,
    precioUnitarioUsd: 0,
    precioUnitarioBs: 0,
    precioMayoristaUsd: 0,
    precioMayoristaBs: 0,
    costoUsd: 0,
    costoBs: 0,
  };
}

function formatearMonto(valor) {
  return Number(valor || 0).toFixed(2);
}

function normalizarNumero(valor) {
  const numero = Number(valor || 0);
  return Number.isFinite(numero) ? numero : 0;
}

function redondearMonto(valor) {
  return Number(normalizarNumero(valor).toFixed(2));
}

function limitarDosDecimales(valor) {
  return redondearMonto(valor);
}

function formatearFechaHora(valor) {
  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${anio} - ${horas}:${minutos}`;
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obtenerCantidadSucursal(producto, idSucursal) {
  return (
    producto.existencias_por_sucursal.find(
      (item) => item.sucursal_id === idSucursal
    )?.cantidad || 0
  );
}

function obtenerSucursalPorId(producto, idSucursal) {
  return (
    producto.existencias_por_sucursal.find(
      (item) => item.sucursal_id === idSucursal
    ) || null
  );
}

function obtenerProductoPorId(idProducto) {
  return (
    productos.value.find(
      (producto) => Number(producto.id) === Number(idProducto)
    ) || null
  );
}

function puedeSolicitarProducto(producto) {
  if (!puedeSolicitarTransferencias.value || !sucursalActual.value) {
    return false;
  }

  return (producto.existencias_por_sucursal || []).some(
    (sucursal) =>
      normalizarTexto(sucursal.sucursal) !==
        normalizarTexto(sucursalActual.value) &&
      Number(sucursal.cantidad || 0) > 0
  );
}

function tooltipSolicitud(producto) {
  if (!puedeSolicitarTransferencias.value) {
    return "Tu rol no puede registrar solicitudes";
  }

  if (!sucursalActual.value) {
    return "Tu usuario no tiene una sucursal asignada";
  }

  if (!puedeSolicitarProducto(producto)) {
    return "No hay otra sucursal con stock disponible para este producto";
  }

  return "Solicitar transferencia";
}

function puedeTransferirDirectamenteProducto(producto) {
  if (!puedeTransferirDirecto.value) {
    return false;
  }

  return (producto.existencias_por_sucursal || []).some(
    (sucursal) => Number(sucursal.cantidad || 0) > 0
  );
}

function puedeAbrirTransferencia(producto) {
  if (puedeTransferirDirecto.value) {
    return puedeTransferirDirectamenteProducto(producto);
  }

  return puedeSolicitarProducto(producto);
}

function tooltipTransferencia(producto) {
  if (puedeTransferirDirecto.value) {
    return puedeTransferirDirectamenteProducto(producto)
      ? "Transferir directamente"
      : "No hay stock disponible para transferir";
  }

  return tooltipSolicitud(producto);
}

function puedeAgregarCarrito(producto) {
  if (!puedeVender.value || !sucursalActual.value) {
    return false;
  }

  return Number(
    (producto.existencias_por_sucursal || []).find(
      (item) =>
        normalizarTexto(item.sucursal) === normalizarTexto(sucursalActual.value)
    )?.cantidad || 0
  ) > 0;
}

function tooltipCarrito(producto) {
  if (!puedeVender.value) {
    return "Tu rol no puede vender";
  }

  if (!sucursalActual.value) {
    return "Tu usuario no tiene una sucursal asignada";
  }

  return puedeAgregarCarrito(producto)
    ? "Agregar al carrito"
    : "No hay stock disponible en tu sucursal";
}

function puedeMostrarGestion(producto) {
  return puedeGestionarProductos.value || puedeSolicitarProducto(producto);
}

function claseSucursal(nombreSucursal) {
  const nombre = normalizarTexto(nombreSucursal);

  if (nombre.includes("tecnocenter")) return "celda-sucursal-verde";
  if (nombre.includes("gold-punto")) return "celda-sucursal-amarilla";
  if (nombre.includes("mundo electronico")) return "celda-sucursal-rosada";
  if (nombre.includes("medrano")) return "celda-sucursal-mostaza";
  if (nombre.includes("gold-mi pc")) return "celda-sucursal-azul";
  if (nombre.includes("supermall")) return "celda-sucursal-naranja";
  if (nombre.includes("rma")) return "celda-sucursal-gris";

  return "celda-sucursal-neutra";
}

function claseTarjetaSucursal(nombreSucursal) {
  const clase = claseSucursal(nombreSucursal);
  return clase.replace("celda-sucursal", "tarjeta-sucursal-detalle-producto");
}

function alternarTipoOperacion(tipo) {
  if (tiposOperacionSeleccionados.value.includes(tipo)) {
    tiposOperacionSeleccionados.value =
      tiposOperacionSeleccionados.value.filter((item) => item !== tipo);
    return;
  }

  tiposOperacionSeleccionados.value = [
    ...tiposOperacionSeleccionados.value,
    tipo,
  ];
}

async function cargarDetalleProducto(idProducto) {
  cargandoDetalle.value = true;
  errorDetalle.value = "";

  try {
    const respuesta = await obtenerDetalleProducto(idProducto);
    productoDetalle.value = respuesta.producto || null;
    operacionesDetalle.value = respuesta.operaciones || [];
    idProductoDetalleAbierto.value = idProducto;
  } catch (error) {
    errorDetalle.value =
      error.message || "No se pudo cargar el detalle del producto.";
    productoDetalle.value = null;
    operacionesDetalle.value = [];
  } finally {
    cargandoDetalle.value = false;
  }
}

async function verDetalles(idProducto) {
  tiposOperacionSeleccionados.value = ["adquisicion", "venta", "transferencia"];
  dialogoDetalleAbierto.value = true;
  await cargarDetalleProducto(idProducto);
}

function cerrarDetalles() {
  dialogoDetalleAbierto.value = false;
  idProductoDetalleAbierto.value = null;
  productoDetalle.value = null;
  operacionesDetalle.value = [];
  errorDetalle.value = "";
}

function reiniciarFormularioSolicitud() {
  Object.assign(formularioSolicitud, crearFormularioSolicitudVacio());
  errorSolicitud.value = "";
}

function reiniciarFormularioEdicion() {
  Object.assign(formularioEdicion, crearFormularioEdicionVacio());
  errorEdicion.value = "";
}

function actualizarMontoEdicion(prefijo, monedaOrigen, valor) {
  const tipoCambio = Math.max(
    0.01,
    limitarDosDecimales(formularioEdicion.tipoCambio)
  );
  const monto = limitarDosDecimales(valor);
  formularioEdicion.tipoCambio = tipoCambio;

  if (monedaOrigen === "usd") {
    formularioEdicion[`${prefijo}Usd`] = monto;
    formularioEdicion[`${prefijo}Bs`] = redondearMonto(monto * tipoCambio);
    return;
  }

  formularioEdicion[`${prefijo}Bs`] = monto;
  formularioEdicion[`${prefijo}Usd`] =
    tipoCambio > 0 ? redondearMonto(monto / tipoCambio) : 0;
}

function recalcularMontosEdicionDesdeTipoCambio() {
  formularioEdicion.tipoCambio = Math.max(
    0.01,
    limitarDosDecimales(formularioEdicion.tipoCambio)
  );
  actualizarMontoEdicion(
    "precioUnitario",
    "usd",
    formularioEdicion.precioUnitarioUsd
  );
  actualizarMontoEdicion(
    "precioMayorista",
    "usd",
    formularioEdicion.precioMayoristaUsd
  );
  actualizarMontoEdicion("costo", "usd", formularioEdicion.costoUsd);
}

function leerNotificacionesVistas() {
  const valor = localStorage.getItem(claveNotificacionesVistas.value);

  if (!valor) {
    notificacionesVistas.value = [];
    return;
  }

  try {
    const ids = JSON.parse(valor);
    notificacionesVistas.value = Array.isArray(ids) ? ids : [];
  } catch {
    notificacionesVistas.value = [];
    localStorage.removeItem(claveNotificacionesVistas.value);
  }
}

function guardarNotificacionesVistas() {
  localStorage.setItem(
    claveNotificacionesVistas.value,
    JSON.stringify(notificacionesVistas.value)
  );
}

function marcarBandejaComoVista() {
  notificacionesVistas.value = bandejaNotificaciones.value.map(
    (notificacion) => notificacion.id
  );
  guardarNotificacionesVistas();
}

function abrirDialogoSolicitud(producto) {
  if (!puedeAbrirTransferencia(producto)) {
    return;
  }

  productoSolicitud.value = producto;
  reiniciarFormularioSolicitud();
  if (puedeTransferirDirecto.value) {
    formularioSolicitud.sucursalOrigenId =
      opcionesSucursalesOrigenDirectas.value[0]?.value || null;
    formularioSolicitud.sucursalDestinoId =
      opcionesSucursalesDestinoDirectas.value[0]?.value || null;
  } else {
    formularioSolicitud.sucursalOrigenId =
      opcionesSucursalesDisponibles.value[0]?.value || null;
  }
  dialogoSolicitudAbierto.value = true;
}

function agregarProductoCarritoDesdeInventario(producto) {
  const agregado = agregarProductoAlCarrito(producto);

  if (!agregado) {
    mostrarNotificacion("warning", "No hay stock disponible en tu sucursal para este producto.");
    return;
  }

  mostrarNotificacion("positive", "Producto agregado al carrito.");
}

function irAVentas() {
  router.push("/ventas");
}

async function cargarCatalogosEdicion() {
  if (marcasEdicion.value.length && categoriasEdicion.value.length) {
    return;
  }

  const datos = await obtenerDatosFormularioProducto();
  marcasEdicion.value = datos.marcas || [];
  categoriasEdicion.value = datos.categorias || [];
}

async function abrirDialogoEdicion(producto) {
  if (!puedeGestionarProductos.value) {
    return;
  }

  productoEdicion.value = producto;
  reiniciarFormularioEdicion();

  try {
    await cargarCatalogosEdicion();
    Object.assign(formularioEdicion, {
      modelo: producto.modelo,
      marcaId: producto.marca_id,
      categoriaId: producto.categoria_id,
      tipoCambio: Number(producto.tipo_cambio_referencia || 1),
      precioUnitarioUsd: Number(producto.precio_unitario_usd || 0),
      precioUnitarioBs: Number(producto.precio_unitario_bs || 0),
      precioMayoristaUsd: Number(producto.precio_mayorista_usd || 0),
      precioMayoristaBs: Number(producto.precio_mayorista_bs || 0),
      costoUsd: Number(producto.costo_usd || 0),
      costoBs: Number(producto.costo_bs || 0),
    });
    dialogoEdicionAbierto.value = true;
  } catch (error) {
    errorSolicitudes.value =
      error.message || "No se pudieron cargar los datos para editar.";
  }
}

function cerrarDialogoEdicion() {
  dialogoEdicionAbierto.value = false;
  productoEdicion.value = null;
  reiniciarFormularioEdicion();
}

function abrirDialogoEliminacion(producto) {
  if (!puedeGestionarProductos.value) {
    return;
  }

  productoEliminacion.value = producto;
  errorEliminacion.value = "";
  dialogoEliminacionAbierto.value = true;
}

function cerrarDialogoEliminacion() {
  dialogoEliminacionAbierto.value = false;
  productoEliminacion.value = null;
  errorEliminacion.value = "";
}

function cerrarDialogoSolicitud() {
  dialogoSolicitudAbierto.value = false;
  productoSolicitud.value = null;
  reiniciarFormularioSolicitud();
}

async function guardarEdicionProducto() {
  if (!productoEdicion.value) {
    return;
  }

  guardandoEdicion.value = true;
  errorEdicion.value = "";

  try {
    await actualizarProducto(productoEdicion.value.id, formularioEdicion);
    await cargarInventario();
    cerrarDialogoEdicion();
    mostrarNotificacion("positive", "Producto actualizado correctamente.");
  } catch (error) {
    errorEdicion.value = error.message || "No se pudo actualizar el producto.";
  } finally {
    guardandoEdicion.value = false;
  }
}

async function confirmarEliminacionProducto() {
  if (!productoEliminacion.value) {
    return;
  }

  eliminandoProducto.value = true;
  errorEliminacion.value = "";

  try {
    await eliminarProducto(productoEliminacion.value.id);
    await cargarInventario();
    cerrarDialogoEliminacion();
    mostrarNotificacion("positive", "Producto eliminado correctamente.");
  } catch (error) {
    errorEliminacion.value =
      error.message || "No se pudo eliminar el producto.";
  } finally {
    eliminandoProducto.value = false;
  }
}

async function cargarSolicitudes() {
  errorSolicitudes.value = "";

  try {
    const respuesta = await listarSolicitudesTransferencia();
    misSolicitudes.value = respuesta.mis_solicitudes || [];
    solicitudesPorRevisar.value = respuesta.solicitudes_por_revisar || [];
    historialRecibidas.value = respuesta.historial_recibidas || [];
  } catch (error) {
    errorSolicitudes.value =
      error.message ||
      "No se pudieron cargar las solicitudes de transferencia.";
  }

  inicializarRespuestasSolicitudes();
}

function inicializarRespuestasSolicitudes() {
  Object.keys(respuestaSolicitudes).forEach((clave) => {
    delete respuestaSolicitudes[clave];
  });

  solicitudesPorRevisar.value.forEach((solicitud) => {
    respuestaSolicitudes[solicitud.id] = {
      cantidadAprobada: solicitud.cantidad_solicitada,
      detalleRespuesta: solicitud.detalle_respuesta || "",
    };
  });
}

async function abrirDialogoSolicitudes() {
  dialogoSolicitudesAbierto.value = true;
  tabSolicitudesActiva.value = puedeRevisarSolicitudes.value
    ? "por_revisar"
    : "mis_solicitudes";
  await cargarSolicitudes();
  marcarBandejaComoVista();
}

function cerrarDialogoSolicitudes() {
  dialogoSolicitudesAbierto.value = false;
}

async function registrarSolicitud() {
  errorSolicitud.value = "";

  if (!productoSolicitud.value) {
    errorSolicitud.value = "No se encontro el producto seleccionado.";
    return;
  }

  if (!formularioSolicitud.sucursalOrigenId) {
    errorSolicitud.value = puedeTransferirDirecto.value
      ? "Selecciona la sucursal origen."
      : "Selecciona la sucursal proveedora.";
    return;
  }

  if (puedeTransferirDirecto.value && !formularioSolicitud.sucursalDestinoId) {
    errorSolicitud.value = "Selecciona la sucursal destino.";
    return;
  }

  if (
    puedeTransferirDirecto.value &&
    Number(formularioSolicitud.sucursalOrigenId) ===
      Number(formularioSolicitud.sucursalDestinoId)
  ) {
    errorSolicitud.value = "La sucursal origen y destino deben ser diferentes.";
    return;
  }

  const cantidadSolicitada = Math.trunc(
    Number(formularioSolicitud.cantidadSolicitada || 0)
  );

  if (cantidadSolicitada <= 0) {
    errorSolicitud.value = "La cantidad solicitada debe ser mayor a cero.";
    return;
  }

  try {
    if (puedeTransferirDirecto.value) {
      await registrarTransferenciaDirecta({
        productoId: productoSolicitud.value.id,
        sucursalOrigenId: formularioSolicitud.sucursalOrigenId,
        sucursalDestinoId: formularioSolicitud.sucursalDestinoId,
        cantidadSolicitada,
        detalleSolicitud: formularioSolicitud.detalle.trim(),
      });
      await cargarInventario();
    } else {
      await registrarSolicitudTransferencia({
        productoId: productoSolicitud.value.id,
        sucursalOrigenId: formularioSolicitud.sucursalOrigenId,
        cantidadSolicitada,
        detalleSolicitud: formularioSolicitud.detalle.trim(),
      });
      await cargarSolicitudes();
    }
    cerrarDialogoSolicitud();
    mostrarNotificacion(
      "positive",
      puedeTransferirDirecto.value
        ? "Transferencia registrada correctamente."
        : "Solicitud enviada correctamente."
    );
  } catch (error) {
    errorSolicitud.value =
      error.message ||
      (puedeTransferirDirecto.value
        ? "No se pudo registrar la transferencia."
        : "No se pudo registrar la solicitud.");
  }
}

function stockDisponibleParaSolicitud(solicitud) {
  const producto = obtenerProductoPorId(solicitud.producto_id);

  if (!producto) {
    return 0;
  }

  const sucursal = (producto.existencias_por_sucursal || []).find(
    (item) => Number(item.sucursal_id) === Number(solicitud.sucursal_origen_id)
  );

  return Number(sucursal?.cantidad || 0);
}

async function aprobarSolicitud(solicitud) {
  const respuesta = respuestaSolicitudes[solicitud.id];
  const cantidadAprobada = Math.trunc(Number(respuesta?.cantidadAprobada || 0));
  const detalleRespuesta = (respuesta?.detalleRespuesta || "").trim();

  if (cantidadAprobada <= 0) {
    return;
  }

  try {
    await responderSolicitudTransferencia(solicitud.id, {
      accion: "aceptar",
      cantidadAprobada,
      detalleRespuesta,
    });

    await Promise.all([cargarSolicitudes(), cargarInventario()]);
    mostrarNotificacion("positive", "Solicitud atendida correctamente.");
  } catch (error) {
    errorSolicitudes.value =
      error.message || "No se pudo responder la solicitud.";
  }
}

async function rechazarSolicitud(solicitud) {
  const respuesta = respuestaSolicitudes[solicitud.id];
  const detalleRespuesta = (respuesta?.detalleRespuesta || "").trim();

  try {
    await responderSolicitudTransferencia(solicitud.id, {
      accion: "rechazar",
      cantidadAprobada: 0,
      detalleRespuesta,
    });

    await cargarSolicitudes();
    mostrarNotificacion("positive", "Solicitud rechazada correctamente.");
  } catch (error) {
    errorSolicitudes.value =
      error.message || "No se pudo rechazar la solicitud.";
  }
}

function etiquetaEstadoSolicitud(estado) {
  if (estado === "aprobada") return "Aprobada";
  if (estado === "aprobada_parcial") return "Aprobada parcial";
  if (estado === "rechazada") return "Rechazada";
  return "Pendiente";
}

function colorEstadoSolicitud(estado) {
  if (estado === "aprobada") return "green-2";
  if (estado === "aprobada_parcial") return "orange-2";
  if (estado === "rechazada") return "red-2";
  return "grey-3";
}

async function cargarInventario() {
  cargando.value = true;

  try {
    const respuesta = await listarProductos();
    productos.value = respuesta.productos || [];

    const mapaSucursales = new Map();

    productos.value.forEach((producto) => {
      producto.existencias_por_sucursal.forEach((sucursal) => {
        const clave = `${sucursal.sucursal_id}-${sucursal.sucursal}`;

        if (!mapaSucursales.has(clave)) {
          mapaSucursales.set(clave, {
            id: sucursal.sucursal_id,
            nombre: sucursal.sucursal,
          });
        }
      });
    });

    sucursales.value = Array.from(mapaSucursales.values());

    if (dialogoDetalleAbierto.value && idProductoDetalleAbierto.value) {
      await cargarDetalleProducto(idProductoDetalleAbierto.value);
    }

    if (productoSolicitud.value) {
      productoSolicitud.value = obtenerProductoPorId(
        productoSolicitud.value.id
      );
    }
  } finally {
    cargando.value = false;
  }
}

onMounted(() => {
  leerNotificacionesVistas();
  cargarSolicitudes();
  cargarInventario();
});
</script>
