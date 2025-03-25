// utils/roles.ts
import { auth } from "@clerk/nextjs/server";

export function checkRole(requiredRole: "admin" | "member") {
  const { sessionClaims } = auth();

  // If no organization, treat as a guest (no role)
  if (!sessionClaims?.org_id) {
    return false;
  }

  const userRole = sessionClaims?.org_role; // e.g., "org:admin" or "org:member"
  if (requiredRole === "admin" && userRole === "org:admin") {
    return true;
  }
  if (requiredRole === "member" && userRole === "org:member") {
    return true;
  }
  return false;
}
