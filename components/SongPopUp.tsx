"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Release } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faTimes } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface Props {
  activeTrack: Release | null;
  setActiveTrack: (track: Release | null) => void;
  popupRef: React.RefObject<HTMLDivElement>;
  tracks: Release[];
  currentTrack: Release | null;
  isPlaying: boolean;
  playTrack: (track: Release, tracks: Release[]) => void;
  pauseTrack: () => void;
  era_title?: string; // Added to pass Era.title
}

export default function SongPopUp({
  activeTrack,
  setActiveTrack,
  popupRef,
  tracks,
  currentTrack,
  isPlaying,
  playTrack,
  pauseTrack,
  era_title,
}: Props) {
  const id = useId();
  const isTrackPlayable = (track: Release) => {
    return !!track.file && track.file.trim() !== "";
  };

  const handlePlayPause = (track: Release) => {
    if (!isTrackPlayable(track)) return;
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track, tracks);
    }
  };

  if (!activeTrack) {
    return null; // Prevent rendering if activeTrack is invalid
  }

  // Format date to "MMM DD, YYYY" (e.g., "May 24, 2024")
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format era_id to title case (e.g., "smithereens" → "Smithereens") as fallback
  const formatEraTitle = (eraId: string) => {
    return eraId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Capitalize first letter (e.g., "released" → "Released")
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Adjust font size based on description length
  const getDescriptionFontSize = (text: string) => {
    if (text.length > 200) return "text-sm";
    if (text.length > 100) return "text-base";
    return "text-lg";
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key={`backdrop-${activeTrack.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 0.5] },
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 0.5] }}
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setActiveTrack(null)}
        />
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          key={`popup-${activeTrack.id}`}
          className="fixed inset-0 grid place-items-center z-[1000] p-4"
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 0.5] }}
        >
          <motion.div
            layoutId={`card-${activeTrack.id}-${id}`}
            ref={popupRef}
            className="relative w-full max-w-[500px] h-full md:h-fit md:max-h-[90vh] flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl"
            initial={{ scale: 0.9, opacity: 0, filter: "blur(4px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.9, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 0.5] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button for Mobile */}
            <motion.button
              className="absolute top-4 right-4 text-gray-300 hover:text-white block md:hidden z-10"
              onClick={() => setActiveTrack(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.3, duration: 0.2 }}
              aria-label="Close popup"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </motion.button>

            <div className="p-8 flex flex-col gap-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Poster */}
              <motion.div
                layoutId={`image-${activeTrack.id}`}
                className="relative w-full max-w-[300px] h-48 mx-auto mt-6 shadow-sm"
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 0.5] }}
              >
                <img
                  width={300}
                  height={192}
                  src={
                    activeTrack.cover_image ||
                    "https://via.placeholder.com/300x192?text=No+Image+2025"
                  }
                  alt={activeTrack.title || "Track"}
                  className="w-full h-full object-contain rounded-xl"
                />
              </motion.div>

              {/* Title, Credit, AKA & Duration */}
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  delay: 0.2,
                  duration: 0.3,
                  ease: [0.2, 0, 0, 0.5],
                }}
              >
                <motion.h3
                  layoutId={`title-${activeTrack.id}`}
                  className="text-3xl font-bold text-white text-center"
                >
                  {activeTrack.title || "Untitled Track"}
                </motion.h3>
                {activeTrack.aka && (
                  <motion.p
                    layoutId={`aka-${activeTrack.id}`}
                    className="text-sm italic text-gray-500 text-center"
                  >
                    AKA: {activeTrack.aka}
                  </motion.p>
                )}
                <div className="flex items-center gap-2">
                  {activeTrack.credit && (
                    <motion.p
                      layoutId={`credit-${activeTrack.id}`}
                      className="text-sm italic text-gray-500 text-center"
                    >
                      {activeTrack.credit}
                    </motion.p>
                  )}
                  {activeTrack.duration && (
                    <motion.span
                      className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25, duration: 0.2 }}
                    >
                      {activeTrack.duration}
                    </motion.span>
                  )}
                </div>
              </motion.div>

              {/* Play Button */}
              {isTrackPlayable(activeTrack) && (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    delay: 0.25,
                    duration: 0.25,
                    ease: [0.2, 0, 0, 0.5],
                  }}
                >
                  <motion.button
                    layoutId={`play-button-${activeTrack.id}`}
                    onClick={() => handlePlayPause(activeTrack)}
                    className={cn(
                      "px-6 py-3 rounded-full font-semibold text-white flex items-center gap-2 cursor-pointer",
                      {
                        "bg-blue-600 hover:bg-blue-700":
                          currentTrack?.id === activeTrack.id && isPlaying,
                        "bg-blue-500 hover:bg-blue-600": !(
                          currentTrack?.id === activeTrack.id && isPlaying
                        ),
                      }
                    )}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.3,
                      duration: 0.2,
                      ease: [0.3, 0, 0, 0.5],
                    }}
                  >
                    {currentTrack?.id === activeTrack.id && isPlaying ? (
                      <>
                        <FontAwesomeIcon icon={faPause} size="sm" />
                        Pause
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlay} size="sm" />
                        Play
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Metadata */}
              <motion.div
                className="flex flex-wrap justify-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  delay: 0.35,
                  duration: 0.3,
                  ease: [0.2, 0, 0, 0.5],
                }}
              >
                {(era_title || activeTrack.era_id) && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                    {era_title || formatEraTitle(activeTrack.era_id)}
                  </span>
                )}
                {formatDate(activeTrack.file_date) && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                    {formatDate(activeTrack.file_date)}
                  </span>
                )}
                {formatDate(activeTrack.leak_date) && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                    Leaked: {formatDate(activeTrack.leak_date)}
                  </span>
                )}
                {activeTrack.category && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                    {capitalizeFirstLetter(activeTrack.category)}
                  </span>
                )}
                {activeTrack.type && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                    {activeTrack.type}
                  </span>
                )}
                {activeTrack.track_type && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                    {activeTrack.track_type}
                  </span>
                )}
                {activeTrack.available &&
                  activeTrack.category !== "released" && (
                    <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                      {activeTrack.available}
                    </span>
                  )}
                {activeTrack.quality && activeTrack.category !== "released" && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                    {activeTrack.quality}
                  </span>
                )}
                {activeTrack.og_filename && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300">
                    OG File - {activeTrack.og_filename}
                  </span>
                )}
              </motion.div>

              {/* Description */}
              {activeTrack.notes && (
                <motion.div
                  className={cn(
                    "text-gray-400 mt-4 text-center",
                    getDescriptionFontSize(activeTrack.notes)
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    delay: 0.4,
                    duration: 0.3,
                    ease: [0.2, 0, 0, 0.5],
                  }}
                >
                  <p>{activeTrack.notes}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
