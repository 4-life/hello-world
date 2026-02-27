import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '../db';
import { User } from '../entities/User';

export async function POST(): Promise<NextResponse> {
  const usersRepo = await db.getRepository(User);
  await usersRepo.clear();
  revalidatePath('/db');

  return NextResponse.json({ message: 'All todos deleted successfully' });
}
