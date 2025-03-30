"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Release } from "@/lib/types";
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
} from "@fortawesome/free-solid-svg-icons";

export default function TrackList({
  initialTracks,
  sectionTracks,
  viewMode = "default",
}: {
  initialTracks: (Release & { likes?: number })[];
  sectionTracks: Release[];
  viewMode?: "default" | "trackType" | "releaseType" | "available" | "quality";
}) {
  const [tracks, setTracks] =
    useState<(Release & { likes?: number })[]>(initialTracks);
  const [editingTrack, setEditingTrack] = useState<Release | null>(null);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackFile, setTrackFile] = useState("");
  const [trackType, setTrackType] = useState("");
  const [trackAvailable, setTrackAvailable] = useState<
    "Confirmed" | "Partial" | "Snippet" | "Full" | "Rumored" | "OG File" | ""
  >("");
  const [trackQuality, setTrackQuality] = useState<
    | "Not Available"
    | "High Quality"
    | "Recording"
    | "Lossless"
    | "Low Quality"
    | "CD Quality"
    | ""
  >("");
  const [trackFileDate, setTrackFileDate] = useState("");
  const [trackLeakDate, setTrackLeakDate] = useState("");
  const [trackNotes, setTrackNotes] = useState("");
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
  const [hoveredTrackId, setHoveredTrackId] = useState<number | null>(null);

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

  const handleEdit = (track: Release) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    }
    setEditingTrack(track);
    setTrackTitle(track.title);
    setTrackDuration(track.duration);
    setTrackFile(track.file);
    setTrackType(track.type || "");
    setTrackAvailable(track.available || "");
    setTrackQuality(track.quality || "");
    setTrackFileDate(track.file_date || "");
    setTrackLeakDate(track.leak_date || "");
    setTrackNotes(track.notes || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;

    const updatedTrack = {
      title: trackTitle,
      duration: trackDuration,
      file: trackFile.trimEnd(),
      type: trackType || undefined,
      available:
        editingTrack.category !== "released" ? trackAvailable : undefined,
      quality: editingTrack.category !== "released" ? trackQuality : undefined,
      file_date: trackFileDate || undefined,
      leak_date: trackLeakDate || undefined,
      notes: trackNotes || undefined,
      era_id: editingTrack.era_id,
      category: editingTrack.category,
      cover_image: editingTrack.cover_image,
    };

    const { error } = await supabase
      .from("releases")
      .update(updatedTrack)
      .eq("id", editingTrack.id);

    if (error) {
      console.error("Error updating track:", error);
      showAlert("Update Failed", "Failed to update track: " + error.message);
    } else {
      console.log("Track updated:", editingTrack.id);
      showAlert("Success", "Track updated successfully!");
      const updatedTrackWithLikes = {
        ...editingTrack,
        ...updatedTrack,
        likes: tracks.find((t) => t.id === editingTrack.id)?.likes,
      };
      setTracks(
        tracks.map((t) =>
          t.id === editingTrack.id ? updatedTrackWithLikes : t
        )
      );
      if (currentTrack?.id === editingTrack.id) {
        playTrack(updatedTrackWithLikes, sectionTracks);
      }
      setEditingTrack(null);
      setTrackTitle("");
      setTrackDuration("");
      setTrackFile("");
      setTrackType("");
      setTrackAvailable("");
      setTrackQuality("");
      setTrackFileDate("");
      setTrackLeakDate("");
      setTrackNotes("");
    }
  };

  const handleDelete = async (track: Release) => {
    showAlert(
      "Confirm Deletion",
      `Are you sure you want to delete "${track.title}"?`,
      "destructive",
      async () => {
        const { error } = await supabase
          .from("releases")
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
    setTrackType("");
    setTrackAvailable("");
    setTrackQuality("");
    setTrackFileDate("");
    setTrackLeakDate("");
    setTrackNotes("");
  };

  const handlePlayPause = (track: Release) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track, sectionTracks);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === " ") {
      e.stopPropagation();
    }
  };

  const getBadgeStyles = (field: string, value: string) => {
    const baseStyles =
      "px-1.5 py-0.5 text-[10px] rounded-full border border-gray-600";
    switch (field) {
      case "type":
        return `${baseStyles} bg-gray-700 text-gray-200`;
      case "available":
        switch (value) {
          case "Confirmed":
          case "Full":
          case "OG File":
            return `${baseStyles} bg-green-900 text-green-300`;
          case "Partial":
          case "Snippet":
            return `${baseStyles} bg-yellow-900 text-yellow-300`;
          case "Rumored":
            return `${baseStyles} bg-red-900 text-red-300`;
          default:
            return `${baseStyles} bg-gray-700 text-gray-200`;
        }
      case "quality":
        switch (value) {
          case "High Quality":
          case "Lossless":
          case "CD Quality":
            return `${baseStyles} bg-green-900 text-green-300`;
          case "Recording":
          case "Low Quality":
            return `${baseStyles} bg-yellow-900 text-yellow-300`;
          case "Not Available":
            return `${baseStyles} bg-red-900 text-red-300`;
          default:
            return `${baseStyles} bg-gray-700 text-gray-200`;
        }
      default:
        return `${baseStyles} bg-gray-700 text-gray-200`;
    }
  };

  // Categorized View Logic
  const renderCategorizedView = () => {
    const releasedTrackTypeOrder = [
      "Single",
      "Album Track",
      "Loosie",
      "Beat",
      "Remix",
      "Feature",
      "Production",
      "Demo",
    ];

    const releaseTypeOrder = [
      "Beat",
      "Demo",
      "Remix",
      "Throwaway",
      "Cancer",
      "Unknown",
      "Project File",
      "Reference",
      "ALT File",
      "Feature",
      "Cover",
    ];

    const additionalTypeOrder = [
      "Fragments", // Maps to "Music" in DB
      "Features With",
      "Features Without",
      "Early Sessions",
      "Instrumentals",
      "Acapellas",
      "Stems",
      "Dolby Atmos",
      "Sessions",
      "TV Tracks",
    ];

    const availableOrder = [
      "Confirmed",
      "Partial",
      "Snippet",
      "Full",
      "Rumored",
      "OG File",
    ];

    const qualityOrder = [
      "High Quality",
      "Recording",
      "Lossless",
      "Low Quality",
      "CD Quality",
      "Not Available",
    ];

    let groupedTracks;
    if (sectionTracks[0]?.category === "released") {
      // Released: Only categorize by trackType using a limited set
      if (viewMode === "trackType") {
        groupedTracks = releasedTrackTypeOrder
          .map((type) => ({
            type,
            tracks: tracks.filter((t) => t.type === type),
          }))
          .filter((group) => group.tracks.length > 0);
        // Add tracks with no type or outside list as "Unknown"
        const noTypeTracks = tracks.filter(
          (t) => !t.type || !releasedTrackTypeOrder.includes(t.type)
        );
        if (noTypeTracks.length > 0) {
          groupedTracks.push({ type: "Unknown", tracks: noTypeTracks });
        }
      } else {
        groupedTracks = [];
      }
    } else {
      // Unreleased/Stems: Categorize based on viewMode
      if (viewMode === "trackType") {
        groupedTracks = additionalTypeOrder
          .map((type) => ({
            type,
            tracks: tracks.filter(
              (t) => t.track_type === (type === "Fragments" ? "Music" : type)
            ),
          }))
          .filter((group) => group.tracks.length > 0);
        // Add tracks with no track_type as "Unknown"
        const noTrackTypeTracks = tracks.filter(
          (t) => !t.track_type || !additionalTypeOrder.includes(t.track_type)
        );
        if (noTrackTypeTracks.length > 0) {
          groupedTracks.push({ type: "Unknown", tracks: noTrackTypeTracks });
        }
      } else if (viewMode === "releaseType") {
        groupedTracks = releaseTypeOrder
          .map((type) => ({
            type,
            tracks: tracks.filter((t) => t.type === type),
          }))
          .filter((group) => group.tracks.length > 0);
        // Add tracks with no type or outside list as "Unknown"
        const noTypeTracks = tracks.filter(
          (t) => !t.type || !releaseTypeOrder.includes(t.type)
        );
        if (noTypeTracks.length > 0) {
          groupedTracks.push({ type: "Unknown", tracks: noTypeTracks });
        }
      } else if (viewMode === "available") {
        groupedTracks = availableOrder
          .map((available) => ({
            type: available,
            tracks: tracks.filter((t) => t.available === available),
          }))
          .filter((group) => group.tracks.length > 0);
        // Add tracks with no availability as "Unknown"
        const noAvailableTracks = tracks.filter(
          (t) => !t.available || !availableOrder.includes(t.available)
        );
        if (noAvailableTracks.length > 0) {
          groupedTracks.push({ type: "Unknown", tracks: noAvailableTracks });
        }
      } else if (viewMode === "quality") {
        groupedTracks = qualityOrder
          .map((quality) => ({
            type: quality,
            tracks: tracks.filter((t) => t.quality === quality),
          }))
          .filter((group) => group.tracks.length > 0);
        // Add tracks with no quality as "Not Available"
        const noQualityTracks = tracks.filter(
          (t) => !t.quality || !qualityOrder.includes(t.quality)
        );
        if (noQualityTracks.length > 0) {
          groupedTracks.push({
            type: "Not Available",
            tracks: noQualityTracks,
          });
        }
      } else {
        groupedTracks = [];
      }
    }

    if (groupedTracks.length === 0) {
      return (
        <p className="text-gray-400">No tracks available for this view.</p>
      );
    }

    return (
      <div className="space-y-6">
        {groupedTracks.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-lg font-semibold text-white mb-2">
              {group.type}
            </h3>
            <ul className="space-y-2">
              {group.tracks.map((track, index) => (
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
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {track.type && (
                      <span className={getBadgeStyles("type", track.type)}>
                        {track.type}
                      </span>
                    )}
                    {track.category !== "released" && track.available && (
                      <span
                        className={getBadgeStyles("available", track.available)}
                      >
                        {track.available}
                      </span>
                    )}
                    {track.category !== "released" && track.quality && (
                      <span
                        className={getBadgeStyles("quality", track.quality)}
                      >
                        {track.quality}
                      </span>
                    )}
                    <span className="ml-3 text-gray-400 text-xs tabular-nums">
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
          </div>
        ))}
      </div>
    );
  };

  const renderDefaultView = () => (
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
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {track.type && (
              <span className={getBadgeStyles("type", track.type)}>
                {track.type}
              </span>
            )}
            {track.category !== "released" && track.available && (
              <span className={getBadgeStyles("available", track.available)}>
                {track.available}
              </span>
            )}
            {track.category !== "released" && track.quality && (
              <span className={getBadgeStyles("quality", track.quality)}>
                {track.quality}
              </span>
            )}
            <span className="ml-3 text-gray-400 text-xs tabular-nums">
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
  );

  return (
    <div>
      {viewMode === "default" ? renderDefaultView() : renderCategorizedView()}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTrack}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="sm:max-w-[425px] bg-[#0C1521] text-white border border-gray-700 max-h-[80vh] overflow-y-auto">
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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Release Type
              </label>
              <select
                value={trackType}
                onChange={(e) => setTrackType(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="Beat">Beat</option>
                <option value="Demo">Demo</option>
                <option value="Remix">Remix</option>
                <option value="Throwaway">Throwaway</option>
                <option value="Cancer">Cancer</option>
                <option value="Unknown">Unknown</option>
                <option value="Project File">Project File</option>
                <option value="Reference">Reference</option>
                <option value="ALT File">ALT File</option>
                <option value="Feature">Feature</option>
                <option value="Cover">Cover</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                File Date
              </label>
              <input
                type="date"
                value={trackFileDate}
                onChange={(e) => setTrackFileDate(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Leak Date
              </label>
              <input
                type="date"
                value={trackLeakDate}
                onChange={(e) => setTrackLeakDate(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {editingTrack?.category !== "released" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Available
                  </label>
                  <select
                    value={trackAvailable}
                    onChange={(e) =>
                      setTrackAvailable(
                        e.target.value as
                          | "Confirmed"
                          | "Partial"
                          | "Snippet"
                          | "Full"
                          | "Rumored"
                          | "OG File"
                          | ""
                      )
                    }
                    className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Select availability
                    </option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Partial">Partial</option>
                    <option value="Snippet">Snippet</option>
                    <option value="Full">Full</option>
                    <option value="Rumored">Rumored</option>
                    <option value="OG File">OG File</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Quality
                  </label>
                  <select
                    value={trackQuality}
                    onChange={(e) =>
                      setTrackQuality(
                        e.target.value as
                          | "Not Available"
                          | "High Quality"
                          | "Recording"
                          | "Lossless"
                          | "Low Quality"
                          | "CD Quality"
                          | ""
                      )
                    }
                    className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Select quality
                    </option>
                    <option value="Not Available">Not Available</option>
                    <option value="High Quality">High Quality</option>
                    <option value="Recording">Recording</option>
                    <option value="Lossless">Lossless</option>
                    <option value="Low Quality">Low Quality</option>
                    <option value="CD Quality">CD Quality</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Notes
              </label>
              <textarea
                value={trackNotes}
                onChange={(e) => setTrackNotes(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any notes"
                rows={3}
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
