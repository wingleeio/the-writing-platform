import { createFileRoute } from "@tanstack/react-router";
import { ActivityFeed } from "@/components/activity-feed";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <ActivityFeed />;
}
