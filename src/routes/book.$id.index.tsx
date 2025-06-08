import { Button } from "@/components/ui/button";
import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { match, P } from "ts-pattern";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/book/$id/")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.chapters.listByBookId, {
        bookId: params.id as Id<"books">,
      })
    );
    await context.queryClient.ensureQueryData(
      convexQuery(api.books.getById, {
        id: params.id as Id<"books">,
      })
    );
  },
});

function useChapters() {
  const { id: bookId } = Route.useParams();
  return useSuspenseQuery(
    convexQuery(api.chapters.listByBookId, {
      bookId: bookId as Id<"books">,
    })
  );
}

function useBookData() {
  const { id: bookId } = Route.useParams();
  return useSuspenseQuery(
    convexQuery(api.books.getById, { id: bookId as Id<"books"> })
  );
}

function RouteComponent() {
  const { id: bookId } = Route.useParams();

  const { data: chapters } = useChapters();

  return match(chapters)
    .with(P.nullish, () => <EmptyState />)
    .otherwise((chapters) =>
      match(chapters.length)
        .with(0, () => <EmptyState />)
        .otherwise(() => (
          <div className="overflow-y-auto overflow-x-hidden">
            {chapters.map((chapter, i) => (
              <Link
                key={chapter._id}
                to="/book/$id/chapter/$chapterId"
                params={{ id: bookId, chapterId: chapter._id }}
                className="p-4 flex gap-2 border-b hover:bg-muted cursor-pointer"
              >
                <div>{i + 1}.</div>
                <div>
                  <h3>{chapter.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(chapter._creationTime).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ))
    );
}

function EmptyState() {
  const { id: bookId } = Route.useParams();

  const me = useQuery(api.users.getCurrent);

  const { data: book } = useBookData();

  return (
    <div className="p-8 items-center flex flex-col gap-4">
      <h3 className="text-muted-foreground text-sm">No published chapters</h3>
      {match({
        isAuthor: me?._id === book?.authorId,
      })
        .with({ isAuthor: true }, () => (
          <Button variant="outline" size="sm" asChild>
            <Link to="/book/$id/create" params={{ id: bookId }}>
              <PlusIcon /> Add your first chapter
            </Link>
          </Button>
        ))
        .otherwise(() => null)}
    </div>
  );
}
