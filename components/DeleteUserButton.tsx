'use client';

import useDeleteUser from '@/app/libs/deleteUser';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
}

export default function DeleteUserButton({ id }: Props): React.JSX.Element {
  const [deleteUser, { loading: isLoading }] = useDeleteUser();
  const router = useRouter();

  async function handleDelete(): Promise<void> {
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
      disabled={isLoading}
      style={{ fontSize: '10pt', padding: '2px 4px' }}
    >
      {isLoading ? 'Deleting...' : 'Delete user'}
    </button>
  );
}
