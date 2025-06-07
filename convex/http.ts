import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "convex/_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/jwks",
  method: "GET",
  handler: httpAction(async () => {
    const response = await fetch(
      `https://${process.env.WORKOS_API_HOSTNAME}/sso/jwks/${process.env.WORKOS_CLIENT_ID}`
    );
    const jwks = await response.json();
    return Response.json(jwks);
  }),
});

http.route({
  path: "/image",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId")! as Id<"_storage">;
    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("Image not found", {
        status: 404,
      });
    }
    return new Response(blob);
  }),
});

http.route({
  path: "/workos-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const bodyText = await request.text();
    const sigHeader = String(request.headers.get("workos-signature"));

    const { event, data } = await ctx.runAction(internal.workos.verifyWebhook, {
      payload: bodyText,
      signature: sigHeader,
    });

    switch (event) {
      case "user.created": {
        const user = await ctx.runQuery(internal.users.getByAuthId, {
          authId: data.id,
        });

        if (user) {
          return Response.json(
            {
              status: "error",
              message: `User already exists`,
              metadata: {
                id: data.id,
                event,
              },
            },
            { status: 400 }
          );
        }

        await ctx.runMutation(internal.users.create, {
          authId: data.id,
          totalBooks: 0,
          totalChapters: 0,
          totalReviews: 0,
          totalLikes: 0,
          totalFollowers: 0,
          totalFollowing: 0,
          totalComments: 0,
          totalWords: 0,
        });
        break;
      }
      case "user.deleted": {
        const user = await ctx.runQuery(internal.users.getByAuthId, {
          authId: data.id,
        });

        if (!user?._id) {
          return Response.json(
            {
              status: "error",
              message: `User not found`,
              metadata: {
                id: data.id,
                event,
              },
            },
            { status: 400 }
          );
        }

        await ctx.runMutation(internal.users.destroy, {
          id: user._id,
        });

        break;
      }
      default: {
        return Response.json(
          {
            status: "error",
            message: `Unhandled event type`,
            metadata: {
              event,
            },
          },
          { status: 400 }
        );
      }
    }

    return Response.json({ status: "success" });
  }),
});

export default http;
