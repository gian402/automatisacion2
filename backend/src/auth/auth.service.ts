// ============================================================
// HYTICON — AuthService
// login, logout, refresh, validación de usuario
// ============================================================

import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import type { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_BYTES = 64;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ── Hashear contraseña ──────────────────────────────────────
  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  // ── Validar credenciales ────────────────────────────────────
  private async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.activo) {
      // Mismo mensaje para no revelar si el email existe
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValida = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return user;
  }

  // ── Login ───────────────────────────────────────────────────
  async login(dto: LoginDto, ip?: string) {
    const user = await this.validateUser(dto.email, dto.password);

    const accessToken = this.generarAccessToken(user);
    const refreshTokenRaw = await this.generarRefreshToken(user.id);

    await this.auditoria.registrar({
      usuarioId: user.id,
      accion: 'LOGIN',
      entidad: 'users',
      entidadId: user.id,
      detalle: { email: user.email },
      ip,
    });

    return {
      accessToken,
      refreshTokenRaw,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  // ── Logout (este dispositivo) ───────────────────────────────
  async logout(refreshTokenRaw: string, userId?: string): Promise<void> {
    if (!refreshTokenRaw) return;

    const hash = this.hashToken(refreshTokenRaw);
    await this.prisma.refreshToken.deleteMany({ where: { token: hash } });

    if (userId) {
      await this.auditoria.registrar({
        usuarioId: userId,
        accion: 'LOGOUT',
        entidad: 'users',
        entidadId: userId,
      });
    }
  }

  // ── Logout de todos los dispositivos ───────────────────────
  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.auditoria.registrar({
      usuarioId: userId,
      accion: 'LOGOUT_ALL',
      entidad: 'users',
      entidadId: userId,
    });
  }

  // ── Refresh de access token (con rotación) ──────────────────
  async refresh(refreshTokenRaw: string) {
    if (!refreshTokenRaw) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    const tokenHash = this.hashToken(refreshTokenRaw);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            activo: true,
          },
        },
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Sesión expirada. Inicia sesión de nuevo');
    }

    if (!stored.user.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Rotación: invalidar el token usado, emitir uno nuevo
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    const nuevoRefreshTokenRaw = await this.generarRefreshToken(stored.user.id);
    const accessToken = this.generarAccessToken(stored.user);

    return {
      accessToken,
      refreshTokenRaw: nuevoRefreshTokenRaw,
      user: {
        id: stored.user.id,
        nombre: stored.user.nombre,
        email: stored.user.email,
        rol: stored.user.rol,
      },
    };
  }

  // ── Perfil del usuario autenticado ─────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }

  // ── Helpers privados ────────────────────────────────────────

  private generarAccessToken(user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol as JwtPayload['rol'],
    };
    return this.jwt.sign(payload);
  }

  private async generarRefreshToken(userId: string): Promise<string> {
    const raw = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const hash = this.hashToken(raw);

    // Parsear "7d" → días → ms
    const raw_expiry =
      this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN') ?? '7d';
    const days = parseInt(raw_expiry.replace(/[^0-9]/g, ''), 10) || 7;

    await this.prisma.refreshToken.create({
      data: {
        token: hash,
        userId,
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    });

    return raw; // solo se envía al cliente, nunca se almacena en claro
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
