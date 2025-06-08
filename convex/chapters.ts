import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "convex/functions";
import { api, internal } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";

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

export const getPageDataById = query({
  args: {
    id: v.id("chapters"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    chapters: Omit<Doc<"chapters">, "content">[];
    chapterNumber: number;
    prevChapterId: Id<"chapters"> | null;
    nextChapterId: Id<"chapters"> | null;
    authorId: Id<"users">;
    bookTitle: string;
    bookId: Id<"books">;
    chapterTitle: string;
    chapterContent: string;
    chapterId: Id<"chapters">;
  }> => {
    const chapter = await ctx.db.get(args.id);
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    const book = await ctx.runQuery(api.books.getById, {
      id: chapter.bookId,
    });
    if (!book) {
      throw new Error("Book not found");
    }

    const chapters = await ctx.runQuery(api.chapters.listByBookId, {
      bookId: chapter.bookId,
    });

    const chapterNumber = chapters?.findIndex((c) => c._id === args.id) + 1;

    const prevChapter = chapters?.[chapterNumber - 2];
    const nextChapter = chapters?.[chapterNumber];

    return {
      chapters,
      chapterNumber,
      prevChapterId: prevChapter?._id,
      nextChapterId: nextChapter?._id,
      authorId: book.authorId,
      bookTitle: book?.title,
      bookId: book._id,
      chapterId: chapter._id,
      chapterTitle: chapter.title,
      chapterContent: chapter.content,
    };
  },
});
