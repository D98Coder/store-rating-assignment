import { BadRequestException } from '@nestjs/common';

/** Escapes % _ \ so user input is matched literally inside ILIKE. */
export const likePattern = (v: string) => `%${v.replace(/[\\%_]/g, '\\$&')}%`;

/** Whitelist sort fields (prevents SQL injection / invalid columns). */
export function resolveSort(
  sortBy: string | undefined,
  allowed: Record<string, string>,
  fallback: string,
): string {
  const key = sortBy ?? fallback;
  if (!Object.prototype.hasOwnProperty.call(allowed, key)) {
    throw new BadRequestException(`sortBy must be one of: ${Object.keys(allowed).join(', ')}`);
  }
  return allowed[key];
}

export const buildMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

export const isUniqueViolation = (e: any) => (e?.code ?? e?.driverError?.code) === '23505';