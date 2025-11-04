"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendOtp = async () => {
    if (!email) {
      alert("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again!");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-orange-100">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-orange-600">
          Welcome Back 🍕
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Enter your email to receive your 4-digit OTP
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-3 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 outline-none"
        />

        <button
          onClick={sendOtp}
          disabled={loading}
          className={`w-full p-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-orange-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {loading ? "Sending OTP..." : "Get OTP"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Secure login with instant OTP — no password needed 🍰
        </p>
      </div>
    </div>
  );
}
