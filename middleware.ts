import { NextResponse } from "next/server";
export default function middleware(req) {
  console.log("Middleware running for:", req.nextUrl.pathname);
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};

// This is an example of how to use Clerk middleware for authentication
// WORKED FINE FOR SOME TIME COULDN'T GET IT TO WORK AGAIN

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/about",
//   "/eras/(.*)",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/api/webhook", // Add this to exclude webhook from auth checks
// ]);

// const isProtectedRoute = createRouteMatcher(["/upload"]);

// export default clerkMiddleware(async (auth, req) => {
//   const authObject = await auth();

//   if (isPublicRoute(req)) {
//     return;
//   }

//   if (!authObject.userId) {
//     return authObject.redirectToSignIn();
//   }

//   if (isProtectedRoute(req)) {
//     type PublicMetadata = { role?: string };
//     const publicMetadata = (authObject.sessionClaims?.publicMetadata ||
//       {}) as PublicMetadata;
//     const userRole = publicMetadata.role;
//     if (userRole !== "admin") {
//       return Response.redirect(new URL("/", req.url));
//     }
//   }
// });

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
