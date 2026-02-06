"use client"

import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SignOutButton } from "@/components/auth/signout-button"
import { Icons } from "@/components/icons"

export function UserMenu(): JSX.Element {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-9 w-9">
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "user", size: "icon" }),
          "transition-all duration-300 ease-in-out hover:opacity-70"
        )}
      >
        <Avatar className="h-9 w-9 rounded-md">
          {user?.image ? (
            <AvatarImage src={user.image} className="h-9 w-9" />
          ) : (
            <AvatarFallback className="h-9 w-9 rounded-md">
              <Icons.user className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
      </SheetTrigger>
      <SheetContent className="z-[99]">
        <SheetHeader>
          <SheetTitle>{user?.name || user?.email || "User"}</SheetTitle>
          {user?.walletAddress && (
            <p className="text-xs text-muted-foreground">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </p>
          )}
        </SheetHeader>
        <SheetDescription className="mt-4">
          <SignOutButton />
        </SheetDescription>
      </SheetContent>
    </Sheet>
  )
}
