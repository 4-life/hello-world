import { registerEnumType } from 'type-graphql';

export enum UserRole {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The user roles.',
});
