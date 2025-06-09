import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { mutation } from "convex/functions";
import { v } from "convex/values";
import { internal } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export const getPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("books").paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    coverImage: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"books">> => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const author = await ctx.runQuery(internal.users.getByAuthId, {
      authId: user.subject,
    });

    if (!author) {
      throw new Error("User not found");
    }

    return ctx.db.insert("books", {
      title: args.title,
      description: args.description,
      coverImage: args.coverImage,
      authorId: author._id,
      totalChapters: 0,
      totalReviews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalWords: 0,
      totalFollows: 0,
    });
  },
});

export const getById = query({
  args: {
    id: v.id("books"),
  },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.id);

    if (!book) {
      throw new Error("Book not found");
    }

    const author = await ctx.db.get(book.authorId);

    if (!author) {
      throw new Error("Author not found");
    }

    return {
      ...book,
      author,
    };
  },
});

export const getByAuthorId = query({
  args: {
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("books")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .collect();
  },
});

export const removeBook = mutation({
  args: {
    id: v.id("books"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const book = await ctx.db.get(args.id);

    if (!book) {
      throw new Error("Book not found");
    }

    const author = await ctx.runQuery(internal.users.getByAuthId, {
      authId: user.subject,
    });

    if (!author || author._id !== book.authorId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("books"),
    title: v.string(),
    description: v.string(),
    coverImage: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const book = await ctx.db.get(args.id);

    if (!book) {
      throw new Error("Book not found");
    }

    const author = await ctx.runQuery(internal.users.getByAuthId, {
      authId: user.subject,
    });

    if (!author || author._id !== book.authorId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      coverImage: args.coverImage,
    });
  },
});
