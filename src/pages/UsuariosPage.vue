<template>
  <q-page class="pagina-usuarios q-pa-lg">
    <div class="encabezado-usuarios">
      <div>
        <div class="text-caption text-weight-bold texto-resalte-panel">Gestion de usuarios</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Registro y control de personal</h1>
        <p class="text-body1 text-grey-8 q-ma-none">
          Registra nuevos usuarios del sistema y administra si cada cuenta permanece activa o inactiva.
        </p>
      </div>

      <q-card flat bordered class="tarjeta-resumen-usuarios">
        <q-card-section>
          <div class="text-caption text-grey-7">Usuarios registrados</div>
          <div class="text-h4 text-weight-bold q-mt-xs">{{ usuarios.length }}</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Activos: {{ totalActivos }} | Inactivos: {{ totalInactivos }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="bloques-usuarios q-mt-lg">
      <q-card flat bordered class="tarjeta-formulario-usuarios">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold">Nuevo usuario</div>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-lg">
            Completa los datos del trabajador para habilitar su ingreso al sistema.
          </p>

          <q-banner v-if="mensajeFormulario" rounded class="bg-green-1 text-green-10 q-mb-md">
            {{ mensajeFormulario }}
          </q-banner>

          <q-banner v-if="errorFormulario" rounded class="bg-red-1 text-red-10 q-mb-md">
            {{ errorFormulario }}
          </q-banner>

          <q-form class="formulario-usuarios" @submit="guardarUsuario">
            <div class="campo-formulario-usuarios">
              <q-input
                v-model="formulario.nombre"
                outlined
                label="Nombre"
                lazy-rules
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-input
                v-model="formulario.apellido"
                outlined
                label="Apellido"
                lazy-rules
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-input
                v-model="formulario.documentoIdentidad"
                outlined
                label="Documento de identidad"
                lazy-rules
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-input
                v-model="formulario.telefono"
                outlined
                label="Telefono"
                lazy-rules
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-input
                v-model="formulario.nombreUsuario"
                outlined
                label="Nombre de usuario"
                lazy-rules
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-input
                v-model="formulario.contrasena"
                outlined
                :type="mostrarContrasena ? 'text' : 'password'"
                label="Contrasena"
                lazy-rules
                reactive-rules
                :rules="[reglaRequerida, reglaContrasena]"
              >
                <template #append>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="mostrarContrasena ? 'visibility_off' : 'visibility'"
                    @click="mostrarContrasena = !mostrarContrasena"
                  />
                </template>
              </q-input>
            </div>

            <div class="campo-formulario-usuarios">
              <q-select
                v-model="formulario.rol"
                outlined
                emit-value
                map-options
                label="Rol"
                :options="roles"
                option-value="value"
                option-label="label"
                lazy-rules
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-select
                v-model="formulario.sucursal"
                outlined
                emit-value
                map-options
                clearable
                label="Sucursal"
                :options="sucursales"
                option-value="value"
                option-label="label"
                :rules="[reglaSucursal]"
              />
            </div>

            <div class="campo-formulario-usuarios campo-formulario-usuarios--ancho-dos-columnas">
              <q-input
                v-model="formulario.direccion"
                outlined
                type="textarea"
                autogrow
                label="Direccion"
                lazy-rules
                :rules="[reglaRequerida]"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-file
                v-model="formulario.fotoFacturaLuz"
                outlined
                clearable
                accept=".jpg,.jpeg,.png,.pdf"
                label="Foto de factura de luz (opcional)"
                hint="Formatos permitidos: JPG, PNG o PDF. Maximo 5 MB."
              />
            </div>

            <div class="acciones-formulario-usuarios">
              <q-btn flat color="grey-8" label="Limpiar" @click="reiniciarFormulario" />
              <q-btn
                unelevated
                color="dark"
                text-color="white"
                label="Registrar usuario"
                type="submit"
                :loading="guardandoUsuario"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="tarjeta-listado-usuarios">
        <q-card-section class="q-pa-lg">
          <div class="cabecera-listado-usuarios">
            <div>
              <div class="text-h6 text-weight-bold">Usuarios del sistema</div>
              <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
                Desde aqui puedes revisar el personal registrado y activar o inactivar sus accesos.
              </p>
            </div>

            <q-btn flat icon="refresh" label="Actualizar" :loading="cargandoDatos" @click="cargarModulo" />
          </div>

          <q-banner v-if="errorListado" rounded class="bg-red-1 text-red-10 q-mt-md">
            {{ errorListado }}
          </q-banner>

          <div class="contenedor-tabla-usuarios q-mt-lg">
            <q-table
              flat
              :rows="usuarios"
              :columns="columnasUsuarios"
              row-key="id"
              :loading="cargandoDatos"
              no-data-label="Aun no hay usuarios registrados."
              :pagination="{ rowsPerPage: 8 }"
            >
              <template #body-cell-usuario="propiedades">
                <q-td :props="propiedades">
                  <div class="text-weight-medium">{{ propiedades.row.nombre_completo }}</div>
                  <div class="text-caption text-grey-7">{{ propiedades.row.nombre_usuario }}</div>
                </q-td>
              </template>

              <template #body-cell-rol="propiedades">
                <q-td :props="propiedades">
                  {{ propiedades.row.rol_etiqueta }}
                </q-td>
              </template>

              <template #body-cell-sucursal="propiedades">
                <q-td :props="propiedades">
                  {{ propiedades.row.sucursal || 'No asignada' }}
                </q-td>
              </template>

              <template #body-cell-estado="propiedades">
                <q-td :props="propiedades">
                  <q-badge :color="propiedades.row.activo ? 'positive' : 'grey-6'">
                    {{ propiedades.row.activo ? 'Activo' : 'Inactivo' }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-factura="propiedades">
                <q-td :props="propiedades">
                  <a
                    v-if="propiedades.row.url_factura_luz"
                    :href="propiedades.row.url_factura_luz"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="enlace-tabla-usuarios"
                  >
                    Ver archivo
                  </a>
                  <span v-else class="text-grey-6">No adjunta</span>
                </q-td>
              </template>

              <template #body-cell-acciones="propiedades">
                <q-td :props="propiedades">
                  <div class="row items-center q-gutter-sm">
                    <q-btn
                      v-if="puedeCambiarSucursal(propiedades.row)"
                      size="sm"
                      flat
                      color="primary"
                      icon="store"
                      label="Cambiar sucursal"
                      @click="abrirDialogoCambioSucursal(propiedades.row)"
                    />
                    <q-btn
                      size="sm"
                      unelevated
                      :color="propiedades.row.activo ? 'negative' : 'positive'"
                      :label="propiedades.row.activo ? 'Inactivar' : 'Activar'"
                      :loading="idsUsuariosProcesando.includes(propiedades.row.id)"
                      @click="actualizarEstadoUsuario(propiedades.row)"
                    />
                  </div>
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="dialogoCambioSucursalAbierto">
      <q-card class="tarjeta-dialogo-transferencia">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold">Cambiar sucursal</div>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            Reasigna al trabajador a otra sucursal sin modificar sus credenciales.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-banner v-if="errorCambioSucursal" rounded class="bg-red-1 text-red-10 q-mb-lg">
            {{ errorCambioSucursal }}
          </q-banner>

          <div v-if="usuarioCambioSucursal" class="formulario-usuarios">
            <div class="campo-formulario-usuarios">
              <q-input
                :model-value="usuarioCambioSucursal.nombre_completo"
                outlined
                disable
                label="Trabajador"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-input
                :model-value="usuarioCambioSucursal.rol_etiqueta"
                outlined
                disable
                label="Rol"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-input
                :model-value="usuarioCambioSucursal.sucursal || 'No asignada'"
                outlined
                disable
                label="Sucursal actual"
              />
            </div>

            <div class="campo-formulario-usuarios">
              <q-select
                v-model="formularioCambioSucursal.sucursal"
                outlined
                emit-value
                map-options
                label="Nueva sucursal"
                :options="sucursales"
                option-value="value"
                option-label="label"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat color="grey-8" label="Cancelar" @click="cerrarDialogoCambioSucursal" />
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            label="Guardar cambio"
            :loading="guardandoCambioSucursal"
            @click="guardarCambioSucursal"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  actualizarSucursalUsuario,
  cambiarEstadoUsuario,
  obtenerDatosModuloUsuarios,
  registrarUsuario
} from 'src/services/usuarios'

defineOptions({
  name: 'UsuariosPage'
})

const cargandoDatos = ref(false)
const guardandoUsuario = ref(false)
const mostrarContrasena = ref(false)
const mensajeFormulario = ref('')
const errorFormulario = ref('')
const errorListado = ref('')
const errorCambioSucursal = ref('')
const roles = ref([])
const sucursales = ref([])
const usuarios = ref([])
const idsUsuariosProcesando = ref([])
const dialogoCambioSucursalAbierto = ref(false)
const guardandoCambioSucursal = ref(false)
const usuarioCambioSucursal = ref(null)

const formulario = reactive(crearFormularioVacio())
const formularioCambioSucursal = reactive({
  sucursal: null
})

const columnasUsuarios = [
  { name: 'usuario', label: 'Usuario', align: 'left', field: 'nombre_completo', sortable: true },
  { name: 'documento_identidad', label: 'Documento', align: 'left', field: 'documento_identidad', sortable: true },
  { name: 'telefono', label: 'Telefono', align: 'left', field: 'telefono' },
  { name: 'rol', label: 'Rol', align: 'left', field: 'rol_etiqueta', sortable: true },
  { name: 'sucursal', label: 'Sucursal', align: 'left', field: 'sucursal', sortable: true },
  { name: 'estado', label: 'Estado', align: 'left', field: 'activo', sortable: true },
  { name: 'factura', label: 'Factura de luz', align: 'left', field: 'url_factura_luz' },
  { name: 'acciones', label: 'Acciones', align: 'left', field: 'id' }
]

const totalActivos = computed(() => usuarios.value.filter(usuario => usuario.activo).length)
const totalInactivos = computed(() => usuarios.value.filter(usuario => !usuario.activo).length)

function crearFormularioVacio () {
  return {
    nombre: '',
    apellido: '',
    documentoIdentidad: '',
    telefono: '',
    direccion: '',
    nombreUsuario: '',
    contrasena: '',
    rol: null,
    sucursal: null,
    fotoFacturaLuz: null
  }
}

function reglaRequerida (valor) {
  return !!valor || 'Este campo es obligatorio.'
}

function reglaContrasena (valor) {
  return (valor && valor.length >= 8) || 'La contrasena debe tener al menos 8 caracteres.'
}

function reglaSucursal (valor) {
  if (requiereSucursal(formulario.rol)) {
    return !!valor || 'La sucursal es obligatoria para supervisores y vendedores.'
  }

  return true
}

function requiereSucursal (rol) {
  return ['vendedor', 'supervisor_sucursal'].includes(rol)
}

function puedeCambiarSucursal (usuario) {
  return requiereSucursal(usuario.rol)
}

function reiniciarFormulario () {
  Object.assign(formulario, crearFormularioVacio())
  mensajeFormulario.value = ''
  errorFormulario.value = ''
  mostrarContrasena.value = false
}

async function cargarModulo () {
  cargandoDatos.value = true
  errorListado.value = ''

  try {
    const datos = await obtenerDatosModuloUsuarios()
    roles.value = datos.roles
    sucursales.value = datos.sucursales
    usuarios.value = datos.usuarios
  } catch (error) {
    errorListado.value = error.message || 'No se pudo cargar el modulo de usuarios.'
  } finally {
    cargandoDatos.value = false
  }
}

async function guardarUsuario () {
  guardandoUsuario.value = true
  mensajeFormulario.value = ''
  errorFormulario.value = ''

  try {
    const respuesta = await registrarUsuario(formulario)
    usuarios.value = [respuesta.usuario, ...usuarios.value]
    reiniciarFormulario()
    mensajeFormulario.value = respuesta.message || 'Usuario registrado correctamente.'
  } catch (error) {
    errorFormulario.value = error.message || 'No se pudo registrar el usuario.'
  } finally {
    guardandoUsuario.value = false
  }
}

async function actualizarEstadoUsuario (usuario) {
  idsUsuariosProcesando.value = [...idsUsuariosProcesando.value, usuario.id]
  errorListado.value = ''

  try {
    const respuesta = await cambiarEstadoUsuario(usuario.id, !usuario.activo)
    usuarios.value = usuarios.value.map(item =>
      item.id === usuario.id ? respuesta.usuario : item
    )
  } catch (error) {
    errorListado.value = error.message || 'No se pudo actualizar el estado del usuario.'
  } finally {
    idsUsuariosProcesando.value = idsUsuariosProcesando.value.filter(id => id !== usuario.id)
  }
}

function abrirDialogoCambioSucursal (usuario) {
  usuarioCambioSucursal.value = usuario
  formularioCambioSucursal.sucursal = usuario.sucursal || null
  errorCambioSucursal.value = ''
  dialogoCambioSucursalAbierto.value = true
}

function cerrarDialogoCambioSucursal () {
  dialogoCambioSucursalAbierto.value = false
  usuarioCambioSucursal.value = null
  formularioCambioSucursal.sucursal = null
  errorCambioSucursal.value = ''
}

async function guardarCambioSucursal () {
  errorCambioSucursal.value = ''

  if (!usuarioCambioSucursal.value?.id) {
    errorCambioSucursal.value = 'No se encontro el usuario seleccionado.'
    return
  }

  if (!formularioCambioSucursal.sucursal) {
    errorCambioSucursal.value = 'Selecciona la nueva sucursal.'
    return
  }

  guardandoCambioSucursal.value = true

  try {
    const respuesta = await actualizarSucursalUsuario(
      usuarioCambioSucursal.value.id,
      formularioCambioSucursal.sucursal
    )

    usuarios.value = usuarios.value.map(item =>
      item.id === usuarioCambioSucursal.value.id ? respuesta.usuario : item
    )

    cerrarDialogoCambioSucursal()
  } catch (error) {
    errorCambioSucursal.value =
      error.message || 'No se pudo actualizar la sucursal del usuario.'
  } finally {
    guardandoCambioSucursal.value = false
  }
}

onMounted(() => {
  cargarModulo()
})
</script>
