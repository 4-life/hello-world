import { InputType, Field, Int } from "type-graphql";

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true })
  offset?: number = 0;

  @Field(() => Int, { nullable: true })
  limit?: number = 10;
}
