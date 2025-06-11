"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Release } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface SongPopUpProps {
  activeTrack: Release | null;
  setActiveTrack: (track: Release | null) => void;
  popupRef: React.RefObject<HTMLDivElement>;
  tracks: Release[];
  currentTrack: Release | null;
  isPlaying: boolean;
  playTrack: (track: Release, trackList: Release[]) => void;
  pauseTrack: () => void;
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
}: SongPopUpProps) {
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

  if (!activeTrack || !activeTrack.id) {
    return null; // Prevent rendering if activeTrack is invalid
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          key={`overlay-${activeTrack.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 bg-black/50 h-full w-full z-50"
          onClick={() => setActiveTrack(null)} // Close popup when clicking backdrop
        />
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          key={`popup-${activeTrack.id}`}
          className="fixed inset-0 grid place-items-center z-[1000] p-4"
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            layoutId={`card-${activeTrack.id}-${id}`}
            ref={popupRef}
            className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90vh] flex flex-col bg-gray-900 rounded-3xl overflow-hidden"
            layout
            transition={{
              borderRadius: 24,
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside popup from closing it
          >
            <motion.div
              layoutId={`image-${activeTrack.id}`}
              className="relative w-full h-80"
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <img
                width={500}
                height={200}
                src={
                  activeTrack.cover_image ||
                  "https://via.placeholder.com/500x200?text=No+Image+2025"
                }
                alt={activeTrack.title || "Track"}
                className="w-full h-full object-cover object-center rounded-t-3xl"
              />
            </motion.div>
            <motion.div className="p-6 flex flex-col gap-4">
              <motion.div
                className="flex justify-between items-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.2, duration: 0.3, ease: [0.2, 0, 0, 1] }}
              >
                <div>
                  <motion.h3
                    layoutId={`title-${activeTrack.id}`}
                    className="font-bold text-white text-2xl"
                  >
                    {activeTrack.title || "Untitled Track"}
                  </motion.h3>
                  {activeTrack.credit && (
                    <motion.p
                      layoutId={`credit-${activeTrack.id}`}
                      className="text-gray-400 text-sm mt-1"
                    >
                      {activeTrack.credit}
                    </motion.p>
                  )}
                </div>
                {isTrackPlayable(activeTrack) && (
                  <motion.button
                    layoutId={`play-button-${activeTrack.id}`}
                    onClick={() => handlePlayPause(activeTrack)}
                    className={cn(
                      "px-5 py-2.5 rounded-lg font-semibold text-white flex items-center gap-2 transition-colors",
                      currentTrack?.id === activeTrack.id && isPlaying
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-teal-500 hover:bg-teal-600"
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.3,
                      duration: 0.2,
                      ease: [0.2, 0, 0, 1],
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
                )}
              </motion.div>
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  delay: 0.25,
                  duration: 0.3,
                  ease: [0.2, 0, 0, 1],
                }}
                className="text-gray-300 text-sm flex flex-col gap-3 max-h-[40vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] pr-2"
              >
                {activeTrack.og_filename && (
                  <p>
                    <span className="font-semibold text-gray-200">
                      Original Filename:
                    </span>{" "}
                    {activeTrack.og_filename}
                  </p>
                )}
                {activeTrack.file_date && (
                  <p>
                    <span className="font-semibold text-gray-200">
                      File Date:
                    </span>{" "}
                    {activeTrack.file_date}
                  </p>
                )}
                {activeTrack.leak_date && (
                  <p>
                    <span className="font-semibold text-gray-200">
                      Leak Date:
                    </span>{" "}
                    {activeTrack.leak_date}
                  </p>
                )}
                {activeTrack.notes && (
                  <p>
                    <span className="font-semibold text-gray-200">Notes:</span>{" "}
                    {activeTrack.notes}
                  </p>
                )}
                {activeTrack.type && (
                  <p>
                    <span className="font-semibold text-gray-200">Type:</span>{" "}
                    {activeTrack.type}
                  </p>
                )}
                {activeTrack.track_type && (
                  <p>
                    <span className="font-semibold text-gray-200">
                      Track Type:
                    </span>{" "}
                    {activeTrack.track_type}
                  </p>
                )}
                {activeTrack.available &&
                  activeTrack.category !== "released" && (
                    <p>
                      <span className="font-semibold text-gray-200">
                        Availability:
                      </span>{" "}
                      {activeTrack.available}
                    </p>
                  )}
                {activeTrack.quality && activeTrack.category !== "released" && (
                  <p>
                    <span className="font-semibold text-gray-200">
                      Quality:
                    </span>{" "}
                    {activeTrack.quality}
                  </p>
                )}
                {activeTrack.duration && (
                  <p>
                    <span className="font-semibold text-gray-200">
                      Duration:
                    </span>{" "}
                    {activeTrack.duration}
                  </p>
                )}
                {activeTrack.category && (
                  <p>
                    <span className="font-semibold text-gray-200">
                      Category:
                    </span>{" "}
                    {activeTrack.category}
                  </p>
                )}
                {activeTrack.era_id && (
                  <p>
                    <span className="font-semibold text-gray-200">Era:</span>{" "}
                    {activeTrack.era_id}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
