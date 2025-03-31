import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

type PublicMetadata = {
  role?: string;
};

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/eras/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isProtectedRoute = createRouteMatcher(["/upload"]); // Define protected routes requiring admin

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return;
  }

  // Redirect to sign-in if not authenticated
  if (!authObject.userId) {
    return authObject.redirectToSignIn();
  }

  // Check admin role for protected routes (e.g., /upload)
  if (isProtectedRoute(req)) {
    const publicMetadata = (authObject.sessionClaims?.publicMetadata ||
      {}) as PublicMetadata;
    const userRole = publicMetadata.role;
    if (userRole !== "admin") {
      return Response.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
