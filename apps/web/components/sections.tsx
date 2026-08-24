import type { PageSection } from "@openorg/contracts";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  CircleDollarSign,
  ContactRound,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PublicContactForm } from "@/components/public-form";
import { SmartImage } from "@/components/smart-image";
import { getContents, getEvents } from "@/lib/api";

export function SectionRenderer({
  sections,
  organizationSlug,
}: {
  sections: PageSection[];
  organizationSlug: string;
}) {
  return (
    <>
      {sections.map((section) => (
        <Section
          key={section.id}
          section={section}
          _organizationSlug={organizationSlug}
        />
      ))}
    </>
  );
}

async function Section({
  section,
  _organizationSlug,
}: {
  section: PageSection;
  _organizationSlug?: string;
}) {
  switch (section.type) {
    case "hero":
      return <Hero section={section} />;
    case "richText":
      return (
        <section className={`rich-section ${section.width}`}>
          <div className="wrap">
            <div className="section-heading">
              {section.eyebrow && (
                <span className="eyebrow">{section.eyebrow}</span>
              )}
              {section.title && <h2>{section.title}</h2>}
            </div>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </div>
        </section>
      );
    case "features":
      return (
        <section
          className={`features-section section-space ${section.variant}`}
        >
          <div className="wrap">
            <SectionHeading
              {...(section.eyebrow ? { eyebrow: section.eyebrow } : {})}
              title={section.title}
              {...(section.description
                ? { description: section.description }
                : {})}
            />
            <div
              className="feature-grid"
              style={{ "--feature-columns": section.columns } as CSSProperties}
            >
              {section.items.map((item, index) => (
                <article key={`${item.title}-${index}`}>
                  <span className="feature-number">
                    {section.variant === "steps" ? (
                      String(index + 1).padStart(2, "0")
                    ) : (
                      <FeatureIcon name={item.icon} />
                    )}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.link && (
                    <Link href={item.link.href}>
                      {item.link.label} <ArrowRight size={16} />
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    case "stats":
      return (
        <section className="stats-section">
          <div className="wrap">
            {section.title && <h2>{section.title}</h2>}
            <div>
              {section.items.map((item) => (
                <span key={item.label}>
                  <strong>{item.value}</strong>
                  <small>{item.label}</small>
                </span>
              ))}
            </div>
          </div>
        </section>
      );
    case "contentFeed":
      return <ContentFeed section={section} />;
    case "organizationChart":
      return (
        <section className="section-space chart-section">
          <div className="wrap">
            <SectionHeading
              title={section.title}
              description={
                section.description ??
                "Kenali pengurus dan wilayah yang menggerakkan misi organisasi."
              }
            />
            <div className="chart-placeholder">
              <span>
                <Users size={27} />
              </span>
              <h3>Digerakkan manusia, dihubungkan oleh tujuan</h3>
              <p>
                Struktur organisasi dikelola secara transparan dan selalu
                terhubung dengan direktori anggota.
              </p>
              <Link className="text-link" href="/structure">
                Lihat struktur organisasi <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      );
    case "cta":
      return (
        <section className={`cta-section ${section.tone}`}>
          <div className="wrap">
            <div>
              <h2>{section.title}</h2>
              {section.description && <p>{section.description}</p>}
            </div>
            <div>
              <Link className="button light" href={section.primaryAction.href}>
                {section.primaryAction.label} <ArrowRight size={17} />
              </Link>
              {section.secondaryAction && (
                <Link
                  className="button outline-light"
                  href={section.secondaryAction.href}
                >
                  {section.secondaryAction.label}
                </Link>
              )}
            </div>
          </div>
        </section>
      );
    case "contact":
      return <ContactSection section={section} />;
  }
}

function Hero({
  section,
}: {
  section: Extract<PageSection, { type: "hero" }>;
}) {
  return (
    <section className={`hero-section align-${section.alignment}`}>
      <div className="hero-orb one" />
      <div className="hero-orb two" />
      <div className="wrap hero-inner">
        <div className="hero-copy">
          {section.eyebrow && (
            <span className="eyebrow light">{section.eyebrow}</span>
          )}
          <h1>{section.title}</h1>
          {section.description && <p>{section.description}</p>}
          <div className="hero-actions">
            {section.primaryAction && (
              <Link className="button accent" href={section.primaryAction.href}>
                {section.primaryAction.label} <ArrowRight size={18} />
              </Link>
            )}
            {section.secondaryAction && (
              <Link
                className="button ghost-light"
                href={section.secondaryAction.href}
              >
                {section.secondaryAction.label}
              </Link>
            )}
          </div>
        </div>
        {section.image && (
          <div className="hero-media">
            <img src={section.image} alt="" />
          </div>
        )}
        {!section.image && section.highlights?.length ? (
          <div className="hero-os-panel">
            <div className="hero-panel-top">
              <span>
                <LayoutDashboard size={17} />
              </span>
              <div>
                <small>RUANG KERJA AKTIF</small>
                <strong>
                  {section.panelTitle ?? "Organization command center"}
                </strong>
              </div>
              <i />
            </div>
            <div className="hero-panel-grid">
              {section.highlights.map((item, index) => (
                <article key={item}>
                  <span>
                    {index === 0 ? (
                      <ContactRound size={18} />
                    ) : index === 1 ? (
                      <ShieldCheck size={18} />
                    ) : index === 2 ? (
                      <BookOpen size={18} />
                    ) : (
                      <CircleDollarSign size={18} />
                    )}
                  </span>
                  <strong>{item}</strong>
                  <small>Dikelola dari CMS</small>
                </article>
              ))}
            </div>
            <div className="hero-panel-foot">
              <BadgeCheck size={15} /> Aman per tenant · dapat diaudit · dapat
              dikonfigurasi
            </div>
          </div>
        ) : null}
      </div>
      <div className="hero-note wrap">
        {(section.proofPoints?.length
          ? section.proofPoints
          : ["Dipimpin anggota", "Transparan", "Terbuka untuk kolaborasi"]
        ).map((item) => (
          <span key={item}>
            <Check size={15} /> {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function FeatureIcon({ name }: { name: string | undefined }) {
  const normalized = name?.toLowerCase() ?? "";
  if (normalized.includes("credential") || normalized.includes("shield"))
    return <ShieldCheck size={21} />;
  if (normalized.includes("learning") || normalized.includes("academy"))
    return <BookOpen size={21} />;
  if (normalized.includes("revenue") || normalized.includes("payment"))
    return <CircleDollarSign size={21} />;
  if (normalized.includes("governance") || normalized.includes("network"))
    return <Network size={21} />;
  if (normalized.includes("engagement") || normalized.includes("campaign"))
    return <Megaphone size={21} />;
  if (normalized.includes("member")) return <Users size={21} />;
  return <BadgeCheck size={21} />;
}

async function ContentFeed({
  section,
}: {
  section: Extract<PageSection, { type: "contentFeed" }>;
}) {
  if (section.contentType === "event") {
    const events = await getEvents(section.limit);
    return (
      <section className="section-space feed-section">
        <div className="wrap">
          <SectionHeading
            title={section.title}
            {...(section.action ? { action: section.action } : {})}
          />
          <div className="card-grid">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <div className="date-block">
                  <strong>{new Date(event.startsAt).getDate()}</strong>
                  <span>
                    {new Date(event.startsAt).toLocaleString("default", {
                      month: "short",
                    })}
                  </span>
                </div>
                <div>
                  <span className="card-meta">
                    <CalendarDays size={14} />{" "}
                    {new Date(event.startsAt).toLocaleDateString()}
                  </span>
                  <h3>{event.title}</h3>
                  {event.locationName && (
                    <p>
                      <MapPin size={14} /> {event.locationName}
                    </p>
                  )}
                  <Link href={`/events/${event.slug}`}>
                    Detail agenda <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }
  const type = ["post", "news", "campaign"].includes(section.contentType)
    ? section.contentType
    : "post";
  const items = await getContents(type, section.limit);
  return (
    <section className="section-space feed-section">
      <div className="wrap">
        <SectionHeading
          title={section.title}
          {...(section.action ? { action: section.action } : {})}
        />
        <div className="story-grid">
          {items.map((item) => (
            <article className="story-card" key={item.id}>
              <SmartImage
                src={item.coverUrl}
                alt={item.title}
                fallbackType={item.type === "post" ? "tech" : "news"}
              />
              <div>
                <span className="card-meta">
                  {item.type} ·{" "}
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString()
                    : "New"}
                </span>
                <h3>{item.title}</h3>
                {item.excerpt && <p>{item.excerpt}</p>}
                <Link href={`/stories/${item.slug}`}>
                  Baca selengkapnya <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({
  section,
}: {
  section: Extract<PageSection, { type: "contact" }>;
}) {
  return (
    <section className="contact-section section-space">
      <div className="wrap contact-grid">
        <div>
          <span className="eyebrow">Start a conversation</span>
          <h2>{section.title}</h2>
          {section.description && <p>{section.description}</p>}
          <div className="contact-points">
            <span>
              <strong>Email us</strong>
              <small>hello@organization.org</small>
            </span>
            <span>
              <strong>Visit us</strong>
              <small>Open Monday through Friday</small>
            </span>
          </div>
        </div>
        {section.showForm && <PublicContactForm />}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="section-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && (
        <Link className="text-link" href={action.href}>
          {action.label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
