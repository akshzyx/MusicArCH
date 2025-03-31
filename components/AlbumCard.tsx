import Link from "next/link";
import Image from "next/image";

interface AlbumCardProps {
  album: {
    id: string;
    cover_image: string;
    title: string;
    release_date: string;
  };
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/albums/${album.id}`} className="block">
      <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
        <Image
          src={album.cover_image}
          alt={album.title}
          width={300}
          height={300}
        />
        <div className="p-4">
          <h2 className="text-xl font-semibold">{album.title}</h2>
          <p className="text-gray-600">{album.release_date}</p>
        </div>
      </div>
    </Link>
  );
}
