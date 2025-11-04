"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut } from "lucide-react";

export default function MyAccount() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("account");
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    occupation: "",
    age: "",
    dp: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/user/${session.user.id}`);
          const data = await res.json();
          if (res.ok) {
            setUserData(data);
            setForm({
              name: data.name || "",
              address: data.address || "",
              occupation: data.occupation || "",
              age: data.age || "",
              dp: data.dp || "",
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [session]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/orders?userId=${session.user.id}`);
          const data = await res.json();
          if (res.ok) setOrders(data);
        } catch (err) {
          console.error("Error fetching orders:", err);
        }
      }
    };
    fetchOrders();
  }, [session]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataUrl: reader.result }),
          });
          const data = await res.json();
          if (res.ok && data.url) {
            setForm((prev) => ({ ...prev, dp: data.url }));
          } else {
            alert("Image upload failed.");
          }
        } catch (err) {
          console.error("Upload error:", err);
          alert("Error uploading image.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File processing error:", err);
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/user/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setUserData(data);
        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Something went wrong!");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">Loading your account...</p>
      </div>
    );
  }

  const variants = {
    hidden: { opacity: 0, x: 40 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 md:p-6 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">My Account</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm md:text-base font-semibold shadow-md"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* TABS */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-5 py-2 rounded-full text-sm md:text-base font-medium shadow-sm transition ${
              activeTab === "account"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👤 Account Details
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2 rounded-full text-sm md:text-base font-medium shadow-sm transition ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🛒 Order History
          </button>
        </div>

        {/* TABBED CONTENT WITH ANIMATION */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "account" && userData && (
              <motion.div
                key="account"
                initial="hidden"
                animate="enter"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 max-w-lg mx-auto"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={form.dp || "/default-avatar.png"}
                    alt="User"
                    className="w-24 h-24 rounded-full border border-gray-200 object-cover mb-3"
                  />

                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow"
                    >
                      ✏️ Edit Profile
                    </button>
                  ) : (
                    <div className="flex justify-center gap-3 mb-4">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setForm({
                            name: userData.name || "",
                            address: userData.address || "",
                            occupation: userData.occupation || "",
                            age: userData.age || "",
                            dp: userData.dp || "",
                          });
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {["name", "address", "occupation", "age"].map((field) => (
                    <div key={field}>
                      <label className="text-gray-600 text-sm font-medium capitalize">
                        {field}
                      </label>
                      <input
                        type={field === "age" ? "number" : "text"}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg text-gray-700 ${
                          editMode
                            ? "border-blue-400 focus:ring-2 focus:ring-blue-200"
                            : "border-gray-200 bg-gray-100"
                        }`}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-gray-600 text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="w-full mt-1 px-3 py-2 border rounded-lg border-gray-200 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-gray-600 text-sm font-medium">
                      Profile Picture
                    </label>
                    {editMode ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="mt-2 w-full text-sm text-gray-600"
                        />
                        {uploading && (
                          <p className="text-blue-500 text-xs mt-1">
                            Uploading image...
                          </p>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={form.dp}
                        disabled
                        className="w-full mt-1 px-3 py-2 border rounded-lg border-gray-200 bg-gray-100"
                      />
                    )}
                  </div>

                  {userData.joinedAt && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Joined on: {new Date(userData.joinedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial="hidden"
                animate="enter"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-lg rounded-2xl p-5 sm:p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  🧾 Your Order History
                </h2>

                {orders.length === 0 ? (
                  <p className="text-gray-600 text-center">No orders found 😔</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 bg-white"
                      >
                        <p className="text-sm text-gray-500 mb-1">
                          🆔 <span className="font-medium">Order ID:</span> {order._id}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          🚚 <span className="font-medium">Status:</span>{" "}
                          {order.status}
                        </p>

                        <div className="space-y-3 mt-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 border-t pt-2"
                            >
                              <img
                                src={item.image || "/default-food.png"}
                                alt={item.name}
                                className="w-14 h-14 rounded-lg object-cover border"
                              />
                              <div className="text-sm text-gray-700">
                                <p className="font-semibold">{item.name} 🍽️</p>
                                <p className="text-gray-500">
                                  Qty: {item.qty} × ₹{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-sm text-gray-500 mt-4">
                          📍 <span className="font-medium">Address:</span>{" "}
                          {order.customer.address}
                        </p>

                        <p className="text-sm text-gray-700 mt-2 text-right font-semibold">
                          💰 Total: ₹
                          {order.items.reduce(
                            (sum, item) => sum + item.price * item.qty,
                            0
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
