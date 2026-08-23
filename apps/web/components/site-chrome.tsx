"use client";

import type { PublicNavItem, PublicSite } from "@openorg/contracts";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  Compass,
  CreditCard,
  FileText,
  Globe,
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
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMemberAuth } from "@/lib/use-member-auth";

function getNavIcon(href: string) {
  if (href.includes("structure")) return Network;
  if (href.includes("organization") || href.includes("profile"))
    return Building2;
  if (href.includes("vision")) return Sparkles;
  if (href.includes("regulation") || href.includes("ad-art")) return FileText;
  if (href.includes("technician")) return Users;
  if (href.includes("lender")) return Landmark;
  if (href.includes("club")) return Compass;
  if (href.includes("verify")) return ShieldCheck;
  if (href.includes("join")) return UserPlus;
  if (href.includes("member")) return LogIn;
  if (href.includes("working-groups") || href.includes("pokja"))
    return Briefcase;
  if (href.includes("stat")) return BarChart3;
  if (href.includes("whois")) return Globe;
  if (href.includes("complaint")) return ShieldAlert;
  if (href.includes("event")) return CalendarDays;
  if (href.includes("champion") || href.includes("contest")) return Trophy;
  if (href.includes("storie") || href.includes("berita")) return BookOpen;
  return ArrowRight;
}

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
      aria-label="Instagram"
    >
      <title>Instagram</title>
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
      aria-label="Facebook"
    >
      <title>Facebook</title>
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
      aria-label="LinkedIn"
    >
      <title>LinkedIn</title>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Header({ site }: { site: PublicSite }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, member } = useMemberAuth();
  const pathname = usePathname();

  const isItemActive = (href: string, children?: Array<{ href: string }>) => {
    if (pathname === href) return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    if (
      children?.some(
        (c) =>
          pathname === c.href ||
          (c.href !== "/" && pathname.startsWith(c.href)),
      )
    )
      return true;
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
          label: "Cek Platform Fintech Berizin",
          href: "/lenders",
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
          id: "whois-lookup",
          label: "Lookup WHOIS IP/ASN & IIX",
          href: "/whois",
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
        href = "/regulations";
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
              childHref = "/regulations";
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
                              pathname === child.href ? "active" : ""
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
                          className="mobile-nav-child-link"
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
        >
          <Phone size={18} />
          <div className="quick-contact-text">
            <small>Hotline Resmi</small>
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
            <Link href="/lenders">Cek Fintech Berizin OJK</Link>
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
            <Link href="/whois">Lookup WHOIS & IIX</Link>
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
