import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";

export default function TermsOfUsePage() {
  return (
    <CustomerStaticPage
      title="Terms of Use"
      subtitle="The terms that apply when you book tickets, redeem promotions or use any LTC service."
    >
      <h2>1. Booking &amp; ticketing</h2>
      <ul>
        <li>A ticket is only valid for the specific film, showtime, hall and seat printed on it.</li>
        <li>Tickets are non-transferable and, except where required by law, are non-refundable once issued.</li>
        <li>Latecomers may be seated at the manager&apos;s discretion and are not entitled to a refund.</li>
      </ul>

      <h2>2. Age classification</h2>
      <p>
        Customers must comply with the film age classification (P, K, T13, T16, T18, C). Valid photo ID may be
        requested at the door. LTC reserves the right to refuse entry where age requirements are not met.
      </p>

      <h2>3. Conduct in the cinema</h2>
      <ul>
        <li>No filming, recording or photography during the screening.</li>
        <li>No outside food or drinks. Only items purchased at LTC are permitted inside the auditorium.</li>
        <li>Mobile phones must be silenced for the duration of the screening.</li>
        <li>Disruptive guests may be removed without refund.</li>
      </ul>

      <h2>4. Promotions, vouchers &amp; gift cards</h2>
      <p>
        Each promotion, voucher or gift card has its own terms which prevail over these Terms where there is conflict.
        Promotions cannot be combined unless explicitly stated. LTC may withdraw or modify any promotion at any time
        without prior notice.
      </p>

      <h2>5. Member program</h2>
      <p>
        Membership benefits, points and tiers are governed by the LTC Member Program Terms. Points have no cash value and
        expire according to the schedule published in the member portal.
      </p>

      <h2>6. Cancellation by LTC</h2>
      <p>
        In the event of a technical fault, force majeure or operational issue, LTC may cancel or reschedule a screening.
        Affected customers will be offered a full refund or a replacement ticket of equal value.
      </p>

      <h2>7. Privacy</h2>
      <p>Personal data collected through the Site is processed in accordance with our Privacy Policy.</p>

      <h2>8. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Socialist Republic of Vietnam. Any dispute shall be resolved by the
        competent courts of Ho Chi Minh City.
      </p>

      <p className="text-xs text-muted-foreground-shadcn">Last updated: 1 January 2026</p>
    </CustomerStaticPage>
  );
}
