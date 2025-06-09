"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadFormVid() {
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [seasons, setSeasons] = useState<{ id: string; season_name: string }[]>(
    []
  );
  const [videoForms, setVideoForms] = useState([
    {
      key: Date.now(),
      title: "",
      description: "",
      videoUrl: "",
      episodeNumber: "",
      type: "main",
      uploadDate: "",
      channel: "DizastaMusic",
    },
  ]);

  // Fetch seasons from Supabase on component mount
  useEffect(() => {
    const fetchSeasons = async () => {
      const { data, error } = await supabase
        .from("seasons")
        .select("id, season_name")
        .order("season_name", { ascending: true });

      if (error) {
        console.error("Error fetching seasons:", error.message);
        setError("Failed to load seasons. Please try again later.");
      } else {
        setSeasons(data || []);
        if (data && data.length > 0 && !seasonId) {
          setSeasonId(data[0].id);
        }
      }
    };

    fetchSeasons();
  }, [seasonId]);

  // Enhanced function to extract video ID from YouTube URL
  const extractVideoId = (url: string): string => {
    try {
      // Handle empty or invalid input
      if (!url || typeof url !== "string") return "";

      // Normalize URL by adding https:// if missing
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(normalizedUrl);

      // Check for youtube.com/watch?v=
      const searchParams = new URLSearchParams(urlObj.search);
      if (urlObj.hostname.includes("youtube.com") && searchParams.has("v")) {
        return searchParams.get("v") || "";
      }
      // Check for youtu.be/ short URL
      else if (urlObj.hostname.includes("youtu.be")) {
        const pathSegments = urlObj.pathname.split("/").filter(Boolean);
        return pathSegments.length > 0 ? pathSegments[0] : "";
      }

      return ""; // Return empty string if no valid ID found
    } catch (e) {
      console.error("Invalid URL format:", e, "URL:", url);
      return ""; // Return empty string for malformed URLs
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!seasonId) {
      setError("Season ID is required.");
      return;
    }

    const videoData = videoForms
      .map((form, index) => {
        const extractedVideoId = extractVideoId(form.videoUrl);
        if (!extractedVideoId) {
          setError(
            `Invalid YouTube URL for Video ${
              index + 1
            }. Please provide a valid URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ).`
          );
          return null;
        }
        return {
          title: form.title,
          description: form.description,
          video_id: extractedVideoId, // Automatically extracted and included
          video_url: form.videoUrl,
          episode_number: form.episodeNumber,
          type: form.type,
          upload_date: form.uploadDate
            ? new Date(form.uploadDate).toISOString().split("T")[0]
            : null,
          channel: form.channel,
          season_id: seasonId,
          created_at: new Date().toISOString(),
        };
      })
      .filter((item) => item !== null);

    if (videoData.length !== videoForms.length) {
      return; // Stop submission if any URL is invalid
    }

    const { error: insertError } = await supabase
      .from("videos")
      .insert(videoData);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      // Reset form
      setVideoForms([
        {
          key: Date.now(),
          title: "",
          description: "",
          videoUrl: "",
          episodeNumber: "",
          type: "main",
          uploadDate: "",
          channel: "DizastaMusic",
        },
      ]);
      if (seasons.length > 0) {
        setSeasonId(seasons[0].id);
      } else {
        setError(null);
      }
    }
  };

  const addVideoForm = () => {
    setVideoForms([
      ...videoForms,
      {
        key: Date.now(),
        title: "",
        description: "",
        videoUrl: "",
        episodeNumber: "",
        type: "main",
        uploadDate: "",
        channel: "DizastaMusic",
      },
    ]);
  };

  const updateVideoForm = (index: number, field: string, value: string) => {
    const newForms = [...videoForms];
    newForms[index] = { ...newForms[index], [field]: value };
    // Automatically extract and update videoId when videoUrl changes
    if (field === "videoUrl") {
      const extractedId = extractVideoId(value);
      if (!extractedId) {
        console.warn(`No valid video ID extracted for URL: ${value}`);
      }
    }
    setVideoForms(newForms);
  };

  // Channel list
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
          Videos uploaded successfully!
        </p>
      )}
      {error && <p className="text-red-400 text-center">{error}</p>}
      <div>
        <label className="block text-white mb-1">Season ID</label>
        <select
          value={seasonId || ""}
          onChange={(e) => setSeasonId(e.target.value || null)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        >
          <option value="" disabled>
            Select a season
          </option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.season_name}
            </option>
          ))}
        </select>
      </div>
      {videoForms.map((form, index) => (
        <div
          key={form.key}
          className="border border-gray-600 p-4 rounded-lg space-y-4"
        >
          <h3 className="text-white text-lg font-semibold">
            Video {index + 1}
          </h3>
          <div>
            <label className="block text-white mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateVideoForm(index, "title", e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Episode Number</label>
            <input
              type="text"
              value={form.episodeNumber}
              onChange={(e) =>
                updateVideoForm(index, "episodeNumber", e.target.value)
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-1">Channel</label>
              <select
                value={form.channel}
                onChange={(e) =>
                  updateVideoForm(index, "channel", e.target.value)
                }
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
              <label className="block text-white mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => updateVideoForm(index, "type", e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="main">Main</option>
                <option value="extra">Extra</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-white mb-1">Upload Date</label>
            <input
              type="date"
              value={form.uploadDate}
              onChange={(e) =>
                updateVideoForm(index, "uploadDate", e.target.value)
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Video URL</label>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) =>
                updateVideoForm(index, "videoUrl", e.target.value)
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
              placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                updateVideoForm(index, "description", e.target.value)
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addVideoForm}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors mt-4"
      >
        Add Another Video
      </button>
      <button
        type="submit"
        className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors mt-4"
      >
        Upload Videos
      </button>
    </form>
  );
}
