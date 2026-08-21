// ============================================================
// HYTICON — ClientesController
// GET    /clientes          — listar con búsqueda y paginación
// GET    /clientes/:id      — detalle
// POST   /clientes          — crear
// PATCH  /clientes/:id      — actualizar
// PATCH  /clientes/:id/toggle — activar/desactivar
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
  ParseBoolPipe,
  Optional,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import {
  CreateClienteDto,
  UpdateClienteDto,
  ToggleClienteDto,
} from './dto/cliente.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Clientes')
@ApiBearerAuth('access-token')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // ── GET /clientes ───────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiQuery({ name: 'page',       required: false, type: Number })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  @ApiQuery({ name: 'search',     required: false, type: String })
  @ApiQuery({ name: 'soloActivos', required: false, type: Boolean })
  findAll(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('soloActivos', new DefaultValuePipe(undefined)) soloActivosStr?: string,
  ) {
    const soloActivos =
      soloActivosStr === 'true'  ? true  :
      soloActivosStr === 'false' ? false :
      undefined;

    return this.clientesService.findAll({ page, limit, search, soloActivos });
  }

  // ── GET /clientes/:id ───────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un cliente' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  // ── POST /clientes ──────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Crear cliente' })
  create(
    @Body() dto: CreateClienteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.clientesService.create(dto, user.id);
  }

  // ── PATCH /clientes/:id ─────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cliente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClienteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.clientesService.update(id, dto, user.id);
  }

  // ── PATCH /clientes/:id/toggle ──────────────────────────────
  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Activar o desactivar cliente' })
  toggle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleClienteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.clientesService.toggleActivo(id, dto, user.id);
  }
}
