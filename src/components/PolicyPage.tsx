import React from "react";
import { Shield, FileText, RotateCcw, Landmark, Truck, ArrowLeft, Calendar, HelpCircle, CheckCircle } from "lucide-react";

interface PolicyPageProps {
  policyType: string;
  onGoBack: () => void;
}

export default function PolicyPage({ policyType, onGoBack }: PolicyPageProps) {
  // Map policy types to descriptive titles, icons and content blocks
  const getPolicyDetails = () => {
    switch (policyType) {
      case "privacy-policy":
        return {
          title: "Privacy & Cookie Policy",
          icon: <Shield className="w-8 h-8 text-emerald-500 shrink-0" />,
          intro: "Your privacy is of vital significance to ARA Mart. We commit to preserving absolute discretion of your personal identifiers, transactional histories, and local preferences.",
          lastUpdated: "June 2026",
          sections: [
            {
              heading: "1. Information We Collect",
              text: "We collect information you provide directly during user registration and order checkout. This comprises your username, valid email address, active telephone numbers, delivery destinations, and structural order summaries.",
            },
            {
              heading: "2. Cookies & Local Analytics",
              text: "Our channels utilize browser session cookies and local storage tokens to store essential attributes such as active shopping cart indices, wishlist selections, user authentication benchmarks, and active visual theme preferences (light/dark parameters).",
            },
            {
              heading: "3. Safe Payment Processing",
              text: "ARA Mart never retains your payment cards, bank indices, or mobile wallet pins (bKash/Nagad pins). Transaction channels are guarded using SSL encryption standards routed via Bangladesh authorized secure merchants.",
            },
            {
              heading: "4. Third-Party Disclosures",
              text: "Your delivery information is mapped exclusively to our verified logistics transit services (e.g. RedX, Steadfast, ARA Dispatch teams) to execute physical parcel handovers. We do not distribute, lease, or trade identifiers to digital advertising syndicates.",
            }
          ]
        };

      case "terms-conditions":
        return {
          title: "Terms & Conditions of Trade",
          icon: <FileText className="w-8 h-8 text-emerald-500 shrink-0" />,
          intro: "These Terms and Conditions govern all electronic sales of premium gadgets and wearables conducted on ARA Mart in compliance with commercial retail laws of Bangladesh.",
          lastUpdated: "June 2026",
          sections: [
            {
              heading: "1. Contract Formulation",
              text: "An order submitted on our system represents an offer to purchase. A definitive contract is established only when our fulfillment agents contact you over verified phone or email to confirm delivery address and pricing parameters.",
            },
            {
              heading: "2. Pricing and Valuation Errors",
              text: "We strive to reflect correct commercial catalog prices at all times. In the rare circumstance of a systemic pricing error, we reserve statutory rights to rescind the offer and refund any pre-authorized payments in full.",
            },
            {
              heading: "3. Cash on Delivery (COD) Compliance",
              text: "When selecting Cash on Delivery, you commit to inspecting the integrity of the physical package before completion. Refusing uncompromised packages upon courier delivery without adequate context may lead to database account limitation.",
            },
            {
              heading: "4. Digital Limitation of Liability",
              text: "ARA Mart shall not be held liable for indirect smart device functional failures. Device manufacturing warranties are maintained and honored through respective official brand distributors.",
            }
          ]
        };

      case "return-policy":
        return {
          title: "7-Day Return Policy",
          icon: <RotateCcw className="w-8 h-8 text-emerald-500 shrink-0" />,
          intro: "We maintain a flexible to-and-fro dynamic return model. If your accessory indices fail to look correct or function as anticipated, submit a claim within 7 calendar days of receipt.",
          lastUpdated: "June 2026",
          sections: [
            {
              heading: "1. Return Eligibility Requirements",
              text: "To initiate a return process, items must remain in their pristine original shipping state. This requires unbroken seals, original cardboard casing, unmodified accessories list, and all enclosed user manuals.",
            },
            {
              heading: "2. Standard Exclusions",
              text: "Certain categories are strictly non-returnable due to hygiene or software constraints. This comprises inner ear devices (in-ear earbuds), modified software ROMs, and customized fashion wear articles.",
            },
            {
              heading: "3. Mandatory Unboxing Documentation",
              text: "We strongly advise taking an uninterrupted unboxing video clip upon opening a received package. Detailed media files supply crucial verification metrics to assert instant resolution if items arrive with shipping fractures.",
            },
            {
              heading: "4. Return Logistics Transit",
              text: "Return items can be dropped off directly at our Banani service hub or requested for pickup. For pickup requests outside Dhaka, customers may be asked to cover basic return postal fees.",
            }
          ]
        };

      case "refund-policy":
        return {
          title: "Refund Policy Details",
          icon: <Landmark className="w-8 h-8 text-emerald-500 shrink-0" />,
          intro: "If an item cannot be replaced or is legally returned under our 7-day guarantee, ARA Mart guarantees systematic refunds routed immediately to your source transaction channel.",
          lastUpdated: "June 2026",
          sections: [
            {
              heading: "1. Refund Timelines and Gateways",
              text: "Once the return is inspected and officially approved at our Banani distribution hub, refunds are sent back to the original method of payment. Processing windows vary by channel: Mobile wallets (bKash/Nagad) complete in 3-5 business days, Visa/MasterCard credit channels take 7-10 business days.",
            },
            {
              heading: "2. COD Order Refunds",
              text: "For Cash on Delivery orders, refunds are dispatched seamlessly to a bKash/Nagad number provided by the registered customer, or sent via electronic bank transfer inside Bangladesh.",
            },
            {
              heading: "3. Deductions and Fees",
              text: "Where refunds are requested because of sudden user mind-shifts (rather than product functional defects), transit shipping fees may be deducted from the total refund yield.",
            },
            {
              heading: "4. Promotional Coupon Offsets",
              text: "If an order was processed utilizing our limited-time promotional voucher codes, the refund sum is assessed solely based on the real cash paid, and reused coupon metrics will not re-apply.",
            }
          ]
        };

      case "shipping-policy":
        return {
          title: "Shipping & Dispatch Rules",
          icon: <Truck className="w-8 h-8 text-emerald-500 shrink-0" />,
          intro: "Our delivery networks provide extremely fast and color-safe transit across all 64 districts of Bangladesh with instant SMS tracking updates.",
          lastUpdated: "June 2026",
          sections: [
            {
              heading: "1. Standard Processing Cycles",
              text: "Orders completed before 4:00 PM on business days are dispatched from our warehouse on the same calendar day. Orders processed after 4:00 PM are entered into the next morning's delivery batch.",
            },
            {
              heading: "2. Freight Durations",
              text: "Deliveries inside Dhaka Metro arrive in 24 to 48 hours. Regional deliveries outside Dhaka arrive in 3 to 5 business days using our top-rated logistics partners.",
            },
            {
              heading: "3. Delivery Costs",
              text: "Dhaka city inside deliveries incur a flat rate of ৳80. Deliveries outside Dhaka are subject to a flat rate of ৳150. Enjoy comprehensive Free Delivery inside Bangladesh on all single orders exceeding ৳5,000.",
            },
            {
              heading: "4. Structural Delay Liability",
              text: "While we align transit partners to extreme quality standards, minor delays might arise due to transport strikes, severe weather, or festival spikes (Eid rushes). Our team handles real-time coordination to support quick resolutions.",
            }
          ]
        };

      default:
        return {
          title: "Customer Support Documentation",
          icon: <HelpCircle className="w-8 h-8 text-emerald-500 shrink-0" />,
          intro: "Welcome to ARA Mart official compliance policy directory. Browse resources here to align your shopping experience with premium metrics.",
          lastUpdated: "June 2026",
          sections: []
        };
    }
  };

  const details = getPolicyDetails();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fade-in text-left font-sans">
      {/* Back navigation button */}
      <button
        onClick={onGoBack}
        className="group inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition mb-6 sm:mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Home Page
      </button>

      {/* Styled Card Area */}
      <div className="bg-white dark:bg-gray-905 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Header Title Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-150 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-inner">
              {details.icon}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-gray-950 dark:text-white">
                {details.title}
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-500" /> Last Updated: {details.lastUpdated}
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono tracking-wider uppercase px-3 py-1 rounded-full border border-emerald-500/20 shadow-sm select-none">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Active Compliance
          </div>
        </div>

        {/* Intro summary block */}
        <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 border-l-[3px] border-emerald-500 rounded-r-xl">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            {details.intro}
          </p>
        </div>

        {/* Core Sections Grid */}
        <div className="space-y-6">
          {details.sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="font-display font-extrabold text-sm sm:text-base text-gray-905 dark:text-white">
                {section.heading}
              </h3>
              <p className="text-xs sm:text-sm text-gray-650 dark:text-gray-400 leading-relaxed font-sans">
                {section.text}
              </p>
            </div>
          ))}
        </div>

        {/* Closing trust banner */}
        <div className="border-t border-gray-100 dark:border-gray-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs select-none">
          <p className="text-gray-400 dark:text-text-gray-500 font-medium">
            Need urgent statutory assistance or custom order tracking support?
          </p>
          <a
            href="https://wa.me/8801609181280"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition"
          >
            Ask ARA Legal Desk
          </a>
        </div>

      </div>
    </div>
  );
}
