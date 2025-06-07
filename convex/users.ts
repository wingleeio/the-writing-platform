import { crud } from "convex-helpers/server/crud";
import { internalQuery } from "convex/_generated/server";
import schema from "convex/schema";
import { v } from "convex/values";

export const { create, destroy, update } = crud(schema, "users");

export const getByWorkOSId = internalQuery({
  args: {
    workos_id: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workos_id", args.workos_id))
      .first();
  },
});
