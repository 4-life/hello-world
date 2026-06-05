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
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SortOrder } from './SortOrder';
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
    this.updatedDate = new Date();
  }

  @BeforeUpdate()
  updateDates(): void {
    this.updatedDate = new Date();
  }
}

@InputType('CreateUserInput')
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  @Length(3, 50, { message: 'Login must be 3–50 characters' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message:
      'Login may only contain letters, digits, underscores, dots, or hyphens',
  })
  login: string;

  @Field(() => String)
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(255)
  email: string;

  @Field(() => String)
  @IsString()
  @Length(8, 100, { message: 'Password must be 8–100 characters' })
  password: string;

  @Field(() => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @ValidateIf((o: CreateUserInput) => !!o.phone)
  @Matches(/^\+?[\d\s\-().]{7,20}$/, { message: 'Invalid phone number' })
  phone?: string;
}

@InputType('UpdateUserInput')
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  login?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => UserRole, { nullable: true })
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

  @Field(() => Date, { nullable: true })
  startWorkDate?: Date;
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
  @IsString()
  @MaxLength(200)
  @IsOptional()
  query?: string;
}

export enum UserSortField {
  startWorkDate = 'startWorkDate',
  createdDate = 'createdDate',
}

registerEnumType(UserSortField, { name: 'UserSortField' });

@InputType('UsersSortInput')
export class UsersSortInput {
  @Field(() => UserSortField)
  field: UserSortField = UserSortField.createdDate;

  @Field(() => SortOrder)
  order: SortOrder = SortOrder.ASC;
}

@ObjectType('PaginatedUsersResponse')
export class PaginatedUsersResponse {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  total: number;
}
