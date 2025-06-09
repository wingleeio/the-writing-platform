import { query } from "convex/_generated/server";

import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { match } from "ts-pattern";

export const getActivities = query({
  args: {
    authorId: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { authorId, paginationOpts } = args;

    const base = authorId
      ? ctx.db
          .query("activities")
          .withIndex("by_author", (q) =>
            authorId ? q.eq("authorId", authorId) : q
          )
      : ctx.db.query("activities");

    return base
      .order("desc")
      .paginate(paginationOpts)
      .then(async (data) => {
        return {
          ...data,
          page: await Promise.all(
            data.page.map(async (activity) => {
              return match(activity)
                .with({ type: "PublishBook" }, async (activity) => {
                  const book = await ctx.db.get(activity.bookId);
                  const author = await ctx.db.get(activity.authorId);
                  if (!book || !author) {
                    throw new Error("Missing required data");
                  }
                  return {
                    ...activity,
                    type: "PublishBook" as const,
                    book,
                    author,
                  };
                })
                .with({ type: "PublishChapter" }, async (activity) => {
                  const book = await ctx.db.get(activity.bookId);
                  const author = await ctx.db.get(activity.authorId);
                  const chapter = await ctx.db.get(activity.chapterId!);
                  if (!book || !author || !chapter) {
                    throw new Error("Missing required data");
                  }
                  return {
                    ...activity,
                    type: "PublishChapter" as const,
                    book,
                    author,
                    chapter,
                  };
                })
                .with({ type: "PublishComment" }, async (activity) => {
                  const book = await ctx.db.get(activity.bookId);
                  const author = await ctx.db.get(activity.authorId);
                  const chapter = await ctx.db.get(activity.chapterId!);
                  const comment = await ctx.db.get(activity.commentId!);
                  if (!book || !author || !chapter || !comment) {
                    throw new Error("Missing required data");
                  }
                  return {
                    ...activity,
                    type: "PublishComment" as const,
                    book,
                    author,
                    chapter,
                    comment,
                  };
                })
                .with({ type: "PublishReview" }, async (activity) => {
                  const book = await ctx.db.get(activity.bookId);
                  const author = await ctx.db.get(activity.authorId);
                  const review = await ctx.db.get(activity.reviewId!);
                  if (!book || !author || !review) {
                    throw new Error("Missing required data");
                  }
                  return {
                    ...activity,
                    type: "PublishReview" as const,
                    book,
                    author,
                    review,
                  };
                })
                .exhaustive();
            })
          ),
        };
      });
  },
});
