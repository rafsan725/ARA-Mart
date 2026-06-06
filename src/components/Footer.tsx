import React, { useState } from "react";
import { MessageSquare, Phone, MapPin, Mail, ShieldCheck, RefreshCw, Truck } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorStatus, setErrorStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorStatus("Please enter a valid email address.");
      setMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorStatus("");
    setMessage("");

    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        const errData = await response.json();
        setErrorStatus(errData.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setErrorStatus("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 font-sans border-t border-gray-800">
      {/* Upper Feature Highlights Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Delivery All Over Bangladesh</h4>
            <p className="text-xs text-gray-400 mt-1">Superfast standard inside Dhaka delivery & reliable outside Dhaka couriers.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Genuine Authentic Guarantee</h4>
            <p className="text-xs text-gray-400 mt-1">100% genuine brands sourced directly from official manufacturers or distributors.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">7-Day Free Return Policy</h4>
            <p className="text-xs text-gray-400 mt-1">Hassle-free dynamic returns if products fail to suit your expectation metrics.</p>
          </div>
        </div>
      </div>

      {/* Middle Grid of links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <span className="font-display font-black text-white">A</span>
            </div>
            <span className="font-display font-bold text-lg text-white">ARA <span className="text-emerald-500">Mart</span></span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            The prime luxury e-commerce catalog destination for Bangladesh. Premium accessories, lifestyle gadgets, and authentic local wear delivered with absolute integrity.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <a 
              id="whatsapp-integration-link"
              href="https://wa.me/8801609181280" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Help
            </a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h5 className="font-display font-semibold text-white text-xs uppercase tracking-widest mb-4">Core Catalogs</h5>
          <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
            <li><button onClick={() => onNavigate("shop")} className="hover:text-emerald-400 transition cursor-pointer">Electronics & Acc</button></li>
            <li><button onClick={() => onNavigate("shop")} className="hover:text-emerald-400 transition cursor-pointer">Smart Gadgets</button></li>
            <li><button onClick={() => onNavigate("shop")} className="hover:text-emerald-400 transition cursor-pointer">Smart Watches</button></li>
            <li><button onClick={() => onNavigate("shop")} className="hover:text-emerald-400 transition cursor-pointer">Home & Kitchen Appliance</button></li>
            <li><button onClick={() => onNavigate("shop")} className="hover:text-emerald-400 transition cursor-pointer">Premium Silk Fashion</button></li>
          </ul>
        </div>

        {/* Policies Support */}
        <div>
          <h5 className="font-display font-semibold text-white text-xs uppercase tracking-widest mb-4">Refunds & Policies</h5>
          <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
            <li><button id="footer-privacy-btn" onClick={() => onNavigate("privacy-policy")} className="hover:text-emerald-400 transition cursor-pointer">Privacy & Cookie Policy</button></li>
            <li><button id="footer-terms-btn" onClick={() => onNavigate("terms-conditions")} className="hover:text-emerald-400 transition cursor-pointer">Terms & Conditions of Trade</button></li>
            <li><button id="footer-return-btn" onClick={() => onNavigate("return-policy")} className="hover:text-emerald-400 transition cursor-pointer">Return Policy</button></li>
            <li><button id="footer-refund-btn" onClick={() => onNavigate("refund-policy")} className="hover:text-emerald-400 transition cursor-pointer">Refund Policy</button></li>
            <li><button id="footer-shipping-btn" onClick={() => onNavigate("shipping-policy")} className="hover:text-emerald-400 transition cursor-pointer">Shipping & Dispatch Rules</button></li>
          </ul>
        </div>

        {/* Corporate Addresses / Contact */}
        <div className="flex flex-col gap-4">
          <h5 className="font-display font-semibold text-white text-xs uppercase tracking-widest">Connect With Us</h5>
          <div className="flex flex-col gap-3 text-xs text-gray-400">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>House 25, Road 11, Banani, Dhaka, Bangladesh</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <a href="tel:+8801609181280" className="hover:text-emerald-500 hover:underline transition-colors cursor-pointer font-medium">+880 1609-181280</a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>support@aramart.com.bd</span>
            </p>
          </div>

          <div className="mt-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1.5">Weekly Newsletter</p>
            <form onSubmit={handleSubmit} className="flex gap-1.5 flex-col">
              <div className="flex gap-1.5">
                <input 
                  id="newsletter-email-input"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address" 
                  className="bg-gray-800 text-white border-none rounded-lg text-xs px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 flex-1"
                  required
                  disabled={isSubmitting}
                />
                <button 
                  id="newsletter-submit-btn"
                  type="submit" 
                  disabled={isSubmitting}
                  className={`bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold font-sans transition cursor-pointer flex items-center justify-center min-w-[50px] ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Joining..." : "Join"}
                </button>
              </div>
              {message && (
                <p className="text-[11px] text-emerald-400 font-medium leading-none mt-1 animate-fade-in">{message}</p>
              )}
              {errorStatus && (
                <p className="text-[11px] text-red-400 font-medium leading-none mt-1 animate-fade-in">{errorStatus}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="bg-gray-950 py-6 text-center text-xs text-gray-500 font-sans px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ARA Mart. Built with extreme diligence. All rights reserved.</p>
          <div className="flex flex-wrap gap-2.5 items-center justify-center">
            <span className="text-[11px] font-sans font-black uppercase tracking-wider bg-[#E2136E]/10 border border-[#E2136E]/40 text-[#E2136E] px-2.5 py-1 rounded-md transition shadow-sm">
              bKash
            </span>
            <span className="text-[11px] font-sans font-black uppercase tracking-wider bg-[#F15A22]/10 border border-[#F15A22]/40 text-[#F15A22] px-2.5 py-1 rounded-md transition shadow-sm">
              Nagad
            </span>
            <span className="text-[11px] font-sans font-black uppercase tracking-wider bg-blue-900/20 border border-blue-500/40 text-blue-400 px-2.5 py-1 rounded-md transition shadow-sm">
              Visa
            </span>
            <span className="text-[11px] font-sans font-black uppercase tracking-wider bg-orange-950/40 border border-orange-500/40 text-orange-400 px-2.5 py-1 rounded-md transition shadow-sm">
              MasterCard
            </span>
            <span className="text-[11px] font-sans font-black uppercase tracking-wider bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-md transition shadow-sm font-mono">
              COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
