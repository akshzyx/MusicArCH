"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Release, Track, Era } from "@/lib/types";

export default function UploadForm() {
  const [eras, setEras] = useState<Era[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedEraId, setSelectedEraId] = useState<string>("");
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>("new");
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseCategory, setReleaseCategory] = useState<
    "released" | "unreleased" | "og" | "stems" | "sessions"
  >("released");
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackFile, setTrackFile] = useState("");
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: erasData, error: erasError } = await supabase
        .from("eras")
        .select("*");
      const { data: releasesData, error: releasesError } = await supabase
        .from("releases")
        .select("*");
      const { data: tracksData, error: tracksError } = await supabase
        .from("tracks")
        .select("*");
      if (erasError || releasesError || tracksError) {
        console.error(
          "Error fetching data:",
          erasError || releasesError || tracksError
        );
      } else {
        setEras(erasData || []);
        setReleases(releasesData || []);
        setTracks(tracksData || []);
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
      id: editingTrack ? editingTrack.id : Date.now().toString(),
      release_id: 0, // Placeholder, updated below
      title: trackTitle,
      duration: trackDuration,
      file: trackFile.trimEnd(),
    };

    if (selectedReleaseId === "new") {
      if (!title || !coverImage) {
        alert("Please fill in all new release details.");
        return;
      }

      const releaseData: Omit<Release, "id"> = {
        era_id: selectedEraId,
        title,
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
        alert(
          "Failed to create release: " +
            (releaseError?.message || "Unknown error")
        );
        return;
      }

      newTrack.release_id = newRelease.id;

      const { error: trackError } = editingTrack
        ? await supabase
            .from("tracks")
            .update(newTrack)
            .eq("id", editingTrack.id)
        : await supabase.from("tracks").insert([newTrack]);

      if (trackError) {
        console.error(
          `Error ${editingTrack ? "updating" : "adding"} track:`,
          trackError
        );
        alert(
          `Failed to ${editingTrack ? "update" : "add"} track: ` +
            trackError.message
        );
      } else {
        console.log(
          `Created release and ${editingTrack ? "updated" : "added"} track:`,
          newRelease.id
        );
        alert(
          `New release created and track ${editingTrack ? "updated" : "added"}!`
        );
        setTitle("");
        setCoverImage("");
        setReleaseDate("");
        setReleaseCategory("released");
      }
    } else {
      newTrack.release_id = Number(selectedReleaseId);
      const { error: trackError } = editingTrack
        ? await supabase
            .from("tracks")
            .update(newTrack)
            .eq("id", editingTrack.id)
        : await supabase.from("tracks").insert([newTrack]);

      if (trackError) {
        console.error(
          `Error ${editingTrack ? "updating" : "adding"} track:`,
          trackError
        );
        alert(
          `Failed to ${editingTrack ? "update" : "add"} track: ` +
            trackError.message
        );
      } else {
        console.log(
          `Track ${editingTrack ? "updated" : "added"} to release:`,
          selectedReleaseId
        );
        alert(`Track ${editingTrack ? "updated" : "added"} successfully!`);
      }
    }

    // Refresh tracks after CRUD operation
    const { data: updatedTracks } = await supabase.from("tracks").select("*");
    setTracks(updatedTracks || []);

    setTrackTitle("");
    setTrackDuration("");
    setTrackFile("");
    setEditingTrack(null);
  };

  const handleEdit = (track: Track) => {
    setEditingTrack(track);
    setTrackTitle(track.title);
    setTrackDuration(track.duration);
    setTrackFile(track.file);
    setSelectedReleaseId(track.release_id.toString());
  };

  const handleDelete = async (trackId: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;

    const { error } = await supabase.from("tracks").delete().eq("id", trackId);
    if (error) {
      console.error("Error deleting track:", error);
      alert("Failed to delete track: " + error.message);
    } else {
      console.log("Track deleted:", trackId);
      alert("Track deleted successfully!");
      setTracks(tracks.filter((t) => t.id !== trackId));
    }
  };

  const filteredReleases = releases.filter(
    (release) => release.era_id === selectedEraId
  );
  const filteredTracks =
    selectedReleaseId === "new"
      ? tracks
      : tracks.filter(
          (track) => track.release_id === Number(selectedReleaseId)
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
        </>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold">
          {editingTrack ? "Edit Track" : "Add Track"}
        </h3>
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
        {editingTrack
          ? "Update Track"
          : selectedReleaseId === "new"
          ? "Create Release and Add Track"
          : "Add Track to Release"}
      </button>

      {/* Track List with CRUD Options */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg">Existing Tracks</h3>
        {filteredTracks.length === 0 ? (
          <p className="text-gray-600">No tracks found.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {filteredTracks.map((track) => (
              <li
                key={track.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <div>
                  <span className="font-medium">{track.title}</span> -{" "}
                  {track.duration}
                  <br />
                  <span className="text-sm text-gray-600">{track.file}</span>
                </div>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(track)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(track.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
