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
import { Link } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
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
  const auth = useAuth();

  return match(auth)
    .with({ user: P.nullish }, ({ signIn }) => (
      <Button size="sm" onClick={() => signIn()}>
        Login
      </Button>
    ))
    .with({ user: P.nonNullable }, ({ user, signOut }) => (
      <div className="flex flex-row gap-4 items-center">
        <Button variant="outline" className="relative" size="sm">
          <PlusIcon /> Publish
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative w-8 h-8 rounded-full">
              <Avatar>
                <AvatarImage src={user.profilePictureUrl ?? undefined} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ))
    .exhaustive();
}
