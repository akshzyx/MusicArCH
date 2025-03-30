"use client";

import { useState } from "react";
import Image from "next/image";
import TrackList from "@/components/TrackList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Era, Release } from "@/lib/types";

interface EraContentClientProps {
  era: Era;
  releasesWithLikes: (Release & { likes: number })[];
  categories: {
    released: Release[];
    unreleased: Release[];
    stems: Release[];
  };
  tabOrder: string[];
  firstTabWithTracks: string;
}

export default function EraContentClient({
  era,
  releasesWithLikes,
  categories,
  tabOrder,
  firstTabWithTracks,
}: EraContentClientProps) {
  const [isCategorizedView, setIsCategorizedView] = useState(false);

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
              <p className="text-gray-300 text-base sm:text-sm mb-6">
                {era.description}
              </p>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue={firstTabWithTracks} className="space-y-6">
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <TabsList className="flex w-full bg-transparent">
              {tabOrder.map(
                (category) =>
                  categories[category].length > 0 && (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="uppercase text-gray-300 flex-1 py-2 px-4 rounded-md data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-colors"
                    >
                      {category}
                    </TabsTrigger>
                  )
              )}
            </TabsList>
            <button
              onClick={() => setIsCategorizedView(!isCategorizedView)}
              className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap ml-2"
            >
              {isCategorizedView ? "Default" : "Categorized"}
            </button>
          </div>
          {tabOrder.map(
            (category) =>
              categories[category].length > 0 && (
                <TabsContent key={category} value={category}>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <TrackList
                      initialTracks={releasesWithLikes.filter(
                        (r) => r.category === category
                      )}
                      sectionTracks={categories[category]}
                      isCategorizedView={isCategorizedView}
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
