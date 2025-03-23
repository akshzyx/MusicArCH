import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Era } from "@/lib/types";

export default async function Home() {
  const { data: eras, error } = await supabase.from("eras").select("*");
  if (error) {
    console.log("Supabase fetch error:", error);
    return <div>Failed to load eras</div>;
  }
  if (!eras || eras.length === 0) {
    return <div>No eras available</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Eras</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {eras.map((era: Era) => (
          <Link key={era.id} href={`/eras/${era.id}`} className="block">
            <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
              <Image
                src={era.cover_image.trimEnd()}
                alt={era.title}
                width={300}
                height={300}
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{era.title}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
