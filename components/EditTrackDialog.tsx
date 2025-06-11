"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchGitHubRepoContents } from "@/lib/github";
import { Release } from "@/lib/types";
import { useAudio } from "@/lib/AudioContext";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditTrackDialogProps {
  tracks: (Release & { credit?: string; og_filename?: string })[];
  setTracks: React.Dispatch<
    React.SetStateAction<
      (Release & { credit?: string; og_filename?: string })[]
    >
  >;
  editingTrack: Release | null;
  setEditingTrack: React.Dispatch<React.SetStateAction<Release | null>>;
  alertOpen: boolean;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
  alertTitle: string;
  setAlertTitle: React.Dispatch<React.SetStateAction<string>>;
  alertDescription: string;
  setAlertDescription: React.Dispatch<React.SetStateAction<string>>;
  alertVariant: "default" | "destructive";
  setAlertVariant: React.Dispatch<
    React.SetStateAction<"default" | "destructive">
  >;
  onConfirmAction: (() => void) | null;
  setOnConfirmAction: React.Dispatch<React.SetStateAction<(() => void) | null>>;
}

export default function EditTrackDialog({
  tracks,
  setTracks,
  editingTrack,
  setEditingTrack,
  alertOpen,
  setAlertOpen,
  alertTitle,
  setAlertTitle,
  alertDescription,
  setAlertDescription,
  alertVariant,
  setAlertVariant,
  onConfirmAction,
  setOnConfirmAction,
}: EditTrackDialogProps) {
  const { currentTrack, playTrack, sectionTracks } = useAudio();
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [cancelUpdate, setCancelUpdate] = useState(false);
  const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  // Initialize form fields when editingTrack changes
  useEffect(() => {
    if (editingTrack) {
      setTrackTitle(editingTrack.title);
      setTrackDuration(editingTrack.duration);
      setTrackFile(editingTrack.file);
      setIsMultiFiles(
        editingTrack.category === "stems" &&
          !!editingTrack.multi_files &&
          !editingTrack.file
      );
      setTrackType(editingTrack.type || "");
      setTrackTrackType(editingTrack.track_type || "");
      setTrackAvailable(editingTrack.available);
      setTrackQuality(editingTrack.quality);
      setTrackFileDate(
        editingTrack.file_date
          ? new Date(editingTrack.file_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : ""
      );
      setTrackLeakDate(
        editingTrack.leak_date
          ? new Date(editingTrack.leak_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : ""
      );
      setTrackNotes(editingTrack.notes || "");
      setTrackCredit(editingTrack.credit || "");
      setTrackCoverImage(editingTrack.cover_image || "");
      setTrackOgFilename(editingTrack.og_filename || "");
    }
  }, [editingTrack]);

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

    setIsUpdating(true);
    setUpdateProgress(0);
    setCancelUpdate(false);
    setAlertTitle("Updating Track");
    setAlertDescription("Please wait, updating...");
    setAlertVariant("default");
    setOnConfirmAction(null);
    setAlertOpen(true);

    let multiFilesData: Release["multi_files"] = editingTrack.multi_files;
    let totalDuration = trackDuration;

    if (editingTrack.category === "stems" && isMultiFiles && trackFile) {
      try {
        setUpdateProgress(10);
        multiFilesData = await fetchGitHubRepoContents(trackFile, githubToken);
        if (cancelUpdate) throw new Error("Update cancelled");
        setUpdateProgress(50);
        totalDuration = calculateTotalDuration(multiFilesData);
        setTrackDuration(totalDuration);
      } catch (error) {
        if (cancelUpdate) {
          setAlertTitle("Update Cancelled");
          setAlertDescription("The track update was cancelled.");
          setIsUpdating(false);
          setUpdateProgress(0);
          setAlertOpen(false);
          return;
        }
        setAlertTitle("GitHub Fetch Failed");
        setAlertDescription(
          `Failed to fetch GitHub repository contents: ${
            (error as Error).message
          }`
        );
        setAlertVariant("destructive");
        setIsUpdating(false);
        setUpdateProgress(0);
        return;
      }
    } else if (isMultiFiles) {
      multiFilesData = undefined;
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

    setUpdateProgress(75);
    if (cancelUpdate) {
      setAlertTitle("Update Cancelled");
      setAlertDescription("The track update was cancelled.");
      setIsUpdating(false);
      setUpdateProgress(0);
      setAlertOpen(false);
      return;
    }

    const { error } = await supabase
      .from("releases")
      .update(updatedTrack)
      .eq("id", editingTrack.id);

    if (error) {
      console.error("Error updating track:", error);
      setAlertTitle("Update Failed");
      setAlertDescription("Failed to update track: " + error.message);
      setAlertVariant("destructive");
      setIsUpdating(false);
      setUpdateProgress(0);
      return;
    }

    setUpdateProgress(90);
    console.log("Track updated:", editingTrack.id);

    const { data: fetchedTrack, error: fetchError } = await supabase
      .from("releases")
      .select("*")
      .eq("id", editingTrack.id)
      .single();

    if (fetchError) {
      console.error("Error fetching updated track:", fetchError);
      setAlertTitle("Fetch Failed");
      setAlertDescription(
        "Failed to fetch updated track: " + fetchError.message
      );
      setAlertVariant("destructive");
      setIsUpdating(false);
      setUpdateProgress(0);
      return;
    }

    if (fetchedTrack) {
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

      setUpdateProgress(100);
      setAlertTitle("Success");
      setAlertDescription("Track updated successfully!");
      setAlertVariant("default");
      setOnConfirmAction(() => () => {
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
        setAlertOpen(false);
      });
      setIsUpdating(false);
    }
  };

  const handleCancelUpdate = () => {
    setCancelUpdate(true);
    setAlertOpen(false);
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === " ") {
      e.stopPropagation();
    }
  };

  return (
    <>
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
                disabled={isMultiFiles}
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
                      setTrackDuration("");
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
                      <option value="Blackpond Studio Sessions">
                        Blackpond Studio Sessions
                      </option>
                      <option value="The CRC Sessions">The CRC Sessions</option>
                      <option value="Timeshift Studios Sessions">
                        Timeshift Studios Sessions
                      </option>
                      <option value="No Name Studios Sessions">
                        No Name Studios Sessions
                      </option>
                      <option value="The Fab Factory Recording Studio Sessions">
                        The Fab Factory Recording Studio Sessions
                      </option>
                      <option value="WeDidIt Studios Sessions">
                        WeDidIt Studios Sessions
                      </option>
                      <option value="Songs from Unknown Studio Sessions">
                        Songs from Unknown Studio Sessions
                      </option>
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
                disabled={isUpdating}
              >
                Update Track
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <CustomAlertDialog
        isOpen={alertOpen}
        onOpenChange={(open) => {
          if (!open && !isUpdating) setAlertOpen(false);
        }}
        title={alertTitle}
        description={
          isUpdating
            ? `${alertDescription}\nProgress: ${updateProgress}%`
            : alertDescription
        }
        confirmText={
          isUpdating ? undefined : onConfirmAction ? "Confirm" : "OK"
        }
        cancelText={
          isUpdating ? "Cancel" : onConfirmAction ? "Cancel" : undefined
        }
        onConfirm={isUpdating ? undefined : onConfirmAction || undefined}
        onCancel={isUpdating ? handleCancelUpdate : undefined}
        variant={alertVariant}
      />
    </>
  );
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showAlert(arg0: string, arg1: string) {
  throw new Error("Function not implemented.");
}
