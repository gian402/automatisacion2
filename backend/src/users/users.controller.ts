// ============================================================
// HYTICON — UsersController
// Gestión de usuarios — solo ADMINISTRADOR
// GET    /users           — listar
// GET    /users/:id       — detalle
// POST   /users           — crear
// PATCH  /users/:id       — actualizar
// PATCH  /users/:id/toggle — activar/desactivar
// ============================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Rol } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ToggleUserDto } from './dto/user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth('access-token')
@Roles(Rol.ADMIN)           // Todo el controller es solo ADMIN
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── GET /users ──────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar usuarios (solo ADMIN)' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  // ── GET /users/:id ──────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un usuario (solo ADMIN)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  // ── POST /users ─────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Crear usuario (solo ADMIN)' })
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.usersService.create(dto, admin.id);
  }

  // ── PATCH /users/:id ────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario (solo ADMIN)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.usersService.update(id, dto, admin.id);
  }

  // ── PATCH /users/:id/toggle ─────────────────────────────────
  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Activar o desactivar usuario (solo ADMIN)' })
  toggle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleUserDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.usersService.toggleActivo(id, dto, admin.id);
  }
}
