import { InputType, Field, registerEnumType } from 'type-graphql';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SortOrder } from '../SortOrder';

@InputType('CreateEngineerInput')
export class CreateEngineerInput {
  @Field(() => String)
  @IsString()
  @Length(1, 100)
  firstName: string;

  @Field(() => String)
  @IsString()
  @Length(1, 100)
  lastName: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @ValidateIf((o: CreateEngineerInput) => !!o.phone)
  @Matches(/^\+?[\d\s\-().]{7,20}$/, { message: 'Invalid phone number' })
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  @MaxLength(200)
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  specialization?: string;
}

@InputType('UpdateEngineerInput')
export class UpdateEngineerInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  specialization?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType('EngineersFilter')
export class EngineersFilter {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  query?: string;
}

export enum EngineerSortField {
  firstName = 'firstName',
  lastName = 'lastName',
  createdDate = 'createdDate',
}

registerEnumType(EngineerSortField, { name: 'EngineerSortField' });

@InputType('EngineersSortInput')
export class EngineersSortInput {
  @Field(() => EngineerSortField)
  field: EngineerSortField = EngineerSortField.createdDate;

  @Field(() => SortOrder)
  order: SortOrder = SortOrder.ASC;
}
