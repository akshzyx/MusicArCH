"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Release, Era } from "@/lib/types";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";

interface TrackFormData {
  title: string;
  file: string;
  duration: string;
  coverImage: string;
  fileDate: string;
  leakDate: string;
  type: string;
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
}

export default function UploadForm() {
  const [eras, setEras] = useState<Era[]>([]);
  const [selectedEraId, setSelectedEraId] = useState<string>("");
  const [releaseCategory, setReleaseCategory] = useState<
    "released" | "unreleased" | "og" | "stems" | "sessions"
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
      available: "",
      quality: "",
      notes: "",
      isLoadingDuration: false,
    },
  ]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const router = useRouter();

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
    tracks.forEach((track, index) => {
      if (!track.file) {
        updateTrack(index, {
          ...track,
          duration: "",
          isLoadingDuration: false,
        });
        return;
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
    });
  }, [tracks.map((track) => track.file).join(",")]);

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
        available: "",
        quality: "",
        notes: "",
        isLoadingDuration: false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting with:", {
      selectedEraId,
      releaseCategory,
      tracks,
    });

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
      if (!track.title || !track.duration || !track.file || !track.coverImage) {
        showAlert(
          "Incomplete Track Details",
          `Please fill in all track details for track ${
            i + 1
          }, including the cover image URL.`
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
    }

    const newReleases: Omit<Release, "id">[] = tracks.map((track) => ({
      era_id: selectedEraId,
      title: track.title,
      duration: track.duration,
      file: track.file.trimEnd(),
      cover_image: track.coverImage.trimEnd(),
      file_date: track.fileDate || undefined,
      leak_date: track.leakDate || undefined,
      category: releaseCategory,
      type: track.type || undefined,
      available: releaseCategory !== "released" ? track.available : undefined,
      quality: releaseCategory !== "released" ? track.quality : undefined,
      notes: track.notes || undefined,
    }));

    const { error: insertError } = await supabase
      .from("releases")
      .insert(newReleases);

    if (insertError) {
      console.error("Error adding releases:", insertError);
      showAlert(
        "Release Addition Failed",
        "Failed to add releases: " + insertError.message
      );
    } else {
      console.log("Created releases with tracks");
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
          available: "",
          quality: "",
          notes: "",
          isLoadingDuration: false,
        },
      ]);
    }
  };

  const handleAlertClose = (open: boolean) => {
    setAlertOpen(open);
    if (!open && redirectUrl) {
      console.log("Redirecting to:", redirectUrl);
      router.push(redirectUrl);
      setRedirectUrl(null);
    }
  };

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
            <option value="og">OG</option>
            <option value="stems">Stems</option>
            <option value="sessions">Sessions</option>
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
                  className="p-2 border rounded flex-1 bg-background text-foreground"
                  required
                />
                <input
                  type="url"
                  placeholder="Track URL (GitHub)"
                  value={track.file}
                  onChange={(e) =>
                    updateTrack(index, { ...track, file: e.target.value })
                  }
                  className="p-2 border rounded flex-1 bg-background text-foreground"
                  required
                />
                <div className="p-2 w-24 text-foreground">
                  {track.isLoadingDuration
                    ? "Loading..."
                    : track.duration || "Duration"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Cover Image URL (GitHub)
                </label>
                <input
                  type="url"
                  value={track.coverImage}
                  onChange={(e) =>
                    updateTrack(index, { ...track, coverImage: e.target.value })
                  }
                  className="w-full p-2 border rounded bg-background text-foreground"
                  placeholder="Enter cover image URL"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  File Date
                </label>
                <input
                  type="date"
                  value={track.fileDate}
                  onChange={(e) =>
                    updateTrack(index, { ...track, fileDate: e.target.value })
                  }
                  className="w-full p-2 border rounded bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Leak Date
                </label>
                <input
                  type="date"
                  value={track.leakDate}
                  onChange={(e) =>
                    updateTrack(index, { ...track, leakDate: e.target.value })
                  }
                  className="w-full p-2 border rounded bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Track Type
                </label>
                <input
                  type="text"
                  value={track.type}
                  onChange={(e) =>
                    updateTrack(index, { ...track, type: e.target.value })
                  }
                  className="w-full p-2 border rounded bg-background text-foreground"
                  placeholder="Enter track type"
                />
              </div>
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
    </>
  );
}
