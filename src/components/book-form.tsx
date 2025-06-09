import { FormSection } from "@/components/form-section";
import { Separator } from "@/components/ui/separator";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";

interface BookFormProps {
  defaultValues?: {
    title: string;
    description: string;
    coverImage: string;
  };
  onSubmit: (values: {
    title: string;
    description: string;
    coverImage: string;
  }) => Promise<void>;
  submitLabel?: string;
  title?: string;
}

export function BookForm({
  defaultValues = {
    title: "",
    description: "",
    coverImage: "",
  },
  onSubmit,
  submitLabel = "Publish",
  title = "Create book",
}: BookFormProps) {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
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
        <h2 className="text-lg font-bold">{title}</h2>
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
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => navigate({ to: "/" })}
        >
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
