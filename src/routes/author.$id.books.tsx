import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpen, Heart, MessageSquare, BookX } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/author/$id/books")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const books = useQuery(api.books.getByAuthorId, {
    authorId: id as Id<"users">,
  });

  if (!books) {
    return null;
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookX className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No books yet</h3>
        <p className="text-muted-foreground max-w-sm">
          This author hasn't published any books yet. Check back later to see
          their work.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {books.map((book) => (
        <Link
          key={book._id}
          to="/book/$id"
          params={{ id: book._id }}
          className="flex gap-4 p-4 hover:bg-muted/50 transition-colors border-b"
        >
          <div className="w-24 h-32 flex-shrink-0">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="font-semibold text-lg">{book.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {book.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{formatNumber(book.totalChapters)} chapters</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{formatNumber(book.totalLikes)} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{formatNumber(book.totalComments)} comments</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
