"use client";

import type { PublicNavItem, PublicSite } from "@openorg/contracts";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  CalendarDays,
  ChevronDown,
  Compass,
  CreditCard,
  FileText,
  Globe,
  Handshake,
  Landmark,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Network,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useMemberAuth } from "@/lib/use-member-auth";

function getNavIcon(href: string) {
  if (href.includes("structure")) return Network;
  if (href.includes("organization") || href.includes("profile"))
    return Building2;
  if (href.includes("vision")) return Sparkles;
  if (href.includes("ad-art")) return BookOpen;
  if (href.includes("technicians")) return Users;
  if (href.includes("clubs")) return Compass;
  if (href.includes("verify")) return ShieldCheck;
  if (href.includes("partners") || href.includes("lenders")) return Handshake;
  if (href.includes("working-groups")) return Briefcase;
  if (href.includes("surat-edaran") || href.includes("se_organisasi"))
    return FileText;
  if (
    href.includes("regulations") ||
    href.includes("regulasi") ||
    href.includes("policy")
  )
    return Landmark;
  if (href.includes("statistics")) return BarChart3;
  if (href.includes("calculator")) return Calculator;
  if (href.includes("complaints")) return ShieldAlert;
  if (href.includes("events")) return CalendarDays;
  if (href.includes("championships")) return Trophy;
  if (href.includes("join")) return UserPlus;
  if (href.includes("member")) return LogIn;
  return Globe;
}

function InstagramIcon({ size = 16 }: { size?: number }) {
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

function FacebookIcon({ size = 16 }: { size?: number }) {
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

function LinkedinIcon({ size = 16 }: { size?: number }) {
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
  return (
    <Suspense
      fallback={
        <header className="site-header">
          <div className="wrap header-inner">
            <Link className="site-brand" href="/">
              <strong>{site.organization.name}</strong>
            </Link>
          </div>
        </header>
      }
    >
      <HeaderContent site={site} />
    </Suspense>
  );
}

function HeaderContent({ site }: { site: PublicSite }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, member } = useMemberAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isChildActive = (childHref: string) => {
    if (childHref.includes("?")) {
      const [childPath, childQuery] = childHref.split("?");
      if (pathname !== childPath && !pathname.startsWith(`${childPath}/`))
        return false;
      const targetParams = new URLSearchParams(childQuery);
      const targetCat = targetParams.get("kategori");
      const currentCat =
        searchParams.get("kategori") ||
        searchParams.get("cat") ||
        searchParams.get("category");
      if (targetCat) {
        return currentCat === targetCat;
      }
      for (const [key, val] of targetParams.entries()) {
        if (searchParams.get(key) !== val) return false;
      }
      return true;
    }

    if (childHref === "/regulations") {
      if (pathname !== "/regulations") return false;
      const cat =
        searchParams.get("kategori") ||
        searchParams.get("cat") ||
        searchParams.get("category");
      return !cat || cat === "semua" || cat === "all";
    }

    if (
      childHref !== "/" &&
      (pathname === childHref || pathname.startsWith(`${childHref}/`))
    ) {
      return true;
    }

    return pathname === childHref;
  };

  const isItemActive = (href: string, children?: Array<{ href: string }>) => {
    if (pathname === href) return true;
    if (href !== "/" && (pathname === href || pathname.startsWith(`${href}/`)))
      return true;
    if (children?.some((c) => isChildActive(c.href))) return true;
    return false;
  };

  const defaultNavItems: PublicNavItem[] = [
    { id: "home", label: "Beranda", href: "/" },
    {
      id: "profile",
      label: "Profil",
      href: "/organization-profile",
      children: [
        {
          id: "org-profile",
          label: "Profil & Sejarah",
          href: "/organization-profile",
        },
        { id: "vision-mission", label: "Visi & Misi", href: "/vision-mission" },
        {
          id: "structure",
          label: "Struktur Pengurus (DPP/DPD)",
          href: "/structure",
        },
        {
          id: "ad-art",
          label: "AD/ART & Kode Etik",
          href: "/ad-art",
        },
      ],
    },
    {
      id: "membership",
      label: "Keanggotaan",
      href: "/join",
      children: [
        {
          id: "join-terms",
          label: "Syarat & Pendaftaran Anggota",
          href: "/join",
        },
        {
          id: "tech-locator",
          label: "Cari Teknisi AC Terverifikasi",
          href: "/technicians",
        },
        {
          id: "clubs-directory",
          label: "Direktori Komunitas & Klub (TKT)",
          href: "/clubs",
        },
        {
          id: "verify-kta",
          label: "Verifikasi KTA & Kredensial",
          href: "/verify",
        },
        {
          id: "lender-verifier",
          label: "Direktori Mitra & Distributor Resmi",
          href: "/partners",
        },
        ...(isLoggedIn
          ? [
              {
                id: "member-portal",
                label: "Portal & KTA Saya",
                href: "/member",
              },
            ]
          : [
              {
                id: "member-portal",
                label: "Login Portal Anggota",
                href: "/member/login",
              },
            ]),
      ],
    },
    {
      id: "services",
      label: "Layanan & Data",
      href: "/regulations",
      children: [
        {
          id: "working-groups",
          label: "Kelompok Kerja (Pokja) Advokasi",
          href: "/working-groups",
        },
        {
          id: "regulations-list",
          label: "Regulasi Pemerintah & Standar SNI",
          href: "/regulations?kategori=regulasi-pemerintah",
        },
        {
          id: "se-list",
          label: "Surat Edaran Resmi (SE)",
          href: "/regulations?kategori=surat-edaran",
        },
        {
          id: "industry-stats",
          label: "Statistik Industri Sektor",
          href: "/statistics",
        },
        {
          id: "calculator",
          label: "Kalkulator PK AC & Data Freon",
          href: "/calculator",
        },
        {
          id: "public-complaints",
          label: "Pengaduan Etik JENDELA",
          href: "/complaints",
        },
        {
          id: "events-list",
          label: "Agenda Workshop & Sertifikasi",
          href: "/events",
        },
        {
          id: "championships",
          label: "Kejuaraan & Skill Contest",
          href: "/championships",
        },
      ],
    },
    { id: "stories", label: "Berita", href: "/stories" },
  ];

  const hasChildren = (items: PublicNavItem[]) =>
    items.some((item) => item.children && item.children.length > 0);

  const normalizeNavItems = (items: PublicNavItem[]): PublicNavItem[] => {
    return items.map((item) => {
      let href = item.href;
      let label = item.label;

      if (item.id === "ad-art" || label.toLowerCase().includes("ad/art")) {
        href = "/ad-art";
      } else if (
        item.id === "regulations-list" ||
        (label.toLowerCase().includes("regulasi") &&
          (href === "/regulations" || href.includes("regulasi_pemerintah")))
      ) {
        href = "/regulations?kategori=regulasi-pemerintah";
        label = "Regulasi Pemerintah & Standar SNI";
      } else if (
        item.id === "se-list" ||
        (label.toLowerCase().includes("surat edaran") &&
          (href === "/regulations" || href.includes("se_organisasi")))
      ) {
        href = "/regulations?kategori=surat-edaran";
      } else if (
        item.id === "policy-papers" ||
        (label.toLowerCase().includes("naskah") &&
          (href === "/regulations" || href.includes("posisi_kebijakan")))
      ) {
        href = "/regulations?kategori=naskah-kebijakan";
      } else if (item.id === "services" && href === "/regulations") {
        href = "/working-groups";
      }

      const children = item.children
        ? item.children.map((child, idx) => {
            let childHref = child.href;
            let childLabel = child.label;
            const childId = child.id || `${item.id}-child-${idx}`;

            if (
              childId === "ad-art" ||
              childLabel.toLowerCase().includes("ad/art")
            ) {
              childHref = "/ad-art";
            } else if (
              childId === "regulations-list" ||
              (childLabel.toLowerCase().includes("regulasi") &&
                (childHref === "/regulations" ||
                  childHref.includes("regulasi_pemerintah")))
            ) {
              childHref = "/regulations?kategori=regulasi-pemerintah";
              childLabel = "Regulasi Pemerintah & Standar SNI";
            } else if (
              childId === "se-list" ||
              (childLabel.toLowerCase().includes("surat edaran") &&
                (childHref === "/regulations" ||
                  childHref.includes("se_organisasi")))
            ) {
              childHref = "/regulations?kategori=surat-edaran";
            } else if (
              childId === "policy-papers" ||
              (childLabel.toLowerCase().includes("naskah") &&
                (childHref === "/regulations" ||
                  childHref.includes("posisi_kebijakan")))
            ) {
              childHref = "/regulations?kategori=naskah-kebijakan";
            } else if (
              childId === "join-terms" ||
              childLabel.toLowerCase().includes("syarat") ||
              childLabel.toLowerCase().includes("pendaftaran") ||
              childHref === "/join"
            ) {
              childHref = "/join";
              childLabel = "Syarat & Pendaftaran Anggota";
            } else if (
              childId === "lender-verifier" ||
              childLabel.toLowerCase().includes("mitra") ||
              childLabel.toLowerCase().includes("distributor") ||
              childLabel.toLowerCase().includes("fintech") ||
              childHref === "/lenders" ||
              childHref === "/partners"
            ) {
              childHref = "/partners";
              childLabel = "Direktori Mitra & Distributor Resmi";
            } else if (
              childId === "whois-lookup" ||
              childId === "calculator" ||
              childLabel.toLowerCase().includes("whois") ||
              childLabel.toLowerCase().includes("kalkulator") ||
              childHref === "/whois" ||
              childHref === "/calculator"
            ) {
              childHref = "/calculator";
              childLabel = "Kalkulator PK AC & Data Freon";
            }

            return {
              id: childId,
              label: childLabel,
              href: childHref,
            };
          })
        : [];

      return {
        ...item,
        label,
        href,
        children,
      };
    });
  };

  const rawNav: PublicNavItem[] =
    site.navigation.length && hasChildren(site.navigation)
      ? site.navigation
      : defaultNavItems;

  const navItems: PublicNavItem[] = normalizeNavItems(rawNav);

  return (
    <>
      {/* Enterprise Top Utility Bar */}
      <div className="site-top-bar">
        <div className="wrap top-bar-inner">
          <div className="top-bar-left">
            <span className="top-bar-badge">
              <span>Sistem Registri Terpadu v2.4</span>
            </span>
          </div>

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
              title="Instagram"
            >
              <InstagramIcon size={13} />
            </a>
            <a
              className="top-bar-icon-link"
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <FacebookIcon size={13} />
            </a>
            <a
              className="top-bar-icon-link"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <LinkedinIcon size={13} />
            </a>

            <div className="top-bar-divider" />

            {/* Member Login / Portal Badge */}
            <Link
              className="top-bar-link highlight"
              href={isLoggedIn ? "/member" : "/member/login"}
            >
              {isLoggedIn ? <UserCheck size={13} /> : <User size={13} />}
              <span>
                {isLoggedIn
                  ? `Portal Anggota (${member?.name ? member.name.split(" ")[0] : "Saya"})`
                  : "Member Login"}
              </span>
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
                  <button
                    type="button"
                    className={`nav-dropdown-trigger ${
                      isItemActive(item.href, item.children) ? "active" : ""
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown size={13} className="chevron-icon" />
                  </button>
                  <div
                    className={`nav-dropdown-popover ${
                      item.children.length > 4 ? "two-column-grid" : ""
                    }`}
                  >
                    <div className="nav-dropdown-items-wrap">
                      {item.children.map((child) => {
                        const IconComponent = getNavIcon(child.href);
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={`nav-dropdown-card-item ${
                              isChildActive(child.href) ? "active" : ""
                            }`}
                          >
                            <div className="nav-item-icon-box">
                              <IconComponent size={14} />
                            </div>
                            <div className="nav-item-text-box">
                              <span className="nav-item-title">
                                {child.label}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className={isItemActive(item.href) ? "active" : ""}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {isLoggedIn ? (
            <Link className="header-action" href="/member">
              <CreditCard size={15} />
              <span>Portal & KTA Saya</span>
            </Link>
          ) : (
            <Link className="header-action" href="/join">
              <span>Daftar Anggota</span>
              <ArrowUpRight size={15} />
            </Link>
          )}

          <button
            type="button"
            className="menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-navigation" aria-label="Mobile navigation">
            {navItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id} className="mobile-dropdown-group">
                  <div className="mobile-dropdown-title">{item.label}</div>
                  <div className="mobile-dropdown-children">
                    {item.children.map((child) => {
                      const IconComponent = getNavIcon(child.href);
                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={() => setMenuOpen(false)}
                          className={`mobile-nav-child-link ${
                            isChildActive(child.href) ? "active" : ""
                          }`}
                        >
                          <IconComponent size={14} />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={isItemActive(item.href) ? "active" : ""}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="mobile-nav-auth-row">
              {isLoggedIn ? (
                <Link
                  className="mobile-nav-member-btn"
                  style={{ width: "100%", justifyContent: "center" }}
                  href="/member"
                  onClick={() => setMenuOpen(false)}
                >
                  <CreditCard size={15} />
                  <span>Buka Portal & KTA Saya</span>
                </Link>
              ) : (
                <>
                  <Link
                    className="mobile-nav-join-btn"
                    href="/join"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserPlus size={15} />
                    <span>Daftar</span>
                  </Link>
                  <Link
                    className="mobile-nav-member-btn"
                    href="/member/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={15} />
                    <span>Masuk</span>
                  </Link>
                </>
              )}
            </div>
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
  const { isLoggedIn } = useMemberAuth();
  const footer = site.footer as {
    description?: string;
    copyright?: string;
    links?: Array<{ label: string; href: string }>;
  };

  return (
    <>
      {site.quickContact && (
        <a
          className="floating-quick-contact"
          href={site.quickContact.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Hubungi ${site.quickContact.label}`}
          aria-label={`Hubungi ${site.quickContact.label}`}
        >
          <div className="quick-contact-icon-pill">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.13c-.24.67-1.39 1.28-1.92 1.36-.51.08-1.16.11-3.69-.93-2.9-1.2-4.78-4.14-4.93-4.33-.14-.2-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.19.01.44-.07.69.52.26.62.88 2.14.96 2.3.08.16.13.35.03.56-.11.2-.16.33-.32.52-.16.19-.34.42-.49.56-.16.16-.33.34-.14.66.19.33.86 1.42 1.84 2.3 1.27 1.13 2.34 1.48 2.67 1.65.33.16.52.14.71-.08.2-.22.84-.98 1.07-1.32.22-.33.45-.28.76-.16.31.11 1.97.93 2.31 1.1.34.16.57.24.65.38.08.14.08.82-.16 1.49z" />
            </svg>
            <span className="online-beacon-dot" />
          </div>
          <div className="quick-contact-text">
            <small>
              <span className="beacon-text-dot" /> Hotline Resmi
            </small>
            <span>{site.quickContact.label}</span>
          </div>
        </a>
      )}

      <footer className="site-footer">
        <div className="wrap footer-main-grid">
          {/* Brand Info & Address */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              {site.organization.logoUrl ? (
                <img
                  src={site.organization.logoUrl}
                  alt={site.organization.name}
                  className="footer-logo"
                />
              ) : (
                <span className="footer-logo-fallback">
                  {site.organization.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div>
                <strong>{site.organization.name}</strong>
                <small>Akreditasi & Sertifikasi Terpadu</small>
              </div>
            </div>
            <p className="footer-desc">
              {footer.description ??
                `${site.organization.name} adalah asosiasi resmi yang menaungi praktisi, pelaku usaha, dan profesional terakreditasi.`}
            </p>
            <p className="footer-address">
              <MapPin size={14} className="address-icon" />
              <span>
                Gedung Sekretariat Pusat, Kawasan Bisnis Terpadu, Jakarta 10220
              </span>
            </p>
            <div className="footer-socials">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
              >
                <FacebookIcon size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                <LinkedinIcon size={14} />
              </a>
            </div>
          </div>

          {/* Nav Column 1: Organisasi */}
          <div className="footer-nav-col">
            <h3>Organisasi</h3>
            <Link href="/structure">Struktur DPP & DPD</Link>
            <Link href="/ad-art">AD/ART & Kode Etik</Link>
            {!isLoggedIn && <Link href="/join">Pendaftaran Anggota</Link>}
            <Link href="/stories">Warta & Kabar Terkini</Link>
            <Link href="/events">Agenda & Pelatihan</Link>
          </div>

          {/* Nav Column 2: Layanan & Direktori */}
          <div className="footer-nav-col">
            <h3>Layanan & Direktori</h3>
            <Link href="/technicians">Cari Teknisi AC KTA</Link>
            <Link href="/partners">Mitra & Distributor Resmi</Link>
            <Link href="/clubs">Direktori Klub & TKT</Link>
            <Link href="/verify">Verifikasi KTA Digital</Link>
            <Link href={isLoggedIn ? "/member" : "/member/login"}>
              {isLoggedIn ? "Portal Anggota (KTA)" : "Portal Login Anggota"}
            </Link>
          </div>

          {/* Nav Column 3: Advokasi & Data */}
          <div className="footer-nav-col">
            <h3>Advokasi & Data</h3>
            <Link href="/working-groups">Pokja Advokasi Tematik</Link>
            <Link href="/regulations?kategori=regulasi-pemerintah">
              Regulasi & Standar Industri
            </Link>
            <Link href="/regulations?kategori=surat-edaran">
              Surat Edaran Organisasi
            </Link>
            <Link href="/statistics">Statistik Industri Sektor</Link>
            <Link href="/calculator">Kalkulator PK & Tekanan Freon</Link>
            <Link href="/championships">Skill Contest & Kejuaraan</Link>
            <Link href="/complaints">Posko Pengaduan JENDELA</Link>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="wrap footer-bottom">
          <p>
            {footer.copyright ??
              `© ${new Date().getFullYear()} ${site.organization.name}. Hak Cipta Dilindungi Undang-Undang.`}
          </p>
          <div className="footer-bottom-badge">
            <ShieldCheck size={14} />
            <span>Standardized Member & Credential Registry · OpenOrg</span>
          </div>
        </div>
      </footer>
    </>
  );
}
