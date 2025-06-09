import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import type { Doc, Id } from "convex/_generated/dataModel";
import { match, P } from "ts-pattern";
import {
  BookOpen,
  Star,
  Heart,
  MessageSquare,
  Users,
  FileText,
} from "lucide-react";
import { formatNumber, generateUsername } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";

export const Route = createFileRoute("/author/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const author = useQuery(api.users.getById, { id: id as Id<"users"> });
  const me = useQuery(api.users.getCurrent);
  const toggleFollow = useMutation(api.users.toggleFollow);

  return match(author)
    .with(P.nullish, () => null)
    .with(P.nonNullable, (author) => (
      <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto md:border-x flex-1">
        <div className="p-4 pt-8">
          <div className="flex gap-4 items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={author.profile?.profilePicture} />
              <AvatarFallback className="text-2xl uppercase">
                {(
                  author.profile?.username ?? generateUsername(author._id)
                ).slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {author.profile?.username ?? generateUsername(author._id)}
                </h1>
                <div className="flex gap-2">
                  {me && me._id === author._id ? (
                    <Button variant="outline" asChild>
                      <Link to="/author/$id/edit" params={{ id: author._id }}>
                        Edit Profile
                      </Link>
                    </Button>
                  ) : me && me._id !== author._id ? (
                    <Button
                      variant="outline"
                      onClick={() => toggleFollow({ followingId: author._id })}
                    >
                      {author.followedByMe ? "Unfollow" : "Follow"}
                    </Button>
                  ) : null}
                </div>
              </div>
              {author.profile?.bio && (
                <p className="text-muted-foreground">{author.profile.bio}</p>
              )}
              <AuthorStats author={author} />
            </div>
          </div>
        </div>

        <div>
          <div className="border-y flex items-center justify-center p-4">
            <div className="flex gap-4 bg-muted rounded-lg py-2 px-4 text-sm text-muted-foreground">
              <Link
                to="/author/$id"
                params={{ id: author._id }}
                activeOptions={{
                  exact: true,
                }}
                activeProps={{
                  className: "text-foreground",
                }}
              >
                Activity
              </Link>
              <Link
                to="/author/$id/books"
                params={{ id: author._id }}
                activeOptions={{
                  exact: true,
                }}
                activeProps={{
                  className: "text-foreground",
                }}
              >
                Books
              </Link>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    ))
    .exhaustive();
}

function AuthorStats({
  author,
}: {
  author: Doc<"users"> & { followedByMe: boolean };
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
        <span className="text-primary">
          <BookOpen className="w-4 h-4" />
        </span>
        <span className="font-medium">{formatNumber(author.totalBooks)}</span>
        <span className="text-muted-foreground/80">books</span>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
        <span className="text-primary">
          <FileText className="w-4 h-4" />
        </span>
        <span className="font-medium">{formatNumber(author.totalWords)}</span>
        <span className="text-muted-foreground/80">words</span>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
        <span className="text-primary">
          <Star className="w-4 h-4" />
        </span>
        <span className="font-medium">{formatNumber(author.totalReviews)}</span>
        <span className="text-muted-foreground/80">reviews</span>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
        <span className="text-primary">
          <Heart className="w-4 h-4" />
        </span>
        <span className="font-medium">{formatNumber(author.totalLikes)}</span>
        <span className="text-muted-foreground/80">likes</span>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
        <span className="text-primary">
          <MessageSquare className="w-4 h-4" />
        </span>
        <span className="font-medium">
          {formatNumber(author.totalComments)}
        </span>
        <span className="text-muted-foreground/80">comments</span>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
        <span className="text-primary">
          <Users className="w-4 h-4" />
        </span>
        <span className="font-medium">
          {formatNumber(author.totalFollowers)}
        </span>
        <span className="text-muted-foreground/80">followers</span>
      </div>
    </div>
  );
}
