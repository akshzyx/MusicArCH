import { supabase } from "@/lib/supabase";
import AlbumCard from "@/components/AlbumCard";
import { Album } from "@/lib/types";

export default async function Home() {
  const { data: albums, error } = await supabase.from("albums").select("*");
  if (error) return <div>Failed to load albums</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Official Release Albums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {albums.map((album: Album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
