"use server"

import crypto from "crypto"
import { getUserByEmail } from "@/actions/users"
import { db } from "@/db"
import { users, type NewUser } from "@/db/schema"
import bcryptjs from "bcryptjs"

// Note: With Privy, most authentication is handled client-side
// These server actions are kept for backward compatibility with the database

export async function createUserInDatabase(
  email: string,
  privyId: string
): Promise<"success" | "error"> {
  try {
    const existingUser = await getUserByEmail(email)
    if (existingUser) return "success" // User already exists

    await db.insert(users).values({
      id: privyId,
      email,
      emailVerified: new Date(),
      role: "user",
    } as NewUser)

    return "success"
  } catch (error) {
    console.error("Error creating user in database:", error)
    return "error"
  }
}

export async function updateUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<"success" | "error"> {
  try {
    await db
      .update(users)
      .set({ role })
      .where((user) => user.id === userId)

    return "success"
  } catch (error) {
    console.error("Error updating user role:", error)
    return "error"
  }
}

// Legacy functions kept for compatibility - can be removed if not needed
export async function signUpWithPassword() {
  throw new Error("Use Privy authentication instead")
}

export async function signInWithPassword() {
  throw new Error("Use Privy authentication instead")
}

export async function resetPassword() {
  throw new Error("Use Privy authentication instead")
}

export async function updatePassword() {
  throw new Error("Use Privy authentication instead")
}

export async function linkOAuthAccount() {
  // No-op for Privy
  return "success"
}

export async function signOut() {
  // Handled by Privy client-side
  return "success"
}
