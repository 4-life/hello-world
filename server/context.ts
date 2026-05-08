import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export type Context = {
  userId: string | null;
  role: string | null;
};

export async function createContext(req: Request): Promise<Context> {
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
    };
  } catch {
    return { userId: null, role: null };
  }
}
