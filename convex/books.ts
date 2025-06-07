import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";

export const getBooks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("books").collect();
  },
});

export const getPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("books").paginate(args.paginationOpts);
  },
});
