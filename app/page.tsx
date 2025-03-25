// pages/Home.tsx
import { supabase } from "@/lib/supabase";
import EraCard from "@/components/EraCard"; // Adjust path if needed
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

  const sortedEras = eras.sort((a, b) => a.album_rank - b.album_rank);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Eras</h1>

      {/* Responsive Grid Layout with Proper Gaps */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 justify-items-center">
        {sortedEras.map((era: Era) => (
          <EraCard key={era.id} era={era} />
        ))}
      </div>
    </div>
  );
}
