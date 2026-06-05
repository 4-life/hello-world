import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export type Context = {
  userId: string | null;
  role: string | null;
  ip: string | null;
};

export async function createContext(req: Request): Promise<Context> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    null;

  try {
    const session = await getServerSession({
      ...authOptions,
      headers: req.headers,
    });

    const user = session?.user as
      | { userId?: string; role?: string }
      | undefined;

    return {
      userId: user?.userId ?? null,
      role: user?.role ?? null,
      ip,
    };
  } catch {
    return { userId: null, role: null, ip };
  }
}
