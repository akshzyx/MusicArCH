import { supabase } from "@/lib/supabase";
import Image from "next/image";
import TrackList from "@/components/TrackList";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      title: "Era Not Found - Music Archive",
    };
  }

  return {
    title: `${era.title} - Music Archive`,
  };
}

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
      <div className="container mx-auto py-8 text-foreground">
        Era not found
        <p>Debug Info:</p>
        <pre>ID: {params.eraId}</pre>
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

  // Define tab order and find the first category with tracks
  const tabOrder = ["released", "unreleased", "og", "stems", "sessions"];
  const firstTabWithTracks =
    tabOrder.find((category) => categories[category].length > 0) || "released";

  return (
    <>
      <div className="p-4 sm:p-12 md:p-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8 items-center md:items-start">
          <Image
            src={era.cover_image.trimEnd()}
            alt={era.title}
            width={300}
            height={300}
            className="rounded w-[300px] h-[300px] sm:w-[300px] sm:h-[300px] md:w-[300px] md:h-[300px] lg:w-[500px] lg:h-[300px] object-cover"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold">{era.title}</h1>
            {era.description && (
              <p className="text-foreground text-zinc-300 mt-2">
                {era.description}
              </p>
            )}
          </div>
        </div>

        <Tabs defaultValue={firstTabWithTracks} className="space-y-4 ">
          <TabsList className="flex w-full bg-background ">
            {tabOrder.map(
              (category) =>
                categories[category].length > 0 && (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="capitalize text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background"
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
                  <div className="border rounded-lg p-4 bg-background">
                    <TrackList
                      initialTracks={categories[category]}
                      sectionTracks={categories[category]} // Pass category tracks as sectionTracks
                    />
                  </div>
                </TabsContent>
              )
          )}
        </Tabs>
      </div>
    </>
  );
}
