import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import {
  setPublicAssets,
  setMyAssets,
  setLoading,
} from "../store/slice/assetSlice";
import Layout from "./Layout";

function AssetCard({ asset }) {
  const isImage = asset.fileType?.startsWith("image/");
  const isVideo = asset.fileType?.startsWith("video/");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Preview */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {isImage && asset.fileUrl ? (
          <img
            src={asset.fileUrl}
            alt={asset.title}
            className="w-full h-full object-cover"
          />
        ) : isVideo && asset.fileUrl ? (
          <video
            src={asset.fileUrl}
            className="w-full h-full object-cover"
            muted
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
            <svg
              className="w-10 h-10"
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
            <span className="text-xs">{asset.fileType || "File"}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
            {asset.title}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
              asset.isPublic
                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            {asset.isPublic ? "Public" : "Private"}
          </span>
        </div>

        {asset.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {asset.description}
          </p>
        )}

        {asset.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {asset.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {asset.uploadedBy?.name || "Unknown"}
          </span>
          {asset.fileUrl && (
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-700 dark:text-gray-300 hover:underline font-medium"
            >
              View →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Assets() {
  const dispatch = useDispatch();
  const { token, user } = useAuth();
  const { publicAssets, myAssets, loading } = useSelector(
    (state) => state.asserts,
  );

  const [activeTab, setActiveTab] = useState("public");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    fetchPublicAssets();
    if (token) fetchMyAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (tagFilter) params.set("tags", tagFilter);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const fetchPublicAssets = async () => {
    dispatch(setLoading(true));
    setError("");
    try {
      const res = await fetch(`http://localhost:3000/assets${buildQuery()}`);
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      dispatch(
        setPublicAssets(Array.isArray(data) ? data : (data.assets ?? [])),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchMyAssets = async () => {
    if (!token) return;
    dispatch(setLoading(true));
    setError("");
    try {
      const res = await fetch("http://localhost:3000/assets/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch your assets");
      const data = await res.json();
      dispatch(setMyAssets(Array.isArray(data) ? data : (data.assets ?? [])));
    } catch (err) {
      setError(err.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPublicAssets();
    if (token) fetchMyAssets();
  };

  const displayedAssets = activeTab === "public" ? publicAssets : myAssets;

  return (
    <Layout>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Assets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse and manage creative assets
          </p>
        </div>
        <Link
          to="/assets/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload Asset
        </Link>
      </div>

      {/* Search & filter */}
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent outline-none text-sm"
        />
        <input
          type="text"
          placeholder="Filter by tag..."
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="sm:w-44 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent outline-none text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          Search
        </button>
      </form>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {["public", "mine"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab === "public" ? "Public Assets" : "My Assets"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && displayedAssets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No assets found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {activeTab === "mine"
              ? "You haven't uploaded any assets yet."
              : "No public assets available."}
          </p>
          <Link
            to="/assets/create"
            className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Upload your first asset
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && displayedAssets.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayedAssets.map((asset) => (
            <AssetCard key={asset._id} asset={asset} />
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Assets;
