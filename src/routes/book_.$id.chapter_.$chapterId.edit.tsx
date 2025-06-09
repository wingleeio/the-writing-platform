import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { ChapterForm } from "@/components/chapter-form";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";

export const Route = createFileRoute("/book_/$id/chapter_/$chapterId/edit")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.fetchQuery(
      convexQuery(api.chapters.getForEdit, {
        id: params.chapterId as Id<"chapters">,
      })
    );
  },
});

function useChapterData() {
  const { chapterId } = Route.useParams();
  return useSuspenseQuery(
    convexQuery(api.chapters.getForEdit, { id: chapterId as Id<"chapters"> })
  );
}

function RouteComponent() {
  const navigate = useNavigate();
  const { id: bookId, chapterId } = Route.useParams();
  const { data: chapter } = useChapterData();
  const updateChapter = useMutation(api.chapters.update);

  return (
    <ChapterForm
      title="Edit chapter"
      defaultValues={{
        title: chapter.title,
        content: chapter.content,
      }}
      onSubmit={async (values) => {
        await updateChapter({
          id: chapterId as Id<"chapters">,
          ...values,
        });
        await navigate({
          to: "/book/$id/chapter/$chapterId",
          params: { id: bookId, chapterId },
        });
      }}
      submitLabel="Save changes"
    />
  );
}
