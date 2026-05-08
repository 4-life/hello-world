import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  InputType,
  registerEnumType,
  Int,
} from 'type-graphql';
import { Vacation } from './Vacation';
import { UserRole } from './UserRole';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The user roles.',
});

@ObjectType('User', {
  description: 'Users table. This is the main user table.',
})
@Entity({ name: 'users' })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  login: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @Field()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Field(() => [Vacation])
  @OneToMany(() => Vacation, (vacation) => vacation.user)
  vacations: Relation<Vacation>[];

  @Field({ nullable: true })
  @Column({
    type: 'date',
    nullable: true,
    transformer: {
      to: (v: Date) => v,
      from: (v: string) => (v ? new Date(v) : null),
    },
  })
  startWorkDate?: Date;

  @Field()
  @Column({ type: 'timestamp' })
  createdDate: Date;

  @Field()
  @Column({ type: 'timestamp' })
  updatedDate: Date;

  @BeforeInsert()
  createDates(): void {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDates(): void {
    this.updatedDate = new Date();
  }
}

@InputType('UpdateUserInput')
export class UpdateUserInput {
  @Field()
  login: string;

  @Field()
  password?: string;

  @Field(() => UserRole)
  role?: UserRole;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;
}

@InputType('UsersFilter')
export class UsersFilter {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  login?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;

  @Field(() => String, { nullable: true })
  email?: string;
}

@ObjectType('PaginatedUsersResponse')
export class PaginatedUsersResponse {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  total: number;
}
