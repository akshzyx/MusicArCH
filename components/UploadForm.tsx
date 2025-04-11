"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchGitHubRepoContents } from "@/lib/github";
import { Release, Era } from "@/lib/types";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type JsonFolder = {
  [key: string]:
    | JsonFolder
    | {
        url: string;
        duration: string;
        size: number;
        type: string;
        sha: string;
      };
};

interface TrackFormData {
  title: string;
  file: string;
  duration: string;
  coverImage: string;
  fileDate: string;
  leakDate: string;
  type: string;
  trackType?:
    | "Music"
    | "Features With"
    | "Features Without"
    | "Early Sessions"
    | "Instrumentals"
    | "Acapellas"
    | "Stems"
    | "Dolby Atmos"
    | "Sessions"
    | "TV Tracks"
    | "";
  available:
    | "Confirmed"
    | "Partial"
    | "Snippet"
    | "Full"
    | "Rumored"
    | "OG File"
    | "";
  quality:
    | "Not Available"
    | "High Quality"
    | "Recording"
    | "Lossless"
    | "Low Quality"
    | "CD Quality"
    | "";
  notes: string;
  isLoadingDuration?: boolean;
  credit?: string;
  og_filename?: string;
  aka?: string;
  isMultiFiles?: boolean;
}

export default function UploadForm() {
  const { user, isSignedIn } = useUser();
  const [eras, setEras] = useState<Era[]>([]);
  const [selectedEraId, setSelectedEraId] = useState<string>("");
  const [releaseCategory, setReleaseCategory] = useState<
    "released" | "unreleased" | "stems" | string
  >("released");
  const [tracks, setTracks] = useState<TrackFormData[]>([
    {
      title: "",
      file: "",
      duration: "",
      coverImage: "",
      fileDate: "",
      leakDate: "",
      type: "",
      trackType: "",
      available: "",
      quality: "",
      notes: "",
      isLoadingDuration: false,
      credit: "",
      og_filename: "",
      aka: "",
      isMultiFiles: false,
    },
  ]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const router = useRouter();

  const isAdmin = user?.publicMetadata?.role === "admin";
  const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  useEffect(() => {
    const fetchData = async () => {
      const { data: erasData, error: erasError } = await supabase
        .from("eras")
        .select("*");
      if (erasError) {
        console.error("Error fetching eras:", erasError);
      } else {
        setEras(erasData || []);
        if (erasData && erasData.length > 0) setSelectedEraId(erasData[0].id);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const processTracks = async () => {
      for (let index = 0; index < tracks.length; index++) {
        const track = tracks[index];
        if (!track.file) {
          updateTrack(index, {
            ...track,
            duration: "",
            isLoadingDuration: false,
          });
          continue;
        }

        // Skip processing for stems with GitHub repo (isMultiFiles)
        if (releaseCategory === "stems" && track.isMultiFiles) {
          updateTrack(index, {
            ...track,
            duration: "",
            isLoadingDuration: false,
          });
          continue;
        }

        updateTrack(index, { ...track, isLoadingDuration: true });
        const audio = new Audio(track.file.trimEnd());

        audio.onloadedmetadata = () => {
          const durationSeconds = audio.duration;
          if (isNaN(durationSeconds) || !isFinite(durationSeconds)) {
            setAlertTitle("Invalid Audio File");
            setAlertDescription(
              `Could not determine track duration for track ${
                index + 1
              }. Please ensure the URL points to a valid audio file.`
            );
            setAlertOpen(true);
            updateTrack(index, {
              ...track,
              duration: "",
              isLoadingDuration: false,
            });
          } else {
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = Math.floor(durationSeconds % 60)
              .toString()
              .padStart(2, "0");
            updateTrack(index, {
              ...track,
              duration: `${minutes}:${seconds}`,
              isLoadingDuration: false,
            });
          }
        };

        audio.onerror = () => {
          setAlertTitle("Error Loading Audio");
          setAlertDescription(
            `Error loading audio file for track ${
              index + 1
            }. Please check the URL.`
          );
          setAlertOpen(true);
          updateTrack(index, {
            ...track,
            duration: "",
            isLoadingDuration: false,
          });
        };
      }
    };

    processTracks();
  }, [tracks.map((track) => `${track.file}-${track.isMultiFiles}`).join(",")]);

  const updateTrack = (index: number, updatedTrack: TrackFormData) => {
    setTracks((prevTracks) => {
      const newTracks = [...prevTracks];
      newTracks[index] = updatedTrack;
      return newTracks;
    });
  };

  const addTrack = () => {
    setTracks((prevTracks) => [
      ...prevTracks,
      {
        title: "",
        file: "",
        duration: "",
        coverImage: "",
        fileDate: "",
        leakDate: "",
        type: "",
        trackType: "",
        available: "",
        quality: "",
        notes: "",
        isLoadingDuration: false,
        credit: "",
        og_filename: "",
        aka: "",
        isMultiFiles: false,
      },
    ]);
  };

  const removeTrack = (index: number) => {
    setTracks((prevTracks) => prevTracks.filter((_, i) => i !== index));
  };

  const showAlert = (title: string, description: string) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertOpen(true);
  };

  const parseDate = (input: string): string | undefined => {
    if (!input) return undefined;

    if (/^\d{4}$/.test(input)) {
      return `${input}-01-01`;
    }

    const dateRegex = /^([A-Za-z]{3})\s+(\d{1,2})(?:,)?\s*(\d{4})$/;
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

  const calculateTotalDuration = (multiFiles: JsonFolder): string => {
    if (!multiFiles) return "0:00";

    let totalSeconds = 0;

    const traverse = (obj: JsonFolder) => {
      for (const key in obj) {
        const value = obj[key];
        if (
          value &&
          "url" in value &&
          "duration" in value &&
          typeof value.duration === "string"
        ) {
          const [minutes, seconds] = value.duration.split(":").map(Number);
          totalSeconds += minutes * 60 + seconds;
        } else if (typeof value === "object" && value !== null) {
          traverse(value as JsonFolder);
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

  const fetchGitHubRepoContentsWithProgress = async (
    url: string,
    token: string | undefined,
    onProgress: (progress: number) => void
  ): Promise<JsonFolder> => {
    const response = await fetchGitHubRepoContents(url, token);
    const fileCount = countFiles(response);
    let processed = 0;

    const simulateProgress = () => {
      processed += 1;
      const percentage = Math.min((processed / fileCount) * 100, 100);
      onProgress(percentage);
    };

    const traverseAndSimulate = (obj: JsonFolder) => {
      for (const key in obj) {
        const value = obj[key];
        if ("url" in value) {
          simulateProgress();
        } else if (typeof value === "object" && value !== null) {
          traverseAndSimulate(value as JsonFolder);
        }
      }
    };

    traverseAndSimulate(response);
    onProgress(100);
    return response;
  };

  const countFiles = (multiFiles: JsonFolder): number => {
    let count = 0;
    const traverse = (obj: JsonFolder) => {
      for (const key in obj) {
        const value = obj[key];
        if ("url" in value) {
          count += 1;
        } else if (typeof value === "object" && value !== null) {
          traverse(value as JsonFolder);
        }
      }
    };
    traverse(multiFiles);
    return count;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !isAdmin) {
      showAlert("Unauthorized", "Only admins can upload tracks.");
      return;
    }

    if (!selectedEraId) {
      showAlert("Missing Era", "Please select an era.");
      return;
    }
    if (tracks.length === 0) {
      showAlert("No Tracks", "Please add at least one track.");
      return;
    }

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (!track.title) {
        showAlert(
          "Incomplete Track Details",
          `Please fill in the title for track ${i + 1}.`
        );
        return;
      }
      if (track.isLoadingDuration) {
        showAlert(
          "Loading Duration",
          `Please wait until the track duration is calculated for track ${
            i + 1
          }.`
        );
        return;
      }
      if (
        releaseCategory === "released" ||
        (releaseCategory !== "released" &&
          track.quality !== "Not Available" &&
          !track.isMultiFiles)
      ) {
        if (!track.file) {
          showAlert(
            "Incomplete Track Details",
            `Please provide a ${
              track.isMultiFiles ? "GitHub repository URL" : "track URL"
            } for track ${i + 1}.`
          );
          return;
        }
        if (!track.duration && !track.isMultiFiles) {
          showAlert(
            "Incomplete Track Details",
            `Please ensure a valid track URL is provided to calculate duration for track ${
              i + 1
            }.`
          );
          return;
        }
      }
      if (
        releaseCategory !== "released" &&
        (!track.available || !track.quality)
      ) {
        showAlert(
          "Incomplete Track Details",
          `Please select availability and quality for track ${
            i + 1
          } (non-released category).`
        );
        return;
      }
      if (
        (releaseCategory === "unreleased" || releaseCategory === "stems") &&
        !track.trackType
      ) {
        showAlert(
          "Incomplete Track Details",
          `Please select an Additional Track Type for track ${
            i + 1
          } (${releaseCategory} category).`
        );
        return;
      }
      if (track.fileDate) {
        const parsedFileDate = parseDate(track.fileDate);
        if (!parsedFileDate) {
          showAlert(
            "Invalid File Date",
            `File Date for track ${
              i + 1
            } must be in the format "Month Day, Year" (e.g., "Oct 1, 2013") or just a year (e.g., "2013").`
          );
          return;
        }
      }
      if (track.leakDate) {
        const parsedLeakDate = parseDate(track.leakDate);
        if (!parsedLeakDate) {
          showAlert(
            "Invalid Leak/Release Date",
            `Leak/Release Date for track ${
              i + 1
            } must be in the format "Month Day, Year" (e.g., "Oct 1, 2013") or just a year (e.g., "2013").`
          );
          return;
        }
      }
    }

    const selectedEra = eras.find((era) => era.id === selectedEraId);
    const defaultCoverImage = selectedEra?.cover_image || "";

    setProgressOpen(true);
    setProgressPercentage(0);
    const newReleases: Omit<Release, "id">[] = await Promise.all(
      tracks.map(async (track) => {
        let multiFilesData: JsonFolder | undefined = undefined;
        let totalDuration = track.duration;

        if (releaseCategory === "stems" && track.isMultiFiles && track.file) {
          try {
            updateTrack(tracks.indexOf(track), {
              ...track,
              isLoadingDuration: true,
            });
            multiFilesData = await fetchGitHubRepoContentsWithProgress(
              track.file,
              githubToken,
              (progress) => setProgressPercentage(progress)
            );
            totalDuration = calculateTotalDuration(multiFilesData);
            updateTrack(tracks.indexOf(track), {
              ...track,
              duration: totalDuration,
              isLoadingDuration: false,
            });
          } catch (error) {
            updateTrack(tracks.indexOf(track), {
              ...track,
              isLoadingDuration: false,
            });
            showAlert(
              "GitHub Fetch Failed",
              `Failed to fetch GitHub repository contents for track ${
                tracks.indexOf(track) + 1
              }: ${(error as Error).message}`
            );
            throw error;
          }
        }

        return {
          era_id: selectedEraId,
          title: track.title,
          duration: totalDuration,
          file: track.isMultiFiles ? "" : track.file.trimEnd(),
          multi_files: multiFilesData,
          cover_image: track.coverImage.trimEnd() || defaultCoverImage,
          file_date:
            releaseCategory === "released"
              ? parseDate(track.leakDate)
              : parseDate(track.fileDate),
          leak_date:
            releaseCategory !== "released"
              ? parseDate(track.leakDate)
              : undefined,
          category: releaseCategory as "released" | "unreleased" | "stems",
          type: track.type || undefined,
          track_type: track.trackType || undefined,
          available:
            releaseCategory !== "released" &&
            track.available !== "" &&
            [
              "Confirmed",
              "Partial",
              "Snippet",
              "Full",
              "Rumored",
              "OG File",
            ].includes(track.available)
              ? track.available
              : undefined,
          quality:
            releaseCategory !== "released" && track.quality !== ""
              ? track.quality
              : undefined,
          notes: track.notes || undefined,
          credit: track.credit || undefined,
          og_filename: track.og_filename || undefined,
          aka: track.aka || undefined,
        };
      })
    );

    const { error: insertError } = await supabase
      .from("releases")
      .insert(newReleases);

    setProgressOpen(false);

    if (insertError) {
      console.error("Error adding releases:", insertError);
      showAlert(
        "Release Addition Failed",
        "Failed to add releases: " + insertError.message
      );
    } else {
      showAlert(
        "Success",
        `New release created with ${tracks.length} track${
          tracks.length > 1 ? "s" : ""
        }!`
      );
      const redirectTo = `/eras/${selectedEraId}#${releaseCategory}`;
      setRedirectUrl(redirectTo);
      setReleaseCategory("released");
      setTracks([
        {
          title: "",
          file: "",
          duration: "",
          coverImage: "",
          fileDate: "",
          leakDate: "",
          type: "",
          trackType: "",
          available: "",
          quality: "",
          notes: "",
          isLoadingDuration: false,
          credit: "",
          og_filename: "",
          aka: "",
          isMultiFiles: false,
        },
      ]);
    }
  };

  const handleAlertClose = (open: boolean) => {
    setAlertOpen(open);
    if (!open && redirectUrl) {
      router.push(redirectUrl);
      setRedirectUrl(null);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === " ") {
      e.stopPropagation();
    }
  };

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-foreground">
          You must be signed in as an admin to upload tracks.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Select Era
          </label>
          <select
            value={selectedEraId}
            onChange={(e) => setSelectedEraId(e.target.value)}
            className="w-full p-2 border rounded bg-background text-foreground"
          >
            {eras.map((era) => (
              <option key={era.id} value={era.id}>
                {era.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Release Category
          </label>
          <select
            value={releaseCategory}
            onChange={(e) =>
              setReleaseCategory(e.target.value as typeof releaseCategory)
            }
            className="w-full p-2 border rounded bg-background text-foreground"
          >
            <option value="released">Released</option>
            <option value="unreleased">Unreleased</option>
            <option value="stems">Stems</option>
          </select>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Add Tracks</h3>
          {tracks.map((track, index) => (
            <div
              key={index}
              className="space-y-2 border p-4 rounded bg-gray-800/50"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-foreground">Track {index + 1}</h4>
                {tracks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTrack(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Track Title"
                  value={track.title}
                  onChange={(e) =>
                    updateTrack(index, { ...track, title: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  className="p-2 border rounded flex-1 bg-background text-foreground"
                  required
                />
                {releaseCategory === "stems" && track.isMultiFiles ? (
                  <input
                    type="url"
                    placeholder="GitHub Repository URL"
                    value={track.file}
                    onChange={(e) =>
                      updateTrack(index, { ...track, file: e.target.value })
                    }
                    onKeyDown={handleKeyDown}
                    className="p-2 border rounded flex-1 bg-background text-foreground"
                    required
                  />
                ) : (
                  <input
                    type="url"
                    placeholder="Track URL (GitHub)"
                    value={track.file}
                    onChange={(e) =>
                      updateTrack(index, { ...track, file: e.target.value })
                    }
                    onKeyDown={handleKeyDown}
                    className="p-2 border rounded flex-1 bg-background text-foreground"
                    required={
                      releaseCategory === "released" ||
                      (releaseCategory !== "released" &&
                        track.quality !== "Not Available" &&
                        !track.isMultiFiles)
                    }
                  />
                )}
                <div className="p-2 w-24 text-foreground">
                  {track.isLoadingDuration
                    ? "Loading..."
                    : track.duration || "Duration"}
                </div>
              </div>
              {releaseCategory === "stems" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={track.isMultiFiles}
                    onChange={(e) =>
                      updateTrack(index, {
                        ...track,
                        isMultiFiles: e.target.checked,
                        duration: e.target.checked ? "" : track.duration,
                      })
                    }
                    className="h-4 w-4 text-blue-600 bg-background border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-foreground">
                    Use GitHub Repository
                  </label>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Cover Image URL (GitHub, optional)
                </label>
                <input
                  type="url"
                  value={track.coverImage}
                  onChange={(e) =>
                    updateTrack(index, { ...track, coverImage: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 border rounded bg-background text-foreground"
                  placeholder="Enter cover image URL (or leave blank for era default)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Credit (optional)
                </label>
                <input
                  type="text"
                  value={track.credit}
                  onChange={(e) =>
                    updateTrack(index, { ...track, credit: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 border rounded bg-background text-foreground"
                  placeholder="e.g., feat. Joji, prod. Joji"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Original Filename (optional)
                </label>
                <input
                  type="text"
                  value={track.og_filename}
                  onChange={(e) =>
                    updateTrack(index, {
                      ...track,
                      og_filename: e.target.value,
                    })
                  }
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 border rounded bg-background text-foreground"
                  placeholder="e.g., original_track_name.mp3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  AKA (optional)
                </label>
                <input
                  type="text"
                  value={track.aka}
                  onChange={(e) =>
                    updateTrack(index, { ...track, aka: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 border rounded bg-background text-foreground"
                  placeholder="e.g., alternative song names"
                />
              </div>
              {releaseCategory !== "released" && (
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    File Date (optional)
                  </label>
                  <input
                    type="text"
                    value={track.fileDate}
                    onChange={(e) =>
                      updateTrack(index, { ...track, fileDate: e.target.value })
                    }
                    className="w-full p-2 border rounded bg-background text-foreground"
                    placeholder="e.g., Oct 1, 2013 or 2013"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {releaseCategory === "released"
                    ? "Release Date (optional)"
                    : "Leak Date (optional)"}
                </label>
                <input
                  type="text"
                  value={track.leakDate}
                  onChange={(e) =>
                    updateTrack(index, { ...track, leakDate: e.target.value })
                  }
                  className="w-full p-2 border rounded bg-background text-foreground"
                  placeholder="e.g., Oct 1, 2013 or 2013"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Release Type
                </label>
                <select
                  value={track.type}
                  onChange={(e) =>
                    updateTrack(index, { ...track, type: e.target.value })
                  }
                  className="w-full p-2 border rounded bg-background text-foreground"
                >
                  <option value="">Select release type</option>
                  {releaseCategory === "released" ? (
                    <>
                      <option value="Loosie">Loosie</option>
                      <option value="Single">Single</option>
                      <option value="Beat">Beat</option>
                      <option value="Album Track">Album Track</option>
                      <option value="Remix">Remix</option>
                      <option value="Feature">Feature</option>
                      <option value="Production">Production</option>
                      <option value="Demo">Demo</option>
                      <option value="Instrumental">Instrumental</option>
                    </>
                  ) : releaseCategory === "stems" ? (
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
              {(releaseCategory === "unreleased" ||
                releaseCategory === "stems") && (
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Additional Track Type
                  </label>
                  <select
                    value={track.trackType}
                    onChange={(e) =>
                      updateTrack(index, {
                        ...track,
                        trackType: e.target.value as TrackFormData["trackType"],
                      })
                    }
                    className="w-full p-2 border rounded bg-background text-foreground"
                    required
                  >
                    <option value="" disabled>
                      Select additional track type
                    </option>
                    {releaseCategory === "unreleased" ? (
                      <>
                        <option value="Music">Fragments</option>
                        <option value="Features With">Features With</option>
                        <option value="Features Without">
                          Features Without
                        </option>
                        <option value="Early Sessions">Early Sessions</option>
                      </>
                    ) : (
                      <>
                        <option value="Instrumentals">Instrumentals</option>
                        <option value="Acapellas">Acapellas</option>
                        <option value="Stems">Stems</option>
                        <option value="Dolby Atmos">Dolby Atmos</option>
                        <option value="Sessions">Sessions</option>
                        <option value="TV Tracks">TV Tracks</option>
                        <option value="Voice Memo">Voice Memo</option>
                      </>
                    )}
                  </select>
                </div>
              )}
              {releaseCategory !== "released" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Available
                    </label>
                    <select
                      value={track.available}
                      onChange={(e) =>
                        updateTrack(index, {
                          ...track,
                          available: e.target
                            .value as TrackFormData["available"],
                        })
                      }
                      className="w-full p-2 border rounded bg-background text-foreground"
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
                      <option value="Tagged">Tagged</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Quality
                    </label>
                    <select
                      value={track.quality}
                      onChange={(e) =>
                        updateTrack(index, {
                          ...track,
                          quality: e.target.value as TrackFormData["quality"],
                        })
                      }
                      className="w-full p-2 border rounded bg-background text-foreground"
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
                <label className="block text-sm font-medium text-foreground">
                  Notes
                </label>
                <textarea
                  value={track.notes}
                  onChange={(e) =>
                    updateTrack(index, { ...track, notes: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 border rounded bg-background text-foreground"
                  placeholder="Enter any notes"
                  rows={3}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTrack}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Another Track
          </button>
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={tracks.some((track) => track.isLoadingDuration)}
        >
          Create Tracks
        </button>
      </form>

      <CustomAlertDialog
        isOpen={alertOpen}
        onOpenChange={handleAlertClose}
        title={alertTitle}
        description={alertDescription}
      />

      <Dialog open={progressOpen} onOpenChange={setProgressOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0C1521] text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Processing GitHub Repository
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-gray-300">
              Fetching repository contents and calculating total duration...
            </p>
            <p className="text-gray-200 mt-2">
              Progress: {Math.round(progressPercentage)}%
            </p>
            <div className="mt-4 w-full bg-gray-600 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
