"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Release, Track, Era } from "@/lib/types";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";

export default function UploadForm() {
  const [eras, setEras] = useState<Era[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedEraId, setSelectedEraId] = useState<string>("");
  const [coverImage, setCoverImage] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseCategory, setReleaseCategory] = useState<
    "released" | "unreleased" | "og" | "stems" | "sessions"
  >("released");
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState<string>("");
  const [trackFile, setTrackFile] = useState("");
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);
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
      const { data: releasesData, error: releasesError } = await supabase
        .from("releases")
        .select("*");
      if (erasError || releasesError) {
        console.error("Error fetching data:", erasError || releasesError);
      } else {
        setEras(erasData || []);
        setReleases(releasesData || []);
        if (erasData && erasData.length > 0) setSelectedEraId(erasData[0].id);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!trackFile) {
      setTrackDuration("");
      return;
    }

    setIsLoadingDuration(true);
    const audio = new Audio(trackFile.trimEnd());

    audio.onloadedmetadata = () => {
      const durationSeconds = audio.duration;
      if (isNaN(durationSeconds) || !isFinite(durationSeconds)) {
        setAlertTitle("Invalid Audio File");
        setAlertDescription(
          "Could not determine track duration. Please ensure the URL points to a valid audio file."
        );
        setAlertOpen(true);
        setTrackDuration("");
      } else {
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = Math.floor(durationSeconds % 60)
          .toString()
          .padStart(2, "0");
        setTrackDuration(`${minutes}:${seconds}`);
      }
      setIsLoadingDuration(false);
    };

    audio.onerror = () => {
      setAlertTitle("Error Loading Audio");
      setAlertDescription("Error loading audio file. Please check the URL.");
      setAlertOpen(true);
      setTrackDuration("");
      setIsLoadingDuration(false);
    };

    return () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
    };
  }, [trackFile]);

  const showAlert = (title: string, description: string) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting with:", {
      coverImage,
      selectedEraId,
      trackTitle,
      trackFile,
      releaseCategory,
    });

    if (!selectedEraId) {
      showAlert("Missing Era", "Please select an era.");
      return;
    }
    if (!trackTitle || !trackDuration || !trackFile) {
      showAlert(
        "Incomplete Track Details",
        "Please fill in all track details."
      );
      return;
    }
    if (isLoadingDuration) {
      showAlert(
        "Loading Duration",
        "Please wait until the track duration is calculated."
      );
      return;
    }
    if (!coverImage) {
      showAlert(
        "Incomplete Release Details",
        "Please fill in the cover image URL."
      );
      return;
    }

    const newTrack: Omit<Track, "id"> = {
      release_id: 0,
      title: trackTitle,
      duration: trackDuration,
      file: trackFile.trimEnd(),
    };

    const releaseData: Omit<Release, "id"> = {
      era_id: selectedEraId,
      title: trackTitle,
      cover_image: coverImage.trimEnd(),
      release_date: releaseDate || undefined,
      category: releaseCategory,
    };

    const { data: newRelease, error: releaseError } = await supabase
      .from("releases")
      .insert([releaseData])
      .select()
      .single();

    if (releaseError || !newRelease) {
      console.error("Error creating release:", releaseError);
      showAlert(
        "Release Creation Failed",
        "Failed to create release: " +
          (releaseError?.message || "Unknown error")
      );
      return;
    }

    newTrack.release_id = newRelease.id;

    const { error: trackError } = await supabase
      .from("tracks")
      .insert([newTrack]);
    if (trackError) {
      console.error("Error adding track:", trackError);
      showAlert(
        "Track Addition Failed",
        "Failed to add track: " + trackError.message
      );
    } else {
      console.log("Created release and added track:", newRelease.id);
      showAlert("Success", "New release created and track added!");
      const submittedCategory = releaseCategory;
      const redirectTo = `/eras/${selectedEraId}#${submittedCategory}`;
      console.log("Setting redirect to:", redirectTo); // Debug redirect URL
      setRedirectUrl(redirectTo);
      setCoverImage("");
      setReleaseDate("");
      setReleaseCategory("released");
    }

    setTrackTitle("");
    setTrackDuration("");
    setTrackFile("");
  };

  const handleAlertClose = (open: boolean) => {
    setAlertOpen(open);
    if (!open && redirectUrl) {
      console.log("Redirecting to:", redirectUrl); // Debug before redirect
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

        <div>
          <label className="block text-sm font-medium text-foreground">
            Cover Image URL (GitHub)
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full p-2 border rounded bg-background text-foreground"
            placeholder="Enter cover image URL"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            Release Date
          </label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full p-2 border rounded bg-background text-foreground"
            required
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Add Track</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Track Title"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              className="p-2 border rounded flex-1 bg-background text-foreground"
              required
            />
            <input
              type="url"
              placeholder="Track URL (GitHub)"
              value={trackFile}
              onChange={(e) => setTrackFile(e.target.value)}
              className="p-2 border rounded flex-1 bg-background text-foreground"
              required
            />
            <div className="p-2 w-24 text-foreground">
              {isLoadingDuration ? "Loading..." : trackDuration || "Duration"}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isLoadingDuration}
        >
          Create Release and Add Track
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
