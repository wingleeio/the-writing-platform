import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/book/$id/reviews')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/book/$id/reviews"!</div>
}
