import { supabase } from "@/lib/supabase";
import TrackList from "@/components/TrackList";
import Image from "next/image";
import { Album } from "@/lib/types";

export default async function AlbumPage({
  params,
}: {
  params: { albumId: string };
}) {
  const { data: album, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", params.albumId)
    .single();
  if (error || !album) return <div>Album not found</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Image
          src={album.cover_image}
          alt={album.title}
          width={400}
          height={400}
          className="rounded"
        />
        <div>
          <h1 className="text-4xl font-bold">{album.title}</h1>
          <p className="text-gray-600 mb-4">Released: {album.release_date}</p>
          <TrackList tracks={album.tracks} />
        </div>
      </div>
    </div>
  );
}
