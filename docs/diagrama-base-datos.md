# Diagrama De Base De Datos

Este diagrama resume la base de datos funcional del proyecto hasta ahora.

- Incluye tablas de negocio principales
- Omite tablas tecnicas de Laravel como `cache`, `jobs`, `failed_jobs`
- Usa nombres reales de tablas y relaciones implementadas

```mermaid
erDiagram
    usuarios ||--o{ tokens_acceso : tiene
    usuarios ||--o{ solicitudes_transferencia : solicita
    usuarios ||--o{ solicitudes_transferencia : revisa

    sucursales ||--o{ producto_unidades : almacena
    sucursales ||--o{ solicitudes_transferencia : solicita_desde
    sucursales ||--o{ solicitudes_transferencia : envia_desde
    sucursales ||--o{ compra_abonos : abona

    marcas ||--o{ productos : clasifica
    categorias ||--o{ productos : clasifica

    productos ||--o{ producto_unidades : tiene
    productos ||--o{ solicitudes_transferencia : se_solicita
    productos ||--o{ compra_detalles : puede_vincular

    proveedores ||--o{ compras : provee

    compras ||--o{ compra_detalles : contiene
    compras ||--o{ compra_abonos : recibe_abonos
    compras ||--o{ compra_cuotas : puede_tener
    compras ||--o{ compra_guias : puede_tener
    compras ||--o{ compra_recepciones : registra

    compra_guias ||--o{ compra_recepciones : puede_asociar
    compra_recepciones ||--o{ compra_recepcion_detalles : detalla
    compra_detalles ||--o{ compra_recepcion_detalles : se_recepciona

    usuarios {
        bigint id PK
        varchar nombre
        varchar apellido
        varchar nombre_usuario
        varchar rol
        varchar sucursal
        boolean activo
    }

    tokens_acceso {
        bigint id PK
        bigint user_id FK
        text token
        timestamp expira_en
    }

    sucursales {
        bigint id PK
        varchar nombre
        boolean activa
    }

    marcas {
        bigint id PK
        varchar nombre
        boolean activa
    }

    categorias {
        bigint id PK
        varchar nombre
        boolean activa
    }

    productos {
        bigint id PK
        varchar modelo
        bigint marca_id FK
        bigint categoria_id FK
        decimal precio_venta_usd
        decimal precio_venta_bs
        decimal costo_referencial_usd
        decimal costo_referencial_bs
        boolean activo
    }

    producto_unidades {
        bigint id PK
        bigint producto_id FK
        bigint sucursal_id FK
        varchar numero_serie
        varchar estado
        text observaciones
        date fecha_ingreso
        boolean activo
    }

    solicitudes_transferencia {
        bigint id PK
        bigint producto_id FK
        bigint usuario_solicitante_id FK
        bigint sucursal_solicitante_id FK
        bigint sucursal_origen_id FK
        int cantidad_solicitada
        int cantidad_aprobada
        varchar estado
        bigint usuario_revisor_id FK
        timestamp fecha_respuesta
    }

    proveedores {
        bigint id PK
        varchar nombre
        boolean activo
    }

    compras {
        bigint id PK
        bigint proveedor_id FK
        date fecha_pedido
        varchar tipo_compra
        varchar nro_pedido
        decimal tipo_cambio_general
        int tiempo_entrega_dias
        varchar estado
        decimal total_productos_usd
        decimal total_productos_bs
        decimal total_abonos_usd
        decimal total_abonos_bs
        decimal saldo_pendiente_usd
        decimal saldo_pendiente_bs
        decimal total_guias_bs
        decimal devolucion_pendiente_usd
        decimal devolucion_pendiente_bs
    }

    compra_detalles {
        bigint id PK
        bigint compra_id FK
        bigint producto_id FK
        varchar detalle_texto
        int cantidad_pedida
        int cantidad_recibida_acumulada
        int cantidad_pendiente
        decimal tipo_cambio_aplicado
        decimal precio_unitario_usd
        decimal precio_unitario_bs
        decimal subtotal_usd
        decimal subtotal_bs
        varchar estado_linea
    }

    compra_abonos {
        bigint id PK
        bigint compra_id FK
        bigint sucursal_id FK
        decimal tipo_cambio_abono
        decimal abono_usd
        decimal abono_bs
        date fecha_abono
    }

    compra_cuotas {
        bigint id PK
        bigint compra_id FK
        int nro_cuota
        date fecha_vencimiento
        decimal monto_usd
        decimal monto_bs
        decimal saldo_pendiente_usd
        decimal saldo_pendiente_bs
        varchar estado
    }

    compra_guias {
        bigint id PK
        bigint compra_id FK
        date fecha_registro
        decimal monto_bs
        varchar estado
        boolean pagado
        text observaciones
    }

    compra_recepciones {
        bigint id PK
        bigint compra_id FK
        bigint compra_guia_id FK
        date fecha_recepcion
        varchar estado_recepcion
        boolean ingresado_inventario
    }

    compra_recepcion_detalles {
        bigint id PK
        bigint recepcion_id FK
        bigint compra_detalle_id FK
        int cantidad_recibida
        text observaciones
    }
```

## Lectura Rapida

- `productos` es el catalogo base
- `producto_unidades` guarda cada unidad fisica real por sucursal
- `compras` concentra la cabecera del pedido o compra
- `compra_detalles` guarda cada linea del pedido
- `compra_abonos` registra pagos directos por sucursal
- `compra_cuotas` queda preparada para escenarios de credito
- `compra_guias` controla el transporte o envio
- `compra_recepciones` y `compra_recepcion_detalles` controlan llegadas parciales o totales
- `solicitudes_transferencia` registra movimientos solicitados entre sucursales

## Sugerencia Para Entregar Como Imagen

Puedes abrir este archivo en:

- GitHub
- VS Code con vista previa Markdown
- Mermaid Live Editor

Y desde ahi exportarlo como imagen si te piden una "foto" del modelo.
