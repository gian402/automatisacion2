import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() permite que PrismaService esté disponible en TODOS
// los módulos sin necesidad de importar PrismaModule en cada uno.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
