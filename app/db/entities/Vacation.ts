import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ObjectType, Field, ID, InputType } from 'type-graphql';
import { User } from './User';

@ObjectType('Vacation')
@Entity({ name: 'vacations' })
export class Vacation {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.vacations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Field()
  @Column({
    type: 'date',
    transformer: { to: (v: Date) => v, from: (v: string) => new Date(v) },
  })
  startDate: Date;

  @Field()
  @Column({
    type: 'date',
    transformer: { to: (v: Date) => v, from: (v: string) => new Date(v) },
  })
  endDate: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  info?: string;
}

@InputType('CreateVacationInput')
export class CreateVacationInput {
  @Field()
  userId: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field({ nullable: true })
  info?: string;
}
