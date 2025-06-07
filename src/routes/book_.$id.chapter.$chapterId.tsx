import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
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

export const Route = createFileRoute("/book_/$id/chapter/$chapterId")({
  component: RouteComponent,
});

function ChapterSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto md:border-x flex-1">
      <div className="p-4 border-b flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-9" />
      </div>
      <Separator />
      <div className="px-4 flex flex-col gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Separator />
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-9" />
      </div>
      <Separator />
    </div>
  );
}

function RouteComponent() {
  const { chapterId } = Route.useParams();
  const chapter = useQuery(api.chapters.getById, {
    id: chapterId as Id<"chapters">,
  });

  return match(chapter)
    .with(P.nullish, () => <ChapterSkeleton />)
    .with(P.nonNullable, (chapter) => (
      <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto md:border-x flex-1">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">{chapter.title}</h2>
          <ChapterActions id={chapterId as Id<"chapters">} />
        </div>
        <ChapterSwitcher id={chapterId as Id<"chapters">} />
        <Separator />
        <div className="px-4 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 whitespace-pre-wrap">{chapter.content}</div>
        </div>
        <Separator />
        <ChapterSwitcher id={chapterId as Id<"chapters">} />
        <Separator />
      </div>
    ))
    .exhaustive();
}

function ChapterSwitcher({ id }: { id: Id<"chapters"> }) {
  const { id: bookId } = Route.useParams();
  const chapters = useQuery(api.chapters.listByBookId, {
    bookId: bookId as Id<"books">,
  });
  const [open, setOpen] = useState(false);

  return match(chapters)
    .with(P.nullish, () => (
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-9" />
      </div>
    ))
    .with(P.nonNullable, (chapters) => {
      const currentIndex = chapters.findIndex((chapter) => chapter._id === id);
      const prevChapter = chapters[currentIndex - 1];
      const nextChapter = chapters[currentIndex + 1];

      return (
        <div className="flex items-center justify-center gap-4">
          {prevChapter && (
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/book/$id/chapter/$chapterId"
                params={{ id: bookId, chapterId: prevChapter._id }}
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
                    {chapters.map((chapter, i) => (
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
                          params={{ id: bookId, chapterId: chapter._id }}
                          className="flex items-center justify-between"
                        >
                          <span>
                            {i + 1}. {chapter.title}
                          </span>
                          {chapter._id === id && (
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
          {nextChapter && (
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/book/$id/chapter/$chapterId"
                params={{ id: bookId, chapterId: nextChapter._id }}
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

function ChapterActions({ id }: { id: Id<"chapters"> }) {
  const me = useQuery(api.users.getCurrent);
  const chapter = useQuery(api.chapters.getById, { id });
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
            {match(me._id === chapter?.authorId)
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
