import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getContents } from "@/lib/api";

export const metadata: Metadata = {
  title: "Cerita & Kabar",
  description: "Kabar, pengetahuan, dan pembaruan terbaru dari organisasi.",
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
    <>
      <section className="archive-hero">
        <div className="wrap archive-hero-copy">
          <span className="eyebrow light">Ruang pengetahuan</span>
          <h1>Cerita, kabar, dan gagasan untuk bergerak bersama.</h1>
          <p>Ikuti pembaruan organisasi, praktik baik, dan agenda advokasi.</p>
        </div>
      </section>
      <section className="section-space archive-section">
        <div className="wrap">
          {items.length ? (
            <div className="story-grid archive-grid">
              {items.map((item) => (
                <article className="story-card" key={item.id}>
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="" />
                  ) : (
                    <div className="story-fallback" />
                  )}
                  <div>
                    <span className="card-meta">
                      {item.type} ·{" "}
                      {new Date(
                        item.publishedAt ?? item.updatedAt,
                      ).toLocaleDateString("id-ID")}
                    </span>
                    <h2>{item.title}</h2>
                    {item.excerpt && <p>{item.excerpt}</p>}
                    <Link href={`/stories/${item.slug}`}>
                      Baca selengkapnya <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="archive-empty">
              Belum ada cerita yang dipublikasikan.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
