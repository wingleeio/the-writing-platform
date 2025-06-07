import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { mutation } from "convex/functions";
import { v } from "convex/values";
import { internal } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";

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

    const bookId = await ctx.db.insert("books", {
      title: args.title,
      description: args.description,
      coverImage: args.coverImage,
      authorId: author._id,
    });

    return bookId;
  },
});

export const getById = query({
  args: {
    id: v.id("books"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
