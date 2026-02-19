import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, name, password, role } = location.state || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(true);

  // Redirect if no email found
  if (!email) {
    navigate("/register");
    return null;
  }

  // Hide success message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/signup/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          name,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      // Show success and redirect to login
      navigate("/login", {
        state: { message: "Account created successfully! Please login." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/auth/signup/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      // Show success message
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-md";
      successDiv.textContent = "OTP resent successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-md z-50">
          ✓ OTP has been sent to your email!
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Verify Your Email
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          We've sent a 6-digit code to{" "}
          <span className="font-medium">{email}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
                setError("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Didn't receive the code?{" "}
            <span className="font-medium underline">Resend OTP</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/register"
            className="text-sm text-gray-600 hover:underline"
          >
            ← Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
