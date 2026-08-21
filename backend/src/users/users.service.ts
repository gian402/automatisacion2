// ============================================================
// HYTICON — UsersService
// CRUD de usuarios — solo accesible por ADMIN
// ============================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UpdateUserDto, ToggleUserDto } from './dto/user.dto';

// Campos que nunca se devuelven al cliente
const USER_SELECT = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
    private readonly authService: AuthService,
  ) {}

  // ── Listar usuarios ─────────────────────────────────────────
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, limit };
  }

  // ── Obtener uno ─────────────────────────────────────────────
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ── Crear usuario ───────────────────────────────────────────
  async create(dto: CreateUserDto, adminId: string) {
    const existe = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existe) throw new ConflictException('Ya existe un usuario con ese correo');

    const passwordHash = await this.authService.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        nombre: dto.nombre.trim(),
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        rol: dto.rol,
        activo: true,
      },
      select: USER_SELECT,
    });

    await this.auditoria.registrar({
      usuarioId: adminId,
      accion: 'CREAR_USUARIO',
      entidad: 'users',
      entidadId: user.id,
      detalle: { email: user.email, rol: user.rol },
    });

    return user;
  }

  // ── Actualizar usuario ──────────────────────────────────────
  async update(id: string, dto: UpdateUserDto, adminId: string) {
    await this.findOne(id); // valida que existe

    // Si hay nuevo email, verificar que no esté en uso
    if (dto.email) {
      const existe = await this.prisma.user.findFirst({
        where: { email: dto.email.toLowerCase().trim(), NOT: { id } },
      });
      if (existe) throw new ConflictException('Ya existe un usuario con ese correo');
    }

    // Si hay nueva contraseña, hashearla
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await this.authService.hashPassword(dto.password);
    }

    const { password: _pw, ...rest } = dto;
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(dto.email && { email: dto.email.toLowerCase().trim() }),
        ...(passwordHash && { passwordHash }),
      },
      select: USER_SELECT,
    });

    await this.auditoria.registrar({
      usuarioId: adminId,
      accion: 'ACTUALIZAR_USUARIO',
      entidad: 'users',
      entidadId: id,
      detalle: { campos: Object.keys(rest) },
    });

    return user;
  }

  // ── Activar / desactivar ────────────────────────────────────
  async toggleActivo(id: string, dto: ToggleUserDto, adminId: string) {
    if (id === adminId && !dto.activo) {
      throw new BadRequestException('No puedes desactivar tu propia cuenta');
    }

    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { activo: dto.activo },
      select: USER_SELECT,
    });

    // Al desactivar, invalidar todas las sesiones del usuario
    if (!dto.activo) {
      await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    }

    await this.auditoria.registrar({
      usuarioId: adminId,
      accion: dto.activo ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO',
      entidad: 'users',
      entidadId: id,
    });

    return user;
  }
}
