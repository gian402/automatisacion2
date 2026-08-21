import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx    = host.switchToHttp();
    const res    = ctx.getResponse<Response>();
    const req    = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    // ── HttpException de NestJS ───────────────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as Record<string, unknown>).message as string ?? message;
    }

    // ── Errores conocidos de Prisma ───────────────────────
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status  = HttpStatus.CONFLICT;
          message = 'Ya existe un registro con ese valor único';
          break;
        case 'P2025':
          status  = HttpStatus.NOT_FOUND;
          message = 'Registro no encontrado';
          break;
        case 'P2003':
          status  = HttpStatus.BAD_REQUEST;
          message = 'Referencia a un registro que no existe';
          break;
        default:
          status  = HttpStatus.BAD_REQUEST;
          message = 'Error en la base de datos';
      }
    }

    // ── Log del error (nunca exponer stack en producción) ─
    this.logger.error(
      `${req.method} ${req.url} → ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    res.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
