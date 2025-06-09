import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Doc, Id } from "convex/_generated/dataModel";
import { match, P } from "ts-pattern";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn, formatNumber, generateUsername } from "@/lib/utils";
import { CommentEditor } from "@/components/text-editor";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/book/$id/reviews")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.fetchQuery(
      convexQuery(api.reviews.getByBookId, {
        bookId: params.id as Id<"books">,
      })
    );
  },
});

function useReviews() {
  const { id: bookId } = Route.useParams();
  return useSuspenseQuery(
    convexQuery(api.reviews.getByBookId, {
      bookId: bookId as Id<"books">,
    })
  );
}

function RouteComponent() {
  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto md:border-x flex-1">
      <ReviewHeader />
      <Separator />
      <ReviewForm />
      <ReviewList />
    </div>
  );
}

function ReviewHeader() {
  const { data: reviews } = useReviews();

  return (
    <div className="px-4 flex items-center gap-2 pt-8">
      <h2 className="text-lg font-bold">Reviews</h2>
      <div className="text-sm text-muted-foreground rounded-lg bg-muted px-3 py-1">
        {formatNumber(reviews.length)}
      </div>
    </div>
  );
}

function ReviewForm() {
  const me = useQuery(api.users.getCurrent);
  const { id: bookId } = Route.useParams();
  const createReview = useMutation(api.reviews.create);
  const form = useForm({
    defaultValues: {
      content: "",
    },
    defaultState: {
      canSubmit: false,
      isSubmitting: false,
    },
    onSubmit: async ({ value }) => {
      await createReview({
        bookId: bookId as Id<"books">,
        content: value.content,
      });
    },
    validators: {
      onChange: z.object({
        content: z.string().min(10),
      }),
    },
  });

  return match(me)
    .with(P.nullish, () => null)
    .with(P.nonNullable, () => (
      <>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <form.Field
              name="content"
              children={(field) => (
                <div className="px-4">
                  <CommentEditor
                    placeholder="Write a review..."
                    submitButtonText="Review"
                    onChange={(content) => field.handleChange(content)}
                    onSubmit={form.handleSubmit}
                    onSubmitEnabled={canSubmit && !isSubmitting}
                  />
                </div>
              )}
            />
          )}
        />
        <Separator />
      </>
    ))
    .exhaustive();
}

function ReviewList() {
  const { data: reviews } = useReviews();

  return match(reviews.length)
    .with(0, () => (
      <div className="px-4 py-8 flex justify-center">No reviews yet.</div>
    ))
    .with(P.number, () =>
      reviews.map((review) => <ReviewItem key={review._id} review={review} />)
    )
    .exhaustive();
}

function ReviewItem({
  review,
}: {
  review: Doc<"reviews"> & { author: Doc<"users">; likedByMe: boolean };
}) {
  const toggleLike = useMutation(api.reviews.toggleLike);

  return (
    <>
      <div className="px-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={review.author.profile?.profilePicture} />
            <AvatarFallback className="text-xs uppercase">
              {(
                review.author.profile?.username ??
                generateUsername(review.author._id)
              ).slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Link
                to="/author/$id"
                params={{ id: review.author._id }}
                className="text-sm underline"
              >
                {review.author.profile?.username ??
                  generateUsername(review.author._id)}
              </Link>
              <p className="text-sm text-muted-foreground">
                {new Date(review._creationTime).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <p
              className="prose-sm"
              dangerouslySetInnerHTML={{ __html: review.content }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleLike({ reviewId: review._id })}
              >
                <Heart
                  className={cn(
                    review.likedByMe && "text-red-500 fill-red-500",
                    "h-2 w-2"
                  )}
                />{" "}
                {formatNumber(review.totalLikes)}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Separator />
    </>
  );
}
