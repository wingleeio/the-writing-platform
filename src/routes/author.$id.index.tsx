import { createFileRoute } from "@tanstack/react-router";
import { ActivityFeed } from "@/components/activity-feed";
import type { Id } from "convex/_generated/dataModel";

export const Route = createFileRoute("/author/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <ActivityFeed authorId={id as Id<"users">} />;
}
