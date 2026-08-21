// ============================================================
// HYTICON — Catálogo DTOs
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CategoriaCatalogo } from '@prisma/client';

// ── Crear ítem de catálogo ────────────────────────────────────
export class CreateCatalogoItemDto {
  @ApiProperty({ example: 'CAM-IP-001' })
  @IsString()
  @MinLength(2, { message: 'El código debe tener al menos 2 caracteres' })
  @MaxLength(50)
  codigo: string;

  @ApiProperty({ example: 'Cámara IP Hikvision 2MP' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({ example: 'Cámara IP domo de 2 megapíxeles con visión nocturna' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ enum: CategoriaCatalogo, example: 'HARDWARE' })
  @IsEnum(CategoriaCatalogo, { message: 'Categoría no válida' })
  categoria: CategoriaCatalogo;

  @ApiPropertyOptional({ example: 'und' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unidad?: string;

  @ApiPropertyOptional({ example: 350.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido con hasta 2 decimales' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Type(() => Number)
  precioReferencial?: number;
}

// ── Actualizar ítem ───────────────────────────────────────────
export class UpdateCatalogoItemDto extends PartialType(CreateCatalogoItemDto) {}

// ── Toggle activo ─────────────────────────────────────────────
export class ToggleCatalogoItemDto {
  @ApiProperty()
  @IsBoolean()
  activo: boolean;
}
