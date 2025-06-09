import { internal, api } from "convex/_generated/api";
import { mutation } from "convex/functions";
import { v } from "convex/values";
import type { Id } from "convex/_generated/dataModel";
import sanitizeHtml from "sanitize-html";

export const create = mutation({
  args: {
    content: v.string(),
    chapterId: v.id("chapters"),
  },
  handler: async (ctx, args): Promise<Id<"comments">> => {
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

    const chapter = await ctx.runQuery(api.chapters.getById, {
      id: args.chapterId,
    });

    if (!chapter) {
      throw new Error("Chapter not found");
    }

    const commentId = await ctx.db.insert("comments", {
      content: sanitizeHtml(args.content, {
        allowedTags: ["b", "i", "u", "s", "strike", "p", "strong", "em", "br"],
      }),
      chapterId: args.chapterId,
      authorId: author._id,
      bookId: chapter.bookId,
      totalLikes: 0,
      isDeleted: false,
    });

    return commentId;
  },
});

export const toggleLike = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    const user = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const commentLike = await ctx.db
      .query("commentLikes")
      .withIndex("by_user_comment", (q) =>
        q.eq("userId", user._id).eq("commentId", args.commentId)
      )
      .first();

    if (commentLike) {
      await ctx.db.delete(commentLike._id);
    } else {
      await ctx.db.insert("commentLikes", {
        userId: user._id,
        commentId: args.commentId,
      });
    }

    return null;
  },
});
