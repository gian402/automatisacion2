// ============================================================
// HYTICON — Motor de cálculo de cotizaciones
// Centraliza y valida todos los cálculos. Usa aritmética
// entera (centavos) para evitar errores de punto flotante.
// ============================================================

export const IGV_PORCENTAJE = 0.18;

// ── Convierte a centavos (entero) ─────────────────────────────
function toCents(value: number): number {
  return Math.round(value * 100);
}

// ── Convierte centavos a soles con 2 decimales ────────────────
function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

export interface ItemCalculo {
  cantidad: number;
  precioUnitario: number;
}

export interface ResultadoItem {
  subtotal: number;
}

export interface ResultadoCotizacion {
  valorVenta: number;
  igv: number;
  total: number;
}

// ── Calcular subtotal de un ítem ──────────────────────────────
// subtotal = cantidad × precioUnitario  (redondeado a 2 decimales)
export function calcularSubtotalItem(item: ItemCalculo): number {
  const subtotalCents = toCents(item.cantidad) * toCents(item.precioUnitario);
  // División por 100^2 porque multiplicamos dos valores en centavos
  return fromCents(subtotalCents / 100);
}

// ── Calcular totales de la cotización ─────────────────────────
// valorVenta = suma de subtotales
// IGV        = valorVenta × 0.18
// total      = valorVenta + IGV
export function calcularTotalesCotizacion(
  subtotales: number[],
): ResultadoCotizacion {
  const valorVentaCents = subtotales.reduce(
    (acc, s) => acc + toCents(s),
    0,
  );
  const valorVenta = fromCents(valorVentaCents);
  const igvCents   = Math.round(valorVentaCents * IGV_PORCENTAJE);
  const igv        = fromCents(igvCents);
  const total      = fromCents(valorVentaCents + igvCents);

  return { valorVenta, igv, total };
}

// ── Validar que los totales enviados por el cliente coincidan ─
// Tolerancia: ±1 centavo por posibles diferencias de redondeo
export function validarTotales(
  calculado: ResultadoCotizacion,
  recibido: { valorVenta?: number; igv?: number; total?: number },
): boolean {
  if (recibido.valorVenta === undefined) return true; // no envió totales, el backend los recalcula
  return (
    Math.abs(toCents(calculado.valorVenta) - toCents(recibido.valorVenta ?? 0)) <= 1 &&
    Math.abs(toCents(calculado.igv)        - toCents(recibido.igv        ?? 0)) <= 1 &&
    Math.abs(toCents(calculado.total)      - toCents(recibido.total      ?? 0)) <= 1
  );
}
