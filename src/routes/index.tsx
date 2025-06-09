import { createFileRoute } from "@tanstack/react-router";
import { ActivityFeed } from "@/components/activity-feed";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto flex-1 md:border-x">
      <ActivityFeed />
    </div>
  );
}
