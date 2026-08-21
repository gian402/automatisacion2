// ============================================================
// HYTICON — AuthController
// POST /auth/login   — inicia sesión
// POST /auth/logout  — cierra sesión (requiere auth)
// POST /auth/refresh — renueva access token via cookie
// GET  /auth/me      — perfil del usuario autenticado
// ============================================================

import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, AuthResponseDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const REFRESH_COOKIE = 'refresh_token';

// Opciones del cookie de refresh token
const cookieOptions = (maxAge: number) => ({
  httpOnly: true,               // inaccesible desde JS del cliente
  secure: process.env.NODE_ENV === 'production', // solo HTTPS en prod
  sameSite: 'lax' as const,     // seguro para navegación y subdominios
  maxAge,                       // en milisegundos
  path: '/api/v1/auth',         // limitar el scope del cookie
});

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── POST /auth/login ────────────────────────────────────────
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // máx 10 intentos de login por minuto
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const ip = req.ip ?? req.socket?.remoteAddress;
    const result = await this.authService.login(dto, ip);

    // Refresh token en cookie HttpOnly — nunca en el cuerpo de la respuesta
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    res.cookie(REFRESH_COOKIE, result.refreshTokenRaw, cookieOptions(sevenDaysMs));

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // ── POST /auth/logout ───────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { id: string },
  ): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(refreshToken ?? '', user?.id);

    // Limpiar la cookie
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  }

  // ── POST /auth/refresh ──────────────────────────────────────
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // máx 30 refresh por minuto
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token en cookie' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('No hay sesión activa');
    }

    const result = await this.authService.refresh(refreshToken);

    // Rotar la cookie con el nuevo refresh token
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    res.cookie(REFRESH_COOKIE, result.refreshTokenRaw, cookieOptions(sevenDaysMs));

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // ── GET /auth/me ────────────────────────────────────────────
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }
}
