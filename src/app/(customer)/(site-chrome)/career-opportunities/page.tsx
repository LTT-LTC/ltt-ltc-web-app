import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";
import { MapPin, Briefcase, Clock } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

const jobs = [
  {
    title: "Cinema Operations Manager",
    location: "Ho Chi Minh City",
    type: "Full-time",
    department: "Operations",
    summary:
      "Lead daily operations of a flagship LTC venue, manage 40+ staff and own P&L for the site.",
  },
  {
    title: "Box Office & Guest Services Staff",
    location: "Hanoi · Da Nang · Can Tho",
    type: "Part-time",
    department: "Front of House",
    summary:
      "Welcome guests, sell tickets and concessions, and resolve service requests in a fast-paced environment.",
  },
  {
    title: "Senior Frontend Engineer",
    location: "Ho Chi Minh City / Remote",
    type: "Full-time",
    department: "Technology",
    summary: "Build the next generation of the LTC booking platform with React, TypeScript and our design system.",
  },
  {
    title: "Marketing Executive — Studio Partnerships",
    location: "Ho Chi Minh City",
    type: "Full-time",
    department: "Marketing",
    summary: "Plan local releases with major studios, run premieres and own campaign performance.",
  },
  {
    title: "Projectionist & AV Technician",
    location: "Multiple locations",
    type: "Full-time",
    department: "Technical",
    summary: "Maintain digital projectors, sound systems and 4DX equipment to keep every show flawless.",
  },
];

export default function CareerOpportunitiesPage() {
  return (
    <CustomerStaticPage
      title="Career Opportunities"
      subtitle="Build the future of cinema with us. Explore open roles across operations, technology and creative teams."
      contentMaxWidth="wide"
    >
      <h2>Why work at LTC?</h2>
      <ul>
        <li>Free movie tickets every month for you and your family.</li>
        <li>Performance bonuses, 13th-month salary and annual salary review.</li>
        <li>Comprehensive health insurance and wellness allowance.</li>
        <li>Career paths into management, technology and corporate functions.</li>
      </ul>

      <h2>Open positions</h2>
      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.title}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between my-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-base font-bold">{job.title}</h3>
                <span className="rounded-full bg-primary-shadcn/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-shadcn">
                  {job.department}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground-shadcn">{job.summary}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground-shadcn">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {job.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {job.type}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {job.department}
                </span>
              </div>
            </div>
            <LTTButton type="button" variant="default" className="shrink-0 md:self-center">
              Apply now
            </LTTButton>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground-shadcn my-3">
        Don&apos;t see the right role? Send your CV to{" "}
        <a href="mailto:careers@ltc-cinema.vn" className="font-semibold text-primary-shadcn hover:underline">
          careers@ltc-cinema.vn
        </a>
        .
      </p>
    </CustomerStaticPage>
  );
}
