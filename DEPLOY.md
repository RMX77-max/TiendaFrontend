# Despliegue Frontend + Backend

## Resumen

Este proyecto queda preparado para trabajar en dos entornos:

- Local:
  - frontend Quasar
  - backend Laravel en `http://localhost/Tiendabackend/public/api`
- Produccion:
  - frontend en `https://microcenter-bolivia.com`
  - backend en `https://api.microcenter-bolivia.com/index.php/api`

## Frontend

El frontend usa `fetch` nativo a traves de `solicitarApi` en `src/services/auth.js`.

La URL base se resuelve desde `quasar.config.js` con `build.env.API_BASE_URL`:

- desarrollo: `http://localhost/Tiendabackend/public/api`
- produccion: `https://api.microcenter-bolivia.com/index.php/api`

### Token en produccion

Por compatibilidad con hosting compartido, el frontend envia el token en:

- `Authorization: Bearer <token>`
- `X-Access-Token: <token>`

La cabecera `Authorization` sigue siendo la principal.
`X-Access-Token` es un respaldo para servidores donde PHP o Apache no reenvian bien `Authorization`.

## Backend

El middleware `AutenticarConToken` intenta leer el token en este orden:

1. `bearerToken()`
2. header `X-Access-Token`
3. header `Authorization`
4. `HTTP_AUTHORIZATION`
5. `REDIRECT_HTTP_AUTHORIZATION`
6. `getallheaders()`

Esto mantiene la seguridad del flujo actual sin mandar tokens por URL ni desactivar autenticacion.

## CORS

`config/cors.php` permite:

- `api/*`
- `index.php/api/*`

Origenes permitidos:

- `https://microcenter-bolivia.com`
- `http://localhost:9000`
- `http://127.0.0.1:9000`
- `http://localhost:9001`
- `http://127.0.0.1:9001`

## Build y despliegue del frontend

```bash
npm install
npm run build
```

Subir el contenido de `dist/spa` al dominio del frontend.

## Despliegue del backend

Subir el proyecto Laravel al subdominio del backend y verificar:

1. `.env` con base de datos y `APP_URL`
2. migraciones aplicadas
3. `php artisan storage:link`
4. permisos correctos en `storage` y `bootstrap/cache`

## Compatibilidad temporal de hosting compartido

La cabecera `X-Access-Token` es una medida de compatibilidad para hosting compartido/cPanel.

### Solucion ideal futura

Cuando el servidor quede bien configurado para reenviar `Authorization` a PHP:

- mantener solo `Authorization: Bearer`
- quitar el fallback `X-Access-Token`
- mantener el middleware mas simple

## Recomendacion para cPanel

Si el hosting lo permite, conviene revisar la configuracion de Apache o `.htaccess` para asegurar el reenvio de `Authorization`.

Una configuracion tipica recomendada es reenviar:

- `HTTP_AUTHORIZATION`
- `REDIRECT_HTTP_AUTHORIZATION`

La aplicacion ya funciona sin depender solo de eso, pero sigue siendo la solucion mas limpia a largo plazo.
