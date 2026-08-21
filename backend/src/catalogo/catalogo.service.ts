// ============================================================
// HYTICON — CatalogoService
// Gestión de productos y servicios del catálogo interno
// ============================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriaCatalogo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import {
  CreateCatalogoItemDto,
  UpdateCatalogoItemDto,
  ToggleCatalogoItemDto,
} from './dto/catalogo.dto';

@Injectable()
export class CatalogoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ── Listar con búsqueda, filtro por categoría y paginación ──
  async findAll(opts: {
    page?: number;
    limit?: number;
    search?: string;
    categoria?: CategoriaCatalogo;
    soloActivos?: boolean;
  }) {
    const { page = 1, limit = 20, search, categoria, soloActivos } = opts;
    const skip = (page - 1) * limit;

    const where = {
      ...(soloActivos !== undefined && { activo: soloActivos }),
      ...(categoria   && { categoria }),
      ...(search && {
        OR: [
          { codigo:  { contains: search, mode: 'insensitive' as const } },
          { nombre:  { contains: search, mode: 'insensitive' as const } },
          { descripcion: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.catalogoItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
      }),
      this.prisma.catalogoItem.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ── Obtener uno ─────────────────────────────────────────────
  async findOne(id: string) {
    const item = await this.prisma.catalogoItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Ítem del catálogo no encontrado');
    return item;
  }

  // ── Crear ───────────────────────────────────────────────────
  async create(dto: CreateCatalogoItemDto, usuarioId: string) {
    // Código único
    const existe = await this.prisma.catalogoItem.findUnique({
      where: { codigo: dto.codigo.trim().toUpperCase() },
    });
    if (existe) throw new ConflictException('Ya existe un ítem con ese código');

    const item = await this.prisma.catalogoItem.create({
      data: {
        codigo:            dto.codigo.trim().toUpperCase(),
        nombre:            dto.nombre.trim(),
        descripcion:       dto.descripcion?.trim() ?? null,
        categoria:         dto.categoria,
        unidad:            dto.unidad?.trim() ?? null,
        precioReferencial: dto.precioReferencial ?? null,
        activo:            true,
      },
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    'CREAR_CATALOGO_ITEM',
      entidad:   'catalogo_items',
      entidadId: item.id,
      detalle:   { codigo: item.codigo, nombre: item.nombre, categoria: item.categoria },
    });

    return item;
  }

  // ── Actualizar ──────────────────────────────────────────────
  async update(id: string, dto: UpdateCatalogoItemDto, usuarioId: string) {
    await this.findOne(id);

    // Si cambia el código, verificar unicidad
    if (dto.codigo) {
      const codigoNormalizado = dto.codigo.trim().toUpperCase();
      const existe = await this.prisma.catalogoItem.findFirst({
        where: { codigo: codigoNormalizado, NOT: { id } },
      });
      if (existe) throw new ConflictException('Ya existe un ítem con ese código');
    }

    const item = await this.prisma.catalogoItem.update({
      where: { id },
      data: {
        ...(dto.codigo       !== undefined && { codigo:            dto.codigo.trim().toUpperCase() }),
        ...(dto.nombre       !== undefined && { nombre:            dto.nombre.trim() }),
        ...(dto.descripcion  !== undefined && { descripcion:       dto.descripcion?.trim() ?? null }),
        ...(dto.categoria    !== undefined && { categoria:         dto.categoria }),
        ...(dto.unidad       !== undefined && { unidad:            dto.unidad?.trim() ?? null }),
        ...(dto.precioReferencial !== undefined && { precioReferencial: dto.precioReferencial ?? null }),
      },
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    'ACTUALIZAR_CATALOGO_ITEM',
      entidad:   'catalogo_items',
      entidadId: id,
      detalle:   { campos: Object.keys(dto) },
    });

    return item;
  }

  // ── Activar / desactivar ────────────────────────────────────
  async toggleActivo(id: string, dto: ToggleCatalogoItemDto, usuarioId: string) {
    await this.findOne(id);

    const item = await this.prisma.catalogoItem.update({
      where: { id },
      data: { activo: dto.activo },
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    dto.activo ? 'ACTIVAR_CATALOGO_ITEM' : 'DESACTIVAR_CATALOGO_ITEM',
      entidad:   'catalogo_items',
      entidadId: id,
    });

    return item;
  }
}
