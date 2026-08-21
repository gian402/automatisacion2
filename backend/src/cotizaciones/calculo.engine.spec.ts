// ============================================================
// HYTICON — calculo.engine.spec.ts
// Pruebas unitarias para el motor de cálculo de cotizaciones
// ============================================================

import {
  calcularSubtotalItem,
  calcularTotalesCotizacion,
  validarTotales,
} from './calculo.engine';

describe('CalculoEngine', () => {
  describe('validarTotales', () => {
    it('debe validar coincidencia de totales dentro de la tolerancia de 1 centavo', () => {
      const calculado = { valorVenta: 100, igv: 18, total: 118 };
      expect(validarTotales(calculado, { valorVenta: 100, igv: 18, total: 118 })).toBe(true);
      expect(validarTotales(calculado, { valorVenta: 100.01, igv: 18, total: 118.01 })).toBe(true);
      expect(validarTotales(calculado, { valorVenta: 105, igv: 18, total: 118 })).toBe(false);
    });
  });

  describe('calcularSubtotalItem', () => {
    it('debe calcular correctamente cantidad × precioUnitario', () => {
      const subtotal = calcularSubtotalItem({
        cantidad: 5,
        precioUnitario: 120.5,
      });
      expect(subtotal).toBe(602.5);
    });

    it('debe manejar cantidades con decimales y redondear adecuadamente', () => {
      const subtotal = calcularSubtotalItem({
        cantidad: 2.5,
        precioUnitario: 33.33,
      });
      expect(subtotal).toBe(83.33); // 2.5 * 33.33 = 83.325 -> 83.33
    });

    it('debe retornar 0 si la cantidad o el precio es 0', () => {
      expect(calcularSubtotalItem({ cantidad: 0, precioUnitario: 500 })).toBe(0);
      expect(calcularSubtotalItem({ cantidad: 10, precioUnitario: 0 })).toBe(0);
    });

    it('debe evitar errores de precisión de coma flotante de JS', () => {
      const subtotal = calcularSubtotalItem({
        cantidad: 0.1,
        precioUnitario: 0.2,
      });
      expect(subtotal).toBe(0.02);
    });
  });

  describe('calcularTotalesCotizacion', () => {
    it('debe calcular valorVenta, IGV (18%) y total correctamente', () => {
      const subtotales = [100, 200, 300]; // valorVenta = 600
      const totales = calcularTotalesCotizacion(subtotales);

      expect(totales.valorVenta).toBe(600);
      expect(totales.igv).toBe(108); // 600 * 0.18 = 108
      expect(totales.total).toBe(708); // 600 + 108 = 708
    });

    it('debe manejar subtotales con decimales y calcular IGV exacto', () => {
      const subtotales = [155.75, 244.25]; // suma = 400
      const totales = calcularTotalesCotizacion(subtotales);

      expect(totales.valorVenta).toBe(400);
      expect(totales.igv).toBe(72); // 400 * 0.18 = 72
      expect(totales.total).toBe(472);
    });

    it('debe retornar 0 en todos los campos si la lista de subtotales está vacía', () => {
      const totales = calcularTotalesCotizacion([]);
      expect(totales.valorVenta).toBe(0);
      expect(totales.igv).toBe(0);
      expect(totales.total).toBe(0);
    });

    it('debe manejar cotizaciones con montos grandes sin desbordamiento ni pérdida de precisión', () => {
      const subtotales = [125000.5, 75000.25]; // 200000.75
      const totales = calcularTotalesCotizacion(subtotales);

      expect(totales.valorVenta).toBe(200000.75);
      expect(totales.igv).toBe(36000.14); // 200000.75 * 0.18 = 36000.135 -> 36000.14
      expect(totales.total).toBe(236000.89); // 200000.75 + 36000.14 = 236000.89
    });
  });
});
