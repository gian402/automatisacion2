// ============================================================
// HYTICON — AuditoriaService
// Registro append-only de acciones del sistema
// ============================================================

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface RegistrarAuditoriaDto {
  usuarioId?: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  detalle?: Record<string, unknown>;
  ip?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra una acción en la tabla de auditoría.
   * Los registros son append-only: nunca se modifican ni eliminan.
   */
  async registrar(data: RegistrarAuditoriaDto): Promise<void> {
    await this.prisma.auditoria.create({
      data: {
        usuarioId: data.usuarioId,
        accion:    data.accion,
        entidad:   data.entidad,
        entidadId: data.entidadId,
        detalle:   data.detalle
          ? (data.detalle as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ip: data.ip,
      },
    });
  }

  /**
   * Lista registros de auditoría completos con filtros.
   * Solo ADMIN puede acceder a todos los registros.
   */
  async findAll(opts: {
    page?: number;
    limit?: number;
    accion?: string;
    entidad?: string;
    usuarioId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    const {
      page = 1,
      limit = 50,
      accion,
      entidad,
      usuarioId,
      fechaDesde,
      fechaHasta,
    } = opts;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditoriaWhereInput = {
      ...(accion    && { accion:    { contains: accion,    mode: 'insensitive' } }),
      ...(entidad   && { entidad:   { contains: entidad,   mode: 'insensitive' } }),
      ...(usuarioId && { usuarioId }),
      ...((fechaDesde || fechaHasta) && {
        createdAt: {
          ...(fechaDesde && { gte: new Date(fechaDesde) }),
          ...(fechaHasta && { lte: new Date(new Date(fechaHasta).setHours(23, 59, 59, 999)) }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditoria.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          usuario: {
            select: { id: true, nombre: true, email: true, rol: true },
          },
        },
      }),
      this.prisma.auditoria.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Retorna las acciones únicas registradas (para filtro en frontend).
   */
  async getAccionesUnicas(): Promise<string[]> {
    const rows = await this.prisma.auditoria.findMany({
      select: { accion: true },
      distinct: ['accion'],
      orderBy: { accion: 'asc' },
    });
    return rows.map((r) => r.accion);
  }
}
