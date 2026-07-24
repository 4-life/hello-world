import { InputType, Field } from 'type-graphql';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

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
