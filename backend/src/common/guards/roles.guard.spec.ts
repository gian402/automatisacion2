// ============================================================
// HYTICON — roles.guard.spec.ts
// Pruebas unitarias para el sistema de autorización basada en roles
// ============================================================

import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(user?: { id: string; rol: Rol }): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('debe permitir acceso si el endpoint no tiene restricción de @Roles()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

    const context = createMockExecutionContext({
      id: 'user-1',
      rol: Rol.SUPERVISOR,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe permitir acceso a ADMINISTRADOR si la ruta requiere ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Rol.ADMIN]);

    const context = createMockExecutionContext({
      id: 'admin-1',
      rol: Rol.ADMIN,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe denegar acceso (false) a SUPERVISOR si la ruta requiere ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Rol.ADMIN]);

    const context = createMockExecutionContext({
      id: 'supervisor-1',
      rol: Rol.SUPERVISOR,
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('debe permitir acceso si el rol del usuario está en la lista de roles permitidos', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Rol.ADMIN, Rol.SUPERVISOR]);

    const context = createMockExecutionContext({
      id: 'supervisor-1',
      rol: Rol.SUPERVISOR,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe denegar acceso si no hay usuario en la request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Rol.ADMIN]);

    const context = createMockExecutionContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });
});
