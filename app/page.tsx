// app/page.tsx
import { supabase } from "@/lib/supabase";
import EraCard from "@/components/EraCard";
import { Era } from "@/lib/types";

export const revalidate = 60; // ISR: Cache for 60 seconds

export default async function Home() {
  const { data: eras, error } = await supabase
    .from("eras")
    .select("id, title, album_rank, cover_image")
    .limit(50)
    .order("album_rank", { ascending: true }); // Move sorting to query

  if (error) {
    console.log("Supabase fetch error:", error);
    return <div className="p-8 text-foreground">Failed to load eras</div>;
  }
  if (!eras || eras.length === 0) {
    return <div className="p-8 text-foreground">No eras available</div>;
  }

  // Sorting moved to Supabase query, so no need for JS sort
  // const sortedEras = eras.sort((a, b) => a.album_rank - b.album_rank);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-foreground">
        Eras
      </h1>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 justify-items-center">
        {eras.map((era: Era) => (
          <EraCard key={era.id} era={era} />
        ))}
      </div>
    </div>
  );
}
