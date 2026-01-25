'use client';

import useDeleteUser from '@/app/libs/deleteUser';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
}

export default function DeleteUserButton({ id }: Props) {
  const [deleteUser, { loading }] = useDeleteUser();
  const router = useRouter();

  async function handleDelete() {
    const { data } = await deleteUser({
      variables: { id },
    });

    if (data?.deleteUser) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{ fontSize: '10pt', padding: '2px 4px' }}
    >
      {loading ? 'Deleting...' : 'Delete user'}
    </button>
  );
}
