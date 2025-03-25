// utils/roles.ts
import { auth } from "@clerk/nextjs/server";

// Function to check if the user has the required role (admin or member)
export function checkRole(requiredRole: "admin" | "member") {
  const { sessionClaims } = auth();

  // If the user is not part of an organization, treat them as a guest (no role)
  if (!sessionClaims?.org_id) {
    return false;
  }

  // Get the user's role from session claims (e.g., "org:admin" or "org:member")
  const userRole = sessionClaims?.org_role;
  if (requiredRole === "admin" && userRole === "org:admin") {
    return true;
  }
  if (requiredRole === "member" && userRole === "org:member") {
    return true;
  }
  return false;
}
