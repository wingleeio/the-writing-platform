import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "convex/functions";
import { api, internal } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import sanitizeHtml from "sanitize-html";

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

export const toggleLike = mutation({
  args: {
    chapterId: v.id("chapters"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const chapter = await ctx.db.get(args.chapterId);

    if (!chapter) {
      throw new Error("Chapter not found");
    }

    const user = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const chapterLike = await ctx.db
      .query("chapterLikes")
      .withIndex("by_user_chapter", (q) =>
        q.eq("userId", user._id).eq("chapterId", args.chapterId)
      )
      .first();

    if (chapterLike) {
      await ctx.db.delete(chapterLike._id);
    } else {
      await ctx.db.insert("chapterLikes", {
        userId: user._id,
        chapterId: args.chapterId,
      });
    }
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
      content: sanitizeHtml(args.content, {
        allowedTags: ["b", "i", "u", "s", "strike", "p", "strong", "em", "br"],
      }),
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
    comments: (Doc<"comments"> & {
      author: Doc<"users">;
      likedByMe: boolean;
    })[];
    totalComments: number;
    likedByMe: boolean;
    totalLikes: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    const me = identity
      ? await ctx.runQuery(internal.users.getByAuthId, {
          authId: identity.subject,
        })
      : null;
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

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_chapter_parent", (q) =>
        q.eq("chapterId", args.id).eq("parentId", undefined)
      )
      .collect()
      .then(async (comments) => {
        const commentsWithAuthors = await Promise.all(
          comments.map(async (comment) => {
            const author = await ctx.db.get(comment.authorId);
            if (!author) return null;
            return {
              ...comment,
              author,
              likedByMe: me
                ? (await ctx.db
                    .query("commentLikes")
                    .withIndex("by_user_comment", (q) =>
                      q.eq("userId", me._id).eq("commentId", comment._id)
                    )
                    .first()) !== null
                : false,
            };
          })
        );
        return commentsWithAuthors.filter(
          (comment): comment is NonNullable<typeof comment> => comment !== null
        );
      });

    const chapters = await ctx.runQuery(api.chapters.listByBookId, {
      bookId: chapter.bookId,
    });

    const chapterNumber = chapters?.findIndex((c) => c._id === args.id) + 1;

    const prevChapter = chapters?.[chapterNumber - 2];
    const nextChapter = chapters?.[chapterNumber];

    const likedByMe = me
      ? (await ctx.db
          .query("chapterLikes")
          .withIndex("by_user_chapter", (q) =>
            q.eq("userId", me._id).eq("chapterId", chapter._id)
          )
          .first()) !== null
      : false;

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
      comments,
      totalComments: chapter.totalComments,
      likedByMe,
      totalLikes: chapter.totalLikes,
    };
  },
});
