// ============================================================
// HYTICON — DashboardController
// GET /dashboard/stats — métricas según rol del usuario
// ============================================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Rol } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ── GET /dashboard/stats ────────────────────────────────────
  // ADMIN: métricas globales del sistema
  // SUPERVISOR: métricas de sus propias cotizaciones
  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas del dashboard según rol' })
  getStats(
    @CurrentUser() user: { id: string; rol: Rol },
  ) {
    return this.dashboardService.getStats(user.id, user.rol);
  }
}
