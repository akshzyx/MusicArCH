"use client";

import { useEffect, useState } from "react";
import EraCard from "@/components/EraCard";
import { Era, Release } from "@/lib/types";
import { getCachedData, refetchData } from "@/lib/dataCache";
import {
  faSpinner,
  faTimeline,
  faGrip,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timeline } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";

export default function HomeClient() {
  const [data, setData] = useState<{ eras: Era[]; releases: Release[] }>({
    eras: [],
    releases: [],
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Function to format date from YYYY-MM-DD to MMM DD, YYYY
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown Date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show/hide scroll to top button (only in timeline view)
  useEffect(() => {
    const handleScroll = () => {
      if (viewMode === "timeline") {
        setShowScrollTop(window.scrollY > 300);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewMode]);

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
        const releases = dataToUse.releases || [];
        console.log("All releases:", releases);
        console.log(
          "Release categories:",
          releases.map((r) => ({
            title: r.title,
            category: r.category,
            leak_date: r.leak_date,
            file_date: r.file_date,
          }))
        );
        setData({ eras: dataToUse.eras, releases });
      } catch (error) {
        console.log("Error loading data:", error);
        const cachedData = await getCachedData();
        const releases = cachedData.releases || [];
        console.log("Cached releases:", releases);
        console.log(
          "Cached release categories:",
          releases.map((r) => ({
            title: r.title,
            category: r.category,
            leak_date: r.leak_date,
            file_date: r.file_date,
          }))
        );
        setData({ eras: cachedData.eras, releases });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const timelineData = data.releases
    .filter((release) => release.leak_date || release.file_date)
    .sort((a, b) => {
      const dateA = new Date(a.leak_date || a.file_date || "");
      const dateB = new Date(b.leak_date || b.file_date || "");
      return dateA.getTime() - dateB.getTime();
    })
    .map((release) => ({
      title: formatDate(release.leak_date || release.file_date),
      content: (
        <div className="flex items-start gap-3">
          {release.cover_image && (
            <img
              src={release.cover_image}
              alt={`${release.title} cover`}
              className="h-12 w-12 rounded-md object-cover shadow-md"
            />
          )}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-white">
              {release.title}
            </span>
            {release.credit && (
              <span className="text-xs text-neutral-300">{release.credit}</span>
            )}
          </div>
        </div>
      ),
    }));

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

  if (!data.eras.length && !data.releases.length) {
    return <div className="p-8 text-white min-h-screen">No data available</div>;
  }

  return (
    <>
      <div className="text-white min-h-screen pb-6 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-lg md:text-2xl text-white">
                {viewMode === "grid" ? "Eras" : "Timeline"}
              </h2>
              <p className="text-sm text-neutral-400 mt-2 max-w-lg">
                {viewMode === "grid"
                  ? "Explore the collection of musical eras, showcasing distinct periods of creativity and style."
                  : "View the release history in a chronological timeline, highlighting key moments."}
              </p>
            </div>
            <Button
              onClick={() =>
                setViewMode(viewMode === "grid" ? "timeline" : "grid")
              }
              className="bg-teal-500 hover:bg-teal-600 text-white relative group cursor-pointer"
            >
              <FontAwesomeIcon
                icon={viewMode === "grid" ? faTimeline : faGrip}
                className="w-5 h-5"
              />
              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 top-1/2 -translate-y-1/2 right-full mr-2">
                {viewMode === "grid" ? "Timeline View" : "Era View"}
              </span>
            </Button>
          </div>

          {viewMode === "grid" && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
              {data.eras.map((era: Era) => (
                <EraCard key={era.id} era={era} />
              ))}
            </div>
          )}
          {viewMode === "timeline" && (
            <div className="relative w-full">
              {timelineData.length > 0 ? (
                <Timeline data={timelineData} />
              ) : (
                <p className="text-neutral-400">
                  No releases with valid dates available for timeline.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button - ONLY in Timeline View */}
      {viewMode === "timeline" && (
        <Button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 bg-teal-500 hover:bg-teal-600 text-white shadow-lg transition-all duration-300 ${
            showScrollTop
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          size="sm"
        >
          <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}
