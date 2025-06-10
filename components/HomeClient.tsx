// components/HomeClient.tsx
"use client";

import { useEffect, useState } from "react";
import EraCard from "@/components/EraCard";
import { Era } from "@/lib/types";
import { getCachedData, refetchData } from "@/lib/dataCache";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { AnimatedTestimonialsDemo } from "@/components/Testimonials";

export default function HomeClient() {
  const [data, setData] = useState<{ eras: Era[] }>({ eras: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect running - checking navigation type");
    const loadData = async () => {
      try {
        const navigationType = (
          performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming
        )?.type;
        console.log("Navigation type:", navigationType);

        const shouldRefetch =
          navigationType === "reload" || navigationType === "navigate";
        const dataToUse = shouldRefetch
          ? await refetchData()
          : await getCachedData();
        setData({ eras: dataToUse.eras });
      } catch (error) {
        console.log("Error loading data:", error);
        const cachedData = await getCachedData();
        setData({ eras: cachedData.eras });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <FontAwesomeIcon
          icon={faSpinner}
          spinPulse
          className="text-teal-400 text-4xl"
        />
      </div>
    );
  }

  if (!data.eras.length) {
    return <div className="p-8 text-white min-h-screen">No eras available</div>;
  }

  return (
    <div className="text-white min-h-screen pb-6 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 md:px-8">
        {/* Animated Testimonials Section */}
        {/* <div className="mb-8">
          <AnimatedTestimonialsDemo />
        </div> */}
        {/* Era Cards Section */}
        {/* <h1 className="text-4xl sm:text-xl font-bold mb-4 text-center">Eras</h1> */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {data.eras.map((era: Era) => (
            <EraCard key={era.id} era={era} />
          ))}
        </div>
      </div>
    </div>
  );
}
