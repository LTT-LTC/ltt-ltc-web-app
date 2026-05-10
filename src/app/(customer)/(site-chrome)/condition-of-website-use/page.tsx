import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";

export default function ConditionsOfWebsiteUsePage() {
  return (
    <CustomerStaticPage
      title="Conditions of Website Use"
      subtitle="By accessing and using ltc-cinema.vn you agree to the following conditions."
    >
      <h2>1. Acceptance of conditions</h2>
      <p>
        Your access to and use of the LTC Cinema website (the &quot;Site&quot;) is subject to these Conditions of Use
        and all applicable laws of Vietnam. By using the Site you accept these conditions without limitation.
      </p>

      <h2>2. Use of the Site</h2>
      <ul>
        <li>You may use the Site only for lawful, personal and non-commercial purposes.</li>
        <li>
          You must not interfere with the Site, scrape its content, or attempt to gain unauthorized access to any
          system or account.
        </li>
        <li>You must provide accurate information when registering, booking or making payments.</li>
      </ul>

      <h2>3. Intellectual property</h2>
      <p>
        All trademarks, logos, posters, trailers, copy, images and software on the Site are the property of LTC Vietnam
        or its licensors and are protected by copyright. No content may be reproduced or redistributed without prior
        written consent.
      </p>

      <h2>4. User accounts</h2>
      <p>
        You are responsible for safeguarding your account credentials. LTC will not be liable for any loss resulting from
        unauthorized use of your account. Please notify us immediately at security@ltc-cinema.vn if you suspect
        unauthorized activity.
      </p>

      <h2>5. Third-party links</h2>
      <p>
        The Site may contain links to third-party websites. LTC is not responsible for the content or practices of any
        linked sites and provides such links solely for convenience.
      </p>

      <h2>6. Disclaimer &amp; limitation of liability</h2>
      <p>
        The Site is provided on an &quot;as is&quot; basis. To the maximum extent permitted by law, LTC Vietnam disclaims
        all warranties and shall not be liable for any indirect, incidental or consequential damages arising from your
        use of the Site.
      </p>

      <h2>7. Changes</h2>
      <p>
        LTC may revise these Conditions at any time. Continued use of the Site after any change constitutes acceptance
        of the revised Conditions.
      </p>

      <p className="text-xs text-muted-foreground-shadcn">Last updated: 1 January 2026</p>
    </CustomerStaticPage>
  );
}
