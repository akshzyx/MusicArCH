"use client";

import { useState, useEffect } from "react";
import { Release } from "@/lib/types";
import { useAudio } from "@/lib/AudioContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faChevronDown,
  faDownload,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@clerk/nextjs";
import EditTrackDialog from "./EditTrackDialog";
import { supabase } from "@/lib/supabase";

export default function TrackList({
  initialTracks,
  sectionTracks,
  viewMode = "trackType",
}: {
  initialTracks: (Release & { credit?: string; og_filename?: string })[];
  sectionTracks: Release[];
  viewMode?: "trackType" | "releaseType" | "available" | "quality" | "default";
}) {
  const { isSignedIn, user } = useUser();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";
  const [tracks, setTracks] =
    useState<(Release & { credit?: string; og_filename?: string })[]>(
      initialTracks
    );
  const {
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    stopTrack,
    setSectionTracks,
  } = useAudio();
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [expandedTracks, setExpandedTracks] = useState<Set<number>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  // State for EditTrackDialog
  const [editingTrack, setEditingTrack] = useState<Release | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertVariant, setAlertVariant] = useState<"default" | "destructive">(
    "default"
  );
  const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(
    null
  );

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
    if (!isAdmin) {
      showAlert("Unauthorized", "Only admins can edit tracks.");
      return;
    }
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    }
    setEditingTrack(track);
  };

  const handleDelete = async (track: Release) => {
    if (!isAdmin) {
      showAlert("Unauthorized", "Only admins can delete tracks.");
      return;
    }
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

  // Function to handle download
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "track"; // Fallback filename if none provided
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setTracks(initialTracks);
  }, [initialTracks]);

  useEffect(() => {
    if (viewMode === "default") {
      setSectionTracks(tracks);
    } else {
      const releasedTrackTypeOrder = [
        "Single",
        "Album Track",
        "Loosie",
        "Beat",
        "Remix",
        "Feature",
        "Production",
        "Demo",
        "Instrumental",
      ];
      const additionalTypeOrder = [
        "Fragments",
        "Features With",
        "Features Without",
        "Early Sessions",
        "Blackpond Studio Sessions",
        "The CRC Sessions",
        "Timeshift Studios Sessions",
        "No Name Studios Sessions",
        "The Fab Factory Recording Studio Sessions",
        "WeDidIt Studios Sessions",
        "Songs from Unknown Studio Sessions",
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
        "Tagged",
      ];
      const qualityOrder = [
        "High Quality",
        "Recording",
        "Lossless",
        "Low Quality",
        "CD Quality",
        "Not Available",
      ];

      let flatTracks: Release[] = [];
      if (
        sectionTracks[0]?.category === "released" &&
        viewMode === "trackType"
      ) {
        flatTracks = releasedTrackTypeOrder
          .flatMap((type) => tracks.filter((t) => t.type === type))
          .concat(
            tracks.filter(
              (t) => !t.type || !releasedTrackTypeOrder.includes(t.type)
            )
          );
      } else if (viewMode === "trackType") {
        const categorizedTrackIds = new Set<number>();
        flatTracks = additionalTypeOrder.flatMap((type) => {
          const matchedTracks = tracks.filter((t) => {
            const isMatch =
              t.track_type === (type === "Fragments" ? "Music" : type);
            if (isMatch) categorizedTrackIds.add(t.id);
            return isMatch;
          });
          return matchedTracks;
        });
        const allTrackTypes = [
          "Music",
          "Features With",
          "Features Without",
          "Early Sessions",
          "Blackpond Studio Sessions",
          "The CRC Sessions",
          "Timeshift Studios Sessions",
          "No Name Studios Sessions",
          "The Fab Factory Recording Studio Sessions",
          "WeDidIt Studios Sessions",
          "Songs from Unknown Studio Sessions",
          "Instrumentals",
          "Acapellas",
          "Stems",
          "Dolby Atmos",
          "Sessions",
          "TV Tracks",
        ];
        const noTrackTypeTracks = tracks.filter(
          (t) =>
            !categorizedTrackIds.has(t.id) &&
            (!t.track_type || !allTrackTypes.includes(t.track_type))
        );
        flatTracks = flatTracks.concat(noTrackTypeTracks);
      } else if (viewMode === "releaseType") {
        const isStemsCategory = sectionTracks[0]?.category === "stems";
        const stemsReleaseTypeOrder = [
          "Instrumental",
          "Acapella",
          "Stems",
          "Mix",
          "Session",
          "TV Track",
        ];
        const standardReleaseTypeOrder = [
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
          "Voice Memo",
        ];
        const releaseTypeOrder = isStemsCategory
          ? stemsReleaseTypeOrder
          : standardReleaseTypeOrder;

        flatTracks = releaseTypeOrder
          .flatMap((type) => tracks.filter((t) => t.type === type))
          .concat(
            tracks.filter((t) => !t.type || !releaseTypeOrder.includes(t.type))
          );
      } else if (viewMode === "available") {
        flatTracks = availableOrder
          .flatMap((type) => tracks.filter((t) => t.available === type))
          .concat(
            tracks.filter(
              (t) => !t.available || !availableOrder.includes(t.available)
            )
          );
      } else if (viewMode === "quality") {
        flatTracks = qualityOrder
          .flatMap((type) => tracks.filter((t) => t.quality === type))
          .concat(
            tracks.filter(
              (t) => !t.quality || !qualityOrder.includes(t.quality)
            )
          );
      }
      setSectionTracks(flatTracks);
    }
  }, [viewMode, tracks, sectionTracks, setSectionTracks]);

  const isTrackPlayable = (track: Release) => {
    return !!track.file && track.file.trim() !== "";
  };

  const handlePlayPause = (track: Release, trackList: Release[]) => {
    if (!isTrackPlayable(track)) {
      return;
    }

    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track, trackList);
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
          case "Tagged":
            return `${baseStyles} bg-blue-900 text-blue-300`;
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

  const toggleTrack = (trackId: number) => {
    setExpandedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) newSet.delete(trackId);
      else newSet.add(trackId);
      return newSet;
    });
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) newSet.delete(folderPath);
      else newSet.add(folderPath);
      return newSet;
    });
  };

  const renderJsonContent = (
    json: Release["multi_files"],
    trackId: number,
    path: string = ""
  ) => {
    if (!json) return null;

    // Separate folders and files
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const folders: [string, any][] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files: [string, any][] = [];

    Object.entries(json).forEach(([key, value]) => {
      const isFolder = typeof value === "object" && !("url" in value);
      if (isFolder) {
        folders.push([key, value]);
      } else {
        files.push([key, value]);
      }
    });

    const renderFolders = folders.map(([key, value], index) => {
      const currentPath = path ? `${path}/${key}` : key;
      const isExpanded = expandedFolders.has(`${trackId}-${currentPath}`);
      return (
        <div key={currentPath} className="ml-6 mt-2">
          <div
            className="flex items-center py-1 px-2 cursor-pointer hover:bg-gray-800/50 rounded-lg bg-gray-700/20"
            onClick={() => toggleFolder(`${trackId}-${currentPath}`)}
          >
            <span className="w-5 h-5 flex items-center justify-center text-xs text-gray-400">
              {isExpanded ? (
                <FontAwesomeIcon icon={faChevronDown} size="xs" />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </span>
            <span className="ml-3 text-gray-200 font-semibold">{key}</span>
          </div>
          {isExpanded && (
            <div className="ml-2 mt-2">
              {renderJsonContent(
                value as Release["multi_files"],
                trackId,
                currentPath
              )}
            </div>
          )}
        </div>
      );
    });

    const renderFiles = files.map(([key, value], index) => {
      const currentPath = path ? `${path}/${key}` : key;
      const file = value as {
        url: string;
        duration: string;
        size: number;
        type: string;
        sha: string;
      };
      const isPlayable = !!file.url && file.url.trim() !== "";
      const parentTrack = tracks.find((t) => t.id === trackId);
      const syntheticTrack: Release = {
        id: parseInt(`${trackId}${index}`, 10),
        title: key,
        file: file.url,
        duration: file.duration,
        era_id: parentTrack?.era_id || "",
        category: parentTrack?.category || "unreleased",
        cover_image: parentTrack?.cover_image || "",
      };
      return (
        <div
          key={currentPath}
          className={`flex items-center py-1.5 px-2 ml-6 mt-2 rounded-lg transition-all duration-200 ${
            isPlayable
              ? currentTrack?.id === syntheticTrack.id
                ? "bg-gray-700/50 text-white"
                : "hover:bg-gray-700/50 hover:text-white"
              : "bg-gray-900/50 text-gray-500 cursor-not-allowed opacity-75"
          }`}
          onMouseEnter={() =>
            isPlayable && setHoveredTrackId(syntheticTrack.id.toString())
          }
          onMouseLeave={() => setHoveredTrackId(null)}
        >
          <button
            onClick={() => handlePlayPause(syntheticTrack, tracks)}
            className={`w-5 h-5 flex items-center justify-center text-xs rounded-full transition-colors ${
              isPlayable
                ? currentTrack?.id === syntheticTrack.id && isPlaying
                  ? "text-green-400"
                  : "text-gray-400 hover:text-green-400"
                : "text-gray-600 cursor-not-allowed"
            }`}
            disabled={!isPlayable}
          >
            {isPlayable ? (
              currentTrack?.id === syntheticTrack.id ? (
                isPlaying ? (
                  <FontAwesomeIcon icon={faPause} size="xs" />
                ) : (
                  <FontAwesomeIcon icon={faPlay} size="xs" />
                )
              ) : hoveredTrackId === syntheticTrack.id.toString() ? (
                <FontAwesomeIcon icon={faPlay} size="xs" />
              ) : (
                <span className="text-gray-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )
            ) : (
              <span className="text-gray-600">
                {String(index + 1).padStart(2, "0")}
              </span>
            )}
          </button>
          <span
            className={`font-medium truncate flex-1 ml-3 ${
              isPlayable ? "text-white" : "text-gray-500"
            }`}
          >
            {key}
            {!isPlayable && (
              <span className="text-gray-600 text-xs ml-1">
                (Not Available)
              </span>
            )}
          </span>
          <span
            className={`ml-3 text-xs tabular-nums ${
              isPlayable ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {file.duration}
          </span>
          {isPlayable && (
            <button
              onClick={() => handleDownload(file.url, key)}
              className="ml-3 text-blue-400 hover:text-blue-300 transition-colors p-1"
              title="Download Track"
            >
              <FontAwesomeIcon icon={faDownload} size="sm" />
            </button>
          )}
        </div>
      );
    });

    return (
      <>
        {renderFolders}
        {renderFiles}
      </>
    );
  };

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
      "Instrumental",
    ];

    const stemsReleaseTypeOrder = [
      "Instrumental",
      "Acapella",
      "Stems",
      "Mix",
      "Session",
      "TV Track",
    ];
    const standardReleaseTypeOrder = [
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
      "Voice Memo",
    ];

    const additionalTypeOrder = [
      "Fragments",
      "Features With",
      "Features Without",
      "Early Sessions",
      "Blackpond Studio Sessions",
      "The CRC Sessions",
      "Timeshift Studios Sessions",
      "No Name Studios Sessions",
      "The Fab Factory Recording Studio Sessions",
      "WeDidIt Studios Sessions",
      "Songs from Unknown Studio Sessions",
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
      "Tagged",
    ];

    const qualityOrder = [
      "High Quality",
      "Recording",
      "Lossless",
      "Low Quality",
      "CD Quality",
      "Not Available",
    ];

    let groupedTracks: { type: string; tracks: Release[] }[];
    if (sectionTracks[0]?.category === "released") {
      if (viewMode === "trackType") {
        groupedTracks = releasedTrackTypeOrder
          .map((type) => ({
            type,
            tracks: tracks.filter((t) => t.type === type),
          }))
          .filter((group) => group.tracks.length > 0);
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
      const isStemsCategory = sectionTracks[0]?.category === "stems";
      const releaseTypeOrder = isStemsCategory
        ? stemsReleaseTypeOrder
        : standardReleaseTypeOrder;

      if (viewMode === "trackType") {
        groupedTracks = additionalTypeOrder
          .map((type) => ({
            type,
            tracks: tracks.filter(
              (t) => t.track_type === (type === "Fragments" ? "Music" : type)
            ),
          }))
          .filter((group) => group.tracks.length > 0);
        const allTrackTypes = [
          "Music",
          "Features With",
          "Features Without",
          "Early Sessions",
          "Blackpond Studio Sessions",
          "The CRC Sessions",
          "Timeshift Studios Sessions",
          "No Name Studios Sessions",
          "The Fab Factory Recording Studio Sessions",
          "WeDidIt Studios Sessions",
          "Songs from Unknown Studio Sessions",
          "Instrumentals",
          "Acapellas",
          "Stems",
          "Dolby Atmos",
          "Sessions",
          "TV Tracks",
        ];
        const noTrackTypeTracks = tracks.filter(
          (t) => !t.track_type || !allTrackTypes.includes(t.track_type)
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
        <p className="text-gray-400">
          No tracks available for Broadus this view.
        </p>
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
              {group.tracks.map((track, index) => {
                const isExpanded = expandedTracks.has(track.id);
                const hasMultiFiles =
                  track.multi_files &&
                  Object.keys(track.multi_files).length > 0;
                return (
                  <li key={track.id} className="flex flex-col">
                    <div
                      className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                        isTrackPlayable(track) || hasMultiFiles
                          ? currentTrack?.id === track.id
                            ? "bg-gray-700/50 text-white"
                            : "hover:bg-gray-700/50 hover:text-white"
                          : "bg-gray-900/50 text-gray-500 cursor-not-allowed opacity-75"
                      }`}
                      onMouseEnter={() =>
                        (isTrackPlayable(track) || hasMultiFiles) &&
                        setHoveredTrackId(track.id.toString())
                      }
                      onMouseLeave={() => setHoveredTrackId(null)}
                      onClick={
                        hasMultiFiles ? () => toggleTrack(track.id) : undefined
                      }
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {!hasMultiFiles ? (
                          <button
                            onClick={() => handlePlayPause(track, group.tracks)}
                            className={`w-6 h-6 flex items-center justify-center text-sm rounded-full transition-colors ${
                              isTrackPlayable(track)
                                ? currentTrack?.id === track.id && isPlaying
                                  ? "text-green-400"
                                  : "text-gray-400 hover:text-green-400"
                                : "text-gray-600 cursor-not-allowed"
                            }`}
                            disabled={!isTrackPlayable(track)}
                          >
                            {isTrackPlayable(track) ? (
                              currentTrack?.id === track.id ? (
                                isPlaying ? (
                                  <FontAwesomeIcon icon={faPause} size="xs" />
                                ) : (
                                  <FontAwesomeIcon icon={faPlay} size="xs" />
                                )
                              ) : hoveredTrackId === track.id.toString() ? (
                                <FontAwesomeIcon icon={faPlay} size="xs" />
                              ) : (
                                <span className="text-gray-400">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                              )
                            ) : (
                              <span className="text-gray-600">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="w-6 h-6 flex items-center justify-center text-sm text-gray-400">
                            {isExpanded ? (
                              <FontAwesomeIcon icon={faChevronDown} size="xs" />
                            ) : hoveredTrackId === track.id.toString() ? (
                              <FontAwesomeIcon icon={faChevronDown} size="xs" />
                            ) : (
                              String(index + 1).padStart(2, "0")
                            )}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`font-medium truncate block ${
                              isTrackPlayable(track) || hasMultiFiles
                                ? "text-white"
                                : "text-gray-500"
                            }`}
                          >
                            {track.title}{" "}
                            {track.credit && (
                              <span
                                className={
                                  isTrackPlayable(track) || hasMultiFiles
                                    ? "text-gray-400 text-xs"
                                    : "text-gray-600 text-xs"
                                }
                              >
                                {track.credit}
                              </span>
                            )}
                            {!isTrackPlayable(track) && !hasMultiFiles && (
                              <span className="text-gray-600 text-xs ml-1">
                                (Not Available)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {track.type && (
                          <span
                            className={`${getBadgeStyles(
                              "type",
                              track.type
                            )} hidden sm:inline-block`}
                          >
                            {track.type}
                          </span>
                        )}
                        {track.category !== "released" && track.available && (
                          <span
                            className={`${getBadgeStyles(
                              "available",
                              track.available
                            )} hidden sm:inline-block`}
                          >
                            {track.available}
                          </span>
                        )}
                        {track.category !== "released" && track.quality && (
                          <span
                            className={`${getBadgeStyles(
                              "quality",
                              track.quality
                            )} hidden sm:inline-block`}
                          >
                            {track.quality}
                          </span>
                        )}
                        <span
                          className={`ml-3 text-xs tabular-nums ${
                            isTrackPlayable(track) || hasMultiFiles
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {track.duration}
                        </span>
                        {isTrackPlayable(track) && (
                          <button
                            onClick={() =>
                              handleDownload(track.file, track.title)
                            }
                            className="ml-3 text-blue-400 hover:text-blue-300 transition-colors p-1"
                            title="Download Track"
                          >
                            <FontAwesomeIcon icon={faDownload} size="sm" />
                          </button>
                        )}
                        {isAdmin && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(track)}
                              className={
                                isTrackPlayable(track) || hasMultiFiles
                                  ? "text-blue-400 hover:text-blue-300 transition-colors p-1"
                                  : "text-blue-600 p-1"
                              }
                              title="Edit Track"
                            >
                              <FontAwesomeIcon icon={faPencil} size="sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(track)}
                              className={
                                isTrackPlayable(track) || hasMultiFiles
                                  ? "text-red-400 hover:text-red-300 transition-colors p-1"
                                  : "text-red-600 p-1"
                              }
                              title="Delete Track"
                            >
                              <FontAwesomeIcon icon={faTrash} size="sm" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {hasMultiFiles && isExpanded && (
                      <div className="mt-2">
                        {renderJsonContent(track.multi_files, track.id)}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderDefaultView = () => (
    <ul className="space-y-2">
      {tracks.map((track, index) => {
        const isExpanded = expandedTracks.has(track.id);
        const hasMultiFiles =
          track.multi_files && Object.keys(track.multi_files).length > 0;
        return (
          <li key={track.id} className="flex flex-col">
            <div
              className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isTrackPlayable(track) || hasMultiFiles
                  ? currentTrack?.id === track.id
                    ? "bg-gray-700/50 text-white"
                    : "hover:bg-gray-700/50 hover:text-white"
                  : "bg-gray-900/50 text-gray-500 cursor-not-allowed opacity-75"
              }`}
              onMouseEnter={() =>
                (isTrackPlayable(track) || hasMultiFiles) &&
                setHoveredTrackId(track.id.toString())
              }
              onMouseLeave={() => setHoveredTrackId(null)}
              onClick={hasMultiFiles ? () => toggleTrack(track.id) : undefined}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {!hasMultiFiles ? (
                  <button
                    onClick={() => handlePlayPause(track, tracks)}
                    className={`w-6 h-6 flex items-center justify-center text-sm rounded-full transition-colors ${
                      isTrackPlayable(track)
                        ? currentTrack?.id === track.id && isPlaying
                          ? "text-green-400"
                          : "text-gray-400 hover:text-green-400"
                        : "text-gray-600 cursor-not-allowed"
                    }`}
                    disabled={!isTrackPlayable(track)}
                  >
                    {isTrackPlayable(track) ? (
                      currentTrack?.id === track.id ? (
                        isPlaying ? (
                          <FontAwesomeIcon icon={faPause} size="xs" />
                        ) : (
                          <FontAwesomeIcon icon={faPlay} size="xs" />
                        )
                      ) : hoveredTrackId === track.id.toString() ? (
                        <FontAwesomeIcon icon={faPlay} size="xs" />
                      ) : (
                        <span className="text-gray-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="w-6 h-6 flex items-center justify-center text-sm text-gray-400">
                    {isExpanded ? (
                      <FontAwesomeIcon icon={faChevronDown} size="xs" />
                    ) : hoveredTrackId === track.id.toString() ? (
                      <FontAwesomeIcon icon={faChevronDown} size="xs" />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className={`font-medium truncate block ${
                      isTrackPlayable(track) || hasMultiFiles
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {track.title}{" "}
                    {track.credit && (
                      <span
                        className={
                          isTrackPlayable(track) || hasMultiFiles
                            ? "text-gray-400 text-xs"
                            : "text-gray-600 text-xs"
                        }
                      >
                        {track.credit}
                      </span>
                    )}
                    {!isTrackPlayable(track) && !hasMultiFiles && (
                      <span className="text-gray-600 text-xs ml-1">
                        (Not Available)
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {track.type && (
                  <span
                    className={`${getBadgeStyles(
                      "type",
                      track.type
                    )} hidden sm:inline-block`}
                  >
                    {track.type}
                  </span>
                )}
                {track.category !== "released" && track.available && (
                  <span
                    className={`${getBadgeStyles(
                      "available",
                      track.available
                    )} hidden sm:inline-block`}
                  >
                    {track.available}
                  </span>
                )}
                {track.category !== "released" && track.quality && (
                  <span
                    className={`${getBadgeStyles(
                      "quality",
                      track.quality
                    )} hidden sm:inline-block`}
                  >
                    {track.quality}
                  </span>
                )}
                <span
                  className={`ml-3 text-xs tabular-nums ${
                    isTrackPlayable(track) || hasMultiFiles
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  {track.duration}
                </span>
                {isTrackPlayable(track) && (
                  <button
                    onClick={() => handleDownload(track.file, track.title)}
                    className="ml-3 text-blue-400 hover:text-blue-300 transition-colors p-1"
                    title="Download Track"
                  >
                    <FontAwesomeIcon icon={faDownload} size="sm" />
                  </button>
                )}
                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(track)}
                      className={
                        isTrackPlayable(track) || hasMultiFiles
                          ? "text-blue-400 hover:text-blue-300 transition-colors p-1"
                          : "text-blue-600 p-1"
                      }
                      title="Edit Track"
                    >
                      <FontAwesomeIcon icon={faPencil} size="sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(track)}
                      className={
                        isTrackPlayable(track) || hasMultiFiles
                          ? "text-red-400 hover:text-red-300 transition-colors p-1"
                          : "text-red-600 p-1"
                      }
                      title="Delete Track"
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {hasMultiFiles && isExpanded && (
              <div className="mt-2">
                {renderJsonContent(track.multi_files, track.id)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      {viewMode === "default" ? renderDefaultView() : renderCategorizedView()}
      <EditTrackDialog
        tracks={tracks}
        setTracks={setTracks}
        editingTrack={editingTrack}
        setEditingTrack={setEditingTrack}
        alertOpen={alertOpen}
        setAlertOpen={setAlertOpen}
        alertTitle={alertTitle}
        setAlertTitle={setAlertTitle}
        alertDescription={alertDescription}
        setAlertDescription={setAlertDescription}
        alertVariant={alertVariant}
        setAlertVariant={setAlertVariant}
        onConfirmAction={onConfirmAction}
        setOnConfirmAction={setOnConfirmAction}
      />
    </div>
  );
}
