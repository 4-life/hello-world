import { db } from '@/app/db/db';
import { Notification } from './Notification.entity';
import { notifier } from '@/server/notifier';

export async function createNotification(
  userId: string,
  message: string,
): Promise<void> {
  const repo = db.getRepository(Notification);
  await repo.save(repo.create({ userId, message }));
  notifier.emit(`user:${userId}`, { message });
}
