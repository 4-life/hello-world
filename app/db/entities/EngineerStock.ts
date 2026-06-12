import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ObjectType, Field, ID, InputType, Int } from 'type-graphql';
import { IsInt, Min } from 'class-validator';
import { Engineer } from './Engineer';
import { Part } from './Part';

@ObjectType('EngineerStock', {
  description: 'Stock level of a part held by an engineer.',
})
@Entity({ name: 'engineer_stock' })
export class EngineerStock {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Engineer)
  @ManyToOne('Engineer', (engineer: Engineer) => engineer.stock, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'engineerId' })
  engineer: Relation<Engineer>;

  @Field(() => Part)
  @ManyToOne('Part', (part: Part) => part.stock, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partId' })
  part: Relation<Part>;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  minQuantity: number;

  @Field()
  @Column({ type: 'timestamp' })
  updatedDate: Date;

  @BeforeInsert()
  @BeforeUpdate()
  updateDates(): void {
    this.updatedDate = new Date();
  }
}

@InputType('SetStockInput')
export class SetStockInput {
  @Field(() => String)
  engineerId: string;

  @Field(() => String)
  partId: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  quantity: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  minQuantity: number;
}
