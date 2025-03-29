// app/eras/[eraId]/page.tsx
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import TrackList from "@/components/TrackList";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import { faSpinner, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Metadata generation remains unchanged
export async function generateMetadata({
  params,
}: {
  params: { eraId: string };
}): Promise<Metadata> {
  const { data: era, error } = await supabase
    .from("eras")
    .select("title")
    .eq("id", params.eraId)
    .single();

  if (error || !era) {
    return {
      title: "Era Not Found - JojiArCH",
    };
  }

  return {
    title: `${era.title} - JojiArCH`,
  };
}

// Separate data-fetching component
async function EraContent({ eraId }: { eraId: string }) {
  const { data: era, error: eraError } = await supabase
    .from("eras")
    .select("*")
    .eq("id", eraId)
    .single();
  const { data: releases, error: releasesError } = await supabase
    .from("releases")
    .select("*")
    .eq("era_id", eraId);
  const { data: tracks, error: tracksError } = await supabase
    .from("tracks")
    .select("*");

  if (eraError || releasesError || tracksError || !era) {
    return (
      <div className="container mx-auto py-8 text-white bg-gray-900 min-h-screen">
        Era not found
        <p>Debug Info:</p>
        <pre>ID: {eraId}</pre>
        <pre>Era Error: {JSON.stringify(eraError, null, 2)}</pre>
        <pre>Releases Error: {JSON.stringify(releasesError, null, 2)}</pre>
        <pre>Tracks Error: {JSON.stringify(tracksError, null, 2)}</pre>
      </div>
    );
  }

  const releasesWithTracks = releases.map((release) => ({
    ...release,
    tracks: tracks.filter((track) => track.release_id === release.id),
  }));

  const categories = {
    released: releasesWithTracks
      .filter((r) => r.category === "released")
      .flatMap((r) => r.tracks),
    unreleased: releasesWithTracks
      .filter((r) => r.category === "unreleased")
      .flatMap((r) => r.tracks),
    og: releasesWithTracks
      .filter((r) => r.category === "og")
      .flatMap((r) => r.tracks),
    stems: releasesWithTracks
      .filter((r) => r.category === "stems")
      .flatMap((r) => r.tracks),
    sessions: releasesWithTracks
      .filter((r) => r.category === "sessions")
      .flatMap((r) => r.tracks),
  };

  const tabOrder = ["released", "unreleased", "og", "stems", "sessions"];
  const firstTabWithTracks =
    tabOrder.find((category) => categories[category].length > 0) || "released";

  // Mock like counts since your schema doesn't have them
  const tracksWithLikes = categories[firstTabWithTracks].map(
    (track, index) => ({
      ...track,
      likes: Math.floor(Math.random() * 5000) + 4000, // Random likes between 4k-9k
    })
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen pb-15">
      <div className="max-w-7xl mx-auto pt-12 px-4 sm:px-6 md:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center md:items-start text-center md:text-left">
          <Image
            src={era.cover_image.trimEnd()}
            alt={era.title}
            width={300}
            height={300}
            className="rounded-lg w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] object-cover shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              {era.title}
            </h1>
            {era.description && (
              <p className="text-gray-300 text-base sm:text-lg mb-6">
                {era.description}
              </p>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue={firstTabWithTracks} className="space-y-6">
          <TabsList className="flex w-full bg-gray-800 rounded-lg p-1">
            {tabOrder.map(
              (category) =>
                categories[category].length > 0 && (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="capitalize text-gray-300 flex-1 py-2 rounded-md data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-colors"
                  >
                    {category}
                  </TabsTrigger>
                )
            )}
          </TabsList>
          {tabOrder.map(
            (category) =>
              categories[category].length > 0 && (
                <TabsContent key={category} value={category}>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <TrackList
                      initialTracks={categories[category].map(
                        (track, index) => ({
                          ...track,
                          likes: Math.floor(Math.random() * 5000) + 4000,
                        })
                      )}
                      sectionTracks={categories[category]}
                    />
                  </div>
                </TabsContent>
              )
          )}
        </Tabs>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function EraPage({ params }: { params: { eraId: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
          <FontAwesomeIcon icon={faSpinner} spinPulse />{" "}
        </div>
      }
    >
      <EraContent eraId={params.eraId} />
    </Suspense>
  );
}
