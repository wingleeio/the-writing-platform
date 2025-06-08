import { crud } from "convex-helpers/server/crud";
import { internalQuery, query } from "convex/_generated/server";
import { mutation } from "convex/functions";
import schema from "convex/schema";
import { v } from "convex/values";

export const { create, destroy, update } = crud(
  schema,
  "users",
  query,
  mutation as any
);

export const getByAuthId = internalQuery({
  args: {
    authId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", args.authId))
      .first();
  },
});

export const getCurrent = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
      .first();
  },
});
