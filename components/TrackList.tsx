"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchGitHubRepoContents } from "@/lib/github";
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
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@clerk/nextjs";

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
  const [editingTrack, setEditingTrack] = useState<Release | null>(null);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackFile, setTrackFile] = useState("");
  const [isMultiFiles, setIsMultiFiles] = useState(false);
  const [trackType, setTrackType] = useState("");
  const [trackTrackType, setTrackTrackType] = useState("");
  const [trackAvailable, setTrackAvailable] = useState<
    | "Confirmed"
    | "Partial"
    | "Snippet"
    | "Full"
    | "Rumored"
    | "OG File"
    | "Tagged"
    | undefined
  >(undefined);
  const [trackQuality, setTrackQuality] = useState<
    | "Not Available"
    | "High Quality"
    | "Recording"
    | "Lossless"
    | "Low Quality"
    | "CD Quality"
    | undefined
  >(undefined);
  const [trackFileDate, setTrackFileDate] = useState("");
  const [trackLeakDate, setTrackLeakDate] = useState("");
  const [trackNotes, setTrackNotes] = useState("");
  const [trackCredit, setTrackCredit] = useState("");
  const [trackCoverImage, setTrackCoverImage] = useState("");
  const [trackOgFilename, setTrackOgFilename] = useState("");
  const {
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    stopTrack,
    setSectionTracks,
  } = useAudio();
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
  const [expandedTracks, setExpandedTracks] = useState<Set<number>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

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
    setTrackTitle(track.title);
    setTrackDuration(track.duration);
    setTrackFile(track.file);
    setIsMultiFiles(
      track.category === "stems" && !!track.multi_files && !track.file
    );
    setTrackType(track.type || "");
    setTrackTrackType(track.track_type || "");
    setTrackAvailable(track.available);
    setTrackQuality(track.quality);
    setTrackFileDate(
      track.file_date
        ? new Date(track.file_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : ""
    );
    setTrackLeakDate(
      track.leak_date
        ? new Date(track.leak_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : ""
    );
    setTrackNotes(track.notes || "");
    setTrackCredit(track.credit || "");
    setTrackCoverImage(track.cover_image || "");
    setTrackOgFilename(track.og_filename || "");
  };

  const parseDate = (input: string): string | undefined => {
    if (!input) return undefined;

    const existingFormatRegex = /^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/;
    if (existingFormatRegex.test(input)) {
      const [monthStr, day, year] = input.match(existingFormatRegex)!.slice(1);
      const months: { [key: string]: string } = {
        jan: "01",
        feb: "02",
        mar: "03",
        apr: "04",
        may: "05",
        jun: "06",
        jul: "07",
        aug: "08",
        sep: "09",
        oct: "10",
        nov: "11",
        dec: "12",
      };
      const month = months[monthStr.toLowerCase()];
      if (!month) return undefined;
      const dayPadded = day.padStart(2, "0");
      if (parseInt(day) < 1 || parseInt(day) > 31) return undefined;
      return `${year}-${month}-${dayPadded}`;
    }

    if (/^\d{4}$/.test(input)) {
      return `${input}-01-01`;
    }

    const dateRegex = /^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/;
    const match = input.match(dateRegex);
    if (match) {
      const [, monthStr, day, year] = match;
      const months: { [key: string]: string } = {
        jan: "01",
        feb: "02",
        mar: "03",
        apr: "04",
        may: "05",
        jun: "06",
        jul: "07",
        aug: "08",
        sep: "09",
        oct: "10",
        nov: "11",
        dec: "12",
      };
      const month = months[monthStr.toLowerCase()];
      if (!month) return undefined;
      const dayPadded = day.padStart(2, "0");
      if (parseInt(day) < 1 || parseInt(day) > 31) return undefined;
      return `${year}-${month}-${dayPadded}`;
    }

    return undefined;
  };

  const calculateTotalDuration = (
    multiFiles: Release["multi_files"]
  ): string => {
    if (!multiFiles) return "0:00";

    let totalSeconds = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traverse = (obj: any) => {
      for (const key in obj) {
        const value = obj[key];
        if ("duration" in value && value.duration) {
          const [minutes, seconds] = value.duration.split(":").map(Number);
          totalSeconds += minutes * 60 + seconds;
        } else if (typeof value === "object") {
          traverse(value);
        }
      }
    };

    traverse(multiFiles);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showAlert("Unauthorized", "Only admins can update tracks.");
      return;
    }
    if (!editingTrack) return;

    const isPlayable = trackFile.trim() !== "" && !isMultiFiles;
    const isNonReleased = editingTrack.category !== "released";

    if (!trackTitle) {
      showAlert("Validation Error", "Track Title is required.");
      return;
    }

    if (isNonReleased) {
      if (
        !trackFile.trim() &&
        trackQuality !== "Not Available" &&
        !isMultiFiles
      ) {
        showAlert(
          "Validation Error",
          "Track URL and Duration are required unless Quality is set to 'Not Available' or using a GitHub repository."
        );
        return;
      }
      if (isPlayable && (!trackFile || !trackDuration)) {
        showAlert(
          "Validation Error",
          "Track URL and Duration are required for playable tracks."
        );
        return;
      }
    } else {
      if (isPlayable && (!trackFile || !trackDuration)) {
        showAlert(
          "Validation Error",
          "Track URL and Duration are required for playable tracks."
        );
        return;
      }
    }

    const parsedFileDate = parseDate(trackFileDate);
    if (trackFileDate && !parsedFileDate) {
      showAlert(
        "Invalid File Date",
        "File Date must be in the format 'Month Day, Year' (e.g., 'Oct 1, 2013') or just a year (e.g., '2013')."
      );
      return;
    }

    const parsedLeakDate = parseDate(trackLeakDate);
    if (trackLeakDate && !parsedLeakDate) {
      showAlert(
        "Invalid Leak Date",
        "Leak Date must be in the format 'Month Day, Year' (e.g., 'Oct 1, 2013') or just a year (e.g., '2013')."
      );
      return;
    }

    let multiFilesData: Release["multi_files"] = editingTrack.multi_files;
    let totalDuration = trackDuration;

    if (editingTrack.category === "stems" && isMultiFiles && trackFile) {
      try {
        multiFilesData = await fetchGitHubRepoContents(trackFile, githubToken);
        totalDuration = calculateTotalDuration(multiFilesData);
        setTrackDuration(totalDuration); // Update UI immediately
      } catch (error) {
        showAlert(
          "GitHub Fetch Failed",
          `Failed to fetch GitHub repository contents: ${
            (error as Error).message
          }`
        );
        return;
      }
    } else if (isMultiFiles) {
      multiFilesData = undefined; // Clear if unchecked or no URL
      totalDuration = "";
    }

    const updatedTrack = {
      title: trackTitle,
      duration: totalDuration || "",
      file: isMultiFiles ? "" : trackFile.trimEnd() || "",
      multi_files: multiFilesData,
      type: trackType || undefined,
      track_type:
        editingTrack.category !== "released"
          ? trackTrackType || undefined
          : undefined,
      available:
        editingTrack.category !== "released" ? trackAvailable : undefined,
      quality: editingTrack.category !== "released" ? trackQuality : undefined,
      file_date: parsedFileDate,
      leak_date:
        editingTrack.category !== "released" ? parsedLeakDate : undefined,
      notes: trackNotes || undefined,
      era_id: editingTrack.era_id,
      category: editingTrack.category,
      cover_image: trackCoverImage || undefined,
      credit: trackCredit || undefined,
      og_filename: trackOgFilename || undefined,
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

      const { data: fetchedTrack, error: fetchError } = await supabase
        .from("releases")
        .select("*")
        .eq("id", editingTrack.id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated track:", fetchError);
        showAlert(
          "Fetch Failed",
          "Failed to fetch updated track: " + fetchError.message
        );
      } else if (fetchedTrack) {
        const updatedTrackData = {
          ...fetchedTrack,
          cover_image: fetchedTrack.cover_image || "",
          duration: fetchedTrack.duration || "",
          file_date: fetchedTrack.file_date || undefined,
          leak_date: fetchedTrack.leak_date || undefined,
          og_filename: fetchedTrack.og_filename || undefined,
        };

        setTracks(
          tracks.map((t) => (t.id === editingTrack.id ? updatedTrackData : t))
        );

        if (currentTrack?.id === editingTrack.id && isPlayable) {
          playTrack(updatedTrackData, sectionTracks);
        }

        showAlert("Success", "Track updated successfully!", "default", () => {
          setEditingTrack(null);
          setTrackTitle("");
          setTrackDuration("");
          setTrackFile("");
          setIsMultiFiles(false);
          setTrackType("");
          setTrackTrackType("");
          setTrackAvailable(undefined);
          setTrackQuality(undefined);
          setTrackFileDate("");
          setTrackLeakDate("");
          setTrackNotes("");
          setTrackCredit("");
          setTrackCoverImage("");
          setTrackOgFilename("");
        });
      }
    }
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

  const handleCancel = () => {
    setEditingTrack(null);
    setTrackTitle("");
    setTrackDuration("");
    setTrackFile("");
    setIsMultiFiles(false);
    setTrackType("");
    setTrackTrackType("");
    setTrackAvailable(undefined);
    setTrackQuality(undefined);
    setTrackFileDate("");
    setTrackLeakDate("");
    setTrackNotes("");
    setTrackCredit("");
    setTrackCoverImage("");
    setTrackOgFilename("");
  };

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
    return Object.entries(json).map(([key, value], index) => {
      const currentPath = path ? `${path}/${key}` : key;
      const isFolder = typeof value === "object" && !("url" in value);
      const parentTrack = tracks.find((t) => t.id === trackId);

      if (isFolder) {
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
      } else {
        const file = value as {
          url: string;
          duration: string;
          size: number;
          type: string;
          sha: string;
        };
        const isPlayable = !!file.url && file.url.trim() !== "";
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
                  : "hover:bg-gray-800/50 text-gray-300"
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
          </div>
        );
      }
    });
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
                            : "hover:bg-gray-800/50 text-gray-300"
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
                    : "hover:bg-gray-800/50 text-gray-300"
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
                Duration{" "}
                {(trackFile.trim() !== "" && !isMultiFiles) ||
                (editingTrack?.category !== "released" &&
                  trackQuality !== "Not Available" &&
                  !isMultiFiles)
                  ? "(Required)"
                  : isMultiFiles
                  ? "(Auto-calculated)"
                  : ""}
              </label>
              <input
                type="text"
                value={trackDuration}
                onChange={(e) => setTrackDuration(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={
                  (trackFile.trim() !== "" && !isMultiFiles) ||
                  (editingTrack?.category !== "released" &&
                    trackQuality !== "Not Available" &&
                    !isMultiFiles)
                }
                disabled={isMultiFiles} // Disable when using GitHub repo
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                {editingTrack?.category === "stems" && isMultiFiles
                  ? "GitHub Repository URL"
                  : "Track URL (GitHub)"}{" "}
                {(trackFile.trim() !== "" && !isMultiFiles) ||
                (editingTrack?.category !== "released" &&
                  trackQuality !== "Not Available" &&
                  !isMultiFiles)
                  ? "(Required)"
                  : ""}
              </label>
              <input
                type="url"
                value={trackFile}
                onChange={(e) => setTrackFile(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={
                  (trackFile.trim() !== "" && !isMultiFiles) ||
                  (editingTrack?.category !== "released" &&
                    trackQuality !== "Not Available" &&
                    !isMultiFiles)
                }
                placeholder={
                  editingTrack?.category === "stems" && isMultiFiles
                    ? "e.g., https://github.com/username/repo"
                    : "e.g., https://github.com/username/repo/raw/main/track.mp3"
                }
              />
            </div>
            {editingTrack?.category === "stems" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isMultiFiles}
                  onChange={(e) => {
                    setIsMultiFiles(e.target.checked);
                    if (!e.target.checked) {
                      setTrackDuration(""); // Clear duration when switching off GitHub repo
                    }
                  }}
                  className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-300">
                  Use GitHub Repository
                </label>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Credit
              </label>
              <input
                type="text"
                value={trackCredit}
                onChange={(e) => setTrackCredit(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., prod, feat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Cover Image URL
              </label>
              <input
                type="url"
                value={trackCoverImage}
                onChange={(e) => setTrackCoverImage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter cover image URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Original Filename
              </label>
              <input
                type="text"
                value={trackOgFilename}
                onChange={(e) => setTrackOgFilename(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., original_track_name.mp3"
              />
            </div>
            {editingTrack?.category === "released" && (
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Track Type
                </label>
                <select
                  value={trackType}
                  onChange={(e) => setTrackType(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="Single">Single</option>
                  <option value="Album Track">Album Track</option>
                  <option value="Loosie">Loosie</option>
                  <option value="Beat">Beat</option>
                  <option value="Remix">Remix</option>
                  <option value="Feature">Feature</option>
                  <option value="Production">Production</option>
                  <option value="Demo">Demo</option>
                  <option value="Instrumental">Instrumental</option>
                </select>
              </div>
            )}
            {editingTrack?.category !== "released" && (
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
                  {editingTrack?.category === "stems" ? (
                    <>
                      <option value="Instrumental">Instrumental</option>
                      <option value="Acapella">Acapella</option>
                      <option value="Stems">Stems</option>
                      <option value="Mix">Mix</option>
                      <option value="Session">Session</option>
                      <option value="TV Track">TV Track</option>
                    </>
                  ) : (
                    <>
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
                      <option value="Voice Memo">Voice Memo</option>
                    </>
                  )}
                </select>
              </div>
            )}
            {editingTrack?.category !== "released" && (
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Additional Track Type
                </label>
                <select
                  value={trackTrackType}
                  onChange={(e) => setTrackTrackType(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {editingTrack?.category === "unreleased" ? (
                    <>
                      <option value="Music">Fragments</option>
                      <option value="Features With">Features With</option>
                      <option value="Features Without">Features Without</option>
                      <option value="Early Sessions">Early Sessions</option>
                    </>
                  ) : editingTrack?.category === "stems" ? (
                    <>
                      <option value="Instrumentals">Instrumentals</option>
                      <option value="Acapellas">Acapellas</option>
                      <option value="Stems">Stems</option>
                      <option value="Dolby Atmos">Dolby Atmos</option>
                      <option value="Sessions">Sessions</option>
                      <option value="TV Tracks">TV Tracks</option>
                    </>
                  ) : null}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                {editingTrack?.category === "released"
                  ? "Release Date (optional)"
                  : "File Date (optional)"}
              </label>
              <input
                type="text"
                value={trackFileDate}
                onChange={(e) => setTrackFileDate(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Oct 1, 2013 or 2013"
              />
            </div>
            {editingTrack?.category !== "released" && (
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Leak Date (optional)
                </label>
                <input
                  type="text"
                  value={trackLeakDate}
                  onChange={(e) => setTrackLeakDate(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Oct 1, 2013 or 2013"
                />
              </div>
            )}
            {editingTrack?.category !== "released" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Available
                  </label>
                  <select
                    value={trackAvailable ?? ""}
                    onChange={(e) =>
                      setTrackAvailable(
                        e.target.value === ""
                          ? undefined
                          : (e.target.value as
                              | "Confirmed"
                              | "Partial"
                              | "Snippet"
                              | "Full"
                              | "Rumored"
                              | "OG File"
                              | "Tagged")
                      )
                    }
                    className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select availability</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Partial">Partial</option>
                    <option value="Snippet">Snippet</option>
                    <option value="Full">Full</option>
                    <option value="Rumored">Rumored</option>
                    <option value="OG File">OG File</option>
                    <option value="Tagged">Tagged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Quality
                  </label>
                  <select
                    value={trackQuality ?? ""}
                    onChange={(e) =>
                      setTrackQuality(
                        e.target.value === ""
                          ? undefined
                          : (e.target.value as
                              | "Not Available"
                              | "High Quality"
                              | "Recording"
                              | "Lossless"
                              | "Low Quality"
                              | "CD Quality")
                      )
                    }
                    className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select quality</option>
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
    </div>
  );
}
