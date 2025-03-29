"use client";

import Link from "next/link";
import Image from "next/image";
import { Era, Release } from "@/lib/types";
import { getCachedData } from "@/lib/dataCache";
import { useEffect, useState } from "react";

interface EraCardProps {
  era: Era;
}

export default function EraCard({ era }: EraCardProps) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCachedData()
      .then((cachedData) => {
        setReleases(cachedData.releases.filter((r) => r.era_id === era.id));
      })
      .catch((err) => {
        console.log("Supabase fetch error in EraCard:", err);
        setError("Error loading tracks");
      });
  }, [era.id]);

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-sm transition-all duration-200 hover:bg-gray-700/50">
        <Link href={`/eras/${era.id}`} className="flex flex-row gap-4 w-full">
          <Image
            alt={era.title}
            className="object-cover rounded-lg w-20 h-20 sm:w-24 sm:h-24 shadow-md"
            src={era.cover_image || "/default-image.jpg"}
            width={96}
            height={96}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-white truncate">
              {era.title}
            </h4>
            <p className="text-gray-400 text-sm">Error loading tracks</p>
          </div>
        </Link>
      </div>
    );
  }

  const trackCount = releases.length;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-sm transition-all duration-200 hover:bg-gray-700/50">
      <Link href={`/eras/${era.id}`} className="flex flex-row gap-4 w-full">
        <Image
          alt={era.title}
          className="object-cover rounded-lg w-20 h-20 sm:w-24 sm:h-24 shadow-md"
          src={era.cover_image || "/default-image.jpg"}
          width={96}
          height={96}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white truncate">
            {era.title}
          </h4>
          <p className="text-gray-400 text-sm">
            {trackCount} Track{trackCount !== 1 ? "s" : ""}
          </p>
        </div>
      </Link>
    </div>
  );
}
