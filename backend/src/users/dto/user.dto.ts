// ============================================================
// HYTICON — Users DTOs
// ============================================================

import {
  IsEmail,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { Rol } from '@prisma/client';

// ── Crear usuario ─────────────────────────────────────────────
export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'juan@hyticon.com' })
  @IsEmail({}, { message: 'Ingresa un correo válido' })
  email: string;

  @ApiProperty({ example: 'Segura1234!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  @Matches(/(?=.*[a-zA-Z])(?=.*[0-9])/, {
    message: 'La contraseña debe contener al menos una letra y un número',
  })
  password: string;

  @ApiProperty({ enum: Rol, example: Rol.SUPERVISOR })
  @IsEnum(Rol)
  rol: Rol;
}

// ── Actualizar usuario (todo opcional excepto validaciones) ───
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
  @ApiPropertyOptional({ example: 'NuevaPass1234!' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  @Matches(/(?=.*[a-zA-Z])(?=.*[0-9])/, {
    message: 'La contraseña debe contener al menos una letra y un número',
  })
  password?: string;
}

// ── Cambiar estado activo/inactivo ────────────────────────────
export class ToggleUserDto {
  @ApiProperty()
  @IsBoolean()
  activo: boolean;
}
