<template>
  <div class="pagina-acceso flex flex-center q-pa-md">
    <div class="pagina-acceso__fondo" />

    <q-card class="tarjeta-acceso shadow-16">
      <q-card-section class="q-pa-xl">
        <div class="text-caption text-weight-bold texto-resalte-acceso">Punto Tecnologico</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Iniciar sesion</div>
        <p class="text-body2 text-grey-7 q-mt-sm q-mb-xl">
          Ingresa con tu usuario del sistema para acceder al panel interno de la tienda.
        </p>

        <q-banner
          v-if="mostrarCredencialesPrueba"
          rounded
          class="bg-blue-1 text-blue-10 q-mb-md"
        >
          Usuario de prueba: <strong>gerente</strong> | Contrasena: <strong>admin12345</strong>
        </q-banner>

        <q-form class="column q-gutter-md" @submit="enviarFormulario">
          <q-input
            v-model="formulario.nombreUsuario"
            outlined
            label="Nombre de usuario"
            autocomplete="username"
            :disable="cargando"
            lazy-rules
            :rules="[valor => !!valor || 'Ingresa tu nombre de usuario']"
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="formulario.contrasena"
            outlined
            label="Contrasena"
            :type="mostrarContrasena ? 'text' : 'password'"
            autocomplete="current-password"
            :disable="cargando"
            lazy-rules
            :rules="[valor => !!valor || 'Ingresa tu contrasena']"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
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

          <q-banner v-if="error" rounded class="bg-red-1 text-red-10">
            {{ error }}
          </q-banner>

          <q-btn
            unelevated
            color="dark"
            text-color="white"
            class="full-width q-mt-sm"
            label="Entrar al sistema"
            type="submit"
            :loading="cargando"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { iniciarSesion } from 'src/services/auth'

defineOptions({
  name: 'LoginPage'
})

const route = useRoute()
const router = useRouter()
const cargando = ref(false)
const error = ref('')
const mostrarContrasena = ref(false)
const mostrarCredencialesPrueba = ref(true)
const formulario = reactive({
  nombreUsuario: 'gerente',
  contrasena: 'admin12345'
})

async function enviarFormulario () {
  cargando.value = true
  error.value = ''

  try {
    await iniciarSesion(formulario)
    await router.replace(route.query.redirect || '/inventario')
  } catch (err) {
    error.value = err.message || 'No se pudo iniciar sesion.'
  } finally {
    cargando.value = false
  }
}
</script>
