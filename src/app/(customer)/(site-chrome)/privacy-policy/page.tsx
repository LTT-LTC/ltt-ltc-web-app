import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";

export default function PrivacyPolicyPage() {
  return (
    <CustomerStaticPage
      title="Privacy Policy"
      subtitle="How LTC Cinema collects, uses and protects your personal data."
    >
      <h2>1. Information we collect</h2>
      <ul>
        <li>Account data — name, email, phone number, date of birth.</li>
        <li>Booking data — selected films, seats, payment method and history.</li>
        <li>Device &amp; usage data — IP, browser, device identifiers, pages visited.</li>
        <li>Member program data — points balance, tier, transaction history.</li>
      </ul>

      <h2>2. How we use your data</h2>
      <ul>
        <li>To process bookings, payments and refunds.</li>
        <li>To operate the LTC Member Program and personalize offers.</li>
        <li>To send service notifications, e-tickets and marketing communications you have opted in to.</li>
        <li>To prevent fraud and to comply with legal obligations.</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>
        We share data with payment processors, telecom partners (for SMS), and authorities when required by law. We do
        not sell your personal data to third parties.
      </p>

      <h2>4. Retention</h2>
      <p>
        Personal data is retained for as long as your account is active and as long as required by Vietnamese accounting
        and tax law (typically 10 years for transaction records).
      </p>

      <h2>5. Your rights</h2>
      <p>
        You may access, correct, delete or export your data, and you may withdraw marketing consent at any time, by
        contacting{" "}
        <a href="mailto:privacy@ltc-cinema.vn" className="font-semibold text-primary-shadcn hover:underline">
          privacy@ltc-cinema.vn
        </a>
        .
      </p>

      <h2>6. Security</h2>
      <p>
        We use TLS encryption in transit, encrypted storage at rest, and role-based access controls. Payment card data is
        handled exclusively by PCI-DSS certified processors.
      </p>

      <p className="text-xs text-muted-foreground-shadcn">Last updated: 1 January 2026</p>
    </CustomerStaticPage>
  );
}
