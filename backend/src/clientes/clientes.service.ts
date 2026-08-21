// ============================================================
// HYTICON — ClientesService
// ============================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import {
  CreateClienteDto,
  UpdateClienteDto,
  ToggleClienteDto,
} from './dto/cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ── Listar clientes con búsqueda y filtro ───────────────────
  async findAll(opts: {
    page?: number;
    limit?: number;
    search?: string;
    soloActivos?: boolean;
  }) {
    const { page = 1, limit = 20, search, soloActivos } = opts;
    const skip = (page - 1) * limit;

    const where = {
      ...(soloActivos !== undefined && { activo: soloActivos }),
      ...(search && {
        OR: [
          { nombre:   { contains: search, mode: 'insensitive' as const } },
          { ruc:      { contains: search, mode: 'insensitive' as const } },
          { email:    { contains: search, mode: 'insensitive' as const } },
          { telefono: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ── Obtener uno ─────────────────────────────────────────────
  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  // ── Crear ───────────────────────────────────────────────────
  async create(dto: CreateClienteDto, usuarioId: string) {
    // RUC único si se proporciona
    if (dto.ruc) {
      const existe = await this.prisma.cliente.findUnique({
        where: { ruc: dto.ruc },
      });
      if (existe) throw new ConflictException('Ya existe un cliente con ese RUC');
    }

    const cliente = await this.prisma.cliente.create({
      data: {
        nombre:   dto.nombre.trim(),
        ruc:      dto.ruc?.trim() ?? null,
        direccion: dto.direccion?.trim() ?? null,
        email:    dto.email?.toLowerCase().trim() ?? null,
        telefono: dto.telefono?.trim() ?? null,
        activo:   true,
      },
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    'CREAR_CLIENTE',
      entidad:   'clientes',
      entidadId: cliente.id,
      detalle:   { nombre: cliente.nombre, ruc: cliente.ruc },
    });

    return cliente;
  }

  // ── Actualizar ──────────────────────────────────────────────
  async update(id: string, dto: UpdateClienteDto, usuarioId: string) {
    await this.findOne(id);

    // Si cambia el RUC, verificar que no esté en uso
    if (dto.ruc) {
      const existe = await this.prisma.cliente.findFirst({
        where: { ruc: dto.ruc, NOT: { id } },
      });
      if (existe) throw new ConflictException('Ya existe un cliente con ese RUC');
    }

    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: {
        ...(dto.nombre    && { nombre:    dto.nombre.trim() }),
        ...(dto.ruc       !== undefined && { ruc:       dto.ruc?.trim() ?? null }),
        ...(dto.direccion !== undefined && { direccion: dto.direccion?.trim() ?? null }),
        ...(dto.email     !== undefined && { email:     dto.email?.toLowerCase().trim() ?? null }),
        ...(dto.telefono  !== undefined && { telefono:  dto.telefono?.trim() ?? null }),
      },
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    'ACTUALIZAR_CLIENTE',
      entidad:   'clientes',
      entidadId: id,
      detalle:   { campos: Object.keys(dto) },
    });

    return cliente;
  }

  // ── Activar / desactivar ────────────────────────────────────
  async toggleActivo(id: string, dto: ToggleClienteDto, usuarioId: string) {
    await this.findOne(id);

    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: { activo: dto.activo },
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    dto.activo ? 'ACTIVAR_CLIENTE' : 'DESACTIVAR_CLIENTE',
      entidad:   'clientes',
      entidadId: id,
    });

    return cliente;
  }
}
