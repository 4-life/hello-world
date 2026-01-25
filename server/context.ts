import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export type Context = {
  userId: string | null;
};

export async function createContext(req: Request): Promise<Context> {
  try {
    const session = await getServerSession({
      ...authOptions,
      headers: req.headers,
    });

    return {
      userId:
        session?.user && 'userId' in session.user
          ? (session.user as { userId: string }).userId
          : null,
    };
  } catch (err) {
    console.error('Context creation failed', err);
    return { userId: null };
  }
}
