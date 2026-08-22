"use client";

import type { PublicNavItem, PublicSite } from "@openorg/contracts";
import {
  ArrowUpRight,
  ChevronDown,
  HelpCircle,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { memberApi } from "@/lib/member-client";

function InstagramIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Header({ site }: { site: PublicSite }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberActive, setMemberActive] = useState(false);

  useEffect(() => {
    memberApi("/v1/member/session")
      .then(() => setMemberActive(true))
      .catch(() => setMemberActive(false));
  }, []);

  const defaultNavItems: PublicNavItem[] = [
    {
      id: "profile",
      label: "Profil",
      href: "/organization-profile",
      children: [
        { id: "org-profile", label: "Profil Organisasi", href: "/organization-profile" },
        { id: "vision-mission", label: "Visi & Misi", href: "/vision-mission" },
        { id: "structure", label: "Struktur Pengurus (DPP/DPD)", href: "/structure" },
        { id: "ad-art", label: "AD/ART & Kode Etik", href: "/regulations" },
      ],
    },
    {
      id: "membership",
      label: "Keanggotaan & Direktori",
      href: "/join",
      children: [
        { id: "tech-locator", label: "Cari Teknisi Terverifikasi", href: "/technicians" },
        { id: "clubs-directory", label: "Direktori Klub & TKT", href: "/clubs" },
        { id: "lender-verifier", label: "Cek Platform Fintech Berizin", href: "/lenders" },
        { id: "join-terms", label: "Syarat & Pendaftaran", href: "/join" },
        { id: "verify-kta", label: "Verifikasi KTA & Kredensial", href: "/verify" },
        { id: "member-portal", label: "Portal Anggota", href: "/member/login" },
      ],
    },
    {
      id: "academy",
      label: "Akademi & SKP",
      href: "/events",
      children: [
        { id: "events-list", label: "Agenda & Pelatihan", href: "/events" },
        { id: "bnsp-cert", label: "Sertifikasi Profesi BNSP", href: "/events" },
      ],
    },
    {
      id: "advocacy",
      label: "Advokasi & Layanan",
      href: "/regulations",
      children: [
        { id: "working-groups", label: "Kelompok Kerja (Pokja) Advokasi", href: "/working-groups" },
        { id: "regulations-list", label: "Regulasi & Policy Papers", href: "/regulations" },
        { id: "industry-stats", label: "Statistik Industri", href: "/statistics" },
        { id: "whois-lookup", label: "Lookup WHOIS & Traffic IIX", href: "/whois" },
        { id: "public-complaints", label: "Layanan Pengaduan Etik", href: "/complaints" },
      ],
    },
    { id: "championships", label: "Kejuaraan", href: "/championships" },
    { id: "stories", label: "Berita & Publikasi", href: "/stories" },
  ];

  const navItems: PublicNavItem[] = site.navigation.length
    ? site.navigation
    : defaultNavItems;

  return (
    <>
      {/* Enterprise Top Utility Bar */}
      <div className="site-top-bar">
        <div className="wrap top-bar-inner">
          <div className="top-bar-right">
            {/* Email Contact Shortcut */}
            <a
              className="top-bar-link"
              href="mailto:sekretariat@apti.or.id"
              title="Email Sekretariat"
            >
              <Mail size={13} />
              <span>sekretariat@apti.or.id</span>
            </a>

            {/* Quick Contact / Hotline Shortcut */}
            {site.quickContact && (
              <a
                className="top-bar-link"
                href={site.quickContact.href}
                target="_blank"
                rel="noopener noreferrer"
                title={site.quickContact.label}
              >
                <Phone size={13} />
                <span>{site.quickContact.label}</span>
              </a>
            )}

            <div className="top-bar-divider" />

            {/* Social Media Shortcuts */}
            <a
              className="top-bar-icon-link"
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram APTI"
            >
              <InstagramIcon size={13} />
            </a>
            <a
              className="top-bar-icon-link"
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook APTI"
            >
              <FacebookIcon size={13} />
            </a>
            <a
              className="top-bar-icon-link"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn APTI"
            >
              <LinkedinIcon size={13} />
            </a>

            <div className="top-bar-divider" />

            {/* Member Login / Portal Badge */}
            <Link
              className="top-bar-link highlight"
              href={memberActive ? "/member" : "/member/login"}
            >
              <User size={13} />
              <span>{memberActive ? "Portal Anggota" : "Member login"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <header className="site-header">
        <div className="wrap header-inner">
          <Link className="site-brand" href="/">
            {site.organization.logoUrl ? (
              <img src={site.organization.logoUrl} alt="" />
            ) : (
              <span>{site.organization.name.slice(0, 2).toUpperCase()}</span>
            )}
            <strong>{site.organization.name}</strong>
          </Link>
          <nav aria-label="Primary navigation">
            {navItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id} className="nav-item-dropdown">
                  <button type="button" className="nav-dropdown-trigger">
                    {item.label} <ChevronDown size={14} />
                  </button>
                  <div className="nav-dropdown-popover">
                    {item.children.map((child) => (
                      <Link key={child.id} href={child.href}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.id} href={item.href}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <Link className="header-action" href="/join">
            Join us <ArrowUpRight size={15} />
          </Link>
          <button
            type="button"
            className="menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-navigation" aria-label="Mobile navigation">
            {navItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id} className="mobile-dropdown-group">
                  <div className="mobile-dropdown-title">{item.label}</div>
                  <div className="mobile-dropdown-children">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        onClick={() => setMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              className="mobile-nav-member-link"
              href={memberActive ? "/member" : "/member/login"}
              onClick={() => setMenuOpen(false)}
            >
              <User size={15} />
              <span>{memberActive ? "Portal Anggota" : "Member login"}</span>
            </Link>
            <Link
              className="mobile-nav-join-link"
              href="/join"
              onClick={() => setMenuOpen(false)}
            >
              <span>Daftar Anggota</span>
              <ArrowUpRight size={16} />
            </Link>
            <a
              className="mobile-nav-contact-link"
              href="mailto:sekretariat@apti.or.id"
              onClick={() => setMenuOpen(false)}
            >
              <Mail size={14} />
              <span>sekretariat@apti.or.id</span>
            </a>
          </nav>
        )}
      </header>
    </>
  );
}

export function Footer({ site }: { site: PublicSite }) {
  const footer = site.footer as {
    description?: string;
    copyright?: string;
    links?: Array<{ label: string; href: string }>;
  };
  return (
    <>
      {site.quickContact && (
        <a
          className="quick-contact"
          href={site.quickContact.href}
          aria-label={site.quickContact.label}
          title={site.quickContact.label}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={22} />
        </a>
      )}
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <div className="site-brand inverse">
              {site.organization.logoUrl ? (
                <img src={site.organization.logoUrl} alt="" />
              ) : (
                <span>{site.organization.name.slice(0, 2).toUpperCase()}</span>
              )}
              <strong>{site.organization.name}</strong>
            </div>
            <p>{footer.description ?? site.organization.description}</p>
          </div>
          <div>
            <h2>Explore</h2>
            {site.navigation.slice(0, 5).map((item) => (
              <Link key={item.id} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <h2>Connect</h2>
            {footer.links?.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>
            {footer.copyright ??
              `© ${new Date().getFullYear()} ${site.organization.name}.`}
          </span>
          <span>Powered by OpenOrg · Open source for everyone</span>
        </div>
      </footer>
    </>
  );
}
