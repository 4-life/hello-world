import { db } from "@/app/db/db";
import { CreatePostInput, Post } from "@/app/db/entities/Post";
import { User } from "@/app/db/entities";
import { Resolver, Query, Mutation, Arg } from "type-graphql";

@Resolver(Post)
export class PostResolver {
  private repo = db.getRepository(Post);
  private userRepo = db.getRepository(User);

  @Query(() => [Post])
  async posts() {
    return this.repo.find({ relations: ["author"] });
  }

  @Mutation(() => Post)
  async createPost(@Arg("data") data: CreatePostInput) {
    const author = await this.userRepo.findOneBy({ id: data.authorId });
    if (!author) throw new Error("Author not found");

    const post = this.repo.create({
      title: data.title,
      content: data.content,
      author
    });

    return this.repo.save(post);
  }
}
