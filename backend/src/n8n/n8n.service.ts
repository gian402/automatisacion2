// ============================================================
// HYTICON — N8nService
// Integración desacoplada con n8n via webhook.
// Si n8n no está disponible, el sistema principal sigue funcionando.
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface N8nPayload {
  evento:          string;           // ej: 'COTIZACION_ENVIADA'
  cotizacionId:    string;
  numeroCotizacion: string;
  idempotencyKey:  string;           // para evitar duplicados
  timestamp:       string;
  datos?:          Record<string, unknown>;
}

export interface N8nResult {
  enviado:   boolean;
  intentos:  number;
  error?:    string;
}

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);
  private readonly TIMEOUT_MS   = 10_000; // 10 segundos
  private readonly MAX_REINTENTOS = 3;
  private readonly RETRASO_MS   = 1_000; // 1 segundo entre reintentos

  constructor(private readonly config: ConfigService) {}

  /**
   * Envía un evento al webhook de n8n.
   * Retorna el resultado sin lanzar excepción para no bloquear el flujo principal.
   */
  async dispararEvento(payload: N8nPayload): Promise<N8nResult> {
    const webhookUrl = this.config.get<string>('N8N_WEBHOOK_URL');

    // Si no está configurado, omitir silenciosamente
    if (!webhookUrl) {
      this.logger.log(`n8n no configurado — evento ${payload.evento} omitido`);
      return { enviado: false, intentos: 0, error: 'N8N_NOT_CONFIGURED' };
    }

    const headers = this.buildHeaders(payload);
    let ultimoError: string | undefined;

    for (let intento = 1; intento <= this.MAX_REINTENTOS; intento++) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.TIMEOUT_MS),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        this.logger.log(
          `n8n ✓ evento=${payload.evento} cotizacion=${payload.cotizacionId} intento=${intento}`,
        );
        return { enviado: true, intentos: intento };

      } catch (err) {
        ultimoError = this.extraerMensajeError(err);
        this.logger.warn(
          `n8n intento ${intento}/${this.MAX_REINTENTOS} fallido: ${ultimoError}`,
        );

        if (intento < this.MAX_REINTENTOS) {
          await this.esperar(this.RETRASO_MS * intento); // backoff lineal
        }
      }
    }

    this.logger.error(
      `n8n ✗ evento=${payload.evento} cotizacion=${payload.cotizacionId} — todos los intentos fallaron`,
    );
    return {
      enviado:  false,
      intentos: this.MAX_REINTENTOS,
      error:    ultimoError,
    };
  }

  /**
   * Construye el payload estándar para el evento de envío de cotización.
   */
  buildPayloadEnvio(opts: {
    cotizacionId:    string;
    numeroCotizacion: string;
    clienteNombre:   string;
    clienteEmail:    string | null;
    responsableNombre: string;
    total:           number;
    moneda:          string;
  }): N8nPayload {
    const idempotencyKey = this.generarIdempotencyKey(
      opts.cotizacionId,
      'COTIZACION_ENVIADA',
    );

    return {
      evento:          'COTIZACION_ENVIADA',
      cotizacionId:    opts.cotizacionId,
      numeroCotizacion: opts.numeroCotizacion,
      idempotencyKey,
      timestamp:       new Date().toISOString(),
      datos: {
        clienteNombre:     opts.clienteNombre,
        clienteEmail:      opts.clienteEmail,
        responsableNombre: opts.responsableNombre,
        total:             opts.total,
        moneda:            opts.moneda,
        urlPdf:            `/api/v1/pdf/cotizacion/${opts.cotizacionId}`,
      },
    };
  }

  // ── Utilidades privadas ───────────────────────────────────

  /**
   * Genera una clave de idempotencia determinista (misma entrada → misma clave).
   * Evita que el mismo evento se procese dos veces si n8n reintenta.
   */
  private generarIdempotencyKey(cotizacionId: string, evento: string): string {
    return crypto
      .createHash('sha256')
      .update(`${cotizacionId}:${evento}`)
      .digest('hex')
      .slice(0, 32);
  }

  /**
   * Construye los headers de autenticación del webhook.
   */
  private buildHeaders(payload: N8nPayload): Record<string, string> {
    const secret = this.config.get<string>('N8N_WEBHOOK_SECRET');
    const headers: Record<string, string> = {
      'Content-Type':     'application/json',
      'X-Idempotency-Key': payload.idempotencyKey,
    };

    if (secret) {
      // HMAC-SHA256 sobre el body serializado
      const firma = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      headers['X-HYTICON-Signature'] = `sha256=${firma}`;
    }

    return headers;
  }

  private extraerMensajeError(err: unknown): string {
    if (err instanceof Error) {
      if (err.name === 'TimeoutError') return 'Timeout';
      return err.message;
    }
    return String(err);
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Retorna true si n8n está configurado */
  get estaConfigurado(): boolean {
    return !!this.config.get<string>('N8N_WEBHOOK_URL');
  }
}
