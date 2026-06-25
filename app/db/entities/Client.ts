import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  InputType,
  Int,
  registerEnumType,
} from 'type-graphql';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Invoice } from './Invoice';
import { SortOrder } from './SortOrder';

@ObjectType('Client', {
  description: 'A customer that can be billed via invoices.',
})
@Entity({ name: 'clients' })
export class Client {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @Field(() => [Invoice])
  @OneToMany('invoices', (invoice: Invoice) => invoice.client)
  invoices: Relation<Invoice>[];

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

@ObjectType('PaginatedClientsResponse')
export class PaginatedClientsResponse {
  @Field(() => [Client])
  items: Client[];

  @Field(() => Int)
  total: number;
}
