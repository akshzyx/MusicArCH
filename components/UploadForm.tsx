"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Release, Track, Era } from "@/lib/types";

export default function UploadForm() {
  const [eras, setEras] = useState<Era[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedEraId, setSelectedEraId] = useState<string>("");
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>("new");
  const [customId, setCustomId] = useState("");
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseCategory, setReleaseCategory] = useState<
    "released" | "unreleased" | "og" | "stems" | "sessions"
  >("released");
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackFile, setTrackFile] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEraId) {
      alert("Please select an era.");
      return;
    }
    if (!trackTitle || !trackDuration || !trackFile) {
      alert("Please fill in all track details.");
      return;
    }

    const newTrack: Track = {
      id: Date.now().toString(),
      release_id: selectedReleaseId === "new" ? customId : selectedReleaseId,
      title: trackTitle,
      duration: trackDuration,
      file: trackFile.trimEnd(),
    };

    if (selectedReleaseId === "new") {
      if (!customId || !title || !coverImage) {
        alert("Please fill in all new release details.");
        return;
      }

      const releaseData: Release = {
        id: customId,
        era_id: selectedEraId,
        title,
        cover_image: coverImage.trimEnd(),
        release_date: releaseCategory === "released" ? releaseDate : undefined,
        category: releaseCategory,
      };

      const { data: existingRelease, error: checkError } = await supabase
        .from("releases")
        .select("id")
        .eq("id", customId)
        .single();

      if (existingRelease) {
        alert("Error: This Release ID already exists. Please use a unique ID.");
        return;
      }
      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking ID:", checkError);
        alert("Failed to check ID: " + checkError.message);
        return;
      }

      const { error: releaseError } = await supabase
        .from("releases")
        .insert([releaseData]);
      if (releaseError) {
        console.error("Error creating release:", releaseError);
        alert("Failed to create release: " + releaseError.message);
        return;
      }

      const { error: trackError } = await supabase
        .from("tracks")
        .insert([newTrack]);
      if (trackError) {
        console.error("Error adding track:", trackError);
        alert("Failed to add track: " + trackError.message);
      } else {
        console.log("Created release and added track:", customId);
        alert("New release created and track added!");
        setCustomId("");
        setTitle("");
        setCoverImage("");
        setReleaseDate("");
        setReleaseCategory("released");
      }
    } else {
      const { error } = await supabase.from("tracks").insert([newTrack]);
      if (error) {
        console.error("Error adding track:", error);
        alert("Failed to add track: " + error.message);
      } else {
        console.log("Track added to release:", selectedReleaseId);
        alert("Track added successfully!");
      }
    }

    setTrackTitle("");
    setTrackDuration("");
    setTrackFile("");
  };

  const filteredReleases = releases.filter(
    (release) => release.era_id === selectedEraId
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Era
        </label>
        <select
          value={selectedEraId}
          onChange={(e) => setSelectedEraId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {eras.map((era) => (
            <option key={era.id} value={era.id}>
              {era.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Release Category
        </label>
        <select
          value={releaseCategory}
          onChange={(e) =>
            setReleaseCategory(e.target.value as typeof releaseCategory)
          }
          className="w-full p-2 border rounded"
        >
          <option value="released">Released</option>
          <option value="unreleased">Unreleased</option>
          <option value="og">OG</option>
          <option value="stems">Stems</option>
          <option value="sessions">Sessions</option>
        </select>
        {/* <label className="block text-sm font-medium text-gray-700">
          Select Release
        </label>
        <select
          value={selectedReleaseId}
          onChange={(e) => setSelectedReleaseId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="new">Create New Release</option>
          {filteredReleases.map((release) => (
            <option key={release.id} value={release.id}>
              {release.title} ({release.category} - {release.id})
            </option>
          ))}
        </select> */}
      </div>

      {selectedReleaseId === "new" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Release ID (Custom)
            </label>
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., nectar-002"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Release Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cover Image URL (GitHub)
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div></div>
          {releaseCategory === "released" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Release Date
              </label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold">Add Track</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Track Title"
            value={trackTitle}
            onChange={(e) => setTrackTitle(e.target.value)}
            className="p-2 border rounded flex-1"
            required
          />
          <input
            type="text"
            placeholder="Duration (e.g., 3:45)"
            value={trackDuration}
            onChange={(e) => setTrackDuration(e.target.value)}
            className="p-2 border rounded w-24"
            required
          />
          <input
            type="url"
            placeholder="Track URL (GitHub)"
            value={trackFile}
            onChange={(e) => setTrackFile(e.target.value)}
            className="p-2 border rounded flex-1"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {selectedReleaseId === "new"
          ? "Create Release and Add Track"
          : "Add Track to Release"}
      </button>
    </form>
  );
}
