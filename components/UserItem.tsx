import { UsersQuery } from '@/app/libs/getUsers';
import DeleteUserButton from './DeleteUserButton';

interface Props {
  user: UsersQuery['users']['items'][0];
}

export default function UserItem({ user }: Props): React.JSX.Element {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h3>{user.login}</h3>
        <DeleteUserButton id={user.id} />
      </div>
      {user.pinnedPost ? (
        <div>
          <p>Pinned post: {user.pinnedPost?.title}</p>
          {user.pinnedPost?.content && <p>{user.pinnedPost.content}</p>}
        </div>
      ) : (
        <p>No pinned post</p>
      )}
    </div>
  );
}
