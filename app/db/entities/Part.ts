import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { ObjectType, Field, ID, InputType, Int } from 'type-graphql';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { EngineerStock } from './EngineerStock';

@ObjectType('Part', {
  description: 'A catalog item / spare part that can be stocked.',
})
@Entity({ name: 'parts' })
export class Part {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Field()
  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Field()
  @Column({ type: 'varchar', length: 20, default: 'pcs' })
  unit: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => [EngineerStock])
  @OneToMany('EngineerStock', (stock: EngineerStock) => stock.part)
  stock: Relation<EngineerStock>[];

  @Field()
  @Column({ type: 'timestamp' })
  createdDate: Date;
}

@InputType('CreatePartInput')
export class CreatePartInput {
  @Field(() => String)
  @IsString()
  @Length(1, 200)
  name: string;

  @Field(() => String)
  @IsString()
  @Length(1, 100)
  sku: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  unit?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}

@InputType('UpdatePartInput')
export class UpdatePartInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  sku?: string;

  @Field(() => String, { nullable: true })
  unit?: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

@InputType('PartsFilter')
export class PartsFilter {
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  query?: string;
}

@ObjectType('PaginatedPartsResponse')
export class PaginatedPartsResponse {
  @Field(() => [Part])
  items: Part[];

  @Field(() => Int)
  total: number;
}
