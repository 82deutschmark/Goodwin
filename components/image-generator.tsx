/**
 * ImageGenerator Component
 * Purpose: Lets users enter a prompt, select number of images, image size, and quality, then generate and download images via the /api/generate-image endpoint.
 * How it works: Sends prompt, n, size, and quality to backend; displays image(s) or errors; offers download links.
 * Integrates visually and functionally with the app's main page.
 * Author/Model: Claude 3.7 Sonnet
 * Date: 2025-05-20
 *
 * To use: Import and render <ImageGenerator /> in your main page or UI.
 */

"use client";
import React, { useState } from "react";
// Use Next.js Image for optimal performance
import Image from "next/image";

/**
 * ImageGenerator component
 * Allows users to generate images using OpenAI's gpt-image-1 model.
 * Features:
 * - User inputs prompt, number of images, size, and quality.
 * - Accessible form with proper label associations.
 * - Download links use sanitized prompt-based filenames.
 *
 * Author: Claude 3.7 Sonnet
 * Last updated: 2025-05-20
 */
export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [n, setN] = useState(2); // default 2 images
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("high");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // Sizes supported by gpt-image-1: 1024x1024, 1024x1536, 1536x1024, auto
  const presetSizes = [
    "1024x1024",
    "1024x1536",
    "1536x1024",
    "auto"
  ];

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setImages([]);
    try {
      const chosenSize = size;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, n, size: chosenSize, quality })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      // Support both url and b64_json (base64) for robustness
      const imageSources = data.data.map((img: { url?: string; b64_json?: string }) => {
        if (img.url) return img.url;
        if (img.b64_json) return `data:image/png;base64,${img.b64_json}`;
        return null;
      }).filter(Boolean);
      setImages(imageSources);
    } catch (err: unknown) {
      // Type-safe error handling for unknown type
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate image");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full h-full flex flex-col justify-start border border-gray-100 dark:border-gray-800">
      {/* Card-style container for Image Generator */}
      <h2 className="text-xl font-bold mb-6 text-blue-700 dark:text-blue-200 tracking-tight">Image Generator</h2>
      <form
        onSubmit={handleGenerate}
        className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 w-full"
        style={{ flexWrap: "wrap" }}
      >
        {/* Prompt field */}
        <div className="flex flex-col flex-1 min-w-[180px]">
          <label htmlFor="prompt-input" className="text-sm font-medium mb-1">Prompt</label>
          <textarea
            id="prompt-input"
            name="prompt"
            className="border rounded-md p-2 text-black resize-y min-h-[44px] focus:outline-blue-400"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your image..."
            required
            rows={2}
            autoComplete="off"
          />
        </div>
        {/* Number of images field */}
        <div className="flex flex-col min-w-[100px] max-w-[120px]">
          <label htmlFor="number-input" className="text-sm font-medium mb-1">Number</label>
          <input
            id="number-input"
            name="number"
            type="number"
            min={1}
            max={10}
            className="border rounded-md p-2 text-black focus:outline-blue-400"
            value={n}
            onChange={e => setN(Number(e.target.value))}
            required
            autoComplete="off"
          />
        </div>
        {/* Size field */}
        <div className="flex flex-col min-w-[120px] max-w-[150px]">
          <label htmlFor="size-select" className="text-sm font-medium mb-1">Size</label>
          <select
            id="size-select"
            name="size"
            className="border rounded-md p-2 text-black focus:outline-blue-400"
            value={size}
            onChange={e => setSize(e.target.value)}
            autoComplete="off"
          >
            {presetSizes.map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500 mt-1">Supported: 1024x1024, 1024x1536, 1536x1024, auto</span>
        </div>
        {/* Quality field */}
        <div className="flex flex-col min-w-[100px] max-w-[120px]">
          <label htmlFor="quality-select" className="text-sm font-medium mb-1">Quality</label>
          <select
            id="quality-select"
            name="quality"
            className="border rounded-md p-2 text-black focus:outline-blue-400"
            value={quality}
            onChange={e => setQuality(e.target.value)}
            autoComplete="off"
          >
            <option value="high">High</option>
            <option value="standard">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        {/* Submit button */}
        <div className="flex flex-col md:justify-end w-full md:w-auto">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 w-full md:w-auto mt-2 md:mt-0"
            style={{ minWidth: 150 }}
          >
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </div>
      </form>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {images.length === 0 && !loading && (
        <div className="text-gray-500 mt-6">No images to display. Try generating some!</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {images.map((src, idx) => {
          // Helper to sanitize prompt for filenames
          function sanitizeFilename(text: string) {
            return text
              .toLowerCase()
              .replace(/[^a-z0-9\-_]+/g, '-') // Replace non-alphanum with dash
              .replace(/^-+|-+$/g, '')         // Trim leading/trailing dashes
              .replace(/-+/g, '-')             // Collapse multiple dashes
              .slice(0, 32)                    // Limit length
              || 'image';
          }
          const baseFilename = sanitizeFilename(prompt);
          const filename = `${baseFilename || 'image'}-${idx+1}.png`;
          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Use Next.js <Image> for optimal performance. Handles both URL and base64 images. */}
              <Image
                src={src}
                alt={prompt ? `${prompt} (${idx+1})` : `Generated ${idx+1}`}
                width={512}
                height={512}
                className="rounded shadow w-full h-auto"
                unoptimized={src.startsWith('data:')}
              />
              <a href={src} download={filename} className="mt-2 text-blue-600 underline">Download</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
