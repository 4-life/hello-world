'use client';

import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/app/db/entities';
import { UserRole } from '@/app/db/entities/UserRole';

const CREATE_USER = gql`
  mutation CreateUser($data: CreateUserInput!) {
    createUser(data: $data) {
      id
      login
      email
      firstName
      lastName
      rol
    }
  }
`;

export default function CreateUser(): React.JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<{
    login: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
  }>({
    login: '',
    password: '',
    role: 'USER',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [createUser, { loading: isLoading, error }] =
    useMutation<User>(CREATE_USER);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const { data: mutationData } = await createUser({
      variables: { data: form },
    });
    if (mutationData) {
      router.push('/users');
    }
  }

  return (
    <div>
      <h3>Create user</h3>
      {error && <p>{error.message || 'Failed to create user'}</p>}
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 300 }}
      >
        <input
          name="login"
          placeholder="Login"
          value={form.login}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <select name="role" value={form.role} onChange={handleChange}>
          {Object.entries(UserRole).map(([key, role]) => (
            <option key={key} value={key}>
              {role}
            </option>
          ))}
        </select>

        <input
          name="firstName"
          placeholder="First name"
          value={form.firstName}
          onChange={handleChange}
          autoComplete="off"
        />

        <input
          name="lastName"
          placeholder="Last name"
          value={form.lastName}
          onChange={handleChange}
          autoComplete="off"
        />

        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="off"
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          autoComplete="off"
        />

        <input
          name="avatar"
          placeholder="Avatar URL"
          value={form.avatar}
          onChange={handleChange}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create User'}
        </button>

        {error && <div style={{ color: 'red' }}>{error.message}</div>}
      </form>
    </div>
  );
}
