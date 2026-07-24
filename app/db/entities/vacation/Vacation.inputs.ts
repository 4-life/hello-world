import { InputType, Field } from 'type-graphql';

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
