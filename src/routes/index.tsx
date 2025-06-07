import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  // const { results, status } = usePaginatedQuery(
  //   api.books.getPaginated,
  //   {},
  //   { initialNumItems: 10 }
  // );
  return <div className="p-3"></div>;
}
