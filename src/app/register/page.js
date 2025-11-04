"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * ✅ Wrapper component to handle suspense for useSearchParams()
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    address: "",
    occupation: "",
    age: "",
    dp: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.occupation || !form.age) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        // ✅ Auto sign in after registration
        const result = await signIn("credentials", {
          email,
          redirect: false,
        });

        if (result?.error) {
          alert("Sign-in failed. Please try again.");
          return;
        }

        alert("Profile completed successfully!");
        router.push("/"); // redirect home
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Server error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-orange-600">
          Complete Your Profile 🍰
        </h1>

        <p className="text-center text-gray-500 mb-6">
          We’ve created your account using <b>{email}</b>.
          <br />
          Please provide the rest of your details.
        </p>

        <div className="space-y-3">
          <input
            placeholder="Full Name"
            className="border p-3 w-full rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Address"
            className="border p-3 w-full rounded"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            placeholder="Occupation"
            className="border p-3 w-full rounded"
            value={form.occupation}
            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
          />
          <input
            placeholder="Age"
            type="number"
            className="border p-3 w-full rounded"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
          <input
            placeholder="Profile Image URL (optional)"
            className="border p-3 w-full rounded"
            value={form.dp}
            onChange={(e) => setForm({ ...form, dp: e.target.value })}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-6 w-full p-3 rounded text-white font-medium ${
            loading
              ? "bg-orange-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {loading ? "Saving..." : "Register"}
        </button>
      </div>
    </div>
  );
}
