"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadFormVid() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoId, setVideoId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [type, setType] = useState("main");
  const [uploadDate, setUploadDate] = useState("");
  const [channel, setChannel] = useState("DizastaMusic"); // Default channel
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const { error: insertError } = await supabase.from("videos").insert({
      title,
      description,
      video_id: videoId,
      video_url: videoUrl,
      episode_number: episodeNumber,
      type,
      upload_date: uploadDate
        ? new Date(uploadDate).toISOString().split("T")[0]
        : null,
      channel,
      season_id: seasonId,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      // Reset form
      setTitle("");
      setDescription("");
      setVideoId("");
      setVideoUrl("");
      setEpisodeNumber("");
      setType("main");
      setUploadDate("");
      setChannel("DizastaMusic"); // Reset to default channel
      setSeasonId(null);
    }
  };

  // Channel list from your input
  const channels = [
    "Cosmochino",
    "2cool4u92",
    "DizastaMusic",
    "AussieAsianBoyz",
    "Facebook",
    "TVFilthyFrank",
    "TooDamnFilthy",
    "h3h3productions",
    "maxmoefoegames",
    "maxmoefoetwo",
    "iDubbbzTV",
    "HowToBasic",
    "maxmoefoe",
    "JonTronShow",
    "SaZZGamingYT",
    "88rising",
    "theneedledrop",
    "Making Of The Memes",
    "デーモンAstari",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <p className="text-green-400 text-center">
          Video uploaded successfully!
        </p>
      )}
      {error && <p className="text-red-400 text-center">{error}</p>}
      <div>
        <label className="block text-white mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white mb-1">Video ID</label>
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white mb-1">Video URL</label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white mb-1">Episode Number</label>
        <input
          type="text"
          value={episodeNumber}
          onChange={(e) => setEpisodeNumber(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="main">Main</option>
          <option value="extra">Extra</option>
        </select>
      </div>
      <div>
        <label className="block text-white mb-1">Upload Date</label>
        <input
          type="date"
          value={uploadDate}
          onChange={(e) => setUploadDate(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-white mb-1">Channel</label>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          {channels.map((channelName) => (
            <option key={channelName} value={channelName}>
              {channelName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-white mb-1">Season ID (optional)</label>
        <input
          type="text"
          value={seasonId || ""}
          onChange={(e) => setSeasonId(e.target.value || null)}
          placeholder="Enter season UUID"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors"
      >
        Upload Video
      </button>
    </form>
  );
}
