import { InputType, Field, registerEnumType } from 'type-graphql';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SortOrder } from '../SortOrder';

@InputType('CreateClientInput')
export class CreateClientInput {
  @Field(() => String)
  @IsString()
  @Length(1, 200)
  name: string;

  @Field(() => String, { nullable: true })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  @MaxLength(200)
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @ValidateIf((o: CreateClientInput) => !!o.phone)
  @Matches(/^\+?[\d\s\-().]{7,20}$/, { message: 'Invalid phone number' })
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  address?: string;
}

@InputType('UpdateClientInput')
export class UpdateClientInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;
}

@InputType('ClientsFilter')
export class ClientsFilter {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  query?: string;
}

export enum ClientSortField {
  name = 'name',
  createdDate = 'createdDate',
}

registerEnumType(ClientSortField, { name: 'ClientSortField' });

@InputType('ClientsSortInput')
export class ClientsSortInput {
  @Field(() => ClientSortField)
  field: ClientSortField = ClientSortField.createdDate;

  @Field(() => SortOrder)
  order: SortOrder = SortOrder.ASC;
}
