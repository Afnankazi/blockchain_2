"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function SignOutButton(): JSX.Element {
  const { logout } = usePrivy()
  const router = useRouter()

  return (
    <Button
      aria-label="Sign Out"
      variant="ghost"
      className="w-full justify-start text-sm"
      onClick={async () => {
        await logout()
        router.push("/signin")
      }}
    >
      <Icons.logout className="mr-2 h-4 w-4" aria-hidden="true" />
      Sign out
    </Button>
  )
}
