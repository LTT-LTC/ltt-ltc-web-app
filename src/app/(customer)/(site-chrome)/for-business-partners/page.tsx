import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";
import { Building2, Gift, Megaphone, Users2 } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

const programs = [
  {
    icon: Users2,
    title: "Group & Corporate Bookings",
    desc: "Block-book auditoriums for company outings, school screenings or private events. Discounts from 20+ tickets.",
  },
  {
    icon: Gift,
    title: "Bulk Gift Cards & Vouchers",
    desc: "Reward employees and clients with branded LTC gift cards from 300,000 VND. Volume pricing available.",
  },
  {
    icon: Megaphone,
    title: "On-Screen & Lobby Advertising",
    desc: "Reach 12M+ moviegoers a year through pre-roll cinema ads, lobby standees and digital signage.",
  },
  {
    icon: Building2,
    title: "Co-Branding & Sponsorships",
    desc: "Partner on movie premieres, festivals and member events with category exclusivity.",
  },
];

export default function ForBusinessPartnersPage() {
  return (
    <CustomerStaticPage
      title="For Business Partners"
      subtitle="Grow your brand with Vietnam&apos;s most engaged movie-going audience."
      contentMaxWidth="wide"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {programs.map((p) => (
          <div key={p.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p.icon className="h-6 w-6 text-primary-shadcn" />
            <h3 className="font-heading mt-3 font-bold">{p.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground-shadcn">{p.desc}</p>
          </div>
        ))}
      </div>

      <h2>Why partner with LTC?</h2>
      <ul>
        <li>
          <strong>Reach</strong> — 85+ cinemas, 500+ screens, 12M+ admissions per year.
        </li>
        <li>
          <strong>Audience</strong> — 62% are aged 16–34, the most sought-after consumer segment.
        </li>
        <li>
          <strong>Captive attention</strong> — full-screen, full-sound exposure with zero ad-blocking.
        </li>
        <li>
          <strong>Flexible packages</strong> — from a single venue to nationwide campaigns.
        </li>
      </ul>

      <h2>Talk to our partnerships team</h2>
      <p>
        Email{" "}
        <a href="mailto:partners@ltc-cinema.vn" className="font-semibold text-primary-shadcn hover:underline">
          partners@ltc-cinema.vn
        </a>{" "}
        or call our B2B hotline at <strong>(028) 7300 6017</strong>. We respond within one business day.
      </p>
      <div>
        <LTTButton type="button" size="lg">
          Request a partnership deck
        </LTTButton>
      </div>
    </CustomerStaticPage>
  );
}
