import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { ObjectType, Field, ID, InputType } from 'type-graphql';
import { User } from '.';

@ObjectType()
@Entity({ name: 'posts' })
export class Post {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  content?: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  author: Relation<User>;
}

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  content?: string;

  @Field()
  authorId: string;
}
