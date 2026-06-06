import React, { useState, useEffect } from "react";
import { Compass, ShoppingBag, MapPin, User, LogOut, Cpu, Send, CheckCircle2 } from "lucide-react";
import { User as UserType, Order, Address } from "../types.js";

interface CustomerDashboardProps {
  currentUser: UserType;
  token: string;
  onLogout: () => void;
  onNavigate: (page: string, categoryId?: string, productId?: string, trackingCode?: string) => void;
}

export default function CustomerDashboard({
  currentUser,
  token,
  onLogout,
  onNavigate
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserType>(currentUser);

  // Profile forms
  const [username, setUsername] = useState(currentUser.username);
  const [phone, setPhone] = useState(currentUser.phone || "");

  // Address directory states
  const [addresses, setAddresses] = useState<Address[]>(currentUser.addresses || []);
  const [newLabel, setNewLabel] = useState("Home");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDistrict, setNewDistrict] = useState("Dhaka");
  const [newLines, setNewLines] = useState("");

  const [alertText, setAlertText] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    setUserProfile(currentUser);
    setUsername(currentUser.username);
    setPhone(currentUser.phone || "");
    setAddresses(currentUser.addresses || []);
  }, [currentUser]);

  const loadOrderHistory = async () => {
    try {
      const res = await fetch(`/api/orders/user/${currentUser.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch {
      setErrorText("Database error fetching order history indices.");
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadOrderHistory();
    }
  }, [currentUser?.id, token, activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertText("");
    setErrorText("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username, phone })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertText("Profile successfully modified.");
        setUserProfile(data.user);
      } else {
        setErrorText(data.error);
      }
    } catch {
      setErrorText("Connection to auth server failed.");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertText("");
    setErrorText("");
    if (!newFullName || !newPhone || !newLines) {
      setErrorText("Make sure to fill out all address lines.");
      return;
    }

    const newAddr: Address = {
      id: "addr-" + Math.random().toString(36).substring(3, 9),
      label: newLabel,
      fullName: newFullName,
      phone: newPhone,
      district: newDistrict,
      addressLine: newLines
    };

    const updatedList = [...addresses, newAddr];

    try {
      const res = await fetch("/api/auth/addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: updatedList })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertText("Delivery address directory successfully updated.");
        setAddresses(data.user.addresses);
        // Clear inputs
        setNewFullName("");
        setNewPhone("");
        setNewLines("");
      } else {
        setErrorText(data.error);
      }
    } catch {
      setErrorText("Server failed to commit address.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setAlertText("");
    setErrorText("");
    const updatedList = addresses.filter((a) => a.id !== id);
    try {
      const res = await fetch("/api/auth/addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: updatedList })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertText("Address purged.");
        setAddresses(data.user.addresses);
      } else {
        setErrorText(data.error);
      }
    } catch {
      setErrorText("Request failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-xs">
      
      {/* Alert Notices */}
      {alertText && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl mb-6 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {alertText}
        </div>
      )}
      {errorText && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 p-4 rounded-xl mb-6 font-bold">
          ⚠️ {errorText}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Navigation Panel - Flex Row on Mobile, Flex Column on Desktop */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 md:p-5 shrink-0 h-fit space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 dark:border-gray-800/50 pb-3 md:pb-0 md:border-b-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-xs md:text-sm shadow-sm">
              {currentUser.username[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-xs md:text-sm text-gray-900 dark:text-white truncate">{currentUser.username}</h3>
              <p className="text-[9px] md:text-[10px] text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none snap-x -mx-2 px-2 md:mx-0 md:px-0">
            <button
              id="customer-tab-profile"
              onClick={() => setActiveTab("profile")}
              className={`whitespace-nowrap shrink-0 snap-align-start text-left py-2 px-3.5 md:px-3 rounded-xl font-bold flex items-center gap-2 text-[10px] md:text-xs transition-all duration-200 cursor-pointer ${
                activeTab === "profile" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <User className="w-3.5 h-3.5" /> Profile Coordinates
            </button>
            <button
              id="customer-tab-orders"
              onClick={() => setActiveTab("orders")}
              className={`whitespace-nowrap shrink-0 snap-align-start text-left py-2 px-3.5 md:px-3 rounded-xl font-bold flex items-center gap-2 text-[10px] md:text-xs transition-all duration-200 cursor-pointer ${
                activeTab === "orders" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> My Order Log
            </button>
            <button
              id="customer-tab-addresses"
              onClick={() => setActiveTab("addresses")}
              className={`whitespace-nowrap shrink-0 snap-align-start text-left py-2 px-3.5 md:px-3 rounded-xl font-bold flex items-center gap-2 text-[10px] md:text-xs transition-all duration-200 cursor-pointer ${
                activeTab === "addresses" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Address Directories
            </button>

            <button
              id="customer-logout-btn"
              onClick={onLogout}
              className="whitespace-nowrap shrink-0 snap-align-start text-left py-2 px-3.5 md:px-3 rounded-xl font-bold flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 md:mt-4 transition-all duration-200 cursor-pointer text-[10px] md:text-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </nav>
        </div>

        {/* Right Dashboard Area */}
        <div className="flex-1">

          {/* PROFILE COORDINATES TAB */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-md font-display font-medium text-gray-950 dark:text-white">Profile Settings</h2>
                <p className="text-gray-400 text-[10px]">Verify and adapt core communication indexes</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Username Portal *</label>
                  <input
                    id="profile-username"
                    type="text" required
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none focus:ring-1 focus:ring-emerald-500 text-gray-950 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Email (Immutable)</label>
                  <input
                    type="text" disabled
                    value={currentUser.email}
                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Mobile Contact Phone (Bangladesh)</label>
                  <input
                    id="profile-phone"
                    type="text"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none focus:ring-1 focus:ring-emerald-500 text-gray-950 dark:text-white"
                    placeholder="+880 1XXXXXXXXX"
                  />
                </div>

                <button
                  id="profile-submit-btn"
                  type="submit"
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-5 py-2.5 rounded-xl transition hover:scale-[1.01]"
                >
                  Save Modifications
                </button>
              </form>
            </div>
          )}

          {/* ORDERS HISTORY LOG OVERVIEW */}
          {activeTab === "orders" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 md:p-8 space-y-6">
              <div>
                <h2 className="text-sm md:text-md font-display font-bold text-gray-950 dark:text-white">Transaction Order History</h2>
                <p className="text-gray-400 text-[10px]">Review status schedules and delivery estimates</p>
              </div>

              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-gray-200 dark:hover:border-gray-700">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-gray-900 dark:text-white font-mono text-xs md:text-sm">{ord.invoiceNumber}</span>
                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-extrabold tracking-wider uppercase ${
                          ord.status === "Delivered" 
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50" 
                            : "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-400 border border-cyan-200/50"
                        }`}>{ord.status}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                        <div>
                          <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-mono">Paid Balance</span>
                          <span className="font-extrabold text-gray-950 dark:text-white text-[11px] md:text-xs">৳{ord.total}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-gray-400 uppercase tracking-widest font-mono">Estimated Arrival</span>
                          <span className="font-semibold text-gray-600 dark:text-gray-300 text-[10px] md:text-xs whitespace-nowrap">{ord.estimatedDelivery}</span>
                        </div>
                      </div>

                      <div className="pt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-xl w-fit border border-emerald-500/10">
                        <span>🚚 Track ID:</span>
                        <span className="tracking-wide select-all">{ord.trackingCode}</span>
                      </div>
                    </div>

                    <button
                      id={`client-track-btn-${ord.id}`}
                      onClick={() => onNavigate(`track-order`, undefined, undefined, ord.trackingCode)}
                      className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all duration-200 text-xs shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Track Shipment</span>
                    </button>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <span className="text-3xl block">📦</span>
                    <p className="text-xs font-extrabold">You have not placed any orders yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DELIVERY ADDRESS DIRECTORY SETTINGS */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-md font-display font-medium text-gray-950 dark:text-white">Save Delivery Address</h2>
                  <p className="text-gray-400 text-[10px]">Tether quick address configurations for express checkouts</p>
                </div>

                <form onSubmit={handleAddAddress} className="space-y-4 max-w-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Label Tag *</label>
                      <select
                        id="address-label"
                        value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-900 dark:text-white"
                      >
                        <option value="Home">🏠 Home</option>
                        <option value="Office">🏢 Office</option>
                        <option value="Billing">💳 Billing Location</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Delivery District *</label>
                      <select
                        id="address-district"
                        value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-900 dark:text-white"
                      >
                        <option value="Dhaka">Dhaka District</option>
                        <option value="Outside Dhaka">Outside Dhaka District</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Recipients Name *</label>
                    <input
                      id="address-fullname"
                      type="text" required
                      value={newFullName} onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                      placeholder="Enter receiver name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Mobile Contact Phone *</label>
                    <input
                      id="address-phone"
                      type="text" required
                      value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                      placeholder="+8801XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Detail Address lines *</label>
                    <textarea
                      id="address-lines"
                      required rows={2}
                      value={newLines} onChange={(e) => setNewLines(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white resize-none"
                      placeholder="Holding num, Area codes, Local landmarks..."
                    />
                  </div>

                  <button
                    id="address-submit-btn"
                    type="submit"
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-5 py-2.5 rounded-xl transition hover:scale-[1.01]"
                  >
                    Append Address Entry
                  </button>
                </form>
              </div>

              {/* Saved Address grid lists */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <span className="font-bold text-gray-900 dark:text-white">Active Directories ({addresses.length} entries)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {addresses.map((a) => (
                    <div key={a.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 relative flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            {a.label}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">{a.district}</span>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{a.fullName}</p>
                        <p className="text-[10px] text-gray-450 mt-1">{a.addressLine}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">📞 {a.phone}</p>
                      </div>

                      <button
                        id={`delete-address-${a.id}`}
                        onClick={() => handleDeleteAddress(a.id)}
                        className="text-red-500 hover:text-red-650 font-bold self-end text-[10px] mt-4 cursor-pointer"
                      >
                        Purge Location
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
