// app/upload/page.tsx
import { redirect } from "next/navigation";
// import { checkRole } from "@/utils/roles"; // Import role check utility
// import { auth } from "@clerk/nextjs/server"; // Import Clerk auth for server-side checks
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  // // Check if the user is authenticated and has the Admin role
  // const { userId } = auth();

  // // If the user is not signed in or not an Admin, redirect to the homepage
  // if (!userId || !checkRole("admin")) {
  //   redirect("/"); // Middleware already protects this route, but this adds an extra layer
  // }

  // Render the upload page only for authorized Admins
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upload new Track</h1>
      <UploadForm />
    </div>
  );
}
