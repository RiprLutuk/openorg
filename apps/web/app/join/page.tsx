import type { Metadata } from "next";
import { MembershipRegistration } from "@/components/membership-registration";
import { getSite } from "@/lib/api";

export const metadata: Metadata = { title: "Apply for membership" };

export default async function JoinPage() {
  const site = await getSite();
  return (
    <section className="member-page-shell">
      <div className="wrap member-page-grid">
        <div className="member-page-intro">
          <p className="eyebrow light">Join the community</p>
          <h1>A membership that stays useful after you apply.</h1>
          <p>
            Submit your application online, follow its review, keep your profile
            current, and carry a verifiable digital member card.
          </p>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Apply securely</strong>
                <small>Your data stays in the organization’s own system.</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Track the review</strong>
                <small>See progress and decisions from your portal.</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Use your card</strong>
                <small>Print or verify your active credential anytime.</small>
              </div>
            </li>
          </ol>
        </div>
        <MembershipRegistration
          organization={site.organization.slug}
          organizationName={site.organization.name}
        />
      </div>
    </section>
  );
}
