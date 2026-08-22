import { ArrowRight, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getContents } from "@/lib/api";

export const metadata: Metadata = {
  title: "Warta & Publikasi Berita",
  description:
    "Kabar, warta kegiatan, siaran pers, dan artikel pengetahuan terbaru dari organisasi.",
};

export default async function StoriesPage() {
  const groups = await Promise.all(
    ["post", "news", "campaign"].map((type) => getContents(type, 100)),
  );
  const items = groups
    .flat()
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.updatedAt).getTime() -
        new Date(a.publishedAt ?? a.updatedAt).getTime(),
    );
  return (
    <div className="page-shell">
      <section className="stories-archive-hero">
        <div className="wrap">
          <div className="hero-pill">
            <Newspaper size={14} />
            <span>Pusat Publikasi & Informasi</span>
          </div>
          <h1>Warta, Kabar & Siaran Pers Resmi</h1>
          <p className="hero-lead">
            Ikuti informasi terkini mengenai perkembangan regulasi, liputan
            kegiatan kepengurusan daerah, dan artikel edukasi profesional.
          </p>
        </div>
      </section>

      <section className="section-space">
        <div className="wrap">
          {items.length ? (
            <div className="story-grid-refined">
              {items.map((item) => (
                <article className="story-card-refined" key={item.id}>
                  {item.coverUrl ? (
                    <div className="story-cover-wrap">
                      <img src={item.coverUrl} alt="" />
                    </div>
                  ) : (
                    <div className="story-cover-fallback" />
                  )}
                  <div className="story-card-body">
                    <div className="story-meta-header">
                      <span className="story-type-badge">{item.type}</span>
                      <span className="story-date-chip">
                        {new Date(
                          item.publishedAt ?? item.updatedAt,
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h2>{item.title}</h2>
                    {item.excerpt && (
                      <p className="story-excerpt">{item.excerpt}</p>
                    )}
                    <Link
                      href={`/stories/${item.slug}`}
                      className="story-read-link"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Newspaper size={48} />
              <h3>Belum Ada Artikel Dipublikasikan</h3>
              <p>
                Warta dan publikasi berita terbaru akan segera diunggah oleh tim
                redaksi.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
