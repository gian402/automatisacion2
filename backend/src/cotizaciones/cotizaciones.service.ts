// ============================================================
// HYTICON — CotizacionesService
// Módulo principal del sistema
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, EstadoCotizacion, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { N8nService } from '../n8n/n8n.service';
import {
  CreateCotizacionDto,
  UpdateCotizacionDto,
  CambiarEstadoDto,
} from './dto/cotizacion.dto';
import {
  calcularSubtotalItem,
  calcularTotalesCotizacion,
} from './calculo.engine';

// ── Transiciones de estado permitidas ────────────────────────
const TRANSICIONES: Record<EstadoCotizacion, EstadoCotizacion[]> = {
  BORRADOR:  ['ENVIADA'],
  ENVIADA:   ['APROBADA', 'RECHAZADA', 'VENCIDA'],
  APROBADA:  ['VENCIDA'],
  RECHAZADA: [],
  VENCIDA:   [],
};

@Injectable()
export class CotizacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
    private readonly n8n: N8nService,
  ) {}

  // ── Generar número correlativo ────────────────────────────
  private async generarNumeroCotizacion(): Promise<string> {
    const año = new Date().getFullYear();
    const prefix = `COT-${año}-`;

    const ultima = await this.prisma.cotizacion.findFirst({
      where: { numeroCotizacion: { startsWith: prefix } },
      orderBy: { numeroCotizacion: 'desc' },
      select: { numeroCotizacion: true },
    });

    let siguiente = 1;
    if (ultima) {
      const partes = ultima.numeroCotizacion.split('-');
      const num = parseInt(partes[partes.length - 1], 10);
      if (!isNaN(num)) siguiente = num + 1;
    }

    return `${prefix}${String(siguiente).padStart(4, '0')}`;
  }

  // ── Listar con filtros y paginación ───────────────────────
  async findAll(opts: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: EstadoCotizacion;
    clienteId?: string;
    responsableId?: string;
    // Para SUPERVISOR: filtrar solo sus cotizaciones
    soloPropias?: boolean;
    usuarioId?: string;
  }) {
    const {
      page = 1, limit = 15, search, estado,
      clienteId, responsableId, soloPropias, usuarioId,
    } = opts;
    const skip = (page - 1) * limit;

    const where: Prisma.CotizacionWhereInput = {
      ...(estado     && { estado }),
      ...(clienteId  && { clienteId }),
      ...(responsableId && { responsableId }),
      ...(soloPropias && usuarioId && {
        OR: [{ responsableId: usuarioId }, { creadoPorId: usuarioId }],
      }),
      ...(search && {
        OR: [
          { numeroCotizacion: { contains: search, mode: 'insensitive' } },
          { proyecto:         { contains: search, mode: 'insensitive' } },
          { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.cotizacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente:     { select: { id: true, nombre: true, ruc: true } },
          responsable: { select: { id: true, nombre: true } },
          _count:      { select: { items: true } },
        },
      }),
      this.prisma.cotizacion.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ── Detalle completo ──────────────────────────────────────
  async findOne(id: string, usuarioId?: string, userRol?: Rol) {
    const cot = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        cliente:     true,
        responsable: { select: { id: true, nombre: true, email: true } },
        creadoPor:   { select: { id: true, nombre: true } },
        items: {
          orderBy: { orden: 'asc' },
          include: {
            catalogoItem: { select: { id: true, codigo: true, nombre: true } },
          },
        },
        historialEstados: {
          orderBy: { createdAt: 'asc' },
          include: {
            cambiadoPor: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (!cot) throw new NotFoundException('Cotización no encontrada');

    // SUPERVISOR solo puede ver sus propias cotizaciones (IDOR protection)
    if (
      userRol === Rol.SUPERVISOR &&
      usuarioId &&
      cot.responsableId !== usuarioId &&
      cot.creadoPorId   !== usuarioId
    ) {
      throw new ForbiddenException('No tienes permiso para ver esta cotización');
    }

    return cot;
  }

  // ── Crear ─────────────────────────────────────────────────
  async create(dto: CreateCotizacionDto, usuarioId: string) {
    // Verificar que el cliente existe y está activo
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    if (!cliente.activo) throw new BadRequestException('El cliente está inactivo');

    // Verificar responsable
    const responsable = await this.prisma.user.findUnique({
      where: { id: dto.responsableId },
    });
    if (!responsable) throw new NotFoundException('Responsable no encontrado');
    if (!responsable.activo) throw new BadRequestException('El responsable está inactivo');

    // Calcular subtotales e ítems
    const itemsConSubtotal = dto.items.map((item, idx) => {
      const subtotal = calcularSubtotalItem({
        cantidad:       item.cantidad,
        precioUnitario: item.precioUnitario,
      });
      return { ...item, subtotal, orden: item.orden ?? idx };
    });

    // Calcular totales
    const { valorVenta, igv, total } = calcularTotalesCotizacion(
      itemsConSubtotal.map((i) => i.subtotal),
    );

    const numeroCotizacion = await this.generarNumeroCotizacion();

    const cotizacion = await this.prisma.$transaction(async (tx) => {
      const cot = await tx.cotizacion.create({
        data: {
          numeroCotizacion,
          clienteId:          dto.clienteId,
          proyecto:           dto.proyecto?.trim() ?? null,
          fechaEmision:       new Date(dto.fechaEmision),
          fechaVencimiento:   new Date(dto.fechaVencimiento),
          tipoDocumento:      dto.tipoDocumento?.trim() ?? 'COTIZACIÓN',
          responsableId:      dto.responsableId,
          moneda:             dto.moneda,
          estado:             EstadoCotizacion.BORRADOR,
          terminosCondiciones: dto.terminosCondiciones?.trim() ?? null,
          valorVenta:         new Prisma.Decimal(valorVenta),
          igv:                new Prisma.Decimal(igv),
          total:              new Prisma.Decimal(total),
          creadoPorId:        usuarioId,
          items: {
            create: itemsConSubtotal.map((item) => ({
              catalogoItemId: item.catalogoItemId ?? null,
              tipoItem:       item.tipoItem,
              descripcion:    item.descripcion.trim(),
              cantidad:       new Prisma.Decimal(item.cantidad),
              precioUnitario: new Prisma.Decimal(item.precioUnitario),
              subtotal:       new Prisma.Decimal(item.subtotal),
              orden:          item.orden,
            })),
          },
        },
        include: {
          cliente:     { select: { id: true, nombre: true, ruc: true } },
          responsable: { select: { id: true, nombre: true } },
          items:       { orderBy: { orden: 'asc' } },
        },
      });

      // Historial de estado inicial
      await tx.historialEstado.create({
        data: {
          cotizacionId:  cot.id,
          estadoAnterior: null,
          estadoNuevo:   EstadoCotizacion.BORRADOR,
          cambiadoPorId: usuarioId,
          nota:          'Cotización creada',
        },
      });

      return cot;
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    'CREAR_COTIZACION',
      entidad:   'cotizaciones',
      entidadId: cotizacion.id,
      detalle:   {
        numeroCotizacion,
        clienteId: dto.clienteId,
        total,
      },
    });

    return cotizacion;
  }

  // ── Actualizar (solo BORRADOR) ────────────────────────────
  async update(id: string, dto: UpdateCotizacionDto, usuarioId: string, userRol: Rol) {
    const cot = await this.findOne(id);

    if (cot.estado !== EstadoCotizacion.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden editar cotizaciones en estado BORRADOR',
      );
    }

    // SUPERVISOR solo puede editar sus propias cotizaciones
    if (
      userRol === Rol.SUPERVISOR &&
      cot.responsableId !== usuarioId &&
      cot.creadoPorId   !== usuarioId
    ) {
      throw new ForbiddenException('No tienes permiso para editar esta cotización');
    }

    // Recalcular si se envían ítems
    let calculados: {
      itemsConSubtotal: Array<{
        catalogoItemId?: string;
        tipoItem: import('@prisma/client').TipoItem;
        descripcion: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
        orden: number;
      }>;
      valorVenta: number;
      igv: number;
      total: number;
    } | null = null;

    if (dto.items) {
      const itemsConSubtotal = dto.items.map((item, idx) => ({
        ...item,
        subtotal: calcularSubtotalItem({ cantidad: item.cantidad, precioUnitario: item.precioUnitario }),
        orden: item.orden ?? idx,
      }));
      const totales = calcularTotalesCotizacion(itemsConSubtotal.map((i) => i.subtotal));
      calculados = { itemsConSubtotal, ...totales };
    }

    const cotizacion = await this.prisma.$transaction(async (tx) => {
      // Si se actualizan ítems, borrar los anteriores y recrear
      if (calculados) {
        await tx.cotizacionItem.deleteMany({ where: { cotizacionId: id } });
      }

      return tx.cotizacion.update({
        where: { id },
        data: {
          ...(dto.clienteId          && { clienteId:          dto.clienteId }),
          ...(dto.proyecto           !== undefined && { proyecto:          dto.proyecto?.trim() ?? null }),
          ...(dto.fechaEmision       && { fechaEmision:       new Date(dto.fechaEmision) }),
          ...(dto.fechaVencimiento   && { fechaVencimiento:   new Date(dto.fechaVencimiento) }),
          ...(dto.tipoDocumento      !== undefined && { tipoDocumento:      dto.tipoDocumento?.trim() ?? 'COTIZACIÓN' }),
          ...(dto.responsableId      && { responsableId:      dto.responsableId }),
          ...(dto.moneda             && { moneda:             dto.moneda }),
          ...(dto.terminosCondiciones !== undefined && { terminosCondiciones: dto.terminosCondiciones?.trim() ?? null }),
          ...(calculados && {
            valorVenta: new Prisma.Decimal(calculados.valorVenta),
            igv:        new Prisma.Decimal(calculados.igv),
            total:      new Prisma.Decimal(calculados.total),
            items: {
              create: calculados.itemsConSubtotal.map((item) => ({
                catalogoItemId: item.catalogoItemId ?? null,
                tipoItem:       item.tipoItem,
                descripcion:    item.descripcion.trim(),
                cantidad:       new Prisma.Decimal(item.cantidad),
                precioUnitario: new Prisma.Decimal(item.precioUnitario),
                subtotal:       new Prisma.Decimal(item.subtotal),
                orden:          item.orden,
              })),
            },
          }),
        },
        include: {
          cliente:     { select: { id: true, nombre: true, ruc: true } },
          responsable: { select: { id: true, nombre: true } },
          items:       { orderBy: { orden: 'asc' } },
        },
      });
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    'ACTUALIZAR_COTIZACION',
      entidad:   'cotizaciones',
      entidadId: id,
      detalle:   { campos: Object.keys(dto) },
    });

    return cotizacion;
  }

  // ── Cambiar estado ────────────────────────────────────────
  async cambiarEstado(
    id: string,
    dto: CambiarEstadoDto,
    usuarioId: string,
    userRol: Rol,
  ) {
    const cot = await this.findOne(id);

    // SUPERVISOR solo puede cambiar estado de sus cotizaciones
    if (
      userRol === Rol.SUPERVISOR &&
      cot.responsableId !== usuarioId &&
      cot.creadoPorId   !== usuarioId
    ) {
      throw new ForbiddenException('No tienes permiso para cambiar el estado de esta cotización');
    }

    const permitidos = TRANSICIONES[cot.estado];
    if (!permitidos.includes(dto.estado)) {
      throw new BadRequestException(
        `No se puede pasar de ${cot.estado} a ${dto.estado}. ` +
        `Transiciones permitidas: ${permitidos.join(', ') || 'ninguna'}`,
      );
    }

    const cotizacion = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.cotizacion.update({
        where: { id },
        data:  { estado: dto.estado },
      });

      await tx.historialEstado.create({
        data: {
          cotizacionId:   id,
          estadoAnterior: cot.estado,
          estadoNuevo:    dto.estado,
          cambiadoPorId:  usuarioId,
          nota:           dto.nota ?? null,
        },
      });

      return updated;
    });

    await this.auditoria.registrar({
      usuarioId,
      accion:    'CAMBIAR_ESTADO_COTIZACION',
      entidad:   'cotizaciones',
      entidadId: id,
      detalle:   { de: cot.estado, a: dto.estado, nota: dto.nota },
    });

    return cotizacion;
  }

  // ── Obtener historial de estados ──────────────────────────
  async getHistorial(id: string, usuarioId?: string, userRol?: Rol) {
    await this.findOne(id, usuarioId, userRol); // verifica que exista y tenga permisos
    return this.prisma.historialEstado.findMany({
      where:   { cotizacionId: id },
      orderBy: { createdAt: 'asc' },
      include: { cambiadoPor: { select: { id: true, nombre: true } } },
    });
  }

  // ── Enviar cotización ─────────────────────────────────────
  // Flujo: validar estado → cambiar a ENVIADA → disparar n8n → auditoría
  async enviar(id: string, usuarioId: string, userRol: Rol) {
    const cot = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        cliente:     true,
        responsable: { select: { id: true, nombre: true, email: true } },
      },
    });

    if (!cot) throw new NotFoundException('Cotización no encontrada');

    // Solo se puede enviar desde BORRADOR
    if (cot.estado !== EstadoCotizacion.BORRADOR) {
      throw new BadRequestException(
        `Solo se pueden enviar cotizaciones en estado BORRADOR. Estado actual: ${cot.estado}`,
      );
    }

    // SUPERVISOR solo puede enviar sus propias cotizaciones
    if (
      userRol === Rol.SUPERVISOR &&
      cot.responsableId !== usuarioId &&
      cot.creadoPorId   !== usuarioId
    ) {
      throw new ForbiddenException('No tienes permiso para enviar esta cotización');
    }

    // Cambiar estado a ENVIADA en transacción
    await this.prisma.$transaction(async (tx) => {
      await tx.cotizacion.update({
        where: { id },
        data:  { estado: EstadoCotizacion.ENVIADA },
      });

      await tx.historialEstado.create({
        data: {
          cotizacionId:   id,
          estadoAnterior: EstadoCotizacion.BORRADOR,
          estadoNuevo:    EstadoCotizacion.ENVIADA,
          cambiadoPorId:  usuarioId,
          nota:           'Cotización enviada',
        },
      });
    });

    // Disparar n8n de forma desacoplada (no bloquea si falla)
    const payload = this.n8n.buildPayloadEnvio({
      cotizacionId:      id,
      numeroCotizacion:  cot.numeroCotizacion,
      clienteNombre:     cot.cliente?.nombre ?? '—',
      clienteEmail:      cot.cliente?.email   ?? null,
      responsableNombre: cot.responsable?.nombre ?? '—',
      total:             Number(cot.total),
      moneda:            cot.moneda,
    });
    const n8nResult = await this.n8n.dispararEvento(payload);

    // Registrar en auditoría
    await this.auditoria.registrar({
      usuarioId,
      accion:    'ENVIAR_COTIZACION',
      entidad:   'cotizaciones',
      entidadId: id,
      detalle:   {
        numeroCotizacion: cot.numeroCotizacion,
        n8nEnviado:       n8nResult.enviado,
        n8nIntentos:      n8nResult.intentos,
      },
    });

    return {
      ok:              true,
      numeroCotizacion: cot.numeroCotizacion,
      estado:          EstadoCotizacion.ENVIADA,
      n8nEnviado:      n8nResult.enviado,
    };
  }
}
