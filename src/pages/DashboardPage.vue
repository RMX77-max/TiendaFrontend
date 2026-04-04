<template>
  <q-page class="pagina-panel q-pa-lg">
    <div class="encabezado-panel">
      <div>
        <div class="text-caption text-weight-bold texto-resalte-panel">Panel interno</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          Bienvenido, {{ estadoAutenticacion.usuario?.nombre_completo || 'usuario' }}
        </h1>
        <p class="text-body1 text-grey-8 q-ma-none">
          Tu sesion fue validada correctamente. Desde aqui construiremos los modulos de ventas,
          inventario, productos y gestion de usuarios.
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

    <div class="rejilla-panel q-mt-lg">
      <q-card flat bordered class="tarjeta-panel">
        <q-card-section>
          <div class="text-overline text-grey-7">Acceso seguro</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Rutas protegidas</div>
          <p class="text-body2 text-grey-8 q-mt-sm q-mb-none">
            Si intentas entrar sin token valido, el sistema te devolvera al login.
          </p>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="tarjeta-panel">
        <q-card-section>
          <div class="text-overline text-grey-7">Sesion por ventana</div>
          <div class="text-h6 text-weight-bold q-mt-sm">No se comparte por URL</div>
          <p class="text-body2 text-grey-8 q-mt-sm q-mb-none">
            La autenticacion se guarda en sessionStorage, asi que abrir una ventana nueva exige volver a iniciar sesion.
          </p>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="tarjeta-panel">
        <q-card-section>
          <div class="text-overline text-grey-7">Siguiente fase</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Modulo de usuarios</div>
          <p class="text-body2 text-grey-8 q-mt-sm q-mb-none">
            La gestion de usuarios ya puede crecer con registros, sucursales y activacion de cuentas.
          </p>
          <q-btn
            unelevated
            color="dark"
            text-color="white"
            label="Ir a usuarios"
            to="/usuarios"
            class="q-mt-md"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { estadoAutenticacion } from 'src/services/auth'

defineOptions({
  name: 'DashboardPage'
})

const etiquetasRol = {
  gerente: 'Gerente',
  auxiliar_administrativo: 'Auxiliar administrativo',
  supervisor_sucursal: 'Supervisor',
  vendedor: 'Vendedor'
}

const etiquetaRol = computed(() => etiquetasRol[estadoAutenticacion.usuario?.rol] || 'Sin rol')
</script>
