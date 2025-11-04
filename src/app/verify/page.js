"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      alert("Please enter a valid 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        alert(data.message || "Invalid OTP");
        return;
      }

      // Step 2: Check if new or existing user
      if (data.isNew) {
        // ✅ Create placeholder user
        const createRes = await fetch("/api/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const createData = await createRes.json();
        if (!createData.success) {
          alert("Failed to create user. Try again.");
          return;
        }

        // Redirect to registration page
        router.push(`/register?email=${email}`);
      } else {
        // ✅ Existing user → sign in
        const result = await signIn("credentials", {
          email,
          redirect: false,
        });

        if (result?.error) {
          alert("Sign-in failed. Try again.");
          return;
        }

        router.push("/"); // Redirect to home
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-orange-600">
          Verify OTP 🔐
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Enter the 4-digit code sent to <b>{email}</b>
        </p>
        <input
          type="text"
          placeholder="Enter OTP"
          maxLength={4}
          className="border w-full p-3 rounded mb-4 text-center text-lg tracking-widest"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white w-full p-3 rounded"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-orange-500">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
