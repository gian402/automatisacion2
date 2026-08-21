// ============================================================
// HYTICON — DashboardService
// Métricas reales para el Dashboard
// ============================================================

import { Injectable } from '@nestjs/common';
import { Rol, EstadoCotizacion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Estadísticas para ADMIN — vista completa del sistema.
   */
  async getStatsAdmin() {
    const hoy       = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

    // ── Conteos en paralelo ────────────────────────────────
    const [
      totalCotizaciones,
      cotizacionesMes,
      enviadas,
      aprobadas,
      rechazadas,
      pendientes,
      totalClientes,
      clientesActivos,
      totalCatalogo,
      totalUsuarios,
      montoMes,
      montoAprobado,
      actividadReciente,
    ] = await Promise.all([
      // Total cotizaciones
      this.prisma.cotizacion.count(),

      // Cotizaciones del mes
      this.prisma.cotizacion.count({
        where: { createdAt: { gte: inicioMes, lte: finMes } },
      }),

      // Enviadas (actualmente en estado ENVIADA)
      this.prisma.cotizacion.count({
        where: { estado: EstadoCotizacion.ENVIADA },
      }),

      // Aprobadas (históricamente)
      this.prisma.cotizacion.count({
        where: { estado: EstadoCotizacion.APROBADA },
      }),

      // Rechazadas
      this.prisma.cotizacion.count({
        where: { estado: EstadoCotizacion.RECHAZADA },
      }),

      // Pendientes (BORRADOR + ENVIADA)
      this.prisma.cotizacion.count({
        where: {
          estado: { in: [EstadoCotizacion.BORRADOR, EstadoCotizacion.ENVIADA] },
        },
      }),

      // Total clientes
      this.prisma.cliente.count(),

      // Clientes activos
      this.prisma.cliente.count({ where: { activo: true } }),

      // Total ítems catálogo activos
      this.prisma.catalogoItem.count({ where: { activo: true } }),

      // Total usuarios activos
      this.prisma.user.count({ where: { activo: true } }),

      // Monto cotizado este mes
      this.prisma.cotizacion.aggregate({
        where: { createdAt: { gte: inicioMes, lte: finMes } },
        _sum: { total: true },
      }),

      // Monto aprobado total
      this.prisma.cotizacion.aggregate({
        where: { estado: EstadoCotizacion.APROBADA },
        _sum: { total: true },
      }),

      // Actividad reciente — últimas 10 cotizaciones
      this.prisma.cotizacion.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          numeroCotizacion: true,
          estado: true,
          total: true,
          moneda: true,
          createdAt: true,
          cliente:     { select: { id: true, nombre: true } },
          responsable: { select: { id: true, nombre: true } },
        },
      }),
    ]);

    return {
      cotizaciones: {
        total:     totalCotizaciones,
        mes:       cotizacionesMes,
        enviadas,
        aprobadas,
        rechazadas,
        pendientes,
      },
      montos: {
        cotizadoMes:    Number(montoMes._sum.total    ?? 0),
        aprobadoTotal:  Number(montoAprobado._sum.total ?? 0),
      },
      clientes: {
        total:   totalClientes,
        activos: clientesActivos,
      },
      catalogo: {
        itemsActivos: totalCatalogo,
      },
      usuarios: {
        activos: totalUsuarios,
      },
      actividadReciente: actividadReciente.map((c) => ({
        id:               c.id,
        numeroCotizacion: c.numeroCotizacion,
        estado:           c.estado,
        total:            Number(c.total),
        moneda:           c.moneda,
        createdAt:        c.createdAt,
        cliente:          c.cliente,
        responsable:      c.responsable,
      })),
    };
  }

  /**
   * Estadísticas para SUPERVISOR — solo sus cotizaciones.
   */
  async getStatsSupervisor(usuarioId: string) {
    const hoy       = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

    // Filtro de "propias" = responsable O creador
    const propiasFiltro = {
      OR: [
        { responsableId: usuarioId },
        { creadoPorId:   usuarioId },
      ],
    };

    const [
      totalPropias,
      propiasMes,
      propiasAprobadas,
      propiasEnviadas,
      propiasPendientes,
      montoPropioMes,
      actividadReciente,
    ] = await Promise.all([
      this.prisma.cotizacion.count({ where: propiasFiltro }),

      this.prisma.cotizacion.count({
        where: { ...propiasFiltro, createdAt: { gte: inicioMes, lte: finMes } },
      }),

      this.prisma.cotizacion.count({
        where: { ...propiasFiltro, estado: EstadoCotizacion.APROBADA },
      }),

      this.prisma.cotizacion.count({
        where: { ...propiasFiltro, estado: EstadoCotizacion.ENVIADA },
      }),

      this.prisma.cotizacion.count({
        where: {
          ...propiasFiltro,
          estado: { in: [EstadoCotizacion.BORRADOR, EstadoCotizacion.ENVIADA] },
        },
      }),

      this.prisma.cotizacion.aggregate({
        where: { ...propiasFiltro, createdAt: { gte: inicioMes, lte: finMes } },
        _sum: { total: true },
      }),

      // Últimas 10 cotizaciones propias
      this.prisma.cotizacion.findMany({
        where: propiasFiltro,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          numeroCotizacion: true,
          estado: true,
          total: true,
          moneda: true,
          createdAt: true,
          cliente:     { select: { id: true, nombre: true } },
          responsable: { select: { id: true, nombre: true } },
        },
      }),
    ]);

    return {
      cotizaciones: {
        total:     totalPropias,
        mes:       propiasMes,
        aprobadas: propiasAprobadas,
        enviadas:  propiasEnviadas,
        pendientes: propiasPendientes,
      },
      montos: {
        cotizadoMes: Number(montoPropioMes._sum.total ?? 0),
      },
      actividadReciente: actividadReciente.map((c) => ({
        id:               c.id,
        numeroCotizacion: c.numeroCotizacion,
        estado:           c.estado,
        total:            Number(c.total),
        moneda:           c.moneda,
        createdAt:        c.createdAt,
        cliente:          c.cliente,
        responsable:      c.responsable,
      })),
    };
  }

  /**
   * Endpoint unificado — detecta el rol y devuelve las métricas correspondientes.
   */
  async getStats(usuarioId: string, rol: Rol) {
    if (rol === Rol.ADMIN) {
      return this.getStatsAdmin();
    }
    return this.getStatsSupervisor(usuarioId);
  }
}
