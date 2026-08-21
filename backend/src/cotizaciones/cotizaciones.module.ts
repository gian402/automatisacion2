// ============================================================
// HYTICON — CotizacionesModule
// ============================================================

import { Module } from '@nestjs/common';
import { CotizacionesController } from './cotizaciones.controller';
import { CotizacionesService } from './cotizaciones.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { N8nModule } from '../n8n/n8n.module';

@Module({
  imports: [PrismaModule, AuditoriaModule, N8nModule],
  controllers: [CotizacionesController],
  providers: [CotizacionesService],
  exports: [CotizacionesService],
})
export class CotizacionesModule {}
