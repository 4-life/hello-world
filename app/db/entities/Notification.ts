import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType('Notification')
@Entity({ name: 'notifications' })
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid' })
  userId: string;

  @Field()
  @Column({ type: 'text' })
  message: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
