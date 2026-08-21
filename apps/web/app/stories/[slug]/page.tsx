import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContent(slug).catch(() => null);
  if (!item) return {};
  return {
    title: String(item.seo.title ?? item.title),
    description: String(item.seo.description ?? item.excerpt ?? ""),
    robots: item.seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph:
      item.seo.image || item.coverUrl
        ? { images: [String(item.seo.image ?? item.coverUrl)] }
        : undefined,
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContent(slug).catch(() => null);
  if (!item) notFound();
  return (
    <article>
      <header className="detail-hero">
        <div className="wrap detail-wrap">
          <Link className="back-link" href="/stories">
            <ArrowLeft size={16} /> Semua cerita
          </Link>
          <span className="eyebrow light">{item.type}</span>
          <h1>{item.title}</h1>
          {item.excerpt && <p>{item.excerpt}</p>}
          <div className="detail-meta">
            <span>
              {new Date(item.publishedAt ?? item.updatedAt).toLocaleDateString(
                "id-ID",
                { dateStyle: "long" },
              )}
            </span>
            {item.authorName && <span>Oleh {item.authorName}</span>}
          </div>
        </div>
      </header>
      {item.coverUrl && (
        <div className="wrap detail-cover">
          <img src={item.coverUrl} alt="" />
        </div>
      )}
      <div className="wrap detail-body">
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: item.body }}
        />
        {item.sourceUrl && (
          <a
            className="source-link"
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Lihat sumber <ExternalLink size={15} />
          </a>
        )}
      </div>
    </article>
  );
}
