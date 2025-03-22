import { supabase } from "@/lib/supabase";
import AlbumCard from "@/components/AlbumCard";
import { Album } from "@/lib/types";

export default async function Home() {
  const { data: albums, error } = await supabase.from("albums").select("*");
  if (error) {
    console.log("Supabase fetch error:", error);
    return <div>Failed to load albums</div>;
  }
  console.log("Fetched albums:", albums);
  if (!albums || albums.length === 0) {
    console.log("No albums found in Supabase");
    return <div>No albums available</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Official Release Albums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {albums.map((album: Album, index) => {
          console.log(`Album ${index} ID:`, album.id);
          return <AlbumCard key={album.id} album={album} />;
        })}
      </div>
    </div>
  );
}
