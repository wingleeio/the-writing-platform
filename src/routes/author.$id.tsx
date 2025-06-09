import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/author/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/author/$id"!</div>
}
