<template>
  <q-page class="pagina-panel q-pa-lg">
    <div class="encabezado-panel">
      <div>
        <div class="text-caption text-weight-bold texto-resalte-panel">
          Panel interno
        </div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          Bienvenido,
          {{ estadoAutenticacion.usuario?.nombre_completo || "usuario" }}
        </h1>
        <p class="text-body1 text-grey-8 q-ma-none">
          Tu sesion fue validada correctamente. Desde aqui construiremos los
          modulos de ventas, inventario, productos y gestion de usuarios.
        </p>
      </div>

      <q-card flat bordered class="tarjeta-rol-panel">
        <q-card-section>
          <div class="text-caption text-grey-7">Rol actual</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ etiquetaRol }}</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Usuario: {{ estadoAutenticacion.usuario?.nombre_usuario }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from "vue";
import { estadoAutenticacion } from "src/services/auth";

defineOptions({
  name: "DashboardPage",
});

const etiquetasRol = {
  gerente: "Gerente",
  auxiliar_administrativo: "Auxiliar administrativo",
  supervisor_sucursal: "Supervisor",
  vendedor: "Vendedor",
};

const etiquetaRol = computed(
  () => etiquetasRol[estadoAutenticacion.usuario?.rol] || "Sin rol"
);
</script>
