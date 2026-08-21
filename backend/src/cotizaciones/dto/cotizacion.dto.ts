// ============================================================
// HYTICON — Cotizaciones DTOs
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
  IsDateString,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Moneda, TipoItem, EstadoCotizacion } from '@prisma/client';

// ── Ítem dentro de una cotización ─────────────────────────────
export class CotizacionItemDto {
  @ApiPropertyOptional({ description: 'ID del ítem del catálogo (opcional para ítems libres)' })
  @IsOptional()
  @IsUUID()
  catalogoItemId?: string;

  @ApiProperty({ enum: TipoItem })
  @IsEnum(TipoItem, { message: 'Tipo de ítem no válido' })
  tipoItem: TipoItem;

  @ApiProperty({ example: 'Cámara IP Hikvision 2MP' })
  @IsString()
  @MaxLength(500)
  descripcion: string;

  @ApiProperty({ example: 2 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cantidad inválida' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  @Type(() => Number)
  cantidad: number;

  @ApiProperty({ example: 350.00 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Precio unitario inválido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Type(() => Number)
  precioUnitario: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orden?: number;
}

// ── Crear cotización ──────────────────────────────────────────
export class CreateCotizacionDto {
  @ApiProperty({ example: 'uuid-del-cliente' })
  @IsUUID()
  clienteId: string;

  @ApiPropertyOptional({ example: 'Instalación de cámaras en almacén' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  proyecto?: string;

  @ApiProperty({ example: '2026-08-20' })
  @IsDateString()
  fechaEmision: string;

  @ApiProperty({ example: '2026-09-20' })
  @IsDateString()
  fechaVencimiento: string;

  @ApiPropertyOptional({ example: 'COTIZACIÓN' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoDocumento?: string;

  @ApiProperty({ example: 'uuid-del-responsable' })
  @IsUUID()
  responsableId: string;

  @ApiProperty({ enum: Moneda, example: 'PEN' })
  @IsEnum(Moneda, { message: 'Moneda no válida' })
  moneda: Moneda;

  @ApiPropertyOptional({ example: 'Validez de la oferta: 30 días.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  terminosCondiciones?: string;

  @ApiProperty({ type: [CotizacionItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'La cotización debe tener al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => CotizacionItemDto)
  items: CotizacionItemDto[];
}

// ── Actualizar cotización ─────────────────────────────────────
export class UpdateCotizacionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  proyecto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoDocumento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  responsableId?: string;

  @ApiPropertyOptional({ enum: Moneda })
  @IsOptional()
  @IsEnum(Moneda)
  moneda?: Moneda;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  terminosCondiciones?: string;

  @ApiPropertyOptional({ type: [CotizacionItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'La cotización debe tener al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => CotizacionItemDto)
  items?: CotizacionItemDto[];
}

// ── Cambiar estado ────────────────────────────────────────────
export class CambiarEstadoDto {
  @ApiProperty({ enum: EstadoCotizacion })
  @IsEnum(EstadoCotizacion, { message: 'Estado no válido' })
  estado: EstadoCotizacion;

  @ApiPropertyOptional({ example: 'Aprobado por el cliente vía correo' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nota?: string;
}
