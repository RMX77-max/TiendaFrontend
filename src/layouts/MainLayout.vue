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
            <div class="text-caption text-grey-7">
              Sistema interno de ventas
            </div>
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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :behavior="$q.screen.lt.md ? 'mobile' : 'desktop'"
      class="bg-grey-1"
    >
      <div class="q-pa-md">
        <div class="text-overline text-grey-7">Usuario activo</div>
        <div class="text-subtitle1 text-weight-bold">
          {{ estadoAutenticacion.usuario?.nombre_completo }}
        </div>
        <div class="text-body2 text-grey-7">
          {{ estadoAutenticacion.usuario?.nombre_usuario }}
        </div>
      </div>

      <q-separator />

      <q-list padding>
        <q-item
          v-for="enlace in enlacesMenuVisibles"
          :key="enlace.to"
          clickable
          :to="enlace.to"
          :exact="enlace.exact === true"
          @click="manejarClickEnlace"
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
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { estadoAutenticacion, cerrarSesion } from "src/services/auth";

defineOptions({
  name: "MainLayout",
});

const router = useRouter();
const $q = useQuasar();
const leftDrawerOpen = ref(false);
const cerrandoSesion = ref(false);
const etiquetasRol = {
  gerente: "Gerente",
  auxiliar_administrativo: "Auxiliar administrativo",
  supervisor_sucursal: "Supervisor",
  vendedor: "Vendedor",
};
const enlacesMenu = [
  {
    to: "/inventario",
    etiqueta: "Inventario",
    icono: "inventory",
    roles: [
      "gerente",
      "auxiliar_administrativo",
      "supervisor_sucursal",
      "vendedor",
    ],
  },
  {
    to: "/inicio",
    etiqueta: "Inicio",
    icono: "space_dashboard",
    roles: ["gerente", "auxiliar_administrativo"],
  },
  {
    to: "/productos",
    etiqueta: "Anadir producto Rapido",
    icono: "category",
    roles: ["gerente", "auxiliar_administrativo"],
  },
  {
    to: "/compras",
    etiqueta: "Compras",
    icono: "receipt_long",
    roles: ["gerente", "auxiliar_administrativo", "supervisor_sucursal"],
  },
  {
    to: "/cajas",
    etiqueta: "Cajas",
    icono: "point_of_sale",
    roles: ["gerente", "supervisor_sucursal", "auxiliar_administrativo"],
  },
  {
    to: "/ventas",
    etiqueta: "Ventas",
    icono: "shopping_cart",
    roles: ["vendedor", "supervisor_sucursal"],
  },
  {
    to: "/movimientos",
    etiqueta: "Historial ventas",
    icono: "receipt",
    roles: ["vendedor", "supervisor_sucursal", "gerente"],
  },
  {
    to: "/usuarios",
    etiqueta: "Usuarios",
    icono: "manage_accounts",
    roles: ["gerente"],
  },
];

const etiquetaRol = computed(
  () => etiquetasRol[estadoAutenticacion.usuario?.rol] || "Sin rol"
);
const enlacesMenuVisibles = computed(() =>
  enlacesMenu.filter((enlace) =>
    enlace.roles.includes(estadoAutenticacion.usuario?.rol)
  )
);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function manejarClickEnlace() {
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = false;
  }
}

async function manejarCierreSesion() {
  cerrandoSesion.value = true;

  try {
    await cerrarSesion();
    await router.replace("/login");
  } finally {
    cerrandoSesion.value = false;
  }
}
</script>
