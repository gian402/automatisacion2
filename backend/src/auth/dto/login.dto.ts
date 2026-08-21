// ============================================================
// HYTICON — Auth DTOs
// ============================================================

import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ── Login ─────────────────────────────────────────────────────
export class LoginDto {
  @ApiProperty({ example: 'admin@hyticon.com' })
  @IsEmail({}, { message: 'Ingresa un correo válido' })
  email: string;

  @ApiProperty({ example: 'Admin1234!' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(100)
  password: string;
}

// ── Respuesta del login / refresh ─────────────────────────────
export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
}
