import { crud } from "convex-helpers/server/crud";
import { internalQuery, query } from "convex/_generated/server";
import { mutation } from "convex/functions";
import schema from "convex/schema";
import { v } from "convex/values";
import { internal } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";

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

export const getById = query({
  args: {
    id: v.id("users"),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    Doc<"users"> & {
      followedByMe: boolean;
    }
  > => {
    const identity = await ctx.auth.getUserIdentity();
    const me: Doc<"users"> | null = identity
      ? await ctx.runQuery(internal.users.getByAuthId, {
          authId: identity.subject,
        })
      : null;

    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }

    const followedByMe: boolean = me
      ? (await ctx.db
          .query("authorFollows")
          .withIndex("by_follower_following", (q) =>
            q.eq("followerId", me._id).eq("followingId", user._id)
          )
          .first()) !== null
      : false;

    return {
      ...user,

      followedByMe,
    };
  },
});

export const toggleFollow = mutation({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const me = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });

    if (!me) {
      throw new Error("User not found");
    }

    const following = await ctx.db.get(args.followingId);
    if (!following) {
      throw new Error("User to follow not found");
    }

    const existingFollow = await ctx.db
      .query("authorFollows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", me._id).eq("followingId", args.followingId)
      )
      .first();

    if (existingFollow) {
      await ctx.db.delete(existingFollow._id);
    } else {
      await ctx.db.insert("authorFollows", {
        followerId: me._id,
        followingId: args.followingId,
      });
    }
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("users"),
    profile: v.object({
      username: v.string(),
      bio: v.string(),
      profilePicture: v.id("_storage"),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const me = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });

    if (!me) {
      throw new Error("User not found");
    }

    if (me._id !== args.id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      profile: {
        ...args.profile,
        profilePicture: args.profile.profilePicture
          ? ((await ctx.storage.getUrl(args.profile.profilePicture)) ??
            undefined)
          : undefined,
      },
    });
  },
});
