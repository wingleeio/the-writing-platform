import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { generateUsername } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

import { PlusIcon } from "lucide-react";
import { match, P } from "ts-pattern";

export function Header() {
  return (
    <header className="p-4 border-b">
      <nav className="flex flex-row gap-4 items-center justify-between">
        <div className="flex flex-row gap-4 items-center">
          <div className="font-bold">
            <Link to="/">The Writing Platform</Link>
          </div>
        </div>
        <UserMenu />
      </nav>
    </header>
  );
}

function UserMenu() {
  const me = useCurrentUser();
  return match(me)
    .with({ isLoading: true }, () => (
      <div className="flex flex-row gap-4 items-center">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))
    .with({ data: P.nullish }, () => (
      <Button size="sm" asChild>
        <a href="/api/auth/login">Login</a>
      </Button>
    ))
    .with({ data: P.nonNullable }, (me) => (
      <div className="flex flex-row gap-4 items-center">
        <Button variant="outline" className="relative" size="sm" asChild>
          <Link to="/book/create">
            <PlusIcon /> Publish
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative w-8 h-8 rounded-full">
              <Avatar>
                <AvatarImage
                  src={me.data.profile?.profilePicture ?? undefined}
                />
                <AvatarFallback>
                  {me.data &&
                    (me.data.profile?.username ?? generateUsername(me.data._id))
                      .slice(0, 1)
                      .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {me && (
              <DropdownMenuItem asChild>
                <Link to="/author/$id" params={{ id: me.data._id }}>
                  Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/api/auth/logout">Logout</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ))
    .exhaustive();
}
