import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
} from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { match } from "ts-pattern";

const triggers = new Triggers<DataModel>();

triggers.register("commentLikes", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const comment = await ctx.db.get(change.newDoc.commentId);
      if (comment) {
        await ctx.db.patch(comment._id, {
          totalLikes: comment.totalLikes + 1,
        });
        const author = await ctx.db.get(comment.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalLikes: author.totalLikes + 1,
          });
        }
      }
    })
    .with({ operation: "delete" }, async (change) => {
      const comment = await ctx.db.get(change.oldDoc.commentId);
      if (comment) {
        await ctx.db.patch(comment._id, {
          totalLikes: comment.totalLikes - 1,
        });
        const author = await ctx.db.get(comment.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalLikes: author.totalLikes - 1,
          });
        }
      }
    })
    .run();
});

triggers.register("chapterLikes", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const chapter = await ctx.db.get(change.newDoc.chapterId);
      if (chapter) {
        await ctx.db.patch(chapter._id, {
          totalLikes: chapter.totalLikes + 1,
        });
        const author = await ctx.db.get(chapter.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalLikes: author.totalLikes + 1,
          });
        }
        const book = await ctx.db.get(chapter.bookId);
        if (book) {
          await ctx.db.patch(book._id, {
            totalLikes: book.totalLikes + 1,
          });
        }
      }
    })
    .with({ operation: "delete" }, async (change) => {
      const chapter = await ctx.db.get(change.oldDoc.chapterId);
      if (chapter) {
        await ctx.db.patch(chapter._id, {
          totalLikes: chapter.totalLikes - 1,
        });
        const author = await ctx.db.get(chapter.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalLikes: author.totalLikes - 1,
          });
        }
        const book = await ctx.db.get(chapter.bookId);
        if (book) {
          await ctx.db.patch(book._id, {
            totalLikes: book.totalLikes - 1,
          });
        }
      }
    })
    .run();
});

triggers.register("comments", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const book = await ctx.db.get(change.newDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalComments: book.totalComments + 1,
        });
      }
      const chapter = await ctx.db.get(change.newDoc.chapterId);
      if (chapter) {
        await ctx.db.patch(chapter._id, {
          totalComments: chapter.totalComments + 1,
        });
      }
      await ctx.db.insert("activities", {
        type: "PublishComment",
        commentId: change.newDoc._id,
        bookId: change.newDoc.bookId,
        authorId: change.newDoc.authorId,
        chapterId: change.newDoc.chapterId,
      });
    })
    .with({ operation: "delete" }, async (change) => {
      const book = await ctx.db.get(change.oldDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalComments: book.totalComments - 1,
        });
      }
      const chapter = await ctx.db.get(change.oldDoc.chapterId);
      if (chapter) {
        await ctx.db.patch(chapter._id, {
          totalComments: chapter.totalComments - 1,
        });
      }
      for await (const activity of await ctx.db
        .query("activities")
        .withIndex("by_comment", (q) => q.eq("commentId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(activity._id);
      }
    })
    .run();
});

triggers.register("chapters", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const book = await ctx.db.get(change.newDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalChapters: book.totalChapters + 1,
          totalWords: book.totalWords + change.newDoc.totalWords,
        });
      }
      const author = await ctx.db.get(change.newDoc.authorId);
      if (author) {
        await ctx.db.patch(author._id, {
          totalChapters: author.totalChapters + 1,
          totalWords: author.totalWords + change.newDoc.totalWords,
        });
      }

      await ctx.db.insert("activities", {
        type: "PublishChapter",
        chapterId: change.newDoc._id,
        bookId: change.newDoc.bookId,
        authorId: change.newDoc.authorId,
      });
    })
    .with({ operation: "delete" }, async (change) => {
      const book = await ctx.db.get(change.oldDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalChapters: book.totalChapters - 1,
          totalWords: book.totalWords - change.oldDoc.totalWords,
          totalLikes: book.totalLikes - change.oldDoc.totalLikes,
        });
      }
      const author = await ctx.db.get(change.oldDoc.authorId);
      if (author) {
        await ctx.db.patch(author._id, {
          totalChapters: author.totalChapters - 1,
          totalWords: author.totalWords - change.oldDoc.totalWords,
          totalLikes: author.totalLikes - change.oldDoc.totalLikes,
        });
      }

      for await (const comment of await ctx.db
        .query("comments")
        .withIndex("by_chapter", (q) => q.eq("chapterId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(comment._id);
        const author = await ctx.db.get(comment.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalComments: author.totalComments - 1,
            totalLikes: author.totalLikes - comment.totalLikes,
          });
        }
      }

      for await (const activity of await ctx.db
        .query("activities")
        .withIndex("by_chapter", (q) => q.eq("chapterId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(activity._id);
      }
    })
    .with({ operation: "update" }, async (change) => {
      const book = await ctx.db.get(change.newDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalWords: book.totalWords + change.newDoc.totalWords,
        });
      }
      const author = await ctx.db.get(change.newDoc.authorId);
      if (author) {
        await ctx.db.patch(author._id, {
          totalWords: author.totalWords + change.newDoc.totalWords,
        });
      }
    })
    .run();
});

triggers.register("reviews", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const book = await ctx.db.get(change.newDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalReviews: book.totalReviews + 1,
        });
      }
      await ctx.db.insert("activities", {
        type: "PublishReview",
        reviewId: change.newDoc._id,
        bookId: change.newDoc.bookId,
        authorId: change.newDoc.authorId,
      });
    })
    .with({ operation: "delete" }, async (change) => {
      const book = await ctx.db.get(change.oldDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalReviews: book.totalReviews - 1,
        });
      }
      for await (const activity of await ctx.db
        .query("activities")
        .withIndex("by_review", (q) => q.eq("reviewId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(activity._id);
      }
    })
    .run();
});

triggers.register("books", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const author = await ctx.db.get(change.newDoc.authorId);

      if (author) {
        await ctx.db.patch(author._id, {
          totalBooks: author.totalBooks + 1,
        });
      }
      await ctx.db.insert("activities", {
        type: "PublishBook",
        bookId: change.newDoc._id,
        authorId: change.newDoc.authorId,
      });
    })
    .with({ operation: "delete" }, async (change) => {
      const author = await ctx.db.get(change.oldDoc.authorId);

      if (author) {
        await ctx.db.patch(author._id, {
          totalBooks: author.totalBooks - 1,
        });
      }

      for await (const chapter of await ctx.db
        .query("chapters")
        .withIndex("by_book", (q) => q.eq("bookId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(chapter._id);
        const author = await ctx.db.get(chapter.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalChapters: author.totalChapters - 1,
          });
        }
      }

      for await (const comment of await ctx.db
        .query("comments")
        .withIndex("by_book", (q) => q.eq("bookId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(comment._id);
        const author = await ctx.db.get(comment.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalComments: author.totalComments - 1,
            totalLikes: author.totalLikes - comment.totalLikes,
          });
        }
      }
      for await (const review of await ctx.db
        .query("reviews")
        .withIndex("by_book", (q) => q.eq("bookId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(review._id);
        const author = await ctx.db.get(review.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalReviews: author.totalReviews - 1,
            totalLikes: author.totalLikes - review.totalLikes,
          });
        }
      }
      for await (const activity of await ctx.db
        .query("activities")
        .withIndex("by_book", (q) => q.eq("bookId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(activity._id);
      }
    })
    .run();
});

triggers.register("reviewLikes", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const review = await ctx.db.get(change.newDoc.reviewId);
      if (review) {
        await ctx.db.patch(review._id, {
          totalLikes: review.totalLikes + 1,
        });
      }
    })
    .with({ operation: "delete" }, async (change) => {
      const review = await ctx.db.get(change.oldDoc.reviewId);
      if (review) {
        await ctx.db.patch(review._id, {
          totalLikes: review.totalLikes - 1,
        });
      }
    })
    .run();
});

triggers.register("authorFollows", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const following = await ctx.db.get(change.newDoc.followingId);
      if (following) {
        await ctx.db.patch(following._id, {
          totalFollowers: following.totalFollowers + 1,
        });
      }
      const follower = await ctx.db.get(change.newDoc.followerId);
      if (follower) {
        await ctx.db.patch(follower._id, {
          totalFollowing: follower.totalFollowing + 1,
        });
      }
    })
    .with({ operation: "delete" }, async (change) => {
      const following = await ctx.db.get(change.oldDoc.followingId);
      if (following) {
        await ctx.db.patch(following._id, {
          totalFollowers: following.totalFollowers - 1,
        });
      }
      const follower = await ctx.db.get(change.oldDoc.followerId);
      if (follower) {
        await ctx.db.patch(follower._id, {
          totalFollowing: follower.totalFollowing - 1,
        });
      }
    })
    .run();
});

triggers.register("bookFollows", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const book = await ctx.db.get(change.newDoc.followingId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalFollows: book.totalFollows + 1,
        });
      }
    })
    .with({ operation: "delete" }, async (change) => {
      const book = await ctx.db.get(change.oldDoc.followingId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalFollows: book.totalFollows - 1,
        });
      }
    })
    .run();
});

triggers.register("bookLikes", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const book = await ctx.db.get(change.newDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalLikes: book.totalLikes + 1,
        });
        const author = await ctx.db.get(book.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalLikes: author.totalLikes + 1,
          });
        }
      }
    })
    .with({ operation: "delete" }, async (change) => {
      const book = await ctx.db.get(change.oldDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalLikes: book.totalLikes - 1,
        });
        const author = await ctx.db.get(book.authorId);
        if (author) {
          await ctx.db.patch(author._id, {
            totalLikes: author.totalLikes - 1,
          });
        }
      }
    })
    .run();
});

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB)
);
