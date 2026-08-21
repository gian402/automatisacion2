// ============================================================
// HYTICON — ReportesController
// GET /reportes/resumen        — análisis completo con filtros (ADMIN)
// GET /reportes/responsables   — lista para filtros (ADMIN)
// GET /reportes/clientes       — lista para filtros (ADMIN)
// ============================================================

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EstadoCotizacion, Rol } from '@prisma/client';
import { ReportesService } from './reportes.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reportes')
@ApiBearerAuth('access-token')
@Controller('reportes')
@Roles(Rol.ADMIN)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Reporte resumen con filtros (solo ADMIN)' })
  @ApiQuery({ name: 'fechaDesde',    required: false, type: String })
  @ApiQuery({ name: 'fechaHasta',    required: false, type: String })
  @ApiQuery({ name: 'estado',        required: false, enum: EstadoCotizacion })
  @ApiQuery({ name: 'responsableId', required: false, type: String })
  @ApiQuery({ name: 'clienteId',     required: false, type: String })
  getResumen(
    @Query('fechaDesde')    fechaDesde?: string,
    @Query('fechaHasta')    fechaHasta?: string,
    @Query('estado')        estado?: string,
    @Query('responsableId') responsableId?: string,
    @Query('clienteId')     clienteId?: string,
  ) {
    const estadoValido = Object.values(EstadoCotizacion).includes(estado as EstadoCotizacion)
      ? (estado as EstadoCotizacion)
      : undefined;

    return this.reportesService.getResumen({
      fechaDesde:    fechaDesde    || undefined,
      fechaHasta:    fechaHasta    || undefined,
      estado:        estadoValido,
      responsableId: responsableId || undefined,
      clienteId:     clienteId     || undefined,
    });
  }

  @Get('responsables')
  @ApiOperation({ summary: 'Responsables activos para filtros de reportes' })
  getResponsables() {
    return this.reportesService.getResponsables();
  }

  @Get('clientes')
  @ApiOperation({ summary: 'Clientes activos para filtros de reportes' })
  getClientesFiltro() {
    return this.reportesService.getClientesFiltro();
  }
}
