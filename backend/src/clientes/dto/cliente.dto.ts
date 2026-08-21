// ============================================================
// HYTICON — Clientes DTOs
// ============================================================

import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ── Crear cliente ─────────────────────────────────────────────
export class CreateClienteDto {
  @ApiProperty({ example: 'Empresa Ejemplo S.A.C.' })
  @IsString()
  @MinLength(2, { message: 'La razón social debe tener al menos 2 caracteres' })
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({ example: '20123456789' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'El RUC debe tener exactamente 11 dígitos' })
  ruc?: string;

  @ApiPropertyOptional({ example: 'Av. Lima 123, Lima' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;

  @ApiPropertyOptional({ example: 'contacto@empresa.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Ingresa un correo válido' })
  email?: string;

  @ApiPropertyOptional({ example: '999888777' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}

// ── Actualizar cliente ────────────────────────────────────────
export class UpdateClienteDto extends PartialType(CreateClienteDto) {}

// ── Toggle activo ─────────────────────────────────────────────
export class ToggleClienteDto {
  @ApiProperty()
  @IsBoolean()
  activo: boolean;
}
