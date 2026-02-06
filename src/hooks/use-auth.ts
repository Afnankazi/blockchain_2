"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useEffect, useState } from "react"

export interface User {
  id: string
  email?: string
  name?: string
  image?: string
  role?: "user" | "admin"
  walletAddress?: string
}

export function useAuth() {
  const { user: privyUser, authenticated, ready, login, logout } = usePrivy()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (ready) {
      if (authenticated && privyUser) {
        // Map Privy user to our User interface
        setUser({
          id: privyUser.id,
          email: privyUser.email?.address,
          name: privyUser.email?.address?.split("@")[0] || "User",
          walletAddress: privyUser.wallet?.address,
          role: "user", // Default role, can be fetched from database
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
  }, [privyUser, authenticated, ready])

  return {
    user,
    isAuthenticated: authenticated,
    isLoading: !ready || isLoading,
    login,
    logout,
  }
}
