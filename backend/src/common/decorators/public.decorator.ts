import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público — omite la verificación de JWT.
 * Uso: @Public() sobre el método o el controller.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
