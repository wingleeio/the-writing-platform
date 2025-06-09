import { TextEditor } from "@/components/text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { convexQuery } from "@convex-dev/react-query";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import z from "zod";

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
  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
    onSubmit: async ({ value }) => {
      const chapterId = await createChapter({
        bookId: bookId as Id<"books">,
        title: value.title,
        content: value.content,
      });
      await navigate({
        to: "/book/$id/chapter/$chapterId",
        params: { id: bookId, chapterId },
      });
    },
    validators: {
      onChange: z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      }),
    },
  });

  return (
    <form
      className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto md:border-x flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Create chapter for {book.title}</h2>
      </div>

      <form.Field
        name="title"
        children={(field) => (
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Create a title for your chapter"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      />
      <Separator />
      <form.Field
        name="content"
        children={(field) => (
          <div className="px-4">
            <TextEditor
              initialValue={field.state.value}
              placeholder="Write the content for your chapter"
              onChange={(content) => field.handleChange(content)}
            />
          </div>
        )}
      />
      <div className="p-4 border-t flex justify-end gap-4">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
