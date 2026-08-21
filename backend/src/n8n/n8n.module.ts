import { Module } from '@nestjs/common';
import { N8nService } from './n8n.service';

@Module({
  providers: [N8nService],
  exports:   [N8nService], // exportado para que CotizacionesModule lo inyecte
})
export class N8nModule {}
