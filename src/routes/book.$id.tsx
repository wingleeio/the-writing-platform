import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

import type { Id } from "convex/_generated/dataModel";
import { match, P } from "ts-pattern";
import {
  BookOpen,
  Star,
  Heart,
  MessageSquare,
  FileText,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNumber, generateUsername } from "@/lib/utils";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/book/$id")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.fetchQuery(
      convexQuery(api.books.getById, {
        id: params.id as Id<"books">,
      })
    );
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.title} | The Writing Platform`,
      },
      {
        property: "og:title",
        content: `${loaderData?.title} | The Writing Platform`,
      },
      {
        property: "og:type",
        content: "book",
      },
      {
        property: "og:description",
        content: loaderData?.description,
      },
      {
        property: "og:image",
        content: loaderData?.coverImage,
      },
      {
        property: "og:site_name",
        content: "The Writing Platform",
      },
    ],
  }),
});

function useBookData() {
  const { id: bookId } = Route.useParams();
  return useSuspenseQuery(
    convexQuery(api.books.getById, { id: bookId as Id<"books"> })
  );
}

function RouteComponent() {
  const { data: book } = useBookData();

  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto md:border-x flex-1">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex gap-2">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">{book.title}</h2>
            <p className="text-sm text-muted-foreground">
              by{" "}
              <Link
                to="/author/$id"
                params={{ id: book.authorId }}
                className="underline"
              >
                {book.author.profile?.username ??
                  generateUsername(book.authorId)}
              </Link>
            </p>
          </div>
        </div>
        <BookActions />
      </div>
      <div className="px-4 flex flex-col gap-4 sm:flex-row">
        <img
          src={book.coverImage}
          alt={book.title}
          width={100}
          height={100}
          className="w-64 h-96 object-cover rounded-md"
        />
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {book.description}
          </p>
          <div className="flex-1" />
          <BookStats />
        </div>
      </div>
      <div>
        <div className="border-y flex items-center justify-center p-4">
          <div className="flex gap-4 bg-muted rounded-lg py-2 px-4 text-sm text-muted-foreground">
            <Link
              to="/book/$id"
              params={{ id: book._id }}
              activeOptions={{
                exact: true,
              }}
              activeProps={{
                className: "text-foreground",
              }}
            >
              Chapters
            </Link>
            <Link
              to="/book/$id/reviews"
              params={{ id: book._id }}
              activeOptions={{
                exact: true,
              }}
              activeProps={{
                className: "text-foreground",
              }}
            >
              Reviews
            </Link>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

function BookStats() {
  const { data: book } = useBookData();

  return match(book)
    .with(P.nullish, () => null)
    .with(P.nonNullable, (book) => (
      <div className="flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
          <span className="text-primary">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="font-medium">
            {formatNumber(book.totalChapters)}
          </span>
          <span className="text-muted-foreground/80">chapters</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
          <span className="text-primary">
            <Star className="w-4 h-4" />
          </span>
          <span className="font-medium">{formatNumber(book.totalReviews)}</span>
          <span className="text-muted-foreground/80">reviews</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
          <span className="text-primary">
            <Heart className="w-4 h-4" />
          </span>
          <span className="font-medium">{formatNumber(book.totalLikes)}</span>
          <span className="text-muted-foreground/80">likes</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
          <span className="text-primary">
            <MessageSquare className="w-4 h-4" />
          </span>
          <span className="font-medium">
            {formatNumber(book.totalComments)}
          </span>
          <span className="text-muted-foreground/80">comments</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
          <span className="text-primary">
            <Users className="w-4 h-4" />
          </span>
          <span className="font-medium">{formatNumber(book.totalFollows)}</span>
          <span className="text-muted-foreground/80">followers</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">
          <span className="text-primary">
            <FileText className="w-4 h-4" />
          </span>
          <span className="font-medium">{formatNumber(book.totalWords)}</span>
          <span className="text-muted-foreground/80">words</span>
        </div>
      </div>
    ))
    .exhaustive();
}

function BookActions() {
  const me = useQuery(api.users.getCurrent);
  const { data: book } = useBookData();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const deleteBook = useMutation(api.books.removeBook);

  const handleDelete = async () => {
    if (!book) return;
    await deleteBook({ id: book._id });
    navigate({ to: "/" });
  };

  return match(me)
    .with(P.nullish, () => null)
    .with(P.nonNullable, (me) => (
      <div className="flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {match({
              isAuthor: me._id === book?.authorId,
              book,
            })
              .with(
                {
                  isAuthor: true,
                  book: P.nonNullable,
                },
                ({ book }) => (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/book/$id/edit" params={{ id: book._id }}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/book/$id/create" params={{ id: book._id }}>
                        Add Chapter
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )
              )
              .otherwise(() => null)}
            <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Book</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this book? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ShareModal
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          url={window.location.href}
          title="Book"
        />
      </div>
    ))
    .exhaustive();
}
