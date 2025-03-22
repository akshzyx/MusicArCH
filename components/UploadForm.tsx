"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Album, Track } from "@/lib/types";

export default function UploadForm() {
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackFile, setTrackFile] = useState("");

  const addTrack = () => {
    if (trackTitle && trackDuration && trackFile) {
      const newTrack: Track = {
        id: Date.now().toString(),
        title: trackTitle,
        duration: trackDuration,
        file: trackFile,
      };
      setTracks([...tracks, newTrack]);
      setTrackTitle("");
      setTrackDuration("");
      setTrackFile("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const albumData: Omit<Album, "id"> = {
      title,
      cover_image: coverImage,
      release_date: releaseDate,
      tracks,
    };
    const { error } = await supabase.from("albums").insert([albumData]);
    if (error) {
      console.error("Error uploading album:", error);
      alert("Failed to upload album");
    } else {
      alert("Album uploaded successfully!");
      setTitle("");
      setCoverImage("");
      setReleaseDate("");
      setTracks([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Album Title
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
      <div className="space-y-2">
        <h3 className="font-semibold">Add Tracks</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Track Title"
            value={trackTitle}
            onChange={(e) => setTrackTitle(e.target.value)}
            className="p-2 border rounded flex-1"
          />
          <input
            type="text"
            placeholder="Duration (e.g., 3:45)"
            value={trackDuration}
            onChange={(e) => setTrackDuration(e.target.value)}
            className="p-2 border rounded w-24"
          />
          <input
            type="url"
            placeholder="Track URL (GitHub)"
            value={trackFile}
            onChange={(e) => setTrackFile(e.target.value)}
            className="p-2 border rounded flex-1"
          />
          <button
            type="button"
            onClick={addTrack}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {tracks.map((track) => (
            <li key={track.id}>
              {track.title} - {track.duration}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Upload Album
      </button>
    </form>
  );
}
