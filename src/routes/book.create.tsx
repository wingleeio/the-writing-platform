import { FormSection } from "@/components/form-section";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/book/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createBook = useMutation(api.books.create);
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      coverImage: "",
    },
    onSubmit: async ({ value }) => {
      const bookId = await createBook(value);
      await navigate({ to: "/book/$id", params: { id: bookId } });
    },
    validators: {
      onChange: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        coverImage: z.string().min(1),
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
        <h2 className="text-lg font-bold">Create book</h2>
      </div>
      <FormSection
        className="p-4"
        title="Book Information"
        description="Add information about your book"
      >
        <form.Field
          name="title"
          children={(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Create a title for your book"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
        <form.Field
          name="description"
          children={(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="resize-none"
                placeholder="Create a description for your book"
                rows={5}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
      </FormSection>
      <Separator />
      <FormSection
        className="p-4"
        title="Cover Image"
        description="Add a cover image for your book"
      >
        <form.Field
          name="coverImage"
          children={(field) => (
            <ImageUpload
              className="h-48 w-32"
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
            />
          )}
        />
      </FormSection>
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
