// ============================================================
// HYTICON — JWT Payload
// Estructura del payload dentro del access token
// ============================================================

import { Rol } from '@prisma/client';

export interface JwtPayload {
  sub: string;     // user.id
  email: string;
  nombre: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}
