import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { EngineerStock } from './EngineerStock.entity';

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
  @OneToMany('engineer_stock', (stock: EngineerStock) => stock.part)
  stock: Relation<EngineerStock>[];

  @Field()
  @Column({ type: 'timestamp' })
  createdDate: Date;
}
