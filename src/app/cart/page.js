"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/format";
import { Utensils, ShoppingCart, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Cart() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    async function fetchCustomer() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/customer?userId=${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success) {
            setSavedAddresses(data.addresses || []);
            setCustomer({
              name: data.name || session.user.name || "",
              email: data.email || session.user.email || "",
              phone: data.phone || "",
              address:
                data.addresses?.length > 0
                  ? data.addresses[data.addresses.length - 1]
                  : "",
            });
          }
        }
      } catch (err) {
        console.error("❌ Fetch customer failed:", err);
      }
    }
    fetchCustomer();
  }, [session]);

  function remove(i) {
    const updated = [...cart];
    updated.splice(i, 1);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  async function placeOrder() {
    if (!customer.name || !customer.phone || !customer.address)
      return alert("⚠️ Please fill all delivery details");

    setLoading(true);
    try {
      const formattedItems = cart.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
        image: item.image || "/placeholder.png",
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
          customer,
          items: formattedItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          name: customer.name,
          email: customer.email || session.user.email,
          phone: customer.phone,
          address: customer.address,
        }),
      });

      const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
      await fetch("/api/send-order-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: "akashbhowmik005@gmail.com",
          customerEmail: customer.email || session.user.email,
          customerName: customer.name,
          orderId: data._id || "N/A",
          totalAmount: total + (total > 0 ? 30 : 0),
          items: formattedItems,
        }),
      });

      localStorage.removeItem("cart");
      setCart([]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push("/myaccount");
      }, 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  if (success) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 text-center px-4">
        <CheckCircle2 className="text-green-500 animate-bounce" size={90} />
        <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mt-4">
          Order Placed Successfully!
        </h2>
        {/* <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Redirecting to My Account...
        </p> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 bg-white shadow-md z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="text-red-500" size={24} />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              MayukhCake
            </h1>
          </Link>
          <Link
            href="/menu"
            className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors"
          >
            <span className="hidden sm:block font-medium">Back to Menu</span>
            <ShoppingCart size={24} />
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Your Cart
        </h2>

        {cart.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            🛒 Your cart is empty!
            <div className="mt-4">
              <Link
                href="/menu"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-md transition-all inline-block"
              >
                Browse Menu
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* GRID WRAPPER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                {cart.map((it, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b last:border-b-0 py-4 gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={it.image || "/placeholder.png"}
                        alt={it.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                          {it.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {formatCurrency(it.price)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(i)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium self-end sm:self-auto"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 h-fit">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 text-gray-600 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(total > 0 ? 30 : 0)}</span>
                  </div>
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>Total</span>
                    <span>{formatCurrency(total + (total > 0 ? 30 : 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DELIVERY FORM */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Delivery Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-red-400 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  readOnly
                  value={session.user.email}
                  className="border border-gray-200 bg-gray-100 rounded-lg p-3 text-gray-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-red-400 outline-none"
                />

                {savedAddresses.length > 0 && (
                  <select
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    className="sm:col-span-2 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-red-400 outline-none"
                  >
                    <option value="">Select Saved Address</option>
                    {savedAddresses.map((addr, i) => (
                      <option key={i} value={addr}>
                        {addr}
                      </option>
                    ))}
                    <option value="__new__">Add New Address</option>
                  </select>
                )}

                {(savedAddresses.length === 0 ||
                  customer.address === "" ||
                  customer.address === "__new__") && (
                  <textarea
                    placeholder="Enter New Delivery Address"
                    value={
                      customer.address === "__new__" ? "" : customer.address
                    }
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    className="sm:col-span-2 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-red-400 resize-none outline-none"
                    rows="3"
                  />
                )}
              </div>

              <div className="mt-6 text-center sm:text-right">
                <button
                  onClick={placeOrder}
                  disabled={loading || cart.length === 0}
                  className={`${
                    loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                  } text-white px-8 py-3 rounded-full font-semibold shadow-md transition-all duration-200 active:scale-95`}
                >
                  {loading ? "Placing Order..." : "Place Order (COD)"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">MayukhCake</span>. Fast, Fresh &
          Delicious 🍕
        </div>
      </footer>
    </div>
  );
}
