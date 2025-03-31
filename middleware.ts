import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/eras/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook", // Add this to exclude webhook from auth checks
]);

const isProtectedRoute = createRouteMatcher(["/upload"]);

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();

  if (isPublicRoute(req)) {
    return;
  }

  if (!authObject.userId) {
    return authObject.redirectToSignIn();
  }

  if (isProtectedRoute(req)) {
    type PublicMetadata = { role?: string };
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
