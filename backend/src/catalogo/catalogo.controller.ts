// ============================================================
// HYTICON — CatalogoController
// GET    /catalogo            — listar con búsqueda, filtro categoría y paginación
// GET    /catalogo/:id        — detalle
// POST   /catalogo            — crear (solo ADMIN)
// PATCH  /catalogo/:id        — actualizar (solo ADMIN)
// PATCH  /catalogo/:id/toggle — activar/desactivar (solo ADMIN)
// ============================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriaCatalogo, Rol } from '@prisma/client';
import { CatalogoService } from './catalogo.service';
import {
  CreateCatalogoItemDto,
  UpdateCatalogoItemDto,
  ToggleCatalogoItemDto,
} from './dto/catalogo.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Catálogo')
@ApiBearerAuth('access-token')
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  // ── GET /catalogo ───────────────────────────────────────────
  // Accesible por todos los roles autenticados (para usar en cotizaciones)
  @Get()
  @ApiOperation({ summary: 'Listar ítems del catálogo' })
  @ApiQuery({ name: 'page',       required: false, type: Number })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  @ApiQuery({ name: 'search',     required: false, type: String })
  @ApiQuery({ name: 'categoria',  required: false, enum: CategoriaCatalogo })
  @ApiQuery({ name: 'soloActivos', required: false, type: Boolean })
  findAll(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('categoria') categoriaStr?: string,
    @Query('soloActivos') soloActivosStr?: string,
  ) {
    const categoria = Object.values(CategoriaCatalogo).includes(
      categoriaStr as CategoriaCatalogo,
    )
      ? (categoriaStr as CategoriaCatalogo)
      : undefined;

    const soloActivos =
      soloActivosStr === 'true'  ? true  :
      soloActivosStr === 'false' ? false :
      undefined;

    return this.catalogoService.findAll({ page, limit, search, categoria, soloActivos });
  }

  // ── GET /catalogo/:id ───────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un ítem del catálogo' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.findOne(id);
  }

  // ── POST /catalogo ──────────────────────────────────────────
  @Post()
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear ítem del catálogo (solo ADMIN)' })
  create(
    @Body() dto: CreateCatalogoItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.catalogoService.create(dto, user.id);
  }

  // ── PATCH /catalogo/:id ─────────────────────────────────────
  @Patch(':id')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Actualizar ítem del catálogo (solo ADMIN)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatalogoItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.catalogoService.update(id, dto, user.id);
  }

  // ── PATCH /catalogo/:id/toggle ──────────────────────────────
  @Patch(':id/toggle')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Activar o desactivar ítem (solo ADMIN)' })
  toggle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleCatalogoItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.catalogoService.toggleActivo(id, dto, user.id);
  }
}
