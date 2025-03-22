import { Track } from "@/lib/types";
import AudioPlayer from "./AudioPlayer";

interface TrackListProps {
  tracks: Track[];
}

export default function TrackList({ tracks }: TrackListProps) {
  return (
    <ul className="space-y-4">
      {tracks.map((track) => (
        <li key={track.id} className="flex justify-between items-center">
          <div>
            <p className="font-medium">{track.title}</p>
            <p className="text-sm text-gray-500">{track.duration}</p>
            <a
              href={track.file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              Song Link
            </a>
          </div>
          <AudioPlayer src={track.file} />
        </li>
      ))}
    </ul>
  );
}
