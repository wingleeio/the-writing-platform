import { mutation } from "convex/_generated/server";

export const generateUrl = mutation({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
