// app/eras/page.tsx
import { Metadata } from "next";
import HomeClient from "@/components/HomeClient"; // Import the client component

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Eras - MyApp",
    description:
      "Explore the different eras with detailed information and insights.",
  };
}

export default function ErasPage() {
  return <HomeClient />;
}
