"use client";

import { useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import NavArrowDownIcon from "@/src/@core/component/LTTIcon/iconoir/nav-arrow-down";

interface QA {
  q: string;
  a: string;
  category: string;
}

const faqs: QA[] = [
  {
    category: "Booking",
    q: "How do I book a ticket online?",
    a: "Choose a movie from Now Showing, pick a cinema, showtime and seats, then complete payment. Your e-ticket is sent by email and SMS, and is also available under My LTC > My Tickets.",
  },
  {
    category: "Booking",
    q: "Can I change my seats after booking?",
    a: "Seats can be changed up to 30 minutes before the screening, subject to availability, by contacting the box office. Online self-service seat changes are not currently supported.",
  },
  {
    category: "Booking",
    q: "Until when can I book a ticket before the showtime?",
    a: "Online booking closes 15 minutes before the scheduled start time. After that, you may purchase tickets directly at the cinema if seats are still available.",
  },
  {
    category: "Payment",
    q: "Which payment methods do you accept?",
    a: "Visa, MasterCard, JCB, Amex, UnionPay, domestic ATM cards (Internet Banking required), LTC Gift Cards, Member Reward Points and Ticket Vouchers. See the Payment Policy page for details.",
  },
  {
    category: "Payment",
    q: "My payment failed but I was charged. What do I do?",
    a: "Pending charges are typically released within 3–7 business days by the issuing bank. If you do not see the refund after 7 days, contact our hotline 1900 6017 with your transaction reference.",
  },
  {
    category: "Refunds",
    q: "Can I get a refund on my tickets?",
    a: "Tickets are generally non-refundable once issued. Refunds are processed only when LTC cancels a screening, or in cases approved by the Refund Approval team for verified technical issues.",
  },
  {
    category: "Refunds",
    q: "How long does a refund take?",
    a: "Approved refunds are returned to the original payment method within 7–14 business days, depending on your bank or card issuer.",
  },
  {
    category: "Membership",
    q: "How do I join the LTC Member program?",
    a: "Sign up for free under My LTC, or ask staff to register you at the box office. You'll start earning points immediately on every ticket and concession purchase.",
  },
  {
    category: "Membership",
    q: "How do reward points work?",
    a: "1 point = 1,000 VND. Use a minimum of 20 points per transaction at the box office or online. Points expire 12 months after they are earned.",
  },
  {
    category: "Membership",
    q: "What is the U22 program?",
    a: "U22 is for customers aged 12 to under 22, offering discounted standard prices and exclusive screenings. Valid student ID or Citizen ID is required at the cinema.",
  },
  {
    category: "Gift Cards",
    q: "Where can I buy an LTC Gift Card?",
    a: "Gift cards are sold at any LTC Cinema in 300,000 / 500,000 / 1,000,000 VND denominations. They are valid for one year and can be topped up.",
  },
  {
    category: "Gift Cards",
    q: "Can I use a gift card for online booking?",
    a: "Yes. Enter your gift card number and PIN at the payment step when booking online.",
  },
  {
    category: "At the cinema",
    q: "Can I bring outside food into the auditorium?",
    a: "No. Only food and drinks purchased at LTC Cinemas are allowed inside the theater.",
  },
  {
    category: "At the cinema",
    q: "What happens if I arrive late?",
    a: "Latecomers may be seated at the manager's discretion and are not entitled to a refund. We recommend arriving at least 15 minutes before showtime.",
  },
  {
    category: "At the cinema",
    q: "Are there age restrictions for evening screenings?",
    a: "From 22:00, LTC does not serve guests under 13. From 23:00, LTC does not serve guests under 16.",
  },
  {
    category: "Account",
    q: "I forgot my password. How do I reset it?",
    a: "Go to the login page and click 'Forgot password'. We'll send a reset link to the email registered on your account.",
  },
];

function FaqDisclosure({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-2 py-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-start justify-between gap-2 py-3 text-left text-sm font-medium text-slate-900 transition-colors"
      >
        <span>{question}</span>
        <NavArrowDownIcon
          className={`!h-4 !w-4 shrink-0 text-muted-foreground-shadcn transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {/* Same recipe as mobile nav: overflow-hidden + animated height + opacity (Header.tsx MobileMenu) */}
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: isOpen ? "1200px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="pb-3 pl-0 text-sm leading-relaxed text-slate-700">{answer}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const makeId = useCallback((category: string, q: string) => `${category}::${q}`, []);

  const toggleId = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const grouped = useMemo(() => {
    const filtered = faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()),
    );
    return filtered.reduce<Record<string, QA[]>>((acc, f) => {
      if (!acc[f.category]) acc[f.category] = [];
      acc[f.category].push(f);
      return acc;
    }, {});
  }, [query]);

  const visibleIdSet = useMemo(() => {
    const s = new Set<string>();
    for (const [category, items] of Object.entries(grouped)) {
      for (const item of items) {
        s.add(makeId(category, item.q));
      }
    }
    return s;
  }, [grouped, makeId]);

  /** Ignore open ids not in the current filter result (no effect/setState needed). */
  const effectiveOpenIds = useMemo(() => {
    const next = new Set<string>();
    for (const id of openIds) {
      if (visibleIdSet.has(id)) next.add(id);
    }
    return next;
  }, [openIds, visibleIdSet]);

  const categories = Object.keys(grouped);

  return (
    <CustomerStaticPage
      title="Frequently Asked Questions"
      subtitle="Quick answers to the questions our customers ask the most."
      contentMaxWidth="wide"
    >
      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
        <LTTInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="pl-9"
          aria-label="Search FAQ"
        />
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground-shadcn">No questions match your search.</p>
      )}

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="mb-2 font-heading text-lg font-bold">{category}</h2>
            <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-2 shadow-sm my-3">
              {grouped[category].map((f) => {
                const id = makeId(category, f.q);
                return (
                  <FaqDisclosure
                    key={id}
                    question={f.q}
                    answer={f.a}
                    isOpen={effectiveOpenIds.has(id)}
                    onToggle={() => toggleId(id)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </CustomerStaticPage>
  );
}
