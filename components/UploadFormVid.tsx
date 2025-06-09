"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function UploadFormVid() {
  const router = useRouter();
  const { user, isSignedIn } = useUser(); // Add Clerk's useUser hook
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
      if (!url || typeof url !== "string") return "";

      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(normalizedUrl);

      const searchParams = new URLSearchParams(urlObj.search);
      if (urlObj.hostname.includes("youtube.com") && searchParams.has("v")) {
        return searchParams.get("v") || "";
      } else if (urlObj.hostname.includes("youtu.be")) {
        const pathSegments = urlObj.pathname.split("/").filter(Boolean);
        return pathSegments.length > 0 ? pathSegments[0] : "";
      }

      return "";
    } catch (e) {
      console.error("Invalid URL format:", e, "URL:", url);
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isSignedIn || user?.publicMetadata?.role !== "admin") {
      setError("Only admins can upload videos.");
      return;
    }

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
          video_id: extractedVideoId,
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
      return;
    }

    const { error: insertError } = await supabase
      .from("videos")
      .insert(videoData);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      // Redirect to the season page after successful upload
      if (seasonId) {
        router.push(`/seasons/${seasonId}`);
      }
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

  const removeVideoForm = (key: number) => {
    setVideoForms(videoForms.filter((form) => form.key !== key));
  };

  const updateVideoForm = (index: number, field: string, value: string) => {
    const newForms = [...videoForms];
    newForms[index] = { ...newForms[index], [field]: value };
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

  if (!isSignedIn || user?.publicMetadata?.role !== "admin") {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-gray-400">Only admins can upload videos.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
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
          className="border border-gray-600 p-4 rounded-lg space-y-4 bg-gray-800/50"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-white text-lg font-semibold">
              Video {index + 1}
            </h3>
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeVideoForm(form.key)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
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
