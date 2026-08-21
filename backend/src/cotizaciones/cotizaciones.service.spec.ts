// ============================================================
// HYTICON — cotizaciones.service.spec.ts
// Pruebas unitarias para reglas de negocio, transiciones y permisos de cotizaciones
// ============================================================

import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EstadoCotizacion, Moneda, Rol, TipoItem } from '@prisma/client';
import { CotizacionesService } from './cotizaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { N8nService } from '../n8n/n8n.service';

describe('CotizacionesService', () => {
  let service: CotizacionesService;
  let prisma: PrismaService;
  let auditoria: AuditoriaService;
  let n8n: N8nService;

  const mockCotizacionBorrador = {
    id: 'cot-1',
    numeroCotizacion: 'COT-2026-0001',
    clienteId: 'cli-1',
    proyecto: 'Instalación de Cámaras',
    fechaEmision: new Date('2026-01-01'),
    fechaVencimiento: new Date('2026-01-15'),
    tipoDocumento: 'COTIZACIÓN',
    responsableId: 'user-supervisor-1',
    creadoPorId: 'user-supervisor-1',
    moneda: Moneda.PEN,
    estado: EstadoCotizacion.BORRADOR,
    valorVenta: 1000,
    igv: 180,
    total: 1180,
    terminosCondiciones: 'Pago al contado',
  };

  beforeEach(() => {
    prisma = {
      cliente: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
      cotizacion: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      historialEstado: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      cotizacionItem: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    } as unknown as PrismaService;

    auditoria = {
      registrar: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuditoriaService;

    n8n = {
      buildPayloadEnvio: jest.fn().mockReturnValue({ evento: 'COTIZACION_ENVIADA' }),
      dispararEvento: jest.fn().mockResolvedValue({ enviado: true, intentos: 1 }),
    } as unknown as N8nService;

    service = new CotizacionesService(prisma, auditoria, n8n);
  });

  describe('create', () => {
    it('debe rechazar la creación si el cliente está inactivo', async () => {
      (prisma.cliente.findUnique as jest.Mock).mockResolvedValue({
        id: 'cli-1',
        activo: false,
      });

      await expect(
        service.create(
          {
            clienteId: 'cli-1',
            responsableId: 'user-1',
            fechaEmision: '2026-01-01',
            fechaVencimiento: '2026-01-15',
            moneda: Moneda.PEN,
            items: [
              {
                tipoItem: TipoItem.PRODUCTO,
                descripcion: 'Cámara IP',
                cantidad: 1,
                precioUnitario: 100,
              },
            ],
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar la creación si el responsable está inactivo', async () => {
      (prisma.cliente.findUnique as jest.Mock).mockResolvedValue({
        id: 'cli-1',
        activo: true,
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        activo: false,
      });

      await expect(
        service.create(
          {
            clienteId: 'cli-1',
            responsableId: 'user-1',
            fechaEmision: '2026-01-01',
            fechaVencimiento: '2026-01-15',
            moneda: Moneda.PEN,
            items: [
              {
                tipoItem: TipoItem.PRODUCTO,
                descripcion: 'Cámara IP',
                cantidad: 1,
                precioUnitario: 100,
              },
            ],
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('debe impedir edición si la cotización ya no está en estado BORRADOR', async () => {
      (prisma.cotizacion.findUnique as jest.Mock).mockResolvedValue({
        ...mockCotizacionBorrador,
        estado: EstadoCotizacion.ENVIADA,
      });

      await expect(
        service.update('cot-1', { proyecto: 'Nuevo' }, 'user-admin', Rol.ADMIN),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe denegar a un SUPERVISOR la edición de cotizaciones de otros usuarios (IDOR)', async () => {
      (prisma.cotizacion.findUnique as jest.Mock).mockResolvedValue({
        ...mockCotizacionBorrador,
        responsableId: 'otro-supervisor',
        creadoPorId: 'otro-supervisor',
      });

      await expect(
        service.update('cot-1', { proyecto: 'Nuevo' }, 'supervisor-intruso', Rol.SUPERVISOR),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cambiarEstado', () => {
    it('debe validar y permitir transiciones válidas (ej: BORRADOR -> ENVIADA)', async () => {
      (prisma.cotizacion.findUnique as jest.Mock).mockResolvedValue(mockCotizacionBorrador);
      (prisma.cotizacion.update as jest.Mock).mockResolvedValue({
        ...mockCotizacionBorrador,
        estado: EstadoCotizacion.ENVIADA,
      });

      const res = await service.cambiarEstado(
        'cot-1',
        { estado: EstadoCotizacion.ENVIADA, nota: 'Envío manual' },
        'user-supervisor-1',
        Rol.SUPERVISOR,
      );

      expect(res.estado).toBe(EstadoCotizacion.ENVIADA);
      expect(prisma.historialEstado.create).toHaveBeenCalled();
    });

    it('debe rechazar transiciones de estado ilegales (ej: RECHAZADA -> BORRADOR)', async () => {
      (prisma.cotizacion.findUnique as jest.Mock).mockResolvedValue({
        ...mockCotizacionBorrador,
        estado: EstadoCotizacion.RECHAZADA,
      });

      await expect(
        service.cambiarEstado(
          'cot-1',
          { estado: EstadoCotizacion.BORRADOR },
          'user-admin',
          Rol.ADMIN,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('enviar', () => {
    it('debe cambiar estado a ENVIADA y disparar evento desacoplado a n8n', async () => {
      (prisma.cotizacion.findUnique as jest.Mock).mockResolvedValue({
        ...mockCotizacionBorrador,
        cliente: { nombre: 'Cliente Test', email: 'cliente@test.com' },
        responsable: { nombre: 'Resp Test', email: 'resp@test.com' },
      });

      const res = await service.enviar('cot-1', 'user-supervisor-1', Rol.SUPERVISOR);

      expect(res.ok).toBe(true);
      expect(res.estado).toBe(EstadoCotizacion.ENVIADA);
      expect(n8n.dispararEvento).toHaveBeenCalled();
      expect(auditoria.registrar).toHaveBeenCalledWith(
        expect.objectContaining({ accion: 'ENVIAR_COTIZACION' }),
      );
    });

    it('debe rechazar enviar si la cotización ya fue enviada o aprobada', async () => {
      (prisma.cotizacion.findUnique as jest.Mock).mockResolvedValue({
        ...mockCotizacionBorrador,
        estado: EstadoCotizacion.ENVIADA,
      });

      await expect(
        service.enviar('cot-1', 'user-supervisor-1', Rol.SUPERVISOR),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
