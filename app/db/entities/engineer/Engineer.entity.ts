import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Order } from '../order/Order.entity';
import { EngineerStock } from '../store/EngineerStock.entity';

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
  @OneToMany('orders', (order: Order) => order.engineer)
  orders: Relation<Order>[];

  @Field(() => [EngineerStock])
  @OneToMany('engineer_stock', (stock: EngineerStock) => stock.engineer)
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
