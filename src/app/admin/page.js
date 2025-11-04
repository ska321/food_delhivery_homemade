"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  // 🧾 Menu Form
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Pizza",
    size: "",
    description: "",
    image: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // ✅ Admin login
  const login = () => {
    if (
      password === process.env.NEXT_PUBLIC_ADMIN_PASS ||
      password === "changeme"
    ) {
      setAuth(true);
    } else alert("❌ Wrong password");
  };

  // ✅ Upload image
  const uploadImage = async (file, callback) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: reader.result }),
        });
        const data = await res.json();
        if (data.url) callback(data.url);
        else alert("Upload failed");
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      alert("Error uploading image");
    }
  };

  // ✅ Add new item
  const addItem = async () => {
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data._id) {
      alert("✅ Added!");
      setMenu([...menu, data]);
      resetForm();
    }
  };

  // ✅ Update item
  const updateItem = async () => {
    const res = await fetch(`/api/menu/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data._id) {
      setMenu(menu.map((m) => (m._id === editId ? data : m)));
      alert("✅ Updated successfully!");
      resetForm();
    }
  };

  // ✅ Delete item
  const deleteItem = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      setMenu(menu.filter((m) => m._id !== id));
      alert("🗑 Deleted successfully!");
    } else {
      alert("❌ Failed to delete item");
    }
  };

  const startEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price,
      category: item.category,
      size: item.size,
      description: item.description,
      image: item.image,
    });
    setEditMode(true);
    setEditId(item._id);
    setActiveTab("addMenu");
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "Pizza",
      size: "",
      description: "",
      image: "",
    });
    setEditMode(false);
    setEditId(null);
  };

  // ✅ Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order");
      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updatedOrder : o))
      );

      alert(`✅ Order status updated to "${newStatus}". Email sent automatically.`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update order status");
    }
  };

  // ✅ Fetch data when logged in
  useEffect(() => {
    if (auth) {
      fetch("/api/menu").then((r) => r.json()).then(setMenu);
      fetch("/api/orders").then((r) => r.json()).then(setOrders);
      fetch("/api/showcustomer")
        .then((r) => r.json())
        .then((data) => setCustomers(data.customers || []));
    }
  }, [auth]);

  // 🔐 Login UI
  if (!auth)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <motion.div
          className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-sm text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
            Admin Login
          </h1>
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg p-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={login}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition-all"
          >
            Login
          </button>
        </motion.div>
      </div>
    );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "addMenu", label: editMode ? "Edit Menu" : "Add Menu" },
    { id: "myMenu", label: "My Menu" },
    { id: "orders", label: "Orders" },
    { id: "customers", label: "Customers" },
  ];

  // ✅ Dashboard UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 bg-white shadow-sm gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          🍕 Admin Dashboard
        </h2>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-full font-medium transition-all ${
                activeTab === t.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <div className="p-4 sm:p-8 max-w-7xl mx-auto overflow-x-hidden">
        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <Card title="Total Menu Items" value={menu.length} icon="🍕" />
            <Card title="Total Orders" value={orders.length} icon="🛍️" />
            <Card title="Total Customers" value={customers.length} icon="👥" />
            <Card
              title="Revenue (Est.)"
              value={`₹${orders.length * 499}`}
              icon="💰"
            />
          </motion.div>
        )}

        {/* Add / Edit Menu */}
        {activeTab === "addMenu" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl bg-white p-4 sm:p-6 rounded-2xl shadow-md mx-auto"
          >
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">
              {editMode ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>
            <div className="space-y-3">
              <input
                className="border p-2 w-full rounded"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border p-2 w-full rounded"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <select
                className="border p-2 w-full rounded"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Pizza</option>
                <option>Burger</option>
                <option>Drinks</option>
                <option>Desserts</option>
                <option>Chinese</option>
                <option>Indian</option>
              </select>
              <input
                className="border p-2 w-full rounded"
                placeholder="Size"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
              />
              <textarea
                className="border p-2 w-full rounded"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <input
                type="file"
                onChange={(e) =>
                  uploadImage(e.target.files[0], (url) =>
                    setForm({ ...form, image: url })
                  )
                }
                className="w-full"
              />
              {form.image && (
                <img
                  src={form.image}
                  className="w-28 mt-2 rounded-xl shadow mx-auto"
                />
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={editMode ? updateItem : addItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg mt-3 hover:bg-green-700 w-full"
                >
                  {editMode ? "Update Item" : "Add Item"}
                </button>
                {editMode && (
                  <button
                    onClick={resetForm}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg mt-3 hover:bg-gray-500 w-full"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* My Menu */}
        {activeTab === "myMenu" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {menu.length === 0 && <p>No menu items yet.</p>}
            {menu.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-xl"
                />
                <h4 className="mt-3 font-bold text-lg">{item.name}</h4>
                <p className="text-gray-600">₹{item.price}</p>
                <p className="text-sm text-gray-500">
                  {item.category} • {item.size}
                </p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => startEdit(item)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 w-full"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 w-full"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ✅ Orders Tab (with item images) */}
        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {orders.length === 0 && <p>No orders yet</p>}
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-sm sm:text-base"
              >
                <h4 className="font-semibold text-lg text-gray-800">
                  {o.customer?.name}
                </h4>
                <p className="text-gray-600">{o.email}</p>
                <p className="text-gray-600">{o.customer?.phone}</p>
                <p className="text-gray-600">{o.customer?.address}</p>

                {/* 🖼️ Ordered item images */}
                {o.items?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {o.items.map((i, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center text-center"
                      >
                        <img
                          src={i.image || "/placeholder.png"}
                          alt={i.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                        <p className="text-xs text-gray-700 mt-1">
                          {i.name} x{i.qty}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-3">
                  📦 Status:{" "}
                  <span className="font-semibold text-blue-600">{o.status}</span>
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {o.status === "Pending" && (
                    <button
                      onClick={() => updateOrderStatus(o._id, "Accepted")}
                      className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                    >
                      Accept
                    </button>
                  )}
                  {o.status === "Accepted" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(o._id, "Out for Delivery")
                      }
                      className="px-3 py-1 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 text-sm"
                    >
                      Out for Delivery
                    </button>
                  )}
                  {o.status === "Out for Delivery" && (
                    <button
                      onClick={() => updateOrderStatus(o._id, "Delivery Done")}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      Delivery Done
                    </button>
                  )}
                  {o.status === "Delivery Done" && (
                    <p className="text-green-700 font-semibold mt-2 text-sm">
                      ✅ Order successfully delivered
                    </p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Customers */}
        {activeTab === "customers" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-md overflow-auto"
          >
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">
              Registered Customers
            </h3>
            {customers.length === 0 && <p>No customers found</p>}
            {customers.map((c) => (
              <div
                key={c._id}
                className="border-b py-4 last:border-none space-y-1"
              >
                <p className="font-medium text-gray-800">
                  {c.name || "Unnamed User"}
                </p>
                <p className="text-sm text-gray-600">{c.email || "No email"}</p>
                <p className="text-sm text-gray-600">
                  📞 {c.phone || "No phone"}
                </p>
                {c.addresses?.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {c.addresses.map((addr, i) => (
                      <li key={i}>{addr}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No saved addresses</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white p-4 sm:p-6 rounded-2xl shadow-md flex flex-col items-center justify-center text-center"
    >
      <div className="text-3xl sm:text-4xl mb-2">{icon}</div>
      <h4 className="text-gray-700 font-semibold text-sm sm:text-base">
        {title}
      </h4>
      <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
}
