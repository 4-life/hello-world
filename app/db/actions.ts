'use server';

import { revalidatePath } from 'next/cache';
import { db } from './db';
import { User } from './entities/User';

export async function addUserAction(formData: FormData) {
  const usersRepo = await db.getRepository(User);
  const content = formData.get('content') as string;
  const user = new User();
  user.firstName = content;
  await usersRepo.save(user);
  revalidatePath('/db');
}
