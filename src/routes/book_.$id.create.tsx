import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import z from "zod";

export const Route = createFileRoute("/book_/$id/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { id: bookId } = Route.useParams();
  const book = useQuery(api.books.getById, { id: bookId as Id<"books"> });

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
      await navigate({ to: "/book/$id", params: { id: bookId } });
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
        <h2 className="text-lg font-bold">Create chapter for {book?.title}</h2>
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
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              className="resize-none"
              placeholder="Write the content for your chapter"
              rows={5}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
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
