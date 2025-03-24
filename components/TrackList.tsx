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
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function TrackList({
  initialTracks,
  sectionTracks, // Add sectionTracks prop
}: {
  initialTracks: Track[];
  sectionTracks: Track[];
}) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
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

  useEffect(() => {
    setTracks(initialTracks);
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
        playTrack(updatedTrack, sectionTracks); // Update with sectionTracks
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
      playTrack(track, sectionTracks); // Pass sectionTracks here
    }
  };

  return (
    <>
      <ul className="mt-2 space-y-2">
        {tracks.map((track) => (
          <li key={track.id} className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePlayPause(track)}
                className={`text-green-500 hover:text-green-700 ${
                  currentTrack?.id === track.id && isPlaying
                    ? "text-yellow-500"
                    : ""
                }`}
              >
                {currentTrack?.id === track.id && isPlaying ? "❚❚" : "▶"}
              </button>
              <span className="text-foreground">
                {track.title} ({track.duration})
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(track)}
                className="text-blue-500 hover:text-blue-700"
                title="Edit Track"
              >
                <FontAwesomeIcon icon={faPencil} />
              </button>
              <button
                onClick={() => handleDelete(track)}
                className="text-red-500 hover:text-red-700"
                title="Delete Track"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        open={!!editingTrack}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Track Title
              </label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                className="w-full p-2 border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Duration
              </label>
              <input
                type="text"
                value={trackDuration}
                onChange={(e) => setTrackDuration(e.target.value)}
                className="w-full p-2 border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Track URL (GitHub)
              </label>
              <input
                type="url"
                value={trackFile}
                onChange={(e) => setTrackFile(e.target.value)}
                className="w-full p-2 border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update Track
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CustomAlertDialog
        isOpen={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertTitle}
        description={alertDescription}
        confirmText={onConfirmAction ? "Confirm" : "OK"}
        cancelText={onConfirmAction ? "Cancel" : undefined}
        onConfirm={onConfirmAction ? () => onConfirmAction() : undefined}
        variant={alertVariant}
      />
    </>
  );
}
