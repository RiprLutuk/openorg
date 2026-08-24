"use client";

import {
  Award,
  Calendar,
  FileText,
  ImageOff,
  Newspaper,
  Wrench,
} from "lucide-react";
import { useState } from "react";

interface SmartImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackType?: "news" | "event" | "doc" | "tech";
  aspectRatio?: "16/9" | "4/3" | "1/1" | "auto";
}

export function SmartImage({
  src,
  alt,
  className,
  fallbackType = "news",
  aspectRatio = "16/9",
  ...props
}: SmartImageProps) {
  const [hasError, setHasError] = useState(!src);

  if (hasError || !src) {
    return (
      <div
        className={`smart-fallback-container fallback-${fallbackType} ${className ?? ""}`}
        style={{
          aspectRatio: aspectRatio === "auto" ? undefined : aspectRatio,
        }}
      >
        <div className="fallback-content">
          <div className="fallback-icon-pill">
            {fallbackType === "news" && <Newspaper size={24} />}
            {fallbackType === "event" && <Calendar size={24} />}
            {fallbackType === "tech" && <Wrench size={24} />}
            {fallbackType === "doc" && <FileText size={24} />}
          </div>
          <span className="fallback-label">
            {fallbackType === "news" && "Warta & Publikasi Resmi"}
            {fallbackType === "event" && "Agenda & Sertifikasi BNSP"}
            {fallbackType === "tech" && "Dokumentasi Teknis HVAC"}
            {fallbackType === "doc" && "Dokumen & Regulasi"}
          </span>
          <small className="fallback-sub">APTI INDONESIA</small>
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
