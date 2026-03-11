"use client";

import { useState, useRef } from "react";
import axios from "axios";
import ProgressBar from "./ProgressBar";
import PlatformIcon from "./PlatformIcon";
import { ClipboardIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Downloader() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [thumbnail, setThumbnail] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");

  const [formats, setFormats] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const [activeDownload, setActiveDownload] = useState<string | null>(null);

  const pollRef = useRef<any>(null);

  const isYouTube = url.includes("youtube") || url.includes("youtu.be");

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function pasteURL() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      setError("Clipboard permission denied");
    }
  }

  function clearInput() {
    setUrl("");
  }

  async function generateInfo() {
    setError("");
    stopPolling();

    if (!url.trim()) {
      setError("Paste a valid video URL");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5000/api/info", {
        url,
      });

      const video = data.result || data;

      setThumbnail(video.thumbnail);
      setTitle(video.title);
      setDuration(formatDuration(video.duration));

      const map: any = {};
      const allowed = [360, 480, 720, 1080];

      video.formats?.forEach((f: any) => {
        if (!f.height) return;

        const height = f.height;

        if (!allowed.includes(height)) return;

        if (!map[height]) {
          map[height] = {
            label: `${height}p`,
            formatId: f.format_id,
            height: height,
            size: formatSize(f.filesize),
            badge: height >= 720 ? "HD" : "SD",
            hasVideo: f.hasVideo,
            hasAudio: f.hasAudio,
            ext: f.ext,
          };
        }
      });

      const videoFormats = Object.values(map);

      videoFormats.sort((a: any, b: any) => b.height - a.height);

      const mp3 = {
        label: "MP3",
        formatId: "mp3",
        size: "",
        badge: "Audio",
        hasVideo: false,
        hasAudio: true,
      };

      setFormats([...videoFormats, mp3]);

      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.error || "Failed to fetch video info");
    }
  }

  async function startDownload(formatId: string) {
    setActiveDownload(formatId);
    setProgress(0);
    stopPolling();

    try {
      const res = await axios.post("http://localhost:5000/api/download", {
        url,
        format: formatId,
      });

      if (res.data?.type === "direct") {
        window.open(res.data.downloadUrl);
        setActiveDownload(null);
        return;
      }

      const jobId = res.data?.jobId;

      if (!jobId) {
        setActiveDownload(null);
        setError("Invalid download response");
        return;
      }

      pollRef.current = setInterval(async () => {
        try {
          const { data } = await axios.get(
            `http://localhost:5000/api/status/${jobId}`,
          );

          setProgress(data.progress || 0);

          if (data.status === "completed" && data.result) {
            stopPolling();

            window.open(`http://localhost:5000${data.result.downloadUrl}`);

            setActiveDownload(null);
          }

          if (data.status === "failed") {
            stopPolling();

            setActiveDownload(null);

            setError("Download failed");
          }
        } catch {
          stopPolling();

          setActiveDownload(null);

          setError("Download error");
        }
      }, 1000);
    } catch {
      setError("Server error");
      setActiveDownload(null);
    }
  }

  function formatDuration(sec: number) {
    if (!sec) return "";

    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function formatSize(bytes: number) {
    if (!bytes) return "";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <PlatformIcon url={url} />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") generateInfo();
              }}
              placeholder="Paste video URL"
              className="w-full border p-3 pr-20 rounded-lg"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              {url && (
                <button
                  onClick={clearInput}
                  className="text-gray-400 hover:text-black cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={pasteURL}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <ClipboardIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={generateInfo}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg md:w-auto w-full cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              "Generate"
            )}
          </button>
        </div>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        {thumbnail && (
          <div className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img src={thumbnail} className="rounded-lg" />
                <p className="text-gray-500 text-sm mt-2">
                  Duration: {duration}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">{title}</h3>

                {isYouTube && (
                  <a
                    href={thumbnail}
                    download
                    className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Download Thumbnail
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {formats.map((f, index) => {
                const loading = f.formatId === activeDownload;
                const recommended = index === 1;
                const mute = f.hasVideo && !f.hasAudio;

                return (
                  <div
                    key={f.formatId}
                    className="flex items-center justify-between shadow-md p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{f.label}</span>

                      {mute && <span className="text-red-500 text-sm">🔇</span>}

                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {f.badge}
                      </span>

                      {recommended && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Recommended
                        </span>
                      )}

                      <span className="text-gray-500 text-sm">{f.size}</span>
                    </div>

                    <button
                      onClick={() => startDownload(f.formatId)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center w-28"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Download"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {progress > 0 && (
          <div className="mt-6">
            <ProgressBar progress={progress} />
            <p className="text-center text-gray-500 mt-2">
              Downloading {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
