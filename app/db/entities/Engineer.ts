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
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Order } from './Order';
import { EngineerStock } from './EngineerStock';
import { SortOrder } from './SortOrder';

@ObjectType('Engineer', {
  description: 'Field engineers who can be assigned to orders.',
})
@Entity({ name: 'engineers' })
export class Engineer {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  specialization?: string;

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Field(() => [Order])
  @OneToMany('Order', (order: Order) => order.engineer)
  orders: Relation<Order>[];

  @Field(() => [EngineerStock])
  @OneToMany('EngineerStock', (stock: EngineerStock) => stock.engineer)
  stock: Relation<EngineerStock>[];

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

@ObjectType('PaginatedEngineersResponse')
export class PaginatedEngineersResponse {
  @Field(() => [Engineer])
  items: Engineer[];

  @Field(() => Int)
  total: number;
}
