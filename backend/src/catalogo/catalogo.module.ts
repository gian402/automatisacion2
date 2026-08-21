// ============================================================
// HYTICON — CatalogoModule
// ============================================================

import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService], // exportado para uso en CotizacionesModule
})
export class CatalogoModule {}
