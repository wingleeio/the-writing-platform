import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { match, P } from "ts-pattern";
import { FormSection } from "@/components/form-section";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useForm } from "@tanstack/react-form";
import z from "zod";

export const Route = createFileRoute("/author/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const me = useQuery(api.users.getCurrent);
  const updateProfile = useMutation(api.users.updateProfile);

  return match(me)
    .with(P.nullish, () => null)
    .with(P.nonNullable, (me) => {
      if (me._id !== id) {
        navigate({ to: "/author/$id", params: { id } });
        return null;
      }

      const form = useForm({
        defaultValues: {
          username: me.profile?.username ?? "",
          bio: me.profile?.bio ?? "",
          profilePicture: me.profile?.profilePicture ?? "",
        },
        onSubmit: async ({ value }) => {
          const storageId = value.profilePicture.split(
            "storageId="
          )[1] as Id<"_storage">;
          await updateProfile({
            id: me._id,
            profile: {
              username: value.username,
              bio: value.bio,
              profilePicture: storageId,
            },
          });
          await navigate({ to: "/author/$id", params: { id: me._id } });
        },
        validators: {
          onChange: z.object({
            username: z.string().min(1),
            bio: z.string(),
            profilePicture: z.string(),
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
            <h2 className="text-lg font-bold">Edit Profile</h2>
          </div>

          <FormSection
            className="p-4"
            title="Profile Information"
            description="Update your profile information"
          >
            <form.Field
              name="username"
              children={(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
            <form.Field
              name="bio"
              children={(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    className="resize-none"
                    placeholder="Tell us about yourself"
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
            title="Profile Picture"
            description="Update your profile picture"
          >
            <form.Field
              name="profilePicture"
              children={(field) => (
                <ImageUpload
                  className="h-32 w-32"
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
              onClick={() =>
                navigate({ to: "/author/$id", params: { id: me._id } })
              }
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" size="sm" disabled={!canSubmit}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              )}
            />
          </div>
        </form>
      );
    })
    .exhaustive();
}
