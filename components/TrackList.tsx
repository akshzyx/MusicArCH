"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Track } from "@/lib/types";
import { useAudio } from "@/lib/AudioContext";

export default function TrackList({
  initialTracks,
}: {
  initialTracks: Track[];
}) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackFile, setTrackFile] = useState("");
  const { currentTrack, isPlaying, playTrack, pauseTrack, stopTrack } =
    useAudio();

  useEffect(() => {
    setTracks(initialTracks);
  }, [initialTracks]);

  const handleEdit = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack(); // Pause only if this track is playing
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
      alert("Failed to update track: " + error.message);
    } else {
      console.log("Track updated:", editingTrack.id);
      alert("Track updated successfully!");
      setTracks(
        tracks.map((t) => (t.id === editingTrack.id ? updatedTrack : t))
      );
      if (currentTrack?.id === editingTrack.id) {
        playTrack(updatedTrack); // Resume with updated track
      }
      setEditingTrack(null);
      setTrackTitle("");
      setTrackDuration("");
      setTrackFile("");
    }
  };

  const handleDelete = async (track: Track) => {
    if (!confirm(`Are you sure you want to delete "${track.title}"?`)) return;

    const { error } = await supabase.from("tracks").delete().eq("id", track.id);

    if (error) {
      console.error("Error deleting track:", error);
      alert("Failed to delete track: " + error.message);
    } else {
      console.log("Track deleted:", track.id);
      alert("Track deleted successfully!");
      setTracks(tracks.filter((t) => t.id !== track.id));
      if (currentTrack?.id === track.id) {
        stopTrack();
      }
    }
  };

  const handleCancel = () => {
    setEditingTrack(null);
    setTrackTitle("");
    setTrackDuration("");
    setTrackFile("");
  };

  return (
    <>
      <ul className="mt-2 space-y-2">
        {tracks.map((track) => (
          <li key={track.id} className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  currentTrack?.id === track.id && isPlaying
                    ? pauseTrack()
                    : playTrack(track)
                }
                className={`text-green-500 hover:text-green-700 ${
                  currentTrack?.id === track.id && isPlaying
                    ? "text-yellow-500"
                    : ""
                }`}
              >
                {currentTrack?.id === track.id && isPlaying
                  ? "❚❚ Pause"
                  : "▶ Play"}
              </button>
              <span className="text-foreground">
                {track.title} ({track.duration})
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(track)}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(track)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingTrack && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Edit Track
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Track Title
                </label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  className="w-full p-2 border rounded bg-background text-foreground"
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
                  className="w-full p-2 border rounded bg-background text-foreground"
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
                  className="w-full p-2 border rounded bg-background text-foreground"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Track
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
