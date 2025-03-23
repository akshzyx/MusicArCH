import { supabase } from "@/lib/supabase";
import Image from "next/image";
import TrackList from "@/components/TrackList";
import { Era, Release, Track } from "@/lib/types";

export default async function EraPage({
  params,
}: {
  params: { eraId: string };
}) {
  const { data: era, error: eraError } = await supabase
    .from("eras")
    .select("*")
    .eq("id", params.eraId)
    .single();
  const { data: releases, error: releasesError } = await supabase
    .from("releases")
    .select("*")
    .eq("era_id", params.eraId);
  const { data: tracks, error: tracksError } = await supabase
    .from("tracks")
    .select("*");

  if (eraError || releasesError || tracksError || !era) {
    return (
      <div>
        Era not found
        <p>Debug Info:</p>
        <pre>ID: {params.eraId}</pre>
        <pre>Era Error: {JSON.stringify(eraError, null, 2)}</pre>
        <pre>Releases Error: {JSON.stringify(releasesError, null, 2)}</pre>
        <pre>Tracks Error: {JSON.stringify(tracksError, null, 2)}</pre>
      </div>
    );
  }

  // Group tracks by release_id
  const releasesWithTracks = releases.map((release) => ({
    ...release,
    tracks: tracks.filter((track) => track.release_id === release.id),
  }));

  // Group releases by category
  const categories = {
    released: releasesWithTracks.filter((r) => r.category === "released"),
    unreleased: releasesWithTracks.filter((r) => r.category === "unreleased"),
    og: releasesWithTracks.filter((r) => r.category === "og"),
    stems: releasesWithTracks.filter((r) => r.category === "stems"),
    sessions: releasesWithTracks.filter((r) => r.category === "sessions"),
  };

  return (
    <div className="container mx-auto py-8">
      {/* Era Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <Image
          src={era.cover_image.trimEnd()}
          alt={era.title}
          width={400}
          height={400}
          className="rounded"
        />
        <div>
          <h1 className="text-4xl font-bold">{era.title}</h1>
          {era.description && (
            <p className="text-gray-600 mt-2">{era.description}</p>
          )}
          {(era.start_date || era.end_date) && (
            <p className="text-gray-600 mt-2">
              {era.start_date} - {era.end_date || "Present"}
            </p>
          )}
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-8">
        {Object.entries(categories).map(
          ([category, releases]) =>
            releases.length > 0 && (
              <div key={category}>
                <h2 className="text-2xl font-semibold capitalize mb-4">
                  {category}
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {releases.map((release) => (
                    <div key={release.id} className="border rounded-lg p-4">
                      <h3 className="text-xl font-medium">{release.title}</h3>
                      <Image
                        src={release.cover_image.trimEnd()}
                        alt={release.title}
                        width={200}
                        height={200}
                        className="rounded mt-2"
                      />
                      {release.release_date && (
                        <p className="text-gray-600 mt-2">
                          Released: {release.release_date}
                        </p>
                      )}
                      <TrackList tracks={release.tracks} />
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
