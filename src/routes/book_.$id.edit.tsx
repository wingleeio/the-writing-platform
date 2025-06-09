import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { BookForm } from "@/components/book-form";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";

export const Route = createFileRoute("/book_/$id/edit")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.fetchQuery(
      convexQuery(api.books.getById, {
        id: params.id as Id<"books">,
      })
    );
  },
});

function useBookData() {
  const { id: bookId } = Route.useParams();
  return useSuspenseQuery(
    convexQuery(api.books.getById, { id: bookId as Id<"books"> })
  );
}

function RouteComponent() {
  const navigate = useNavigate();
  const updateBook = useMutation(api.books.update);
  const { data: book } = useBookData();

  return (
    <BookForm
      defaultValues={{
        title: book.title,
        description: book.description,
        coverImage: book.coverImage,
      }}
      onSubmit={async (values) => {
        await updateBook({
          id: book._id,
          ...values,
        });
        await navigate({ to: "/book/$id", params: { id: book._id } });
      }}
      submitLabel="Save Changes"
      title="Edit book"
    />
  );
}
