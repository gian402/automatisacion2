import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { CotizacionesModule } from './cotizaciones/cotizaciones.module';
import { PdfModule } from './pdf/pdf.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportesModule } from './reportes/reportes.module';
import { N8nModule } from './n8n/n8n.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // ── Configuración global ──────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
      cache: true,
    }),

    // ── Rate Limiting (Protección contra DoS y fuerza bruta) ─
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),

    // ── Base de datos global ──────────────────────────────
    PrismaModule,

    // ── Módulos del sistema ───────────────────────────────
    AuditoriaModule,
    AuthModule,
    UsersModule,
    ClientesModule,
    CatalogoModule,
    CotizacionesModule,
    PdfModule,
    DashboardModule,
    ReportesModule,
    N8nModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD,  useClass: ThrottlerGuard },
    { provide: APP_GUARD,  useClass: JwtAuthGuard },
    { provide: APP_GUARD,  useClass: RolesGuard },
  ],
})
export class AppModule {}
