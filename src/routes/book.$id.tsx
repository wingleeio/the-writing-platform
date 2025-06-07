import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/book/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/book/$id"!</div>
}
