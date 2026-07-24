import { InputType, Field, registerEnumType } from 'type-graphql';
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
import { SortOrder } from '../SortOrder';
import { UserRole } from './User.types';

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
  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @ValidateIf((o: UpdateUserInput) => !!o.phone)
  @Matches(/^\+?[\d\s\-().]{7,20}$/, { message: 'Invalid phone number' })
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
  @IsString()
  @MaxLength(200)
  @IsOptional()
  query?: string;
}

export enum UserSortField {
  login = 'login',
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
