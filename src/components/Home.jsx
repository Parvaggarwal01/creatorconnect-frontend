import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";

function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to CreatorConnect
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You are successfully logged in to your account.
        </p>

        {/* User Info Card */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="flex border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-400 w-24">
                Name:
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {user.name}
              </span>
            </div>
            <div className="flex border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-400 w-24">
                Email:
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {user.email}
              </span>
            </div>
            <div className="flex border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-400 w-24">
                Role:
              </span>
              <span className="text-sm text-gray-900 dark:text-white capitalize">
                {user.role}
              </span>
            </div>
            <div className="flex">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-400 w-24">
                User ID:
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-mono">
                {user.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-gray-900 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Profile
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Manage your profile and personal information
          </p>
        </div>

        {/* Assets */}
        <Link
          to="/assets"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-gray-900 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:underline">
            Assets
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Browse, upload and manage creative assets
          </p>
        </Link>

        {/* Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-gray-900 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your performance and engagement
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
