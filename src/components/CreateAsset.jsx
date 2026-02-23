import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";

function CreateAsset() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    isPublic: true,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (selectedFile.size > maxSize) {
      setError("File size must be under 50 MB");
      return;
    }
    setFile(selectedFile);
    setError("");

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview({ type: "image", src: reader.result });
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type.startsWith("video/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreview({ type: "video", src: url });
    } else {
      setPreview({ type: "file", name: selectedFile.name });
    }
  };

  const handleFileInput = (e) => handleFileSelect(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("title", formData.title.trim());
      body.append("description", formData.description.trim());
      body.append("isPublic", formData.isPublic);
      if (formData.tags.trim()) {
        formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((tag) => body.append("tags[]", tag));
      }

      const res = await fetch("http://localhost:3000/assets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create asset");

      navigate("/assets", {
        state: { message: "Asset uploaded successfully!" },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upload Asset
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Share your creative work with the community
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* File drop zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File <span className="text-red-500">*</span>
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-lg transition-colors ${
                  dragOver
                    ? "border-gray-600 dark:border-gray-400 bg-gray-50 dark:bg-gray-700"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                {preview ? (
                  <div className="relative p-4">
                    {preview.type === "image" && (
                      <img
                        src={preview.src}
                        alt="Preview"
                        className="max-h-56 mx-auto rounded object-contain"
                      />
                    )}
                    {preview.type === "video" && (
                      <video
                        src={preview.src}
                        controls
                        className="max-h-56 w-full rounded"
                      />
                    )}
                    {preview.type === "file" && (
                      <div className="flex items-center gap-3 py-4">
                        <svg
                          className="w-10 h-10 text-gray-400 dark:text-gray-500 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {preview.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-gray-900 dark:bg-gray-700 text-white rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                    <svg
                      className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Drop a file here, or{" "}
                      <span className="text-gray-900 dark:text-white underline">
                        browse
                      </span>
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Images, videos, documents up to 50 MB
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileInput}
                      accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent outline-none text-sm"
                placeholder="Give your asset a name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent outline-none text-sm resize-none"
                placeholder="Describe your asset (optional)"
              />
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent outline-none text-sm"
                placeholder="design, photography, video (comma-separated)"
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Separate tags with commas
              </p>
            </div>

            {/* Visibility */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Public
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Anyone can discover and view this asset
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isPublic}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 ${
                  formData.isPublic
                    ? "bg-gray-900 dark:bg-gray-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/assets")}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 12 16 12 12H4z"
                      />
                    </svg>
                    Uploading…
                  </span>
                ) : (
                  "Upload Asset"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default CreateAsset;
