// ============================================================
// HYTICON — AuditoriaController
// GET /auditoria           — listar con filtros (solo ADMIN)
// GET /auditoria/acciones  — acciones únicas para filtro (solo ADMIN)
// ============================================================

import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Rol } from '@prisma/client';
import { AuditoriaService } from './auditoria.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Auditoría')
@ApiBearerAuth('access-token')
@Controller('auditoria')
@Roles(Rol.ADMIN)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  // ── GET /auditoria ─────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar registros de auditoría (solo ADMIN)' })
  @ApiQuery({ name: 'page',       required: false, type: Number })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  @ApiQuery({ name: 'accion',     required: false, type: String })
  @ApiQuery({ name: 'entidad',    required: false, type: String })
  @ApiQuery({ name: 'usuarioId',  required: false, type: String })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'ISO date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'ISO date (YYYY-MM-DD)' })
  findAll(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('accion')     accion?: string,
    @Query('entidad')    entidad?: string,
    @Query('usuarioId')  usuarioId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.auditoriaService.findAll({
      page,
      limit,
      accion:     accion     || undefined,
      entidad:    entidad    || undefined,
      usuarioId:  usuarioId  || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    });
  }

  // ── GET /auditoria/acciones ────────────────────────────────
  @Get('acciones')
  @ApiOperation({ summary: 'Listar acciones únicas registradas (para filtros)' })
  getAcciones() {
    return this.auditoriaService.getAccionesUnicas();
  }
}
