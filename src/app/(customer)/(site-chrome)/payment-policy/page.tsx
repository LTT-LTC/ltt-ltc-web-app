import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";
import { CreditCard, Wallet, Gift, Ticket, Landmark } from "lucide-react";

const methods = [
  {
    icon: Wallet,
    title: "Member Reward Points",
    desc: "1 point = 1,000 VND. Minimum 20 points per transaction. Pay in-app or at the box office.",
  },
  {
    icon: Gift,
    title: "LTC Gift Card",
    desc: "Rechargeable cards in 300,000 / 500,000 / 1,000,000 VND with 1-year validity.",
  },
  {
    icon: Ticket,
    title: "Ticket Voucher",
    desc: "Each voucher has its own validity and terms — please read the back before use.",
  },
  {
    icon: Landmark,
    title: "ATM Card (domestic)",
    desc: "Debit / payment / prepaid cards registered for Internet Banking.",
  },
  {
    icon: CreditCard,
    title: "International Card",
    desc: "Visa, MasterCard, JCB, American Express and UnionPay credit/debit/prepaid.",
  },
];

const atmBanks = [
  "Vietcombank — register Internet Banking & SMS Banking",
  "DongA Bank — Internet Banking / SMS transfer service",
  "Vietinbank — register online payment service",
  "VIB — register VIB4U service",
  "HDBank — SMS / Vasco Token Key & eBanking transfer",
  "Techcombank — register Internet Banking",
  "TPBank — register Internet Banking",
  "MB — eBanking service (eMB)",
  "VietA Bank — register Internet Banking",
  "Maritime Bank — M1 card only, no registration required",
  "Eximbank — online payment service (after IB & SMS Banking)",
  "SHB — iBanking activation required",
  "Sacombank — Internet Banking required",
  "Nam A Bank — Internet Banking & SMS Banking",
];

export default function PaymentPolicyPage() {
  return (
    <CustomerStaticPage
      title="Payment Policy"
      subtitle="Accepted payment methods and how online payments work at LTC Cinema."
      contentMaxWidth="wide"
    >
      <h2>1. Payment regulation</h2>
      <p>Customers can choose the following payment methods for online booking transactions on the LTC website:</p>
      <ul>
        <li>Member Reward Points</li>
        <li>LTC Gift Card</li>
        <li>Ticket Voucher</li>
        <li>ATM Card (debit / payment / prepaid cards)</li>
        <li>Credit card, debit card, international prepaid card</li>
      </ul>

      <h2>2. Online payment methods</h2>
      <div className="grid gap-3 sm:grid-cols-2 my-3">
        {methods.map((m) => (
          <div key={m.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <m.icon className="h-5 w-5 text-primary-shadcn" />
            <h3 className="font-heading mt-2 text-sm font-semibold">{m.title}</h3>
            <p className="mt-1.5 text-xs text-muted-foreground-shadcn">{m.desc}</p>
          </div>
        ))}
      </div>

      <p>
        <strong>Membership Points:</strong> 1 point is equivalent to 1,000 VND. You can use points to pay for any
        product or service at LTC, similar to cash. Hand your member card to staff at the box office or select
        &quot;Pay with points&quot; when booking online. Minimum 20 points per transaction. Check your point balance and
        history under <em>My LTC</em>.
      </p>
      <p>
        <strong>LTC Gift Card:</strong> can be used for movie tickets and concessions at all LTC Cinemas, including online
        booking. Available at any LTC Cinema in 300,000 / 500,000 / 1,000,000 VND denominations with a one-year
        validity. Cards are rechargeable.
      </p>
      <p>
        <strong>ATM Card (domestic):</strong> the card must be registered for Internet Banking by the issuing bank. The
        transaction must be acknowledged by the payment gateway (balance/limit and authentication according to the
        card&apos;s terms).
      </p>
      <p>
        <strong>International cards:</strong> Visa, MasterCard, Amex, UnionPay and JCB credit/debit cards issued by
        domestic and international banks. The transaction must be successfully acknowledged by the payment gateway.
      </p>
      <p>
        <strong>Ticket Voucher:</strong> each voucher carries its own validity and terms — please read the back before
        use. When booking online, register the voucher and PIN before payment. Vouchers with a scratched PIN code are no
        longer redeemable at the box office.
      </p>

      <h2>3. Accepted cards for online payment</h2>
      <p>
        <em>Updated by service provider announcement.</em>
      </p>
      <h3>Credit / debit / international prepaid</h3>
      <ul>
        <li>Visa</li>
        <li>MasterCard</li>
        <li>JCB</li>
        <li>American Express</li>
        <li>UnionPay</li>
      </ul>
      <h3>ATM Card (debit / payment / prepaid)</h3>
      <ul>
        {atmBanks.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <h2>4. Unsuccessful transactions</h2>
      <p>Common reasons for a failed transaction include:</p>
      <ul>
        <li>The card is not registered for Internet Banking services.</li>
        <li>
          For Visa / MasterCard, the Verified-by-Visa or MasterCard SecureCode authentication step was not completed.
        </li>
        <li>Insufficient balance, or daily spending limit on the card has been reached.</li>
        <li>Incorrect card number entered.</li>
      </ul>
      <p>
        Please contact our hotline <strong>1900 6017</strong> or your card issuer bank for an accurate explanation.
      </p>
    </CustomerStaticPage>
  );
}
