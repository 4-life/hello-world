import type { Context } from '@/server/context';

const PRIVILEGED_ROLES = new Set(['admin', 'manager']);

export function assertSelfOrPrivileged(
  ctx: Context,
  targetId: string,
  message = 'Not authorized to update other users',
): void {
  const isOtherUser = targetId !== ctx.userId;
  if (isOtherUser && !PRIVILEGED_ROLES.has(ctx.role ?? '')) {
    throw new Error(message);
  }
}
