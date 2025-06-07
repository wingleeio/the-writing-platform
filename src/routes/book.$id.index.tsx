import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { PlusIcon } from "lucide-react";
import { match, P } from "ts-pattern";

export const Route = createFileRoute("/book/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id: bookId } = Route.useParams();
  const chapters = useQuery(api.chapters.listByBookId, {
    bookId: bookId as Id<"books">,
  });

  return match(chapters)
    .with(P.nullish, () => <EmptyState bookId={bookId as Id<"books">} />)
    .otherwise((chapters) =>
      match(chapters.length)
        .with(0, () => <EmptyState bookId={bookId as Id<"books">} />)
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

function EmptyState({ bookId }: { bookId: Id<"books"> }) {
  const me = useQuery(api.users.getCurrent);
  const book = useQuery(api.books.getById, { id: bookId as Id<"books"> });

  return (
    <div className="p-8 items-center flex flex-col gap-4">
      <h3 className="text-muted-foreground text-sm">No published chapters</h3>
      {match(me?._id === book?.authorId)
        .with(true, () => (
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
