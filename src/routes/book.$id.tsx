import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

import type { Id } from "convex/_generated/dataModel";
import { match, P } from "ts-pattern";
import {
  BookOpen,
  Star,
  Heart,
  MessageSquare,
  FileText,
  Users,
  PlusIcon,
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
import { formatNumber } from "@/lib/utils";

export const Route = createFileRoute("/book/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id: bookId } = Route.useParams();
  const book = useQuery(api.books.getById, { id: bookId as Id<"books"> });

  return match(book)
    .with(P.nullish, () => null)
    .with(P.nonNullable, (book) => (
      <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto md:border-x flex-1">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">{book.title}</h2>
          <BookActions id={bookId as Id<"books">} />
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
            <p className="text-sm text-muted-foreground">{book.description}</p>
            <div className="flex-1" />
            <BookStats id={bookId as Id<"books">} />
          </div>
        </div>
        <div>
          <div className="border-y flex items-center justify-center p-4">
            <div className="flex gap-4 bg-muted rounded-lg py-2 px-4 text-sm text-muted-foreground">
              <Link
                to="/book/$id"
                params={{ id: bookId }}
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
                params={{ id: bookId }}
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
    ))
    .exhaustive();
}

function BookStats({ id }: { id: Id<"books"> }) {
  const book = useQuery(api.books.getById, {
    id,
  });

  return match(book)
    .with(P.nullish, () => null)
    .with(P.nonNullable, (book) => (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <div className="flex flex-col items-center rounded-lg border bg-card p-2 text-center">
          <BookOpen className="mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-lg font-bold">
            {formatNumber(book.totalChapters)}
          </p>
          <p className="text-xs text-muted-foreground">Chapters</p>
        </div>
        <div className="flex flex-col items-center rounded-lg border bg-card p-2 text-center">
          <Star className="mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-lg font-bold">{formatNumber(book.totalReviews)}</p>
          <p className="text-xs text-muted-foreground">Reviews</p>
        </div>
        <div className="flex flex-col items-center rounded-lg border bg-card p-2 text-center">
          <Heart className="mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-lg font-bold">{formatNumber(book.totalLikes)}</p>
          <p className="text-xs text-muted-foreground">Likes</p>
        </div>
        <div className="flex flex-col items-center rounded-lg border bg-card p-2 text-center">
          <MessageSquare className="mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-lg font-bold">
            {formatNumber(book.totalComments)}
          </p>
          <p className="text-xs text-muted-foreground">Comments</p>
        </div>

        <div className="flex flex-col items-center rounded-lg border bg-card p-2 text-center">
          <Users className="mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-lg font-bold">{formatNumber(book.totalFollows)}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="flex flex-col items-center rounded-lg border bg-card p-2 text-center">
          <FileText className="mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-lg font-bold">{formatNumber(book.totalWords)}</p>
          <p className="text-xs text-muted-foreground">Words</p>
        </div>
      </div>
    ))
    .exhaustive();
}

function BookActions({ id }: { id: Id<"books"> }) {
  const me = useQuery(api.users.getCurrent);
  const book = useQuery(api.books.getById, { id });
  return match(me)
    .with(P.nullish, () => null)
    .with(P.nonNullable, (me) => (
      <div className="flex gap-4">
        <Button size="sm" variant="outline">
          <Heart />
        </Button>
        <Button size="sm" variant="outline">
          <PlusIcon /> Follow
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {match(me._id === book?.authorId)
              .with(true, () => (
                <>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/book/$id/create" params={{ id }}>
                      Add Chapter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ))
              .otherwise(() => null)}
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ))
    .exhaustive();
}
