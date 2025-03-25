// components/EraCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader } from "@heroui/card";
import { supabase } from "@/lib/supabase";
import { Era } from "@/lib/types";

interface EraCardProps {
  era: Era;
}

export default async function EraCard({ era }: EraCardProps) {
  // Fetch releases for this specific era
  const { data: releases, error: releasesError } = await supabase
    .from("releases")
    .select("*")
    .eq("era_id", era.id);

  // Fetch all tracks (could optimize with a join or filter later)
  const { data: tracks, error: tracksError } = await supabase
    .from("tracks")
    .select("*");

  // Handle errors
  if (releasesError || tracksError) {
    console.log(
      "Supabase fetch error in EraCard:",
      releasesError || tracksError
    );
    return (
      <Card className="p-10 w-full flex flex-row gap-10 rounded-xl shadow-md">
        <Link href={`/eras/${era.id}`} className="flex flex-row gap-4 w-full">
          <Image
            alt={era.title}
            className="object-cover rounded-xl"
            src={era.cover_image || "/default-image.jpg"}
            width={150}
            height={150}
          />
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">{era.title}</h4>
            <small className="text-default-500">Error loading tracks</small>
          </CardHeader>
        </Link>
      </Card>
    );
  }

  // Calculate track count for this era
  const eraTracks = tracks.filter((track) =>
    releases.some((release) => release.id === track.release_id)
  );
  const trackCount = eraTracks.length;

  return (
    <Card className="p-10 w-full flex flex-row gap-10 rounded-xl shadow-md">
      <Link href={`/eras/${era.id}`} className="flex flex-row gap-4 w-full">
        {/* Image on the left - Fixed size */}
        <Image
          alt={era.title}
          className="object-cover rounded-xl"
          src={era.cover_image || "/default-image.jpg"}
          width={150}
          height={150}
        />

        {/* Title and track count on the right - Aligned to top */}
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start justify-start">
          <h4 className="font-bold text-large">{era.title}</h4>
          <small className="text-default-500">{trackCount} Tracks</small>
          {/* Uncomment if you want to add description later */}
          {/* <p className="text-sm">{era.description}</p> */}
        </CardHeader>
      </Link>
    </Card>
  );
}
