"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Album, Track } from "@/lib/types";

export default function UploadForm() {
  const [albums, setAlbums] = useState<Album[]>([]); // List of existing albums
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("new"); // Default to creating new album
  const [customId, setCustomId] = useState(""); // For new album
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackFile, setTrackFile] = useState("");

  // Fetch existing albums on mount
  useEffect(() => {
    const fetchAlbums = async () => {
      const { data, error } = await supabase.from("albums").select("*");
      if (error) {
        console.error("Error fetching albums:", error);
      } else {
        setAlbums(data || []);
      }
    };
    fetchAlbums();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle || !trackDuration || !trackFile) {
      alert("Please fill in all track details.");
      return;
    }

    const newTrack: Track = {
      id: Date.now().toString(),
      title: trackTitle,
      duration: trackDuration,
      file: trackFile,
    };

    if (selectedAlbumId === "new") {
      // Create new album
      if (!customId || !title || !coverImage || !releaseDate) {
        alert("Please fill in all new album details.");
        return;
      }

      const albumData: Album = {
        id: customId,
        title,
        cover_image: coverImage,
        release_date: releaseDate,
        tracks: [newTrack],
      };

      const { data: existingAlbum, error: checkError } = await supabase
        .from("albums")
        .select("id")
        .eq("id", customId)
        .single();

      if (existingAlbum) {
        alert("Error: This Album ID already exists. Please use a unique ID.");
        return;
      }
      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking ID:", checkError);
        alert("Failed to check ID: " + checkError.message);
        return;
      }

      const { error, data } = await supabase
        .from("albums")
        .insert([albumData])
        .select()
        .single();
      if (error) {
        console.error("Error creating album:", error);
        alert("Failed to create album: " + error.message);
      } else {
        console.log("Created album:", data);
        alert("New album created and track added!");
        setCustomId("");
        setTitle("");
        setCoverImage("");
        setReleaseDate("");
      }
    } else {
      // Add track to existing album
      const selectedAlbum = albums.find(
        (album) => album.id === selectedAlbumId
      );
      if (!selectedAlbum) {
        alert("Selected album not found.");
        return;
      }

      const updatedTracks = [...selectedAlbum.tracks, newTrack];
      const { error } = await supabase
        .from("albums")
        .update({ tracks: updatedTracks })
        .eq("id", selectedAlbumId);

      if (error) {
        console.error("Error adding track:", error);
        alert("Failed to add track: " + error.message);
      } else {
        console.log("Track added to album:", selectedAlbumId);
        alert("Track added successfully!");
      }
    }

    // Reset track fields
    setTrackTitle("");
    setTrackDuration("");
    setTrackFile("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Album
        </label>
        <select
          value={selectedAlbumId}
          onChange={(e) => setSelectedAlbumId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="new">Create New Album</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.title} ({album.id})
            </option>
          ))}
        </select>
      </div>

      {selectedAlbumId === "new" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Album ID (Custom)
            </label>
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., nectar-002"
              required={selectedAlbumId === "new"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Album Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required={selectedAlbumId === "new"}
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
              required={selectedAlbumId === "new"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Release Date
            </label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full p-2 border rounded"
              required={selectedAlbumId === "new"}
            />
          </div>
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
        {selectedAlbumId === "new"
          ? "Create Album and Add Track"
          : "Add Track to Album"}
      </button>
    </form>
  );
}
