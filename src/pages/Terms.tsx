import { LegalDocument } from "../components/LegalDocument";

const EFFECTIVE = "30 August 2026";

export function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Use"
      effectiveDate={EFFECTIVE}
      otherPage={{ href: "/privacy", label: "Privacy Policy" }}
      intro={
        <>
          These Terms of Use (“Terms”) govern your access to and use of Dnols,
          including <strong>dnols.com</strong> (buyer marketplace) and our{" "}
          <strong>seller portal</strong> (seller tools). Please read them
          carefully. By using Dnols, you agree to these Terms and our{" "}
          <a href="/privacy">Privacy Policy</a>.
        </>
      }
      sections={[
        {
          id: "about",
          title: "1. About Dnols",
          body: (
            <>
              <p>
                Dnols is an online marketplace that connects buyers with sellers
                operating in and around <strong>Kariakoo Market, Dar es Salaam,
                Tanzania</strong>. Listings are for <strong>in-person pickup</strong>.
                Dnols facilitates discovery, payment holding (escrow), and
                pickup coordination. <strong>Sellers are paid only after the
                buyer has received the product</strong> and handover is confirmed
                in the app — we are not the seller of items listed by third-party
                shops.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          title: "2. Eligibility",
          body: (
            <>
              <p>You must:</p>
              <ul>
                <li>Be at least <strong>18 years old</strong></li>
                <li>Have the legal capacity to enter a binding contract</li>
                <li>Provide accurate registration and checkout information</li>
                <li>Comply with Tanzanian law and these Terms</li>
              </ul>
              <p>
                Sellers must complete our verification process and maintain valid
                identification and payout details through the Dnols seller portal.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          title: "3. Accounts and sign-in",
          body: (
            <>
              <p>
                You may need an account to place orders, save items, or sell on
                Dnols. Sign-in is available via <strong>Google</strong> or{" "}
                <strong>email and password</strong> through Firebase Authentication.
              </p>
              <p>You are responsible for:</p>
              <ul>
                <li>Keeping your credentials confidential</li>
                <li>All activity under your account</li>
                <li>Notifying us promptly of unauthorized use</li>
              </ul>
              <p>
                We may suspend or terminate accounts that violate these Terms or
                pose a security or fraud risk.
              </p>
            </>
          ),
        },
        {
          id: "buying",
          title: "4. Buying on Dnols",
          body: (
            <>
              <p>
                <strong>Listings.</strong> Product photos, descriptions, prices,
                and availability are provided by sellers. We strive for accuracy
                but do not guarantee that every listing is error-free.
              </p>
              <p>
                <strong>Prices.</strong> Prices are shown in{" "}
                <strong>Tanzanian Shillings (TZS)</strong> unless stated
                otherwise. Some listings may be marked negotiable; that is
                between you and the seller before payment.
              </p>
              <p>
                <strong>Payment.</strong> You pay through supported mobile-money
                methods (e.g. M-Pesa, Mix by Yas, Airtel Money). You authorize
                us and our payment partners to charge the amount shown at
                checkout. Payment confirms your order; funds are held in{" "}
                <strong>escrow</strong> until you receive the product at pickup.
              </p>
              <p>
                <strong>Pickup location.</strong> Exact stall address and
                directions are revealed <strong>only after successful payment</strong>.
                You agree to collect items in person within the timeframe shown in
                your order.
              </p>
              <p>
                <strong>Pickup code.</strong> You will receive a pickup code.
                Show it to the seller at handover. Do not share it publicly.
              </p>
            </>
          ),
        },
        {
          id: "escrow",
          title: "5. Escrow and handover",
          body: (
            <>
              <p>
                Dnols holds buyer payments until the product has reached the buyer.
                Sellers are paid only after handover is confirmed:
              </p>
              <ol>
                <li>You pay — funds are held safely, not sent to the seller yet</li>
                <li>You travel to the stall in Kariakoo</li>
                <li>You inspect the product and show your pickup code</li>
                <li>The seller hands over the item; you confirm receipt in the app</li>
                <li>Only then are funds released to the seller</li>
              </ol>
              <p>
                If there is a dispute (wrong item, seller no-show, etc.), contact{" "}
                <a href="mailto:support@dnols.com">support@dnols.com</a> promptly
                with your order ID. We may hold or reverse escrow according to our
                policies and applicable law.
              </p>
            </>
          ),
        },
        {
          id: "selling",
          title: "6. Selling on Dnols",
          body: (
            <>
              <p>
                Sellers use the <strong>Dnols seller portal</strong> to apply, list
                products, and manage orders. By selling, you additionally agree
                to:
              </p>
              <ul>
                <li>Provide truthful shop and product information</li>
                <li>Only list items you are legally allowed to sell</li>
                <li>Honour listed prices and stock levels</li>
                <li>Complete verification (ID, stall location, payout number)</li>
                <li>Fulfil paid orders at your stated stall location</li>
                <li>Use accurate photos; AI-generated covers must represent the real product fairly</li>
              </ul>
              <p>
                We may reject, suspend, or remove sellers or listings that breach
                these Terms or harm buyers.
              </p>
            </>
          ),
        },
        {
          id: "prohibited",
          title: "7. Prohibited conduct",
          body: (
            <>
              <p>You may not:</p>
              <ul>
                <li>Use Dnols for illegal goods, scams, or counterfeit items</li>
                <li>Circumvent escrow by arranging off-platform payment to avoid fees or protections</li>
                <li>Harass, threaten, or discriminate against other users</li>
                <li>Scrape, reverse-engineer, or overload our systems</li>
                <li>Upload malware or infringing content</li>
                <li>Impersonate another person or business</li>
                <li>Misuse pickup codes or seller verification documents</li>
              </ul>
            </>
          ),
        },
        {
          id: "intellectual-property",
          title: "8. Intellectual property",
          body: (
            <>
              <p>
                Dnols logos, branding, software, and site content are owned by us
                or our licensors. You may not copy or use them without permission.
              </p>
              <p>
                Sellers retain rights to their listing content but grant Dnols a
                non-exclusive licence to display, promote, and process that
                content for operating the marketplace (including AI-assisted
                formatting of photos and descriptions).
              </p>
            </>
          ),
        },
        {
          id: "disclaimers",
          title: "9. Disclaimers",
          body: (
            <>
              <p>
                Dnols is provided <strong>“as is”</strong> and{" "}
                <strong>“as available”</strong>. To the fullest extent permitted
                by law, we disclaim warranties of merchantability, fitness for a
                particular purpose, and non-infringement.
              </p>
              <p>
                We do not guarantee uninterrupted service, error-free listings,
                or that every seller will fulfil every order. Transactions are
                primarily between buyers and sellers; Dnols provides the platform
                and escrow mechanics.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          title: "10. Limitation of liability",
          body: (
            <p>
              To the maximum extent permitted by Tanzanian law, Dnols and its
              officers, employees, and partners are not liable for indirect,
              incidental, special, consequential, or punitive damages, or for loss
              of profits, data, or goodwill. Our total liability for any claim
              arising from these Terms or your use of Dnols is limited to the
              greater of (a) the fees you paid to us in the twelve months before
              the claim, or (b) <strong>TZS 500,000</strong>, except where law
              does not allow such limitation.
            </p>
          ),
        },
        {
          id: "indemnity",
          title: "11. Indemnity",
          body: (
            <p>
              You agree to indemnify and hold Dnols harmless from claims,
              damages, and expenses (including reasonable legal fees) arising
              from your use of the service, your listings, your breach of these
              Terms, or your violation of any law or third-party rights.
            </p>
          ),
        },
        {
          id: "termination",
          title: "12. Suspension and termination",
          body: (
            <p>
              We may suspend or terminate your access at any time for violation
              of these Terms, fraud, legal requirements, or operational reasons.
              You may stop using Dnols at any time. Provisions that by nature
              should survive (escrow obligations, liability limits, indemnity,
              governing law) will survive termination.
            </p>
          ),
        },
        {
          id: "law",
          title: "13. Governing law",
          body: (
            <p>
              These Terms are governed by the laws of the{" "}
              <strong>United Republic of Tanzania</strong>, without regard to
              conflict-of-law rules. Disputes shall be subject to the exclusive
              jurisdiction of the courts of <strong>Dar es Salaam</strong>,
              unless mandatory consumer protection law requires otherwise.
            </p>
          ),
        },
        {
          id: "changes",
          title: "14. Changes to these Terms",
          body: (
            <p>
              We may update these Terms from time to time. We will post the
              updated version at <strong>dnols.com/terms</strong> and update the
              effective date. Material changes may be communicated by email or
              in-app notice where appropriate. Continued use after changes
              constitutes acceptance.
            </p>
          ),
        },
        {
          id: "contact",
          title: "15. Contact",
          body: (
            <>
              <p>
                <strong>Dnols</strong>
                <br />
                Email: <a href="mailto:support@dnols.com">support@dnols.com</a>
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
