"use client";

import type { PublicAnnouncement } from "@openorg/contracts";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";

export function CampaignAnnouncement({
  organizationId,
  announcement,
}: {
  organizationId: string;
  announcement: PublicAnnouncement | null;
}) {
  const [open, setOpen] = useState(false);
  const storageKey = announcement
    ? `openorg-announcement:${organizationId}:${announcement.title}`
    : "";

  useEffect(() => {
    if (!announcement || localStorage.getItem(storageKey) === "dismissed")
      return;
    setOpen(true);
  }, [announcement, storageKey]);

  if (!announcement || !open) return null;

  const close = () => {
    localStorage.setItem(storageKey, "dismissed");
    setOpen(false);
  };

  return (
    <div className="announcement-backdrop" role="presentation">
      <section
        className={`announcement-card${announcement.imageUrl ? " has-image" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
      >
        {announcement.imageUrl && (
          <div className="announcement-image">
            <img src={announcement.imageUrl} alt="" />
          </div>
        )}
        <div className="announcement-copy">
          <button
            type="button"
            className="announcement-close"
            onClick={close}
            aria-label="Close announcement"
          >
            <X size={19} />
          </button>
          <span className="eyebrow">{announcement.eyebrow}</span>
          <h2 id="announcement-title">{announcement.title}</h2>
          <p>{announcement.message}</p>
          <a className="announcement-action" href={announcement.actionUrl}>
            {announcement.actionLabel} <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    </div>
  );
}
