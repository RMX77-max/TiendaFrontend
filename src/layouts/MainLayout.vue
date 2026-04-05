<template>
  <q-layout view="lHh Lpr lFf" class="contenedor-aplicacion">
    <q-header class="bg-white text-dark cabecera-aplicacion" bordered>
      <q-toolbar class="q-px-md q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center q-gutter-sm">
          <div class="marca-aplicacion">PT</div>
          <div>
            <div class="text-subtitle1 text-weight-bold">Punto Tecnologico</div>
            <div class="text-caption text-grey-7">Sistema interno de ventas</div>
          </div>
        </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <q-chip square color="grey-2" text-color="dark" icon="badge">
            {{ etiquetaRol }}
          </q-chip>
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            icon="logout"
            label="Cerrar sesion"
            :loading="cerrandoSesion"
            @click="manejarCierreSesion"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
        <div class="q-pa-md">
          <div class="text-overline text-grey-7">Usuario activo</div>
        <div class="text-subtitle1 text-weight-bold">{{ estadoAutenticacion.usuario?.nombre_completo }}</div>
        <div class="text-body2 text-grey-7">{{ estadoAutenticacion.usuario?.nombre_usuario }}</div>
      </div>

      <q-separator />

      <q-list padding>
        <q-item
          v-for="enlace in enlacesMenuVisibles"
          :key="enlace.to"
          clickable
          :to="enlace.to"
          :exact="enlace.exact === true"
        >
          <q-item-section avatar>
            <q-icon :name="enlace.icono" />
          </q-item-section>
          <q-item-section>{{ enlace.etiqueta }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { estadoAutenticacion, cerrarSesion } from 'src/services/auth'

defineOptions({
  name: 'MainLayout'
})

const router = useRouter()
const leftDrawerOpen = ref(false)
const cerrandoSesion = ref(false)
const etiquetasRol = {
  gerente: 'Gerente',
  auxiliar_administrativo: 'Auxiliar administrativo',
  supervisor_sucursal: 'Supervisor',
  vendedor: 'Vendedor'
}
const enlacesMenu = [
  {
    to: '/inventario',
    etiqueta: 'Inventario',
    icono: 'table_view',
    roles: ['gerente', 'auxiliar_administrativo', 'supervisor_sucursal', 'vendedor']
  },
  {
    to: '/inicio',
    etiqueta: 'Inicio',
    icono: 'dashboard',
    roles: ['gerente', 'auxiliar_administrativo']
  },
  {
    to: '/usuarios',
    etiqueta: 'Usuarios',
    icono: 'group',
    roles: ['gerente']
  },
  {
    to: '/productos',
    etiqueta: 'Productos',
    icono: 'inventory_2',
    roles: ['gerente', 'auxiliar_administrativo']
  }
]

const etiquetaRol = computed(() => etiquetasRol[estadoAutenticacion.usuario?.rol] || 'Sin rol')
const enlacesMenuVisibles = computed(() =>
  enlacesMenu.filter((enlace) => enlace.roles.includes(estadoAutenticacion.usuario?.rol))
)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function manejarCierreSesion () {
  cerrandoSesion.value = true

  try {
    await cerrarSesion()
    await router.replace('/login')
  } finally {
    cerrandoSesion.value = false
  }
}
</script>
