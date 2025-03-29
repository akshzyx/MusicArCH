"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Track } from "@/lib/types";
import { useAudio } from "@/lib/AudioContext";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
  faPlay,
  faPause,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

// Fetch release titles for album names
async function fetchReleaseTitle(releaseId: number) {
  const { data } = await supabase
    .from("releases")
    .select("title")
    .eq("id", releaseId)
    .single();
  return data?.title || "Unknown Album";
}

export default function TrackList({
  initialTracks,
  sectionTracks,
}: {
  initialTracks: (Track & { likes?: number })[];
  sectionTracks: Track[];
}) {
  const [tracks, setTracks] =
    useState<(Track & { likes?: number })[]>(initialTracks);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackFile, setTrackFile] = useState("");
  const { currentTrack, isPlaying, playTrack, pauseTrack, stopTrack } =
    useAudio();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertVariant, setAlertVariant] = useState<"default" | "destructive">(
    "default"
  );
  const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(
    null
  );
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [releaseTitles, setReleaseTitles] = useState<{ [key: number]: string }>(
    {}
  );

  useEffect(() => {
    setTracks(initialTracks);
    // Fetch release titles for each track
    const fetchTitles = async () => {
      const titles: { [key: number]: string } = {};
      for (const track of initialTracks) {
        if (!titles[track.release_id]) {
          titles[track.release_id] = await fetchReleaseTitle(track.release_id);
        }
      }
      setReleaseTitles(titles);
    };
    fetchTitles();
  }, [initialTracks]);

  const showAlert = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default",
    confirmAction?: () => void
  ) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertVariant(variant);
    setOnConfirmAction(() => confirmAction || null);
    setAlertOpen(true);
  };

  const handleEdit = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    }
    setEditingTrack(track);
    setTrackTitle(track.title);
    setTrackDuration(track.duration);
    setTrackFile(track.file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;

    const updatedTrack = {
      ...editingTrack,
      title: trackTitle,
      duration: trackDuration,
      file: trackFile.trimEnd(),
    };

    const { error } = await supabase
      .from("tracks")
      .update(updatedTrack)
      .eq("id", editingTrack.id);

    if (error) {
      console.error("Error updating track:", error);
      showAlert("Update Failed", "Failed to update track: " + error.message);
    } else {
      console.log("Track updated:", editingTrack.id);
      showAlert("Success", "Track updated successfully!");
      setTracks(
        tracks.map((t) => (t.id === editingTrack.id ? updatedTrack : t))
      );
      if (currentTrack?.id === editingTrack.id) {
        playTrack(updatedTrack, sectionTracks);
      }
      setEditingTrack(null);
      setTrackTitle("");
      setTrackDuration("");
      setTrackFile("");
    }
  };

  const handleDelete = async (track: Track) => {
    showAlert(
      "Confirm Deletion",
      `Are you sure you want to delete "${track.title}"?`,
      "destructive",
      async () => {
        const { error } = await supabase
          .from("tracks")
          .delete()
          .eq("id", track.id);

        if (error) {
          console.error("Error deleting track:", error);
          showAlert(
            "Deletion Failed",
            "Failed to delete track: " + error.message
          );
        } else {
          console.log("Track deleted:", track.id);
          showAlert("Success", "Track deleted successfully!");
          setTracks(tracks.filter((t) => t.id !== track.id));
          if (currentTrack?.id === track.id) {
            stopTrack();
          }
        }
      }
    );
  };

  const handleCancel = () => {
    setEditingTrack(null);
    setTrackTitle("");
    setTrackDuration("");
    setTrackFile("");
  };

  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track, sectionTracks);
    }
  };

  return (
    <div>
      <ul className="space-y-2">
        {tracks.map((track, index) => (
          <li
            key={track.id}
            className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              currentTrack?.id === track.id
                ? "bg-gray-700/50 text-white"
                : "hover:bg-gray-800/50 text-gray-300"
            }`}
            onMouseEnter={() => setHoveredTrackId(track.id)}
            onMouseLeave={() => setHoveredTrackId(null)}
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <button
                onClick={() => handlePlayPause(track)}
                className={`w-6 h-6 flex items-center justify-center text-sm rounded-full transition-colors ${
                  currentTrack?.id === track.id && isPlaying
                    ? "text-green-400"
                    : "text-gray-400 hover:text-green-400"
                }`}
              >
                {currentTrack?.id === track.id ? (
                  isPlaying ? (
                    <FontAwesomeIcon icon={faPause} size="xs" />
                  ) : (
                    <FontAwesomeIcon icon={faPlay} size="xs" />
                  )
                ) : hoveredTrackId === track.id ? (
                  <FontAwesomeIcon icon={faPlay} size="xs" />
                ) : (
                  <span className="text-gray-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-white font-medium truncate block">
                  {track.title}
                </span>
                {/* <span className="text-gray-500 text-sm truncate block">
                  {releaseTitles[track.release_id] || "Unknown Album"}
                </span> */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* <div className="flex items-center space-x-1 text-gray-400">
                <FontAwesomeIcon icon={faHeart} size="sm" className="text-red-400" />
                <span className="text-xs">{track.likes?.toLocaleString() || "0"}</span>
              </div> */}
              <span className="text-gray-400 text-xs tabular-nums">
                {track.duration}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(track)}
                  className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                  title="Edit Track"
                >
                  <FontAwesomeIcon icon={faPencil} size="sm" />
                </button>
                <button
                  onClick={() => handleDelete(track)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                  title="Delete Track"
                >
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTrack}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="sm:max-w-[425px] bg-[#0C1521] text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Track</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Track Title
              </label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Duration
              </label>
              <input
                type="text"
                value={trackDuration}
                onChange={(e) => setTrackDuration(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Track URL (GitHub)
              </label>
              <input
                type="url"
                value={trackFile}
                onChange={(e) => setTrackFile(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Update Track
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <CustomAlertDialog
        isOpen={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertTitle}
        description={alertDescription}
        confirmText={onConfirmAction ? "Confirm" : "OK"}
        cancelText={onConfirmAction ? "Cancel" : undefined}
        onConfirm={onConfirmAction ? () => onConfirmAction() : undefined}
        variant={alertVariant}
        className="bg-[#0C1521] text-white border border-gray-700"
      />
    </div>
  );
}
