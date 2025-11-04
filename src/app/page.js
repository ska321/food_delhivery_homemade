"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Utensils, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // redirect to custom login page
    }
  }, [status, router]);

  // Load cart count
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const items = JSON.parse(stored);
      setCartCount(items.length);
    }
  }, []);

  // Fetch user data from database
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/user/${session.user.id}`);
          const data = await res.json();
          if (res.ok) setUserData(data);
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* HEADER */}
      <header className="sticky top-0 bg-white shadow-md z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Utensils className="text-red-500" size={26} />
             <Link href={"/"}><h1 className="text-2xl font-bold text-gray-800">MayukhCake</h1></Link>   
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search for dishes..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-red-400 focus:outline-none w-64 text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <Link href="/cart" className="relative cursor-pointer">
              <ShoppingCart className="text-gray-700" size={26} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER INFO (FETCHED FROM DATABASE) */}
            <div
              onClick={() => router.push("/myaccount")}
              className="flex items-center gap-2 ml-3 cursor-pointer hover:opacity-80 transition"
            >
              <span className="hidden sm:block font-medium text-gray-700">
                {userData?.name || session.user.name}
              </span>
              <img
                src={
                  userData?.dp ||
                  session.user.image ||
                  "/default-avatar.png"
                }
                alt="User avatar"
                className="w-9 h-9 rounded-full border border-gray-200 object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="max-w-lg space-y-5">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
            Fresh Homemade <span className="text-red-500">Pizza</span> &{" "}
            <span className="text-orange-500">Cakes</span> — Delivered Fast 🍕🎂
          </h1>
          <p className="text-gray-600 text-lg">
            Crafted with love, baked fresh after you order. Fast local delivery within 1 hour!
          </p>

          <Link href="/menu">
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
              Order Now
            </button>
          </Link>
        </div>

        <div className="relative">
          <img
            src="/pizza.png"
            alt="Delicious pizza and cake"
            className="w-[400px] sm:w-[480px] rounded-3xl object-cover"
          />
          <div className="absolute -top-4 -left-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md animate-bounce">
            20% OFF Today
          </div>
        </div>
      </section>

      {/* CATEGORY PREVIEW */}
      <section className="bg-white py-10 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Explore by Category</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              { name: "Pizza", img: "/pizza.png" },
              { name: "Cake", img: "/cake.webp" },
              { name: "Chocolate", img: "/chocolate.webp" },
            ].map((cat) => (
              <div
                key={cat.name}
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-full shadow-md"
                />
                <p className="mt-2 text-sm font-medium text-gray-700">{cat.name}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/menu">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md">
                View Full Menu →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-6 mt-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-700">MayukhCake</span>. Order happiness, one bite at a time ❤️
        </div>
      </footer>
    </div>
  );
}
