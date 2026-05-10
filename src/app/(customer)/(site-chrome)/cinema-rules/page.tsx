import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";
import {
  Camera,
  PhoneOff,
  Cigarette,
  VolumeX,
  Ban,
  PawPrint,
  Wallet,
  UtensilsCrossed,
  Wine,
  Clock,
  ShieldAlert,
  Video,
} from "lucide-react";

const houseRules = [
  { icon: Camera, text: "No filming or photography." },
  { icon: PhoneOff, text: "Turn off mobile phone ringtones." },
  { icon: Cigarette, text: "No smoking." },
  { icon: VolumeX, text: "Do not cause disorder." },
  { icon: Ban, text: "No chewing gum." },
  { icon: PawPrint, text: "No pets allowed inside the cinema." },
  { icon: Wallet, text: "Take care of your personal belongings." },
  {
    icon: UtensilsCrossed,
    text: "Only food and drinks purchased at LTC Cinemas are allowed inside the theater.",
  },
  { icon: Wine, text: "No alcohol or other stimulants are permitted within LTC premises." },
  {
    icon: Clock,
    text: "From 22:00, no service for guests under 13. From 23:00, no service for guests under 16.",
  },
  {
    icon: ShieldAlert,
    text: "LTC Cinemas reserves the right to refuse entry to any customer who violates these rules.",
  },
  { icon: Video, text: "LTC Vietnam operates security cameras across all LTC Cinemas." },
];

const ratings = [
  { code: "P", desc: "Films permitted for viewers of all ages." },
  { code: "K", desc: "Permitted for viewers under 13 when accompanied by a guardian." },
  { code: "T13", desc: "Permitted for viewers aged 13 and older." },
  { code: "T16", desc: "Permitted for viewers aged 16 and older." },
  { code: "T18", desc: "Permitted for viewers aged 18 and older." },
  { code: "C", desc: "Films not permitted for distribution." },
];

const definitions: [string, string][] = [
  ["Children", "Customers under 16 years old or under 130 cm tall."],
  ["U22 Members", "Active LTC U22 Member program participants aged 12 to under 22."],
  ["Customers under 23", "Customers with valid ID proving they are under 23 when using LTC services."],
  ["Elderly", "Customers over 55 years old."],
  [
    "Revolutionary Contributors",
    "Customers officially certified as Persons with Meritorious Services to the Revolution.",
  ],
  [
    "Disadvantaged Persons",
    "Customers officially certified as living in difficult circumstances (Poor / Near-Poor Households).",
  ],
  [
    "Severely Disabled",
    "Persons with severe disabilities causing partial loss or impairment of basic function.",
  ],
  [
    "Exceptionally Severely Disabled",
    "Persons with complete loss of function, entirely unable to perform basic activities.",
  ],
  ["Adults", "Customers who do not fall into any of the above categories."],
];

const pricing = [
  { who: "Adults", price: "Base ticket price set at each LTC Cinema." },
  { who: "U22 Customers", price: "As announced at each LTC Cinema." },
  { who: "Students (non-U22)", price: "As announced at each LTC Cinema for valid student ID holders." },
  {
    who: "Children, Elderly, Revolutionary Contributors, Disadvantaged Persons",
    price: "At least 20% lower than the base ticket price.",
  },
  { who: "Severely Disabled Persons", price: "At least 50% lower than the base ticket price." },
  { who: "Exceptionally Severely Disabled Persons", price: "Free of charge (100% discount)." },
];

export default function CinemaRulesPage() {
  return (
    <CustomerStaticPage
      title="Cinema Rules"
      subtitle="Please read these rules carefully to ensure a great experience for everyone."
      contentMaxWidth="wide"
    >
      <h2>I. House Rules</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {houseRules.map((r) => (
          <div
            key={r.text}
            className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-shadcn/10 text-primary-shadcn">
              <r.icon className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-800">{r.text}</p>
          </div>
        ))}
      </div>

      <h2>II. Film Age Classification</h2>
      <h3>1. Classification</h3>
      <div className="overflow-x-auto">
        <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
          <thead className="bg-muted-shadcn">
            <tr>
              <th className="w-24 px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Definition</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((r) => (
              <tr key={r.code} className="border-t border-gray-200">
                <td className="px-3 py-2">
                  <span className="inline-flex min-w-10 items-center justify-center rounded bg-primary-shadcn px-2 py-0.5 font-heading text-xs font-bold text-primary-shadcn-foreground">
                    {r.code}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-700">{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>2. Notes</h3>
      <p>
        Customers watching T13 / T16 / T18 films must bring a photo ID showing their date of birth. LTC may request a
        Birth Certificate, Citizen ID, Student ID, Driver&apos;s License or other valid ID to verify age. The Management
        reserves the right to refuse service when age requirements are not met.
      </p>
      <h3>3. Penalties</h3>
      <p>
        Fines of <strong>60,000,000 – 80,000,000 VND</strong> for failing to ensure viewers meet the age limits of the
        film classification.
      </p>

      <h2>III. Screening Hours for Children</h2>
      <ol>
        <li>
          Screenings for children under 13 must end before <strong>22:00</strong>.
        </li>
        <li>
          Screenings for children under 16 must end before <strong>23:00</strong>.
        </li>
      </ol>
      <p>
        LTC may request valid ID to verify age, and reserves the right to refuse service when age requirements are not
        met. Penalties for violation range from <strong>40,000,000 – 60,000,000 VND</strong>.
      </p>

      <h2>IV. Ticket Pricing Policy</h2>
      <h3>1. Definitions</h3>
      <div className="overflow-x-auto">
        <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
          <tbody>
            {definitions.map(([term, desc]) => (
              <tr key={term} className="border-t border-gray-200 first:border-t-0">
                <td className="w-1/3 whitespace-nowrap px-3 py-2 align-top font-semibold">{term}</td>
                <td className="px-3 py-2 text-slate-700">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>2. Notes</h3>
      <ul>
        <li>Age calculations follow legal regulations.</li>
        <li>Customers under 130 cm without documentation will be classified as Children.</li>
        <li>
          Where documentation is unavailable, visual observation may be used to apply Severely Disabled or Exceptionally
          Severely Disabled categories.
        </li>
      </ul>

      <h3>3. Verification Documents</h3>
      <p>
        To apply the Ticket Pricing Policy transparently, LTC may request: Birth Certificate, Citizen ID, Passport,
        Student ID, Household Registration, Elderly Card, Invalid Soldier Card, certificates of merit, ward/commune
        confirmations of difficult circumstances, or medical records stating disability percentage. Limit:{" "}
        <strong>1 subject / 1 ticket / 1 transaction</strong> with no daily transaction limit.
      </p>

      <h3>4. Pricing details</h3>
      <div className="overflow-x-auto">
        <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
          <thead className="bg-muted-shadcn">
            <tr>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Standard ticket price</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((p) => (
              <tr key={p.who} className="border-t border-gray-200">
                <td className="px-3 py-2 align-top">{p.who}</td>
                <td className="px-3 py-2 text-slate-700">{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Important:</strong> ticket prices vary between LTC Cinemas. Discounts for Children, Elderly, Revolutionary
        Contributors, Disadvantaged Persons, Severely Disabled and Exceptionally Severely Disabled Persons{" "}
        <strong>do not apply when booking online</strong> via the LTC website or mobile app — these can only be claimed in
        person at LTC Cinema box offices nationwide.
      </div>
    </CustomerStaticPage>
  );
}
