import { crud } from "convex-helpers/server/crud";
import { internalQuery } from "convex/_generated/server";
import schema from "convex/schema";
import { v } from "convex/values";

export const { create, destroy, update } = crud(schema, "users");

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
