"use client";

import { Calendar, FileText, Newspaper, Wrench } from "lucide-react";
import { useState } from "react";

interface SmartImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null | undefined;
  fallbackType?: "news" | "event" | "doc" | "tech";
  aspectRatio?: "16/9" | "4/3" | "1/1" | "auto";
  compact?: boolean;
}

export function SmartImage({
  src,
  alt,
  className,
  fallbackType = "news",
  aspectRatio = "16/9",
  compact,
  ...props
}: SmartImageProps) {
  const [hasError, setHasError] = useState(!src);

  const isCompact =
    compact ??
    (aspectRatio === "1/1" ||
      Boolean(className && /mini-thumb|avatar-sm|icon-box/i.test(className)));

  if (hasError || !src) {
    return (
      <div
        className={`smart-fallback-container fallback-${fallbackType} ${isCompact ? "compact-fallback" : ""} ${className ?? ""}`}
        style={{
          aspectRatio: aspectRatio === "auto" ? undefined : aspectRatio,
        }}
      >
        <div className="fallback-content">
          <div className="fallback-icon-pill">
            {fallbackType === "news" && (
              <Newspaper size={isCompact ? 18 : 24} />
            )}
            {fallbackType === "event" && (
              <Calendar size={isCompact ? 18 : 24} />
            )}
            {fallbackType === "tech" && <Wrench size={isCompact ? 18 : 24} />}
            {fallbackType === "doc" && <FileText size={isCompact ? 18 : 24} />}
          </div>
          {!isCompact && (
            <>
              <span className="fallback-label">
                {fallbackType === "news" && "Warta & Publikasi Resmi"}
                {fallbackType === "event" && "Agenda & Sertifikasi BNSP"}
                {fallbackType === "tech" && "Dokumentasi Teknis HVAC"}
                {fallbackType === "doc" && "Dokumen & Regulasi"}
              </span>
              <small className="fallback-sub">APTI INDONESIA</small>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Dokumentasi Organisasi"}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
}
