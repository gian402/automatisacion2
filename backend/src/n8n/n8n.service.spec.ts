// ============================================================
// HYTICON — n8n.service.spec.ts
// Pruebas unitarias para integración desacoplada con n8n
// ============================================================

import { ConfigService } from '@nestjs/config';
import { N8nService } from './n8n.service';

describe('N8nService', () => {
  let service: N8nService;
  let config: ConfigService;

  beforeEach(() => {
    config = {
      get: jest.fn(),
    } as unknown as ConfigService;
  });

  describe('dispararEvento cuando n8n NO está configurado', () => {
    it('debe retornar enviado=false sin lanzar excepción para no bloquear el backend', async () => {
      (config.get as jest.Mock).mockReturnValue(undefined); // N8N_WEBHOOK_URL no configurado
      service = new N8nService(config);

      const payload = {
        evento: 'COTIZACION_ENVIADA',
        cotizacionId: 'cot-1',
        numeroCotizacion: 'COT-2026-0001',
        idempotencyKey: 'idemp-123',
        timestamp: new Date().toISOString(),
      };

      const result = await service.dispararEvento(payload);

      expect(result.enviado).toBe(false);
      expect(result.error).toBe('N8N_NOT_CONFIGURED');
    });
  });

  describe('buildPayloadEnvio', () => {
    it('debe generar una clave de idempotencia consistente (determinista)', () => {
      (config.get as jest.Mock).mockReturnValue('https://n8n.hyticon.com/webhook/test');
      service = new N8nService(config);

      const payload1 = service.buildPayloadEnvio({
        cotizacionId: 'cot-1',
        numeroCotizacion: 'COT-2026-0001',
        clienteNombre: 'Cliente SAC',
        clienteEmail: 'cliente@sac.com',
        responsableNombre: 'Juan Pérez',
        total: 1500,
        moneda: 'PEN',
      });

      const payload2 = service.buildPayloadEnvio({
        cotizacionId: 'cot-1',
        numeroCotizacion: 'COT-2026-0001',
        clienteNombre: 'Cliente SAC',
        clienteEmail: 'cliente@sac.com',
        responsableNombre: 'Juan Pérez',
        total: 1500,
        moneda: 'PEN',
      });

      expect(payload1.idempotencyKey).toBe(payload2.idempotencyKey);
      expect(payload1.evento).toBe('COTIZACION_ENVIADA');
      expect(payload1.datos?.urlPdf).toBe('/api/v1/pdf/cotizacion/cot-1');
    });
  });

  describe('tolerancia a fallos de n8n', () => {
    it('debe capturar errores de red y retornar resultado sin quebrar la petición', async () => {
      (config.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'N8N_WEBHOOK_URL') return 'http://localhost:9999/webhook/invalid';
        return undefined;
      });
      service = new N8nService(config);

      // Mock global fetch para simular fallo
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error / connection refused'));

      try {
        const payload = service.buildPayloadEnvio({
          cotizacionId: 'cot-1',
          numeroCotizacion: 'COT-2026-0001',
          clienteNombre: 'Cliente SAC',
          clienteEmail: 'cliente@sac.com',
          responsableNombre: 'Juan Pérez',
          total: 1500,
          moneda: 'PEN',
        });

        const result = await service.dispararEvento(payload);

        expect(result.enviado).toBe(false);
        expect(result.intentos).toBe(3);
        expect(result.error).toContain('Network error');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
