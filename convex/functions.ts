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
    })
    .with({ operation: "delete" }, async (change) => {
      const book = await ctx.db.get(change.oldDoc.bookId);
      if (book) {
        await ctx.db.patch(book._id, {
          totalChapters: book.totalChapters - 1,
          totalWords: book.totalWords - change.oldDoc.totalWords,
        });
      }
      const author = await ctx.db.get(change.oldDoc.authorId);
      if (author) {
        await ctx.db.patch(author._id, {
          totalChapters: author.totalChapters - 1,
          totalWords: author.totalWords - change.oldDoc.totalWords,
        });
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

triggers.register("books", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const author = await ctx.db.get(change.newDoc.authorId);

      if (author) {
        await ctx.db.patch(author._id, {
          totalBooks: author.totalBooks + 1,
        });
      }
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
      }

      for await (const chapter of await ctx.db
        .query("chapters")
        .withIndex("by_book", (q) => q.eq("bookId", change.oldDoc._id))
        .collect()) {
        await ctx.db.delete(chapter._id);
      }
    })
    .run();
});

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB)
);
