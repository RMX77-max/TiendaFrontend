function formatearMonto (valor) {
  return Number(valor || 0).toFixed(2)
}

function escaparHtml (valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function resolverTemaPlantilla (plantilla) {
  const clave = String(plantilla || 'clasica').toLowerCase()

  if (clave.includes('compact')) {
    return {
      fondo: '#f5f7fb',
      panel: '#ffffff',
      tinta: '#162033',
      acento: '#2455d6'
    }
  }

  if (clave.includes('modern')) {
    return {
      fondo: '#f3efe7',
      panel: '#fffdf8',
      tinta: '#2b241d',
      acento: '#bb6b1b'
    }
  }

  if (clave.includes('term')) {
    return {
      fondo: '#ffffff',
      panel: '#ffffff',
      tinta: '#111111',
      acento: '#444444'
    }
  }

  return {
    fondo: '#eef4fb',
    panel: '#ffffff',
    tinta: '#1f2d3d',
    acento: '#127a5c'
  }
}

function construirDocumentoVenta ({
  tipoDocumento,
  venta,
  plantilla,
  detalles,
  fechaEmision,
  clienteNombre,
  clienteTelefono,
  observaciones,
  sucursalNombre,
  moneda,
  totalUsd,
  totalBs
}) {
  const configuracion = plantilla || {}
  const tema = resolverTemaPlantilla(configuracion.plantilla_impresion)
  const titulo = tipoDocumento === 'cotizacion'
    ? 'Cotizacion'
    : tipoDocumento === 'nota'
      ? 'Nota para comprador'
      : 'Recibo de venta'
  const codigo = venta?.nro_venta || 'BORRADOR'
  const filas = (detalles || []).map((detalle) => `
    <tr>
      <td>${escaparHtml(detalle.modelo || detalle.producto || '-')}</td>
      <td>${escaparHtml(detalle.marca || '-')}</td>
      <td>${escaparHtml(detalle.categoria || '-')}</td>
      <td>${escaparHtml(detalle.series || '-')}</td>
      <td>${escaparHtml(detalle.cantidad)}</td>
      <td>$ ${formatearMonto(detalle.precio_venta_usd ?? detalle.precioVentaUsd)}</td>
      <td>Bs. ${formatearMonto(detalle.precio_venta_bs ?? detalle.precioVentaBs)}</td>
      <td>$ ${formatearMonto(detalle.subtotal_usd ?? ((detalle.precioVentaUsd || 0) * (detalle.cantidad || 0)))}</td>
    </tr>
  `).join('')

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escaparHtml(titulo)} ${escaparHtml(codigo)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, Helvetica, sans-serif;
            background: ${tema.fondo};
            color: ${tema.tinta};
          }
          .documento {
            max-width: 980px;
            margin: 0 auto;
            background: ${tema.panel};
            border-radius: 20px;
            padding: 28px;
            box-shadow: 0 18px 45px rgba(10, 18, 30, 0.08);
          }
          .cabecera {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: flex-start;
            border-bottom: 2px solid ${tema.acento};
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .marca {
            display: flex;
            gap: 18px;
            align-items: center;
          }
          .logo {
            width: 74px;
            height: 74px;
            border-radius: 18px;
            object-fit: cover;
            border: 1px solid rgba(0,0,0,0.08);
            background: #fff;
          }
          .logo-vacio {
            width: 74px;
            height: 74px;
            border-radius: 18px;
            background: ${tema.acento};
            color: #fff;
            display: grid;
            place-items: center;
            font-size: 28px;
            font-weight: bold;
          }
          .titulo {
            font-size: 30px;
            font-weight: 700;
            margin: 0 0 8px;
          }
          .subtitulo {
            margin: 0;
            color: #5f6b7a;
            font-size: 14px;
          }
          .bloque-meta {
            text-align: right;
            min-width: 220px;
          }
          .codigo {
            font-size: 24px;
            font-weight: 700;
            color: ${tema.acento};
            margin-bottom: 8px;
          }
          .rejilla {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 22px;
          }
          .tarjeta {
            background: rgba(0, 0, 0, 0.025);
            border-radius: 14px;
            padding: 14px 16px;
          }
          .etiqueta {
            display: block;
            font-size: 12px;
            color: #697585;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .valor {
            font-size: 15px;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          thead th {
            text-align: left;
            padding: 12px 10px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #5f6b7a;
            border-bottom: 1px solid #dfe6ee;
          }
          tbody td {
            padding: 12px 10px;
            border-bottom: 1px solid #edf1f6;
            font-size: 14px;
          }
          .totales {
            margin-top: 24px;
            display: grid;
            grid-template-columns: 1fr 280px;
            gap: 18px;
          }
          .resumen-total {
            background: ${tema.acento};
            color: #fff;
            border-radius: 18px;
            padding: 18px;
          }
          .resumen-total h3 {
            margin: 0 0 12px;
            font-size: 18px;
          }
          .resumen-total p {
            margin: 6px 0;
            font-size: 15px;
          }
          .mensaje {
            margin-top: 26px;
            padding-top: 18px;
            border-top: 1px dashed #cfd8e3;
            color: #596574;
            font-size: 14px;
          }
          @media print {
            body { padding: 0; background: #fff; }
            .documento { box-shadow: none; border-radius: 0; max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="documento">
          <div class="cabecera">
            <div class="marca">
              ${configuracion.logo_url
                ? `<img src="${escaparHtml(configuracion.logo_url)}" alt="Logo" class="logo" />`
                : `<div class="logo-vacio">${escaparHtml((configuracion.nombre || sucursalNombre || 'PT').slice(0, 2).toUpperCase())}</div>`}
              <div>
                <h1 class="titulo">${escaparHtml(titulo)}</h1>
                <p class="subtitulo">${escaparHtml(configuracion.nombre || sucursalNombre || 'Sucursal')} | ${escaparHtml(configuracion.direccion || 'Sin direccion registrada')}</p>
                <p class="subtitulo">${escaparHtml(configuracion.telefono || 'Sin telefono registrado')}</p>
              </div>
            </div>
            <div class="bloque-meta">
              <div class="codigo">${escaparHtml(codigo)}</div>
              <div class="subtitulo">Fecha: ${escaparHtml(fechaEmision || '')}</div>
              <div class="subtitulo">Moneda: ${escaparHtml((moneda || 'bs').toUpperCase())}</div>
            </div>
          </div>

          <div class="rejilla">
            <div class="tarjeta">
              <span class="etiqueta">Cliente</span>
              <div class="valor">${escaparHtml(clienteNombre || 'Sin nombre')}</div>
            </div>
            <div class="tarjeta">
              <span class="etiqueta">Telefono</span>
              <div class="valor">${escaparHtml(clienteTelefono || 'Sin telefono')}</div>
            </div>
            <div class="tarjeta">
              <span class="etiqueta">Sucursal</span>
              <div class="valor">${escaparHtml(sucursalNombre || configuracion.nombre || '-')}</div>
            </div>
            <div class="tarjeta">
              <span class="etiqueta">Observaciones</span>
              <div class="valor">${escaparHtml(observaciones || 'Sin observaciones')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Categoria</th>
                <th>Serie</th>
                <th>Cant.</th>
                <th>Precio USD</th>
                <th>Precio Bs</th>
                <th>Subtotal USD</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>

          <div class="totales">
            <div></div>
            <div class="resumen-total">
              <h3>Total del documento</h3>
              <p>Total USD: $ ${formatearMonto(totalUsd)}</p>
              <p>Total Bs: Bs. ${formatearMonto(totalBs)}</p>
            </div>
          </div>

          <div class="mensaje">
            ${escaparHtml(configuracion.mensaje_documentos || 'Gracias por tu preferencia.')}
          </div>
        </div>
      </body>
    </html>
  `
}

function abrirVentanaImpresion (html) {
  const ventana = window.open('', '_blank', 'width=1024,height=900')

  if (!ventana) {
    throw new Error('El navegador bloqueo la ventana de impresion.')
  }

  ventana.document.open()
  ventana.document.write(html)
  ventana.document.close()
  ventana.focus()
  ventana.onload = () => {
    ventana.print()
  }
}

function imprimirDocumentoVenta ({
  tipoDocumento,
  venta,
  plantilla,
  borrador
}) {
  const fuente = venta || borrador || {}
  const detalles = fuente.detalles || []
  const html = construirDocumentoVenta({
    tipoDocumento,
    venta: fuente,
    plantilla: plantilla || fuente.plantilla || null,
    detalles,
    fechaEmision: fuente.fecha_venta || new Date().toLocaleString('es-BO'),
    clienteNombre: fuente.cliente_nombre || fuente.clienteNombre,
    clienteTelefono: fuente.cliente_telefono || fuente.clienteTelefono,
    observaciones: fuente.observaciones,
    sucursalNombre: fuente.sucursal || fuente.sucursalNombre,
    moneda: fuente.moneda,
    totalUsd: fuente.total_usd ?? fuente.totalUsd,
    totalBs: fuente.total_bs ?? fuente.totalBs
  })

  abrirVentanaImpresion(html)
}

export {
  imprimirDocumentoVenta
}
