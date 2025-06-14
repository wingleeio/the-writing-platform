import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { ChapterForm } from "@/components/chapter-form";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";

export const Route = createFileRoute("/book_/$id/create")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.fetchQuery(
      convexQuery(api.books.getById, { id: params.id as Id<"books"> })
    );
  },
});

function useBookData() {
  const { id: bookId } = Route.useParams();
  return useSuspenseQuery(
    convexQuery(api.books.getById, { id: bookId as Id<"books"> })
  );
}

function RouteComponent() {
  const navigate = useNavigate();
  const { id: bookId } = Route.useParams();
  const { data: book } = useBookData();
  const createChapter = useMutation(api.chapters.create);

  return (
    <ChapterForm
      title={`Create chapter for ${book.title}`}
      onSubmit={async (values) => {
        const chapterId = await createChapter({
          bookId: bookId as Id<"books">,
          ...values,
        });
        await navigate({
          to: "/book/$id/chapter/$chapterId",
          params: { id: bookId, chapterId },
        });
      }}
    />
  );
}
