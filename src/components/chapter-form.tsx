import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextEditor } from "@/components/text-editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";

interface ChapterFormProps {
  defaultValues?: {
    title: string;
    content: string;
  };
  onSubmit: (values: { title: string; content: string }) => Promise<void>;
  submitLabel?: string;
  title?: string;
}

export function ChapterForm({
  defaultValues = {
    title: "",
    content: "",
  },
  onSubmit,
  submitLabel = "Publish",
  title = "Create chapter",
}: ChapterFormProps) {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
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
        <h2 className="text-lg font-bold">{title}</h2>
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
