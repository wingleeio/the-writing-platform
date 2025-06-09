import { internal, api } from "convex/_generated/api";
import { mutation } from "convex/functions";
import { query } from "convex/_generated/server";
import { v } from "convex/values";
import type { Id, Doc } from "convex/_generated/dataModel";
import sanitizeHtml from "sanitize-html";

export const create = mutation({
  args: {
    content: v.string(),
    bookId: v.id("books"),
  },
  handler: async (ctx, args): Promise<Id<"reviews">> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const author = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });

    if (!author) {
      throw new Error("User not found");
    }

    const book = await ctx.runQuery(api.books.getById, {
      id: args.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    const reviewId = await ctx.db.insert("reviews", {
      content: sanitizeHtml(args.content, {
        allowedTags: ["b", "i", "u", "s", "strike", "p", "strong", "em", "br"],
      }),
      bookId: args.bookId,
      authorId: author._id,
      totalLikes: 0,
    });

    return reviewId;
  },
});

export const toggleLike = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    const user = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const reviewLike = await ctx.db
      .query("reviewLikes")
      .withIndex("by_user_review", (q) =>
        q.eq("userId", user._id).eq("reviewId", args.reviewId)
      )
      .first();

    if (reviewLike) {
      await ctx.db.delete(reviewLike._id);
    } else {
      await ctx.db.insert("reviewLikes", {
        userId: user._id,
        reviewId: args.reviewId,
      });
    }

    return null;
  },
});

export const getByBookId = query({
  args: {
    bookId: v.id("books"),
  },
  handler: async (
    ctx,
    args: { bookId: Id<"books"> }
  ): Promise<
    (Doc<"reviews"> & { author: Doc<"users">; likedByMe: boolean })[]
  > => {
    const identity = await ctx.auth.getUserIdentity();
    const me = identity
      ? await ctx.runQuery(internal.users.getByAuthId, {
          authId: identity.subject,
        })
      : null;

    return await ctx.db
      .query("reviews")
      .withIndex("by_book", (q: any) => q.eq("bookId", args.bookId))
      .collect()
      .then(async (reviews: Doc<"reviews">[]) => {
        const reviewsWithAuthors = await Promise.all(
          reviews.map(async (review) => {
            const author = await ctx.db.get(review.authorId);
            if (!author) return null;
            return {
              ...review,
              author,
              likedByMe: me
                ? (await ctx.db
                    .query("reviewLikes")
                    .withIndex("by_user_review", (q: any) =>
                      q.eq("userId", me._id).eq("reviewId", review._id)
                    )
                    .first()) !== null
                : false,
            };
          })
        );
        return reviewsWithAuthors.filter(
          (review): review is NonNullable<typeof review> => review !== null
        );
      });
  },
});
