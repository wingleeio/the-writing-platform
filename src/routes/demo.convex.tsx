import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/demo/convex")({
  component: App,
});

function Products() {
  const books = useQuery(api.books.getBooks);

  return <ul></ul>;
}

function App() {
  return (
    <div className="p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <Products />
      </Suspense>
    </div>
  );
}
