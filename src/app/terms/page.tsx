import type { Metadata } from "next"

import { LegalPage, LegalSection } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service",
}

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" updated="October 2, 2026">
      <LegalSection title="Agreement">
        <p>
          These terms govern your use of ExtSignal. By signing in or using the service,
          you agree to them. If you do not agree, please do not use ExtSignal.
        </p>
      </LegalSection>

      <LegalSection title="What ExtSignal is">
        <p>
          ExtSignal is an analytics tool that observes how extensions rank in searches on
          the public Chrome Web Store, for the keyword and locale combinations you
          configure, and records how those rankings change over time.
        </p>
        <p>
          ExtSignal is <strong>not affiliated with, endorsed by, or sponsored by
          Google</strong>. Chrome and Chrome Web Store are trademarks of Google LLC. All
          data is gathered from publicly visible store pages.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          You sign in with a Google account. You are responsible for activity that occurs
          under your account and for keeping access to that Google account secure. One
          person per account; do not share credentials.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>attempt to bypass usage limits, rate limits, or authentication;</li>
          <li>scrape, bulk-export, or resell the service or its data;</li>
          <li>probe, disrupt, or overload the service or its infrastructure;</li>
          <li>use ExtSignal to break any law or to infringe anyone&apos;s rights.</li>
        </ul>
        <p>
          We may suspend or close an account that violates these terms, with or without
          notice.
        </p>
      </LegalSection>

      <LegalSection title="Accuracy of the data">
        <p>
          Rankings are snapshots taken at a point in time. Search results vary by
          location, device, and personalisation, and the Chrome Web Store changes without
          warning. ExtSignal is provided for information only, and we make no promise that
          any figure is complete or exact. Do not rely on it as the sole basis for a
          business decision.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          ExtSignal is offered as-is, without any uptime guarantee. Features may change,
          break, or be discontinued, and collection schedules may be delayed.
        </p>
      </LegalSection>

      <LegalSection title="Your data and ours">
        <p>
          You keep ownership of the extensions, keywords, and locales you configure. We
          own the application and the aggregated ranking history it produces. You may stop
          using the service at any time.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer and limitation of liability">
        <p>
          ExtSignal is provided &quot;as is&quot; and &quot;as available&quot;, without
          warranties of any kind, express or implied, including merchantability, fitness
          for a particular purpose, and non-infringement.
        </p>
        <p>
          To the fullest extent permitted by law, we are not liable for indirect,
          incidental, special, or consequential damages, or for lost profits, revenue,
          data, or goodwill arising from your use of ExtSignal.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You may stop using ExtSignal at any time, and you may ask us to delete your
          account and data as described in the{" "}
          <a href="/privacy">Privacy Policy</a>. We may suspend or end your access if you
          breach these terms.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms. The date at the top of this page shows when they were
          last revised. Continuing to use ExtSignal after a change means you accept the
          revised terms.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws applicable at our principal place of
          business, without regard to conflict-of-law rules.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:henri@henriz.dev">henri@henriz.dev</a>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
