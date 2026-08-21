// ============================================================
// HYTICON — auth.service.spec.ts
// Pruebas unitarias para autenticación, JWT y refresh tokens
// ============================================================

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;
  let auditoria: AuditoriaService;

  const mockUser = {
    id: 'user-uuid-1',
    nombre: 'Admin HYTICON',
    email: 'admin@hyticon.com',
    passwordHash: '',
    rol: Rol.ADMIN,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('Admin1234!', 10);
  });

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'rt-1' }),
        findUnique: jest.fn(),
        delete: jest.fn().mockResolvedValue({ id: 'rt-1' }),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaService;

    jwt = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    } as unknown as JwtService;

    config = {
      get: jest.fn((key: string) => {
        if (key === 'REFRESH_TOKEN_EXPIRES_IN') return '7d';
        return undefined;
      }),
    } as unknown as ConfigService;

    auditoria = {
      registrar: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuditoriaService;

    service = new AuthService(prisma, jwt, config, auditoria);
  });

  describe('login', () => {
    it('debe autenticar exitosamente y retornar tokens y datos de usuario', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'admin@hyticon.com',
        password: 'Admin1234!',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshTokenRaw');
      expect(result.user).toEqual({
        id: mockUser.id,
        nombre: mockUser.nombre,
        email: mockUser.email,
        rol: mockUser.rol,
      });
      expect(auditoria.registrar).toHaveBeenCalledWith(
        expect.objectContaining({ accion: 'LOGIN', usuarioId: mockUser.id }),
      );
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({
          email: 'noexiste@hyticon.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'admin@hyticon.com',
          password: 'PasswordIncorrecta!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario está desactivado', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        activo: false,
      });

      await expect(
        service.login({
          email: 'admin@hyticon.com',
          password: 'Admin1234!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('debe rotar el refresh token y emitir nuevo access token', async () => {
      const validStoredToken = {
        id: 'rt-1',
        token: 'hash-of-token',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // mañana
        user: mockUser,
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(validStoredToken);

      const result = await service.refresh('sample-raw-token');

      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'rt-1' } });
      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshTokenRaw');
    });

    it('debe rechazar refresh token si está expirado', async () => {
      const expiredStoredToken = {
        id: 'rt-1',
        token: 'hash-of-token',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 10000), // en el pasado
        user: mockUser,
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(expiredStoredToken);

      await expect(service.refresh('expired-raw-token')).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'rt-1' } });
    });

    it('debe rechazar refresh token si el usuario fue desactivado', async () => {
      const storedTokenWithInactiveUser = {
        id: 'rt-1',
        token: 'hash-of-token',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 100000),
        user: { ...mockUser, activo: false },
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(storedTokenWithInactiveUser);

      await expect(service.refresh('raw-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('debe eliminar el refresh token por su hash criptográfico', async () => {
      await service.logout('raw-token-to-delete', mockUser.id);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalled();
      expect(auditoria.registrar).toHaveBeenCalledWith(
        expect.objectContaining({ accion: 'LOGOUT', usuarioId: mockUser.id }),
      );
    });
  });
});
