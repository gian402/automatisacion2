// ============================================================
// HYTICON — ReportesService
// Análisis de cotizaciones con filtros por fecha, estado,
// responsable y cliente. Solo ADMIN.
// ============================================================

import { Injectable } from '@nestjs/common';
import { EstadoCotizacion, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface FiltrosReporte {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: EstadoCotizacion;
  responsableId?: string;
  clienteId?: string;
}

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Resumen general ───────────────────────────────────────
  async getResumen(filtros: FiltrosReporte) {
    const where = this.buildWhere(filtros);

    const [
      totalCotizaciones,
      porEstado,
      montoTotal,
      montoAprobado,
      cotizacionesDetalle,
    ] = await Promise.all([
      // Total en el período
      this.prisma.cotizacion.count({ where }),

      // Agrupación por estado
      this.prisma.cotizacion.groupBy({
        by: ['estado'],
        where,
        _count: { id: true },
        _sum:   { total: true },
      }),

      // Monto total cotizado
      this.prisma.cotizacion.aggregate({
        where,
        _sum: { total: true, valorVenta: true, igv: true },
      }),

      // Monto de las aprobadas
      this.prisma.cotizacion.aggregate({
        where: { ...where, estado: EstadoCotizacion.APROBADA },
        _sum:  { total: true },
      }),

      // Listado con datos para la tabla
      this.prisma.cotizacion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          numeroCotizacion: true,
          estado: true,
          moneda: true,
          total: true,
          valorVenta: true,
          igv: true,
          fechaEmision: true,
          fechaVencimiento: true,
          createdAt: true,
          cliente:     { select: { id: true, nombre: true, ruc: true } },
          responsable: { select: { id: true, nombre: true } },
        },
        take: 200, // máximo para no sobrecargar
      }),
    ]);

    // ── Tasa de conversión ──────────────────────────────────
    const aprobadas  = porEstado.find((e) => e.estado === EstadoCotizacion.APROBADA)?._count.id ?? 0;
    const rechazadas = porEstado.find((e) => e.estado === EstadoCotizacion.RECHAZADA)?._count.id ?? 0;
    const cerradas   = aprobadas + rechazadas;
    const tasaConversion = cerradas > 0 ? Math.round((aprobadas / cerradas) * 100) : null;

    // ── Evolución temporal (agrupado por mes) ───────────────
    const evolucion = await this.getEvolucionMensual(where);

    // ── Top clientes por monto ──────────────────────────────
    const topClientes = await this.getTopClientes(where);

    // ── Top responsables ───────────────────────────────────
    const topResponsables = await this.getTopResponsables(where);

    return {
      resumen: {
        totalCotizaciones,
        montoTotal:    Number(montoTotal._sum.total    ?? 0),
        montoAprobado: Number(montoAprobado._sum.total ?? 0),
        tasaConversion,
      },
      porEstado: porEstado.map((e) => ({
        estado: e.estado,
        cantidad: e._count.id,
        monto: Number(e._sum.total ?? 0),
      })),
      evolucion,
      topClientes,
      topResponsables,
      cotizaciones: cotizacionesDetalle.map((c) => ({
        id:               c.id,
        numeroCotizacion: c.numeroCotizacion,
        estado:           c.estado,
        moneda:           c.moneda,
        total:            Number(c.total),
        valorVenta:       Number(c.valorVenta),
        igv:              Number(c.igv),
        fechaEmision:     c.fechaEmision,
        createdAt:        c.createdAt,
        cliente:          c.cliente,
        responsable:      c.responsable,
      })),
    };
  }

  // ── Evolución mensual ─────────────────────────────────────
  private async getEvolucionMensual(where: Prisma.CotizacionWhereInput) {
    const rows = await this.prisma.cotizacion.findMany({
      where,
      select: { createdAt: true, total: true, estado: true },
      orderBy: { createdAt: 'asc' },
    });

    // Agrupar por año-mes
    const mapa = new Map<string, { mes: string; cantidad: number; monto: number; aprobadas: number }>();

    for (const row of rows) {
      const key = `${row.createdAt.getFullYear()}-${String(row.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!mapa.has(key)) {
        mapa.set(key, { mes: key, cantidad: 0, monto: 0, aprobadas: 0 });
      }
      const entry = mapa.get(key)!;
      entry.cantidad++;
      entry.monto += Number(row.total);
      if (row.estado === EstadoCotizacion.APROBADA) entry.aprobadas++;
    }

    return Array.from(mapa.values()).slice(-12); // últimos 12 meses
  }

  // ── Top clientes ──────────────────────────────────────────
  private async getTopClientes(where: Prisma.CotizacionWhereInput) {
    const rows = await this.prisma.cotizacion.groupBy({
      by: ['clienteId'],
      where,
      _count: { id: true },
      _sum:   { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });

    const clienteIds = rows.map((r) => r.clienteId);
    const clientes = await this.prisma.cliente.findMany({
      where: { id: { in: clienteIds } },
      select: { id: true, nombre: true },
    });
    const clienteMap = new Map(clientes.map((c) => [c.id, c.nombre]));

    return rows.map((r) => ({
      clienteId: r.clienteId,
      nombre:    clienteMap.get(r.clienteId) ?? '—',
      cantidad:  r._count.id,
      monto:     Number(r._sum.total ?? 0),
    }));
  }

  // ── Top responsables ──────────────────────────────────────
  private async getTopResponsables(where: Prisma.CotizacionWhereInput) {
    const rows = await this.prisma.cotizacion.groupBy({
      by: ['responsableId'],
      where,
      _count: { id: true },
      _sum:   { total: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const responsableIds = rows.map((r) => r.responsableId);
    const usuarios = await this.prisma.user.findMany({
      where: { id: { in: responsableIds } },
      select: { id: true, nombre: true },
    });
    const userMap = new Map(usuarios.map((u) => [u.id, u.nombre]));

    return rows.map((r) => ({
      responsableId: r.responsableId,
      nombre:        userMap.get(r.responsableId) ?? '—',
      cantidad:      r._count.id,
      monto:         Number(r._sum.total ?? 0),
    }));
  }

  // ── Helper: construir filtro WHERE ───────────────────────
  private buildWhere(filtros: FiltrosReporte): Prisma.CotizacionWhereInput {
    return {
      ...(filtros.estado        && { estado:        filtros.estado }),
      ...(filtros.responsableId && { responsableId: filtros.responsableId }),
      ...(filtros.clienteId     && { clienteId:     filtros.clienteId }),
      ...((filtros.fechaDesde || filtros.fechaHasta) && {
        createdAt: {
          ...(filtros.fechaDesde && { gte: new Date(filtros.fechaDesde) }),
          ...(filtros.fechaHasta && {
            lte: new Date(new Date(filtros.fechaHasta).setHours(23, 59, 59, 999)),
          }),
        },
      }),
    };
  }

  // ── Listado de responsables activos (para filtro) ─────────
  async getResponsables() {
    return this.prisma.user.findMany({
      where:  { activo: true },
      select: { id: true, nombre: true, rol: true },
      orderBy: { nombre: 'asc' },
    });
  }

  // ── Listado de clientes activos (para filtro) ─────────────
  async getClientesFiltro() {
    return this.prisma.cliente.findMany({
      where:  { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }
}
