import { LegalDocument } from "../components/LegalDocument";

const EFFECTIVE = "30 August 2026";

export function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      effectiveDate={EFFECTIVE}
      otherPage={{ href: "/terms", label: "Terms of Use" }}
      intro={
        <>
          Dnols (“we”, “us”, “our”) operates the buyer marketplace and a separate{" "}
          <strong>seller portal</strong> for stall owners. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have. By
          using Dnols, you agree to this policy.
        </>
      }
      sections={[
        {
          id: "who-we-are",
          title: "1. Who we are",
          body: (
            <>
              <p>
                Dnols is a marketplace focused on in-person pickup in Kariakoo,
                Dar es Salaam, Tanzania. Buyers browse and pay through Dnols.
                Sellers list products and manage orders through our seller portal.
              </p>
              <p>
                For privacy questions or requests, contact us at{" "}
                <a href="mailto:privacy@dnols.com">privacy@dnols.com</a>.
              </p>
            </>
          ),
        },
        {
          id: "information-we-collect",
          title: "2. Information we collect",
          body: (
            <>
              <p>We collect information in these ways:</p>
              <ul>
                <li>
                  <strong>Account information</strong> — When you sign in with
                  Google or email, we receive your name, email address, profile
                  photo (if provided by Google), and a unique account identifier
                  through Firebase Authentication.
                </li>
                <li>
                  <strong>Order and payment information</strong> — Items you buy,
                  order totals in Tanzanian Shillings (TZS), pickup codes,
                  mobile-money phone numbers you enter at checkout, and escrow
                  status (reserved, paid, handed over).
                </li>
                <li>
                  <strong>Location-related data</strong> — Approximate distance to
                  a listing (calculated from a market-area reference point) and,
                  after payment, stall directions needed for pickup. Exact shop
                  coordinates are hidden until you pay.
                </li>
                <li>
                  <strong>Seller information</strong> — Shop name, stall location
                  in Kariakoo, verification documents (e.g. NIDA or passport),
                  payout mobile-money details, product listings, and photos.
                </li>
                <li>
                  <strong>Device and usage data</strong> — Browser type, pages
                  visited, search queries, saved items, and technical logs
                  (IP address, timestamps) needed to run and secure the service.
                </li>
                <li>
                  <strong>Communications</strong> — Messages you send to support
                  and any feedback you provide.
                </li>
              </ul>
              <p>
                We do <strong>not</strong> store full mobile-money PINs or card
                numbers on our servers. Payments are initiated through your
                mobile-money provider (e.g. M-Pesa, Mix by Yas, Airtel Money).
              </p>
            </>
          ),
        },
        {
          id: "how-we-use",
          title: "3. How we use your information",
          body: (
            <>
              <p>We use your information to:</p>
              <ul>
                <li>Provide the marketplace, cart, checkout, and order tracking</li>
                <li>Hold buyer payments in escrow until the buyer receives the product</li>
                <li>Release seller payouts only after handover is confirmed</li>
                <li>Release stall addresses and pickup codes after payment</li>
                <li>Verify sellers and process payouts after successful handover</li>
                <li>Prevent fraud, abuse, and unauthorized access</li>
                <li>Improve search, listings, and product recommendations</li>
                <li>Send service messages (order updates, pickup instructions)</li>
                <li>Comply with applicable law and respond to lawful requests</li>
              </ul>
              <p>
                Sellers may use AI-assisted tools (e.g. cover photos and
                descriptions) in the seller portal. Product text and images you
                provide may be processed by third-party AI providers to generate
                or improve listings, as described in our seller terms.
              </p>
            </>
          ),
        },
        {
          id: "legal-bases",
          title: "4. Legal bases (where applicable)",
          body: (
            <p>
              Where data-protection law requires a legal basis, we rely on:{" "}
              <strong>contract</strong> (to fulfil orders you place),{" "}
              <strong>legitimate interests</strong> (security, fraud prevention,
              service improvement), <strong>consent</strong> (where we ask for it
              explicitly, such as optional marketing), and{" "}
              <strong>legal obligation</strong> (tax, regulatory, or law-enforcement
              requirements in Tanzania).
            </p>
          ),
        },
        {
          id: "sharing",
          title: "5. When we share information",
          body: (
            <>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul>
                <li>
                  <strong>Sellers</strong> — After you pay, the seller receives
                  what they need to fulfil pickup (e.g. pickup code, order
                  details). They do not receive your payment until handover is
                  confirmed.
                </li>
                <li>
                  <strong>Service providers</strong> — Hosting (Firebase/Google
                  Cloud), authentication (Firebase), email (e.g. Resend), payment
                  and API infrastructure, and AI providers used for seller
                  listing tools. These providers process data only on our
                  instructions.
                </li>
                <li>
                  <strong>Authorities</strong> — When required by law or to
                  protect rights, safety, and security.
                </li>
                <li>
                  <strong>Business transfers</strong> — If Dnols is merged,
                  acquired, or sells assets, subject to this policy.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "cookies",
          title: "6. Cookies and local storage",
          body: (
            <>
              <p>
                We use browser <strong>local storage</strong> and similar
                technologies to remember your cart, saved items, sign-in state,
                and preferences (e.g. theme). Our progressive web app may cache
                pages and images so the site works offline or loads faster.
              </p>
              <p>
                Firebase Authentication may set cookies or tokens required for
                secure sign-in. You can clear site data in your browser settings,
                but some features may stop working until you sign in again.
              </p>
            </>
          ),
        },
        {
          id: "retention",
          title: "7. How long we keep data",
          body: (
            <>
              <p>We keep information only as long as needed for the purposes above:</p>
              <ul>
                <li>Account data — while your account is active and for a reasonable period after closure</li>
                <li>Order and escrow records — as required for disputes, tax, and legal compliance</li>
                <li>Server logs — typically up to 12 months unless needed for security investigations</li>
                <li>Seller verification documents — for the duration of the seller relationship and as required by law</li>
              </ul>
            </>
          ),
        },
        {
          id: "security",
          title: "8. Security",
          body: (
            <p>
              We use encryption in transit (HTTPS), access controls, and
              industry-standard practices to protect your data. No method of
              transmission or storage is 100% secure; we cannot guarantee
              absolute security.
            </p>
          ),
        },
        {
          id: "your-rights",
          title: "9. Your choices and rights",
          body: (
            <>
              <p>You can:</p>
              <ul>
                <li>Access and update account details in My Account / Settings</li>
                <li>Sign out or delete saved items from your device</li>
                <li>Request access, correction, or deletion of personal data by emailing privacy@dnols.com</li>
                <li>Object to certain processing where applicable law allows</li>
              </ul>
              <p>
                We will respond to verified requests within a reasonable time.
                You may also lodge a complaint with the relevant data-protection
                authority in Tanzania if you believe your rights have been
                violated.
              </p>
            </>
          ),
        },
        {
          id: "children",
          title: "10. Children",
          body: (
            <p>
              Dnols is not directed at children under 18. We do not knowingly
              collect personal information from children. If you believe a child
              has provided us data, contact us and we will delete it.
            </p>
          ),
        },
        {
          id: "international",
          title: "11. International transfers",
          body: (
            <p>
              Our service providers (including Google/Firebase) may process data
              in countries other than Tanzania. Where required, we use
              appropriate safeguards for such transfers.
            </p>
          ),
        },
        {
          id: "changes",
          title: "12. Changes to this policy",
          body: (
            <p>
              We may update this Privacy Policy from time to time. We will post
              the new version on this page and update the effective date. Continued
              use of Dnols after changes means you accept the updated policy.
            </p>
          ),
        },
        {
          id: "contact",
          title: "13. Contact",
          body: (
            <>
              <p>
                <strong>Dnols</strong>
                <br />
                Email: <a href="mailto:privacy@dnols.com">privacy@dnols.com</a>
                <br />
                Support: <a href="mailto:support@dnols.com">support@dnols.com</a>
                <br />
                Web: <a href="https://dnols.com">dnols.com</a>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
