import { addUserAction } from './actions';
import { db } from './db';
import { User } from './entities/User';

export const dynamic = 'force-dynamic';

export default async function Home(): Promise<React.JSX.Element> {
  const usersRepo = await db.getRepository(User);

  const users = await usersRepo.find();

  return (
    <div>
      <h1>Todo List</h1>
      <form action={addUserAction}>
        <input type="text" name="content" required />
        <button type="submit">Add Todo</button>
      </form>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <span style={{ marginRight: '10px' }}>{user.firstName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
