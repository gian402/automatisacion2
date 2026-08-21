// ============================================================
// HYTICON — CotizacionesController
// GET    /cotizaciones              — listar
// GET    /cotizaciones/:id          — detalle
// GET    /cotizaciones/:id/historial — historial de estados
// POST   /cotizaciones              — crear
// PATCH  /cotizaciones/:id          — actualizar (BORRADOR)
// PATCH  /cotizaciones/:id/estado   — cambiar estado
// ============================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { EstadoCotizacion, Rol } from '@prisma/client';
import { CotizacionesService } from './cotizaciones.service';
import {
  CreateCotizacionDto,
  UpdateCotizacionDto,
  CambiarEstadoDto,
} from './dto/cotizacion.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface UsuarioActual {
  id: string;
  rol: Rol;
}

@ApiTags('Cotizaciones')
@ApiBearerAuth('access-token')
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  // ── GET /cotizaciones ──────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar cotizaciones' })
  @ApiQuery({ name: 'page',          required: false, type: Number })
  @ApiQuery({ name: 'limit',         required: false, type: Number })
  @ApiQuery({ name: 'search',        required: false, type: String })
  @ApiQuery({ name: 'estado',        required: false, enum: EstadoCotizacion })
  @ApiQuery({ name: 'clienteId',     required: false, type: String })
  @ApiQuery({ name: 'responsableId', required: false, type: String })
  findAll(
    @CurrentUser() user: UsuarioActual,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('estado') estadoStr?: string,
    @Query('clienteId') clienteId?: string,
    @Query('responsableId') responsableId?: string,
  ) {
    const estado = Object.values(EstadoCotizacion).includes(estadoStr as EstadoCotizacion)
      ? (estadoStr as EstadoCotizacion)
      : undefined;

    // SUPERVISOR solo ve sus propias cotizaciones
    const soloPropias = user.rol === Rol.SUPERVISOR;

    return this.cotizacionesService.findAll({
      page, limit, search, estado, clienteId, responsableId,
      soloPropias,
      usuarioId: user.id,
    });
  }

  // ── GET /cotizaciones/:id ──────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de cotización' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UsuarioActual,
  ) {
    return this.cotizacionesService.findOne(id, user.id, user.rol);
  }

  // ── GET /cotizaciones/:id/historial ────────────────────────
  @Get(':id/historial')
  @ApiOperation({ summary: 'Historial de estados de una cotización' })
  getHistorial(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UsuarioActual,
  ) {
    return this.cotizacionesService.getHistorial(id, user.id, user.rol);
  }

  // ── POST /cotizaciones ─────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Crear cotización' })
  create(
    @Body() dto: CreateCotizacionDto,
    @CurrentUser() user: UsuarioActual,
  ) {
    return this.cotizacionesService.create(dto, user.id);
  }

  // ── PATCH /cotizaciones/:id ────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cotización (solo BORRADOR)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCotizacionDto,
    @CurrentUser() user: UsuarioActual,
  ) {
    return this.cotizacionesService.update(id, dto, user.id, user.rol);
  }

  // ── PATCH /cotizaciones/:id/estado ─────────────────────────
  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de cotización' })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoDto,
    @CurrentUser() user: UsuarioActual,
  ) {
    return this.cotizacionesService.cambiarEstado(id, dto, user.id, user.rol);
  }

  // ── POST /cotizaciones/:id/enviar ──────────────────────────
  @Post(':id/enviar')
  @ApiOperation({ summary: 'Enviar cotización — genera evento n8n y cambia estado a ENVIADA' })
  enviar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UsuarioActual,
  ) {
    return this.cotizacionesService.enviar(id, user.id, user.rol);
  }
}
