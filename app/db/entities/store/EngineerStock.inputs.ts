import { InputType, Field, Int } from 'type-graphql';
import { IsInt, Min } from 'class-validator';

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
