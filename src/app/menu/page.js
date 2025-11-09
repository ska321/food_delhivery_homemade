"use client";
import useSWR from "swr";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { ShoppingCart, Search, Utensils } from "lucide-react";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Menu() {
  const { data, error } = useSWR("/api/menu", fetcher);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // 🧠 Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // 💾 Save cart to localStorage on every change
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  // 🛒 Add item to cart (includes image)
  function addToCart(item) {
    const next = [
      ...cart,
      {
        _id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        size: item.size || null,
        image: item.image || "/placeholder.png",
        qty: 1,
      },
    ];
    setCart(next);
    // alert(`${item.name} added to cart 🍴`);
  }

  if (error) return <div className="text-center text-red-600">Failed to load menu.</div>;
  if (!data) return <div className="text-center mt-10 text-gray-600">Loading menu...</div>;

  // 🧭 Filter by search and category
  const filtered = data.filter((it) => {
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || it.category === activeCategory;
    return matchSearch && matchCategory;
  });

  // ✅ Only two categories: Pizza and Cake
  const categories = ["All", "Pizza", "Cake"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 bg-white shadow-md z-20 w-full">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 p-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Utensils className="text-red-500" size={26} />
            <Link href={"/"}><h1 className="text-2xl font-bold text-gray-800">OurFoodie</h1></Link>   
          </div>

          {/* Search & Cart Section */}
          <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto gap-3">
            <div className="relative w-full max-w-xs sm:max-w-md">
              <input
                type="text"
                placeholder="Search for dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-200 focus:ring-2 focus:ring-red-400 focus:outline-none text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {/* 🛍️ Cart icon with link */}
            <Link href="/cart" className="relative cursor-pointer">
              <ShoppingCart className="text-gray-700" size={26} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-6xl mx-auto flex gap-3 overflow-x-auto px-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 whitespace-nowrap rounded-full border text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-red-500 text-white border-red-500"
                  : "border-gray-200 text-gray-700 hover:bg-red-100 hover:border-red-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MENU SECTION */}
      <main className="flex-grow max-w-6xl mx-auto p-4 sm:p-6 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left">
          Our Menu
        </h2>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center">No dishes found 😔</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((it) => (
              <ProductCard key={it._id} item={it} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-6 w-full">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm px-4">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-700">OurFoodie</span>.  
          Made with ❤️ by Akash.
        </div>
      </footer>
    </div>
  );
}
