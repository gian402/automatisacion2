// ============================================================
// HYTICON — PdfService
// Genera el PDF de cotización usando Puppeteer + plantilla HTML
// Basado visualmente en la plantilla real de HYTICON
// ============================================================

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Rol } from '@prisma/client';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

// ── Sanitizador HTML para prevenir inyección en PDF ───────────
function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Formateadores ─────────────────────────────────────────────
function formatMonto(valor: string | number, moneda: string): string {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  const symbol = moneda === 'USD' ? '$' : 'S/';
  return `${symbol} ${num.toFixed(2)}`;
}

function formatFecha(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// ── Etiquetas de estado ───────────────────────────────────────
const ESTADO_LABEL: Record<string, string> = {
  BORRADOR:  'Borrador',
  ENVIADA:   'Enviada',
  APROBADA:  'Aprobada',
  RECHAZADA: 'Rechazada',
  VENCIDA:   'Vencida',
};

const ESTADO_COLOR: Record<string, string> = {
  BORRADOR:  '#64748b',
  ENVIADA:   '#2563eb',
  APROBADA:  '#16a34a',
  RECHAZADA: '#dc2626',
  VENCIDA:   '#d97706',
};

const TIPO_ITEM_LABEL: Record<string, string> = {
  PRODUCTO: 'Producto',
  MATERIAL: 'Material',
  SERVICIO: 'Servicio',
};

// ── Plantilla HTML HYTICON ────────────────────────────────────
function buildHtml(cot: {
  numeroCotizacion: string;
  estado: string;
  tipoDocumento: string;
  moneda: string;
  fechaEmision: Date | string;
  fechaVencimiento: Date | string;
  proyecto: string | null;
  terminosCondiciones: string | null;
  valorVenta: string;
  igv: string;
  total: string;
  cliente: { nombre: string; ruc?: string | null; direccion?: string | null; email?: string | null; telefono?: string | null } | null;
  responsable: { nombre: string; email?: string | null } | null;
  items: Array<{
    tipoItem: string;
    descripcion: string;
    cantidad: string;
    precioUnitario: string;
    subtotal: string;
  }>;
}): string {
  const itemsRows = cot.items.map((item, i) => `
    <tr class="${i % 2 === 0 ? '' : 'alt'}">
      <td class="center">${i + 1}</td>
      <td class="center tipo">${escapeHtml(TIPO_ITEM_LABEL[item.tipoItem] ?? item.tipoItem)}</td>
      <td>${escapeHtml(item.descripcion)}</td>
      <td class="center">${parseFloat(item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
      <td class="right">${formatMonto(item.precioUnitario, cot.moneda)}</td>
      <td class="right bold">${formatMonto(item.subtotal, cot.moneda)}</td>
    </tr>
  `).join('');

  const terminosHtml = cot.terminosCondiciones
    ? cot.terminosCondiciones.split('\n').map(l => `<p>${escapeHtml(l.trim())}</p>`).join('')
    : '<p>Sin términos especificados.</p>';

  const estadoColor = ESTADO_COLOR[cot.estado] ?? '#64748b';
  const estadoLabel = ESTADO_LABEL[cot.estado] ?? cot.estado;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${cot.numeroCotizacion}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 10px;
    color: #1e293b;
    background: #ffffff;
    padding: 0;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 14mm 14mm 12mm 14mm;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ── HEADER ────────────────────────────── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #1e3a5f;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }

  .logo-area { display: flex; flex-direction: column; gap: 2px; }

  .logo-name {
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 2px;
    color: #1e3a5f;
    line-height: 1;
  }

  .logo-name span { color: #2563eb; }

  .logo-tagline {
    font-size: 8px;
    color: #64748b;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .doc-info {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .doc-tipo {
    font-size: 14px;
    font-weight: 700;
    color: #1e3a5f;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .doc-numero {
    font-size: 11px;
    font-weight: 600;
    color: #2563eb;
    font-family: 'Courier New', monospace;
  }

  .doc-estado {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #fff;
    background: ${estadoColor};
    align-self: flex-end;
  }

  /* ── INFO GRID ─────────────────────────── */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }

  .info-box {
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 8px 10px;
  }

  .info-box-title {
    font-size: 7.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #94a3b8;
    margin-bottom: 5px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 3px;
  }

  .info-row {
    display: flex;
    gap: 5px;
    margin-bottom: 2px;
    font-size: 9.5px;
    line-height: 1.4;
  }

  .info-label {
    color: #64748b;
    font-weight: 600;
    min-width: 85px;
    flex-shrink: 0;
  }

  .info-value { color: #1e293b; }
  .info-value.strong { font-weight: 700; font-size: 10px; }

  /* ── TABLA DE ÍTEMS ────────────────────── */
  .items-section { margin-bottom: 14px; }

  .section-title {
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #1e3a5f;
    background: #f0f4f8;
    border-left: 3px solid #1e3a5f;
    padding: 4px 8px;
    margin-bottom: 0;
  }

  table.items {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
  }

  table.items thead tr {
    background: #1e3a5f;
    color: #ffffff;
  }

  table.items thead th {
    padding: 5px 7px;
    font-weight: 600;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  table.items tbody tr { border-bottom: 1px solid #e8edf2; }
  table.items tbody tr.alt { background: #f8fafc; }
  table.items tbody tr:hover { background: #f1f5f9; }

  table.items td {
    padding: 5px 7px;
    vertical-align: top;
    line-height: 1.4;
  }

  table.items .center { text-align: center; }
  table.items .right  { text-align: right; font-family: 'Courier New', monospace; }
  table.items .bold   { font-weight: 700; }

  .tipo {
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 7.5px;
    font-weight: 600;
    border-radius: 2px;
  }

  /* ── TOTALES ───────────────────────────── */
  .totales-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 14px;
  }

  .totales {
    width: 240px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .totales-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 10px;
    font-size: 9.5px;
    border-bottom: 1px solid #f1f5f9;
  }

  .totales-row:last-child { border-bottom: none; }
  .totales-row .label { color: #64748b; }
  .totales-row .amount { font-family: 'Courier New', monospace; font-weight: 600; color: #1e293b; }

  .totales-row.total-final {
    background: #1e3a5f;
    padding: 7px 10px;
  }

  .totales-row.total-final .label  { color: #e2e8f0; font-weight: 700; font-size: 10px; }
  .totales-row.total-final .amount { color: #ffffff; font-size: 11px; font-weight: 700; }

  /* ── TÉRMINOS ──────────────────────────── */
  .terminos-section { margin-bottom: 14px; }

  .terminos-body {
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 8px 10px;
    font-size: 8.5px;
    color: #475569;
    line-height: 1.6;
  }

  .terminos-body p { margin-bottom: 2px; }

  /* ── FOOTER ────────────────────────────── */
  .footer {
    margin-top: auto;
    border-top: 2px solid #e2e8f0;
    padding-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-left { font-size: 7.5px; color: #94a3b8; }
  .footer-right { font-size: 7.5px; color: #94a3b8; text-align: right; }

  .firma-area {
    display: flex;
    gap: 40px;
    justify-content: center;
    margin-bottom: 14px;
  }

  .firma-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 150px;
  }

  .firma-line {
    width: 100%;
    border-bottom: 1px solid #94a3b8;
    margin-bottom: 3px;
    height: 30px;
  }

  .firma-label {
    font-size: 8px;
    color: #64748b;
    text-align: center;
    font-weight: 600;
  }

  .firma-nombre {
    font-size: 7.5px;
    color: #94a3b8;
    text-align: center;
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="logo-area">
      <div class="logo-name">HY<span>TI</span>CON</div>
      <div class="logo-tagline">Tecnología · Seguridad Electrónica</div>
    </div>
    <div class="doc-info">
      <div class="doc-tipo">${escapeHtml(cot.tipoDocumento)}</div>
      <div class="doc-numero">${escapeHtml(cot.numeroCotizacion)}</div>
      <div class="doc-estado">${escapeHtml(estadoLabel)}</div>
    </div>
  </div>

  <!-- INFO GRID -->
  <div class="info-grid">
    <!-- Cliente -->
    <div class="info-box">
      <div class="info-box-title">Datos del cliente</div>
      <div class="info-row">
        <span class="info-label">Razón social:</span>
        <span class="info-value strong">${escapeHtml(cot.cliente?.nombre ?? '—')}</span>
      </div>
      ${cot.cliente?.ruc ? `
      <div class="info-row">
        <span class="info-label">RUC:</span>
        <span class="info-value">${escapeHtml(cot.cliente.ruc)}</span>
      </div>` : ''}
      ${cot.cliente?.direccion ? `
      <div class="info-row">
        <span class="info-label">Dirección:</span>
        <span class="info-value">${escapeHtml(cot.cliente.direccion)}</span>
      </div>` : ''}
      ${cot.cliente?.email ? `
      <div class="info-row">
        <span class="info-label">Correo:</span>
        <span class="info-value">${escapeHtml(cot.cliente.email)}</span>
      </div>` : ''}
      ${cot.cliente?.telefono ? `
      <div class="info-row">
        <span class="info-label">Teléfono:</span>
        <span class="info-value">${escapeHtml(cot.cliente.telefono)}</span>
      </div>` : ''}
      ${cot.proyecto ? `
      <div class="info-row">
        <span class="info-label">Proyecto:</span>
        <span class="info-value">${escapeHtml(cot.proyecto)}</span>
      </div>` : ''}
    </div>

    <!-- Datos del documento -->
    <div class="info-box">
      <div class="info-box-title">Datos del documento</div>
      <div class="info-row">
        <span class="info-label">Fecha de emisión:</span>
        <span class="info-value">${formatFecha(cot.fechaEmision)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha vencimiento:</span>
        <span class="info-value">${formatFecha(cot.fechaVencimiento)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tipo de documento:</span>
        <span class="info-value">${escapeHtml(cot.tipoDocumento)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Moneda:</span>
        <span class="info-value">${cot.moneda === 'PEN' ? 'Soles (S/)' : 'Dólares (USD)'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Responsable:</span>
        <span class="info-value strong">${escapeHtml(cot.responsable?.nombre ?? '—')}</span>
      </div>
      ${cot.responsable?.email ? `
      <div class="info-row">
        <span class="info-label">Correo:</span>
        <span class="info-value">${escapeHtml(cot.responsable.email)}</span>
      </div>` : ''}
    </div>
  </div>

  <!-- TABLA DE ÍTEMS -->
  <div class="items-section">
    <div class="section-title">Detalle de ítems</div>
    <table class="items">
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th style="width:65px">Tipo</th>
          <th>Descripción</th>
          <th style="width:55px">Cantidad</th>
          <th style="width:85px; text-align:right">P. Unitario</th>
          <th style="width:85px; text-align:right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
  </div>

  <!-- TOTALES -->
  <div class="totales-wrap">
    <div class="totales">
      <div class="totales-row">
        <span class="label">Valor de venta</span>
        <span class="amount">${formatMonto(cot.valorVenta, cot.moneda)}</span>
      </div>
      <div class="totales-row">
        <span class="label">IGV (18%)</span>
        <span class="amount">${formatMonto(cot.igv, cot.moneda)}</span>
      </div>
      <div class="totales-row total-final">
        <span class="label">TOTAL</span>
        <span class="amount">${formatMonto(cot.total, cot.moneda)}</span>
      </div>
    </div>
  </div>

  <!-- TÉRMINOS Y CONDICIONES -->
  ${cot.terminosCondiciones ? `
  <div class="terminos-section">
    <div class="section-title">Términos y condiciones</div>
    <div class="terminos-body">
      ${terminosHtml}
    </div>
  </div>` : ''}

  <!-- ÁREA DE FIRMAS -->
  <div class="firma-area">
    <div class="firma-box">
      <div class="firma-line"></div>
      <div class="firma-label">Responsable HYTICON</div>
      <div class="firma-nombre">${escapeHtml(cot.responsable?.nombre ?? '')}</div>
    </div>
    <div class="firma-box">
      <div class="firma-line"></div>
      <div class="firma-label">Conformidad del cliente</div>
      <div class="firma-nombre">${escapeHtml(cot.cliente?.nombre ?? '')}</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      HYTICON — Tecnología · Seguridad Electrónica<br/>
      Documento generado el ${formatFecha(new Date())}
    </div>
    <div class="footer-right">
      ${escapeHtml(cot.numeroCotizacion)}<br/>
      Documento válido hasta ${formatFecha(cot.fechaVencimiento)}
    </div>
  </div>

</div>
</body>
</html>`;
}

// ── PdfService ────────────────────────────────────────────────
@Injectable()
export class PdfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async generarPdf(cotizacionId: string, usuarioId: string, userRol?: Rol): Promise<Buffer> {
    // Cargar la cotización completa
    const cot = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        cliente:     true,
        responsable: { select: { id: true, nombre: true, email: true } },
        items:       { orderBy: { orden: 'asc' } },
      },
    });

    if (!cot) throw new NotFoundException('Cotización no encontrada');

    // Validación de autorización para SUPERVISOR (prevención IDOR)
    if (
      userRol === Rol.SUPERVISOR &&
      cot.responsableId !== usuarioId &&
      cot.creadoPorId   !== usuarioId
    ) {
      throw new ForbiddenException('No tienes permiso para generar el PDF de esta cotización');
    }

    // Construir HTML sanitizado
    const html = buildHtml({
      numeroCotizacion:    cot.numeroCotizacion,
      estado:              cot.estado,
      tipoDocumento:       cot.tipoDocumento,
      moneda:              cot.moneda,
      fechaEmision:        cot.fechaEmision,
      fechaVencimiento:    cot.fechaVencimiento,
      proyecto:            cot.proyecto,
      terminosCondiciones: cot.terminosCondiciones,
      valorVenta:          cot.valorVenta.toString(),
      igv:                 cot.igv.toString(),
      total:               cot.total.toString(),
      cliente: cot.cliente
        ? {
            nombre:    cot.cliente.nombre,
            ruc:       cot.cliente.ruc,
            direccion: cot.cliente.direccion,
            email:     cot.cliente.email,
            telefono:  cot.cliente.telefono,
          }
        : null,
      responsable: cot.responsable
        ? { nombre: cot.responsable.nombre, email: cot.responsable.email }
        : null,
      items: cot.items.map((item) => ({
        tipoItem:      item.tipoItem,
        descripcion:   item.descripcion,
        cantidad:      item.cantidad.toString(),
        precioUnitario: item.precioUnitario.toString(),
        subtotal:      item.subtotal.toString(),
      })),
    });

    // Generar PDF con Puppeteer
    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });

      const pdfBuffer = await page.pdf({
        format:            'A4',
        printBackground:   true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      // Registrar en auditoría
      await this.auditoria.registrar({
        usuarioId,
        accion:    'GENERAR_PDF',
        entidad:   'cotizaciones',
        entidadId: cotizacionId,
        detalle:   { numeroCotizacion: cot.numeroCotizacion },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      if (browser) await browser.close();
    }
  }
}
