import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";
import { Film, Users, Award, MapPin } from "lucide-react";

const stats = [
  { icon: MapPin, value: "85+", label: "Cinemas nationwide" },
  { icon: Film, value: "500+", label: "Screens & halls" },
  { icon: Users, value: "12M+", label: "Yearly admissions" },
  { icon: Award, value: "15", label: "Years of operation" },
];

export default function AboutUsPage() {
  return (
    <CustomerStaticPage
      title="About LTC Cinema"
      subtitle="Bringing Vietnam's most immersive cinematic experiences to every city since 2010."
    >
      <p>
        <strong>LTC Cinema</strong> (Long Thành Cinema) is one of Vietnam&apos;s leading cinema operators. We design
        every venue around a single belief: a great film deserves a great room. From premium Dolby Atmos auditoriums to
        4DX motion halls, our network is built to make every showtime feel like a premiere.
      </p>

      <h2>Our mission</h2>
      <p>
        We exist to celebrate storytelling on the big screen — championing both Hollywood blockbusters and Vietnamese
        independent cinema, and making world-class movie experiences affordable and accessible to families, students and
        film lovers across the country.
      </p>

      <h2>What sets us apart</h2>
      <ul>
        <li>
          <strong>Premium formats</strong> — IMAX, 4DX, ScreenX, Dolby Atmos and LTC Gold Class auditoriums.
        </li>
        <li>
          <strong>Locally crafted F&amp;B</strong> — fresh popcorn, signature Vietnamese drinks and chef-curated combos.
        </li>
        <li>
          <strong>U22 Member program</strong> — designed for students and young adults aged 12–22 with year-round perks.
        </li>
        <li>
          <strong>Community first</strong> — accessible pricing for children, the elderly, persons with disabilities and
          revolutionary contributors.
        </li>
      </ul>

      <h2>By the numbers</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"
          >
            <s.icon className="mx-auto h-6 w-6 text-primary-shadcn" />
            <div className="font-heading mt-2 text-2xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground-shadcn">{s.label}</div>
          </div>
        ))}
      </div>

      <h2>Looking ahead</h2>
      <p>
        Over the next three years, LTC Cinema will expand into 20 additional cities, launch our flagship LTC Premiere
        experience, and continue investing in sustainable, energy-efficient venues — because the future of cinema should
        be as bold as the films we screen.
      </p>
    </CustomerStaticPage>
  );
}
