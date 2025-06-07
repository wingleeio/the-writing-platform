import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "convex/functions";
import { api, internal } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export const getPaginatedByBookId = query({
  args: {
    bookId: v.id("books"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .paginate(args.paginationOpts);
  },
});

export const listByBookId = query({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect()
      .then((chapters) =>
        chapters.map(({ content, ...chapter }) => ({
          ...chapter,
        }))
      );
  },
});

export const create = mutation({
  args: {
    bookId: v.id("books"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"chapters">> => {
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

    if (book.authorId !== author._id) {
      throw new Error("Unauthorized");
    }

    return ctx.db.insert("chapters", {
      bookId: args.bookId,
      title: args.title,
      content: args.content,
      authorId: author._id,
      totalLikes: 0,
      totalComments: 0,
      totalWords: args.content.split(" ").length,
    });
  },
});

export const getById = query({
  args: {
    id: v.id("chapters"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
