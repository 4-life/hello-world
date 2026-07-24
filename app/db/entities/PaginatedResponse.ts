import { type ClassType, Field, Int, ObjectType } from 'type-graphql';

export default function PaginatedResponse<TItem extends object>(
  ItemClass: ClassType<TItem>,
  typeName: string,
): ClassType<{ items: TItem[]; total: number }> {
  // typeName is always an explicit string supplied by the caller (e.g.
  // PaginatedResponse(User, 'PaginatedUsersResponse')) — it never falls back to the mangled
  // constructor.name the lint rule guards against.
  // eslint-disable-next-line local/require-typegraphql-explicit-name
  @ObjectType(typeName)
  class PaginatedResponseClass {
    @Field(() => [ItemClass])
    items: TItem[];

    @Field(() => Int)
    total: number;
  }

  return PaginatedResponseClass;
}
