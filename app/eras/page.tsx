
import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Eras - JojiArCH",
    description:
      "Explore the different eras with detailed information and insights.",
  };
}

export default function ErasPage() {
  return <HomeClient />;
}
