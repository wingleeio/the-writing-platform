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

triggers.register("users", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      await ctx.db.insert("userStats", {
        userId: change.newDoc._id,
        totalBooks: 0,
        totalChapters: 0,
        totalReviews: 0,
        totalLikes: 0,
        totalFollowers: 0,
        totalFollowing: 0,
        totalComments: 0,
      });
    })
    .with({ operation: "delete" }, async (change) => {
      const userStats = await ctx.db
        .query("userStats")
        .withIndex("by_user", (q) => q.eq("userId", change.oldDoc._id))
        .first();

      if (userStats) {
        await ctx.db.delete(userStats._id);
      }
    })
    .run();
});

triggers.register("books", async (ctx, change) => {
  match(change)
    .with({ operation: "insert" }, async (change) => {
      const userStats = await ctx.db
        .query("userStats")
        .withIndex("by_user", (q) => q.eq("userId", change.newDoc.authorId))
        .first();

      if (userStats) {
        await ctx.db.patch(userStats._id, {
          totalBooks: userStats.totalBooks + 1,
        });
      }
    })
    .with({ operation: "delete" }, async (change) => {
      const userStats = await ctx.db
        .query("userStats")
        .withIndex("by_user", (q) => q.eq("userId", change.oldDoc.authorId))
        .first();

      if (userStats) {
        await ctx.db.patch(userStats._id, {
          totalBooks: userStats.totalBooks - 1,
        });
      }
    })
    .run();
});

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB)
);
