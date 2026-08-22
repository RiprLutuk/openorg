"use client";

import type { PublicNavItem, PublicSite } from "@openorg/contracts";
import { ArrowUpRight, ChevronDown, Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { memberApi } from "@/lib/member-client";

export function Header({ site }: { site: PublicSite }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberActive, setMemberActive] = useState(false);
  useEffect(() => {
    memberApi("/v1/member/session")
      .then(() => setMemberActive(true))
      .catch(() => setMemberActive(false));
  }, []);

  const navItems: PublicNavItem[] = site.navigation.length
    ? site.navigation
    : [
        { id: "events", label: "Agenda", href: "/events" },
        { id: "structure", label: "Struktur", href: "/structure" },
        { id: "verify", label: "Verifikasi Kredensial", href: "/verify" },
      ];

  return (
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
        <Link
          className="member-login-link"
          href={memberActive ? "/member" : "/member/login"}
        >
          {memberActive ? "Member portal" : "Member login"}
        </Link>
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
            href={memberActive ? "/member" : "/member/login"}
            onClick={() => setMenuOpen(false)}
          >
            {memberActive ? "Member portal" : "Member login"}
          </Link>
          <Link href="/join" onClick={() => setMenuOpen(false)}>
            Apply for membership <ArrowUpRight size={16} />
          </Link>
        </nav>
      )}
    </header>
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
