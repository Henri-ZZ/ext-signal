import type { Metadata } from "next"

import { LegalPage, LegalSection } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2, 2026">
      <LegalSection title="Overview">
        <p>
          ExtSignal is a Chrome Web Store search intelligence tool. It tracks how
          extensions rank for keyword and locale combinations over time and shows that
          history in a dashboard. This policy explains what we collect when you use
          ExtSignal at <strong>extsignal.henriz.dev</strong> and what we do with it.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>
          <strong>Account details.</strong> When you sign in with Google we receive your
          email address, your display name, and your profile picture. We never receive or
          store your Google password.
        </p>
        <p>
          <strong>What you add to your workspace.</strong> The Chrome Web Store
          extensions you track, the keyword and locale pairs you configure, and your
          display preferences.
        </p>
        <p>
          <strong>Ranking data.</strong> Search results observed on the public Chrome Web
          Store for the keywords you track. This is publicly visible information, not
          anything private to you or to other publishers.
        </p>
        <p>
          <strong>A session cookie.</strong> Signing in sets a cookie that keeps you
          authenticated. It is signed and encrypted, it is not readable by scripts on the
          page, and it is the only cookie we set. We do not use advertising or analytics
          cookies.
        </p>
        <p>
          <strong>What we do not collect.</strong> We do not collect payment details —
          ExtSignal is not currently a paid service. We do not run third-party analytics,
          advertising, or session-replay tools, and we do not sell or rent your
          information to anyone.
        </p>
      </LegalSection>

      <LegalSection title="How we use your information">
        <ul>
          <li>To create and secure your account and keep you signed in.</li>
          <li>To run the rankings you have configured and show you the results.</li>
          <li>To operate, maintain, and debug the service.</li>
          <li>To reply to you if you contact us.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Service providers">
        <p>
          We rely on a small number of infrastructure providers to run ExtSignal. They
          process data only on our behalf:
        </p>
        <ul>
          <li>
            <strong>Neon</strong> — the Postgres database and authentication service that
            stores your account, workspace, and ranking data.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting.
          </li>
          <li>
            <strong>Cloudflare</strong> — runs the collection worker that reads the public
            Chrome Web Store on a schedule. It is not part of your browser session.
          </li>
          <li>
            <strong>Google</strong> — handles sign-in through Google OAuth.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Public data only">
        <p>
          Any extension on the Chrome Web Store can be tracked, whether or not you own
          it. ExtSignal only reads what the Chrome Web Store already shows publicly. We do
          not access publisher accounts, private listings, or any non-public information.
        </p>
      </LegalSection>

      <LegalSection title="Retention and deletion">
        <p>
          Your account, extensions, tracking targets, and preferences are kept for as long
          as your account exists. To delete everything, email us at{" "}
          <a href="mailto:henri@henriz.dev">henri@henriz.dev</a> from the address you
          signed up with and we will remove your account and its data.
        </p>
        <p>
          Ranking observations are stored as shared snapshots rather than per-user
          records, so aggregate history may remain after an account is deleted. Those
          snapshots contain no personal information.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Traffic is encrypted in transit with HTTPS. Credentials and signing secrets are
          held server-side and are never sent to the browser. No online service can
          promise perfect security, but we keep the surface small on purpose.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          ExtSignal is a tool for professional use and is not directed at children. It is
          not intended for anyone under 16.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If this policy changes in a meaningful way we will update the date shown at the
          top of this page. Continuing to use ExtSignal after a change means you accept
          the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy or your data? Email{" "}
          <a href="mailto:henri@henriz.dev">henri@henriz.dev</a>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
