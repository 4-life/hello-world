import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToOne,
  JoinColumn,
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
import { Post } from '.';
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

  // -----------------------------
  // AUTH
  // -----------------------------
  @Field()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  login: string;

  // OAuth users don’t have passwords
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string; // hashed password

  // -----------------------------
  // PROFILE FIELDS (Optional)
  // -----------------------------
  @Field()
  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Field()
  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Field()
  @Column({ type: 'varchar', length: 200, nullable: true })
  email?: string;

  @Field()
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  // avatar URL
  @Field()
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @Field()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Field(() => Post, { nullable: true })
  @OneToOne(() => Post, { nullable: true })
  @JoinColumn() // owning side
  pinnedPost?: Relation<Post>;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.author)
  @JoinColumn()
  posts: Relation<Post>[];

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

  @Field(() => String, { nullable: true })
  pinnedPostId?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;
}

@ObjectType('PaginatedUsersResponse')
export class PaginatedUsersResponse {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  total: number;
}
