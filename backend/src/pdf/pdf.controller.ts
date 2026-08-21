// ============================================================
// HYTICON — PdfController
// GET /pdf/cotizacion/:id — Genera y descarga el PDF
// ============================================================

import { Controller, Get, Param, Res, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Rol } from '@prisma/client';
import { PdfService } from './pdf.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('PDF')
@ApiBearerAuth('access-token')
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  // ── GET /pdf/cotizacion/:id ───────────────────────────────
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // máx 20 generaciones de PDF por minuto
  @Get('cotizacion/:id')
  @ApiOperation({ summary: 'Generar PDF de una cotización' })
  async generarPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; rol: Rol },
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generarPdf(id, user.id, user.rol);

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `inline; filename="cotizacion-${id}.pdf"`,
      'Content-Length':      buffer.length,
      'Cache-Control':       'no-cache',
    });

    res.end(buffer);
  }
}
