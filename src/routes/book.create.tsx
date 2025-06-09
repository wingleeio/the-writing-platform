import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { BookForm } from "@/components/book-form";

export const Route = createFileRoute("/book/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createBook = useMutation(api.books.create);

  return (
    <BookForm
      onSubmit={async (values) => {
        const bookId = await createBook(values);
        await navigate({ to: "/book/$id", params: { id: bookId } });
      }}
    />
  );
}
