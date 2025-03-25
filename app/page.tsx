"use client";

import { useEffect, useState } from "react";
import EraCard from "@/components/EraCard";
import { Era } from "@/lib/types";
import { getCachedData } from "@/lib/dataCache"; // Removed refetchData import

export default function Home() {
  const [data, setData] = useState<{ eras: Era[] }>({ eras: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch or get cached data on mount
    getCachedData()
      .then((cachedData) => {
        setData({ eras: cachedData.eras });
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error loading cached data:", error);
        setLoading(false);
      });
  }, []); // Empty dependency array, runs once on mount

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* <FontAwesomeIcon icon={faGear} spin /> */}
      </div>
    );
  }

  if (!data.eras.length) {
    return <div className="p-8 text-foreground">No eras available</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-foreground">
        Eras
      </h1>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 justify-items-center">
        {data.eras.map((era: Era) => (
          <EraCard key={era.id} era={era} />
        ))}
      </div>
    </div>
  );
}
