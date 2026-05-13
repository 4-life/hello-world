import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notifier } from '@/server/notifier';

export async function GET(req: Request): Promise<Response> {
  const session = await getServerSession({
    ...authOptions,
    headers: req.headers,
  });

  const userId = (session?.user as { userId?: string } | undefined)?.userId;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(ctrl) {
      const send = (data: unknown): void => {
        try {
          ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          cleanup();
        }
      };

      const keepAlive = setInterval(() => {
        try {
          ctrl.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          cleanup();
        }
      }, 30_000);

      function cleanup(): void {
        clearInterval(keepAlive);
        notifier.off(`user:${userId}`, send);
      }

      notifier.on(`user:${userId}`, send);
      req.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
