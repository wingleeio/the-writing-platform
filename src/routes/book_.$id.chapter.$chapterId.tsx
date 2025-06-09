import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import type { Doc, Id } from "convex/_generated/dataModel";
import { match, P } from "ts-pattern";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  List,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { useState } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils";
import { CommentEditor } from "@/components/text-editor";

export const Route = createFileRoute("/book_/$id/chapter/$chapterId")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.fetchQuery(
      convexQuery(api.chapters.getPageDataById, {
        id: params.chapterId as Id<"chapters">,
      })
    );
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.chapterNumber}. ${loaderData?.chapterTitle} | ${loaderData?.bookTitle}`,
      },
    ],
  }),
});

function useChapterData() {
  const { chapterId } = Route.useParams();
  return useSuspenseQuery(
    convexQuery(api.chapters.getPageDataById, {
      id: chapterId as Id<"chapters">,
    })
  );
}

function RouteComponent() {
  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto md:border-x flex-1">
      <ChapterHeader />
      <ChapterSwitcher />
      <Separator />
      <ChapterContent />
      <Separator />
      <ChapterSwitcher />
      <Separator />
      <CommentHeader />
      <Separator />
      <CommentForm />
      <CommentList />
    </div>
  );
}

function ChapterHeader() {
  const { data } = useChapterData();

  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex gap-2">
        <div>
          <h2 className="text-lg font-bold">{data.chapterNumber}.</h2>
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">{data.chapterTitle}</h2>
          <p className="text-sm text-muted-foreground">
            <Link
              to="/book/$id"
              params={{ id: data.bookId }}
              className="underline"
            >
              {data.bookTitle}
            </Link>
          </p>
        </div>
      </div>
      <ChapterActions />
    </div>
  );
}

function ChapterContent() {
  const { data } = useChapterData();

  return (
    <div className="px-4 flex flex-col gap-4 sm:flex-row">
      <div
        className="flex-1 whitespace-pre-wrap prose dark:prose-invert w-full"
        dangerouslySetInnerHTML={{ __html: data.chapterContent }}
      />
    </div>
  );
}

function ChapterSwitcher() {
  const { data } = useChapterData();

  const [open, setOpen] = useState(false);

  return match(data)
    .with(P.nullish, () => (
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-9" />
      </div>
    ))
    .with(P.nonNullable, (data) => {
      return (
        <div className="flex items-center justify-center gap-4">
          {data.prevChapterId && (
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/book/$id/chapter/$chapterId"
                params={{ id: data.bookId, chapterId: data.prevChapterId }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                role="combobox"
                aria-expanded={open}
                className="gap-1"
              >
                <List className="h-4 w-4" />
                Chapters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="center">
              <Command>
                <CommandInput placeholder="Search chapters..." />
                <CommandList>
                  <CommandEmpty>No chapters found.</CommandEmpty>
                  <CommandGroup>
                    {data.chapters.map((chapter, i) => (
                      <CommandItem
                        key={chapter._id}
                        value={chapter.title}
                        onSelect={() => {
                          setOpen(false);
                        }}
                        asChild
                      >
                        <Link
                          to="/book/$id/chapter/$chapterId"
                          params={{ id: data.bookId, chapterId: chapter._id }}
                          className="flex items-center justify-between"
                        >
                          <span>
                            {i + 1}. {chapter.title}
                          </span>
                          {chapter._id === data.chapterId && (
                            <Check className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Link>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {data.nextChapterId && (
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/book/$id/chapter/$chapterId"
                params={{ id: data.bookId, chapterId: data.nextChapterId }}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      );
    })
    .exhaustive();
}

function ChapterActions() {
  const me = useQuery(api.users.getCurrent);
  const { data } = useChapterData();

  return match(me)
    .with(P.nullish, () => null)
    .with(P.nonNullable, (me) => (
      <div className="flex gap-4">
        <Button size="sm" variant="outline">
          <Heart />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {match(me._id === data.authorId)
              .with(true, () => (
                <>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
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

function CommentHeader() {
  const { data } = useChapterData();

  return (
    <div className="px-4 flex items-center gap-2">
      <h2 className="text-lg font-bold">Comments</h2>
      <div className="text-sm text-muted-foreground rounded-lg bg-muted px-3 py-1">
        {formatNumber(data.totalComments)}
      </div>
    </div>
  );
}
function CommentForm() {
  const me = useQuery(api.users.getCurrent);
  return match(me)
    .with(P.nullish, () => null)
    .with(P.nonNullable, () => (
      <>
        <CommentEditor placeholder="Add a comment..." />
        <Separator />
      </>
    ))
    .exhaustive();
}

function CommentList() {
  const { data } = useChapterData();

  return match(data.comments.length)
    .with(0, () => (
      <div className="px-4 py-8 flex justify-center">No comments yet.</div>
    ))
    .with(P.number, () =>
      data.comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))
    )
    .exhaustive();
}

function CommentItem({
  comment,
}: {
  comment: Doc<"comments"> & { children: Doc<"comments">[] };
}) {
  return <div>{comment.content}</div>;
}
