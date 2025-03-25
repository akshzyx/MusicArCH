// components/EraCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader } from "@heroui/card";
import { Era, Release, Track } from "@/lib/types";
import { getCachedData } from "@/lib/dataCache";
import { useEffect, useState } from "react";

interface EraCardProps {
  era: Era;
}

export default function EraCard({ era }: EraCardProps) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCachedData()
      .then((cachedData) => {
        setReleases(cachedData.releases.filter((r) => r.era_id === era.id));
        setTracks(cachedData.tracks);
      })
      .catch((err) => {
        console.log("Supabase fetch error in EraCard:", err);
        setError("Error loading tracks");
      });
  }, [era.id]);

  if (error) {
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

  const eraTracks = tracks.filter((track) =>
    releases.some((release) => release.id === track.release_id)
  );
  const trackCount = eraTracks.length;

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
