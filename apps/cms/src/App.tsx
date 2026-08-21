import type { PageSection, Theme } from "@openorg/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  Globe2,
  ImagePlus,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Newspaper,
  Palette,
  Plus,
  Save,
  CheckCircle2,
  Copy,
  CreditCard,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import {
  ApiError,
  api,
  type CmsContent,
  type CmsCredentialField,
  type CmsCredentialRequirement,
  type CmsCredentialScheme,
  type CmsEvent,
  type CmsGovernanceData,
  type CmsLearningActivity,
  type CmsLearningData,
  type CmsMedia,
  type CmsMember,
  type CmsMemberCredential,
  type CmsMembershipApplication,
  type CmsOrganization,
  type CmsPage,
  type CmsPublicSettings,
  type CmsRevenueData,
  type CmsSubmission,
  type CmsUnit,
  type DashboardData,
  type Session,
} from "./api";

type Screen =
  | "dashboard"
  | "pages"
  | "content"
  | "events"
  | "members"
  | "applications"
  | "credentials"
  | "governance"
  | "learning"
  | "revenue"
  | "inbox"
  | "appearance"
  | "settings";

const PUBLIC_SITE_URL = import.meta.env.VITE_WEB_URL ?? "http://localhost:3000";

const menu: Array<{
  title: string;
  items: Array<{ id: Screen; label: string; icon: typeof LayoutDashboard }>;
}> = [
  {
    title: "Workspace",
    items: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "pages", label: "Pages", icon: FileText },
      { id: "content", label: "Stories & news", icon: Newspaper },
      { id: "events", label: "Events", icon: CalendarDays },
    ],
  },
  {
    title: "Community",
    items: [
      { id: "applications", label: "Applications", icon: BadgeCheck },
      { id: "members", label: "Members", icon: Users },
      { id: "credentials", label: "Credentials", icon: ShieldCheck },
      { id: "governance", label: "Governance", icon: Network },
      { id: "learning", label: "Academy & credits", icon: BookOpen },
      { id: "revenue", label: "Revenue & engagement", icon: WalletCards },
      { id: "inbox", label: "Inbox", icon: Inbox },
    ],
  },
  {
    title: "Configuration",
    items: [
      { id: "appearance", label: "Brand & theme", icon: Palette },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

function useHashScreen() {
  const get = () =>
    (window.location.hash.replace("#", "") || "dashboard") as Screen;
  const [screen, setScreen] = useState<Screen>(get);
  useEffect(() => {
    const handler = () => setScreen(get());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return [
    screen,
    (next: Screen) => {
      window.location.hash = next;
    },
  ] as const;
}

export function App() {
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ data: Session }>("/v1/auth/session"),
    retry: false,
  });
  if (session.isLoading) return <Splash />;
  if (session.error instanceof ApiError && session.error.status === 401)
    return <Login />;
  if (session.isError) return <FatalError message={session.error.message} />;
  if (!session.data)
    return <FatalError message="The session response was empty." />;
  return <Studio session={session.data.data} />;
}

function Splash() {
  return (
    <div className="splash">
      <div className="brand-mark">
        <Sparkles size={24} />
      </div>
      <p>Opening your workspace…</p>
    </div>
  );
}

function FatalError({ message }: { message: string }) {
  return (
    <div className="splash">
      <div className="error-icon">!</div>
      <h1>Could not open OpenOrg</h1>
      <p>{message}</p>
      <button
        type="button"
        className="button primary"
        onClick={() => location.reload()}
      >
        Try again
      </button>
    </div>
  );
}

function Login() {
  const client = useQueryClient();
  const [error, setError] = useState("");
  const login = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api("/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["session"] }),
    onError: (reason) => setError(reason.message),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    login.mutate({
      email: String(data.get("email")),
      password: String(data.get("password")),
    });
  };
  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={22} />
          </span>
          <span>OpenOrg</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow light">One platform, every purpose</span>
          <h1>Your organization deserves a digital home that grows with it.</h1>
          <p>
            Publish stories, welcome members, run events, and shape every
            page—without touching code.
          </p>
        </div>
        <div className="trust-row">
          <ShieldCheck size={18} />
          <span>Private by design · Open source · Your data</span>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <div className="mobile-brand brand">
            <span className="brand-mark">
              <Sparkles size={22} />
            </span>
            <span>OpenOrg</span>
          </div>
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to Studio</h2>
          <p>Manage your website and community from one calm workspace.</p>
          {error && <div className="alert error">{error}</div>}
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="admin@organization.org"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              required
              minLength={8}
            />
          </label>
          <button
            type="submit"
            className="button primary large"
            disabled={login.isPending}
          >
            {login.isPending ? (
              "Signing in…"
            ) : (
              <>
                Sign in <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="login-help">
            <CircleHelp size={16} /> Contact your organization owner if you need
            access.
          </p>
        </form>
      </section>
    </main>
  );
}

function Studio({ session }: { session: Session }) {
  const [screen, navigate] = useHashScreen();
  const [mobileNav, setMobileNav] = useState(false);
  const client = useQueryClient();
  const logout = useMutation({
    mutationFn: () => api("/v1/auth/logout", { method: "POST" }),
    onSuccess: () => client.setQueryData(["session"], null),
  });
  const label =
    menu.flatMap((group) => group.items).find((item) => item.id === screen)
      ?.label ?? "Overview";
  return (
    <div className="studio">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="sidebar-head">
          <div className="brand">
            <span className="brand-mark">
              <Sparkles size={20} />
            </span>
            <span>OpenOrg</span>
          </div>
          <button
            type="button"
            className="icon-button mobile-only"
            onClick={() => setMobileNav(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="organization-switch">
          <span className="org-avatar">
            {session.organization.name.slice(0, 2).toUpperCase()}
          </span>
          <span>
            <strong>{session.organization.name}</strong>
            <small>Primary workspace</small>
          </span>
          <ChevronDown size={16} />
        </div>
        <nav>
          {menu.map((group) => (
            <div className="menu-group" key={group.title}>
              <p>{group.title}</p>
              {group.items.map((item) => (
                <button
                  type="button"
                  className={screen === item.id ? "active" : ""}
                  key={item.id}
                  onClick={() => {
                    navigate(item.id);
                    setMobileNav(false);
                  }}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.id === "inbox" && <InboxCount />}
                  {item.id === "applications" && <ApplicationCount />}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <a href={PUBLIC_SITE_URL} target="_blank" rel="noreferrer">
            <Globe2 size={18} />
            <span>View public site</span>
          </a>
          <button type="button" onClick={() => logout.mutate()}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          type="button"
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <section className="workspace">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              className="icon-button mobile-only"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <div>
              <span>Studio</span>
              <strong>{label}</strong>
            </div>
          </div>

          <div className="topbar-search-command">
            <Search size={15} style={{ color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Cari fitur, anggota, atau pengaturan... (⌘K)"
              onClick={() => navigate("members")}
              readOnly
            />
            <kbd className="cmd-kbd">⌘K</kbd>
          </div>

          <div className="topbar-actions">
            <span className="api-status-pill">
              <span className="status-dot-animated" />
              <span>API Live</span>
            </span>
            <div className="user-profile-pill">
              <span className="user-avatar">
                {session.user.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="user-copy">
                <strong>{session.user.name}</strong>
                <small>{session.user.email}</small>
              </span>
            </div>
          </div>
        </header>
        <main className="content-area">
          {screen === "dashboard" && (
            <Dashboard session={session} navigate={navigate} />
          )}
          {screen === "pages" && <Pages />}
          {screen === "content" && <ContentManager />}
          {screen === "events" && <EventsManager />}
          {screen === "members" && <MembersManager />}
          {screen === "applications" && <ApplicationsManager />}
          {screen === "credentials" && <CredentialsManager />}
          {screen === "governance" && <GovernanceManager />}
          {screen === "learning" && <AcademyManager />}
          {screen === "revenue" && <RevenueManager />}
          {screen === "inbox" && <InboxManager />}
          {screen === "appearance" && <Appearance />}
          {screen === "settings" && <SettingsManager />}
        </main>
      </section>
    </div>
  );
}

function Dashboard({
  session,
  navigate,
}: {
  session: Session;
  navigate: (screen: Screen) => void;
}) {
  const [quickKtaCode, setQuickKtaCode] = useState("");
  const [ktaResult, setKtaResult] = useState<any>(null);
  const [ktaLoading, setKtaLoading] = useState(false);

  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<{ data: DashboardData }>("/v1/admin/dashboard"),
  });

  const handleQuickKtaCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickKtaCode.trim()) return;
    setKtaLoading(true);
    setKtaResult(null);
    try {
      const res = await api<{ data: any }>(`/v1/public/membership/cards/${encodeURIComponent(quickKtaCode.trim())}`);
      setKtaResult(res.data);
      toast.success("Data KTA/Anggota ditemukan");
    } catch (err: any) {
      toast.error(err.message || "KTA/Anggota tidak ditemukan");
    } finally {
      setKtaLoading(false);
    }
  };

  if (query.isLoading) return <PageLoading />;
  const data = query.data?.data;
  const stats = [
    {
      label: "Anggota Aktif",
      value: data?.counts.members ?? 0,
      trend: "+12.4%",
      icon: Users,
      screen: "members" as Screen,
      color: "#0F172A",
      bgColor: "#F1F5F9",
    },
    {
      label: "Agenda & Pelatihan",
      value: data?.counts.events ?? 0,
      trend: "+8.1%",
      icon: CalendarDays,
      screen: "events" as Screen,
      color: "#0F172A",
      bgColor: "#F1F5F9",
    },
    {
      label: "Berita & Pengumuman",
      value: data?.counts.contents ?? 0,
      trend: "+24.0%",
      icon: Newspaper,
      screen: "content" as Screen,
      color: "#0F172A",
      bgColor: "#F1F5F9",
    },
    {
      label: "Halaman Dipublikasi",
      value: data?.counts.pages ?? 0,
      trend: "Terverifikasi",
      icon: FileText,
      screen: "pages" as Screen,
      color: "#0F172A",
      bgColor: "#F1F5F9",
    },
  ];

  return (
    <>
      <div className="welcome-row">
        <div>
          <span className="eyebrow" style={{ color: "#64748B", fontWeight: 700 }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          <h1>Selamat Datang, {session.user.name.split(" ")[0]}</h1>
          <p>Ringkasan aktivitas dan tata kelola di <strong>{session.organization.name}</strong>.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate("members")}
          >
            <Users size={16} /> Kelola Anggota
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate("appearance")}
          >
            <Palette size={16} /> Kustomisasi Tema
          </button>
        </div>
      </div>

      {/* Clean Monochromatic Setup Banner */}
      <section className="panel onboarding-hero-card" style={{ marginBottom: "32px" }}>
        <div className="onboarding-hero-header">
          <div>
            <span className="badge-glow" style={{ background: "rgba(255, 255, 255, 0.1)", color: "#E2E8F0", borderColor: "rgba(255, 255, 255, 0.2)", marginBottom: "8px" }}>
              <Sparkles size={13} /> PANDUAN PENYETELAN ORGANISASI
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "6px 0 4px", color: "#FFFFFF" }}>
              Personalisasi Platform {session.organization.name} (3 Langkah Instan)
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0 }}>
              Sesuaikan identitas, logo, warna visual, dan tipografi publik agar situs organisasi tampil profesional.
            </p>
          </div>
          <div className="onboarding-progress-badge">
            <strong>66%</strong>
            <span>Progres Setup</span>
          </div>
        </div>

        <div className="onboarding-steps-grid">
          <button
            type="button"
            className="onboarding-step-card"
            onClick={() => navigate("settings")}
          >
            <div className="step-badge completed">
              <CheckCircle2 size={16} />
            </div>
            <div className="step-info">
              <strong>1. Identitas & Logo</strong>
              <span>Nama, logo, favicon & kontak</span>
            </div>
            <ChevronRight size={16} className="step-arrow" />
          </button>

          <button
            type="button"
            className="onboarding-step-card"
            onClick={() => navigate("appearance")}
          >
            <div className="step-badge completed">
              <CheckCircle2 size={16} />
            </div>
            <div className="step-info">
              <strong>2. Palette Warna Tema</strong>
              <span>Primary, accent & border radius</span>
            </div>
            <ChevronRight size={16} className="step-arrow" />
          </button>

          <button
            type="button"
            className="onboarding-step-card"
            onClick={() => navigate("appearance")}
          >
            <div className="step-badge active">3</div>
            <div className="step-info">
              <strong>3. Tipografi & Font</strong>
              <span>Heading & body font publik</span>
            </div>
            <ChevronRight size={16} className="step-arrow" />
          </button>
        </div>
      </section>

      <div className="stats-grid" style={{ marginBottom: "32px" }}>
        {stats.map((stat) => (
          <button
            type="button"
            className="stat-card"
            key={stat.label}
            onClick={() => navigate(stat.screen)}
          >
            <div className="stat-card-top">
              <span className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
                <stat.icon size={20} />
              </span>
              <span className="stat-trend-pill">{stat.trend}</span>
            </div>
            <div className="stat-card-bottom">
              <strong className="stat-value-big">{stat.value}</strong>
              <span className="stat-label-clean">{stat.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Konten Terbaru</h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>Perubahan cerita, berita, dan halaman publik.</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("content")}
            >
              Lihat Semua <ArrowRight size={16} />
            </button>
          </div>
          <div className="recent-list">
            {data?.recentContent.length ? (
              data.recentContent.map((item) => (
                <div className="recent-item" key={item.id}>
                  <span className="doc-icon">
                    <FileText size={18} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>
                      {item.type} · Diperbarui{" "}
                      {new Date(item.updatedAt).toLocaleDateString("id-ID")}
                    </small>
                  </span>
                  <Status value={item.status} />
                </div>
              ))
            ) : (
              <Empty message="Belum ada konten yang baru diperbarui." />
            )}
          </div>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section className="panel kta-widget-panel">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <ShieldCheck size={20} style={{ color: "#2563EB" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Pemeriksaan KTA Instan</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 14px", lineHeight: 1.5 }}>
              Cari kode KTA atau nomor anggota untuk memverifikasi keaktifan lisensi.
            </p>

            <form onSubmit={handleQuickKtaCheck} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="cth: KTA-APTI-DPP-001"
                value={quickKtaCode}
                onChange={(e) => setQuickKtaCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button type="submit" className="button primary" disabled={ktaLoading} style={{ padding: "0 14px" }}>
                {ktaLoading ? "Mencari..." : "Cek KTA"}
              </button>
            </form>

            {ktaResult && (
              <div style={{ marginTop: "16px", padding: "14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <strong style={{ color: "#166534", fontSize: "14px" }}>{ktaResult.member?.name}</strong>
                  <span style={{ background: "#22C55E", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px" }}>
                    AKTIF
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#15803D" }}>
                  <div>No KTA: <strong>{ktaResult.card?.code || ktaResult.member?.memberNumber}</strong></div>
                  <div>Unit: {ktaResult.member?.unitId || "DPP Pusat"}</div>
                </div>
              </div>
            )}
          </section>

          <section className="panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>Akses Cepat Admin</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => navigate("members")}
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
              >
                <Users size={16} /> Anggota Baru
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => navigate("events")}
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
              >
                <CalendarDays size={16} /> Buat Agenda
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => navigate("settings")}
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
              >
                <Settings size={16} /> Pengaturan
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => navigate("appearance")}
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
              >
                <Palette size={16} /> Ubah Warna
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function Pages() {
  const client = useQueryClient();
  const [editor, setEditor] = useState<CmsPage | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const query = useQuery({
    queryKey: ["pages", search],
    queryFn: () =>
      api<{ data: CmsPage[] }>(
        `/v1/admin/pages?limit=100&search=${encodeURIComponent(search)}`,
      ),
  });
  const visiblePages =
    status === "all"
      ? (query.data?.data ?? [])
      : (query.data?.data ?? []).filter((page) => page.status === status);
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/pages/${id}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["pages"] }),
  });
  if (editor === "new") return <PageEditor onClose={() => setEditor(null)} />;
  if (editor)
    return <PageEditor page={editor} onClose={() => setEditor(null)} />;
  return (
    <>
      <PageHeading
        eyebrow="Website"
        title="Pages"
        description="Compose flexible pages from reusable sections. Changes stay private until you publish."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => setEditor("new")}
          >
            <Plus size={18} /> New page
          </button>
        }
      />
      <div className="table-panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pages…"
            />
          </label>
          <label className="compact-filter">
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <div className="data-table">
          <div className="table-row table-head">
            <span>Page</span>
            <span>Status</span>
            <span>Last updated</span>
            <span />
          </div>
          {visiblePages.map((page) => (
            <div className="table-row" key={page.id}>
              <span className="primary-cell">
                <span className="doc-icon">
                  <FileText size={18} />
                </span>
                <span>
                  <strong>{page.title}</strong>
                  <small>
                    /{page.slug}
                    {page.isHomepage ? " · Homepage" : ""}
                  </small>
                </span>
              </span>
              <Status value={page.status} />
              <span className="muted">
                {new Date(page.updatedAt).toLocaleDateString()}
              </span>
              <span className="row-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setEditor(page)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() =>
                    confirm(`Delete ${page.title}?`) && remove.mutate(page.id)
                  }
                >
                  <X size={17} />
                </button>
              </span>
            </div>
          ))}
        </div>
        {!query.data?.data.length && (
          <Empty message="Create your first page and bring your public site to life." />
        )}
      </div>
    </>
  );
}

function PageEditor({
  page,
  onClose,
}: {
  page?: CmsPage;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [title, setTitle] = useState(page?.title ?? "Untitled page");
  const [slug] = useState(page?.slug ?? "");
  const [status, setStatus] = useState(page?.status ?? "draft");
  const [sections, setSections] = useState<Array<Record<string, unknown>>>(
    page?.sections ?? [],
  );
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: () =>
      api<{ data: CmsPage }>(
        page ? `/v1/admin/pages/${page.id}` : "/v1/admin/pages",
        {
          method: page ? "PATCH" : "POST",
          body: JSON.stringify({
            title,
            slug: slug || undefined,
            sections,
            status,
            isHomepage: page?.isHomepage ?? false,
            seo: page?.seo ?? {},
          }),
        },
      ),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["pages"] });
      onClose();
    },
    onError: (reason) => setError(reason.message),
  });
  const addSection = (type: PageSection["type"]) => {
    const base = { id: crypto.randomUUID(), type };
    const presets: Record<string, Record<string, unknown>> = {
      hero: {
        title: "A clear headline for your organization",
        description: "Tell visitors why your work matters.",
        alignment: "left",
        panelTitle: "Organization command center",
        highlights: [
          "Member registry",
          "Credential compliance",
          "Learning ledger",
          "Revenue & benefits",
        ],
        proofPoints: ["CMS configurable", "Tenant secure", "Audit ready"],
      },
      richText: {
        title: "Our story",
        html: "<p>Start writing here…</p>",
        width: "narrow",
      },
      features: {
        title: "What we do",
        columns: 3,
        variant: "cards",
        items: [
          {
            title: "First program",
            description: "Describe this program or benefit.",
          },
        ],
      },
      stats: { items: [{ value: "1,000+", label: "People reached" }] },
      contentFeed: {
        title: "Latest stories",
        contentType: "post",
        limit: 6,
        layout: "grid",
      },
      organizationChart: {
        title: "Our leadership",
        description: "Introduce the people and units behind the organization.",
        depth: 4,
      },
      cta: {
        title: "Join our movement",
        primaryAction: { label: "Get involved", href: "/contact" },
        tone: "brand",
      },
      contact: { title: "Let’s talk", showForm: true, showMap: false },
    };
    setSections((current) => [...current, { ...base, ...presets[type] }]);
  };
  return (
    <>
      <div className="editor-top">
        <button type="button" className="button ghost" onClick={onClose}>
          ← Back
        </button>
        <div className="editor-title">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Page title"
          />
          <span>/{slug || "untitled-page"}</span>
        </div>
        <div className="editor-actions">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            <option value="draft">Draft</option>
            <option value="review">In review</option>
            <option value="published">Published</option>
          </select>
          <button
            type="button"
            className="button primary"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            <Save size={17} /> {save.isPending ? "Saving…" : "Save page"}
          </button>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="editor-layout">
        <section className="canvas">
          <div className="canvas-browser">
            <span />
            <span />
            <span />
            <b>/{slug || "untitled-page"}</b>
          </div>
          {sections.length === 0 && (
            <div className="empty-canvas">
              <Sparkles size={28} />
              <h3>Build this page, one section at a time</h3>
              <p>Choose a section from the library on the right.</p>
            </div>
          )}
          {sections.map((section, index) => (
            <SectionCard
              section={section}
              index={index}
              key={String(section.id)}
              onChange={(next) =>
                setSections((all) =>
                  all.map((item, itemIndex) =>
                    itemIndex === index ? next : item,
                  ),
                )
              }
              onDelete={() =>
                setSections((all) =>
                  all.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          ))}
        </section>
        <aside className="section-library">
          <h3>Section library</h3>
          <p>Click to add a new content block.</p>
          {(
            [
              "hero",
              "richText",
              "features",
              "stats",
              "contentFeed",
              "organizationChart",
              "cta",
              "contact",
            ] as PageSection["type"][]
          ).map((type) => (
            <button type="button" key={type} onClick={() => addSection(type)}>
              <Plus size={16} />
              <span>
                <strong>{type.replace(/([A-Z])/g, " $1")}</strong>
                <small>Reusable responsive section</small>
              </span>
            </button>
          ))}
        </aside>
      </div>
    </>
  );
}

function SectionCard({
  section,
  index,
  onChange,
  onDelete,
}: {
  section: Record<string, unknown>;
  index: number;
  onChange: (section: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const items = Array.isArray(section.items)
    ? (section.items as Array<Record<string, unknown>>)
    : [];
  const updateItems = (next: Array<Record<string, unknown>>) =>
    onChange({ ...section, items: next });
  const action = (key: "primaryAction" | "secondaryAction" | "action") =>
    (section[key] as Record<string, unknown> | undefined) ?? {};
  return (
    <article className="section-card">
      <header>
        <span className="drag-handle">⠿</span>
        <strong>{String(section.type).replace(/([A-Z])/g, " $1")}</strong>
        <small>Section {index + 1}</small>
        <button type="button" className="icon-button danger" onClick={onDelete}>
          <X size={17} />
        </button>
      </header>
      <div className="section-fields">
        {("eyebrow" in section ||
          ["hero", "richText", "features"].includes(String(section.type))) && (
          <label>
            Eyebrow
            <input
              value={String(section.eyebrow ?? "")}
              onChange={(event) =>
                onChange({ ...section, eyebrow: event.target.value })
              }
            />
          </label>
        )}
        {"title" in section && (
          <label>
            Heading
            <input
              value={String(section.title ?? "")}
              onChange={(event) =>
                onChange({ ...section, title: event.target.value })
              }
            />
          </label>
        )}
        {("description" in section ||
          ["hero", "features", "organizationChart", "cta", "contact"].includes(
            String(section.type),
          )) && (
          <label className="full">
            Description
            <textarea
              rows={3}
              value={String(section.description ?? "")}
              onChange={(event) =>
                onChange({ ...section, description: event.target.value })
              }
            />
          </label>
        )}
        {section.type === "richText" && (
          <>
            <label className="full">
              Content
              <textarea
                rows={7}
                value={String(section.html ?? "")}
                onChange={(event) =>
                  onChange({ ...section, html: event.target.value })
                }
              />
            </label>
            <label>
              Content width
              <select
                value={String(section.width ?? "narrow")}
                onChange={(event) =>
                  onChange({ ...section, width: event.target.value })
                }
              >
                <option value="narrow">Narrow</option>
                <option value="wide">Wide</option>
                <option value="full">Full</option>
              </select>
            </label>
          </>
        )}
        {section.type === "stats" && (
          <div className="section-repeater full">
            <div className="repeater-head">
              <strong>Statistics</strong>
              <button
                type="button"
                onClick={() =>
                  updateItems([
                    ...items,
                    { value: "100+", label: "New metric" },
                  ])
                }
              >
                <Plus size={14} /> Add metric
              </button>
            </div>
            {items.map((item, itemIndex) => (
              <div
                className="repeater-row stats-editor-row"
                key={`stat-${itemIndex}`}
              >
                <label>
                  Value
                  <input
                    value={String(item.value ?? "")}
                    onChange={(event) =>
                      updateItems(
                        items.map((current, index) =>
                          index === itemIndex
                            ? { ...current, value: event.target.value }
                            : current,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Label
                  <input
                    value={String(item.label ?? "")}
                    onChange={(event) =>
                      updateItems(
                        items.map((current, index) =>
                          index === itemIndex
                            ? { ...current, label: event.target.value }
                            : current,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  className="icon-button danger"
                  type="button"
                  onClick={() =>
                    updateItems(items.filter((_, index) => index !== itemIndex))
                  }
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        {section.type === "features" && (
          <div className="section-repeater full">
            <div className="repeater-options">
              <label>
                Visual style
                <select
                  value={String(section.variant ?? "cards")}
                  onChange={(event) =>
                    onChange({ ...section, variant: event.target.value })
                  }
                >
                  <option value="cards">Cards</option>
                  <option value="platform">Platform modules</option>
                  <option value="steps">Journey steps</option>
                </select>
              </label>
              <label>
                Columns
                <select
                  value={String(section.columns ?? 3)}
                  onChange={(event) =>
                    onChange({
                      ...section,
                      columns: Number(event.target.value),
                    })
                  }
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </label>
            </div>
            <div className="repeater-head">
              <strong>Feature items</strong>
              <button
                type="button"
                onClick={() =>
                  updateItems([
                    ...items,
                    {
                      icon: "member",
                      title: "New capability",
                      description:
                        "Describe the outcome this capability creates.",
                    },
                  ])
                }
              >
                <Plus size={14} /> Add item
              </button>
            </div>
            {items.map((item, itemIndex) => (
              <div className="repeater-card" key={`feature-${itemIndex}`}>
                <div className="repeater-card-head">
                  <strong>Item {itemIndex + 1}</strong>
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() =>
                      updateItems(
                        items.filter((_, index) => index !== itemIndex),
                      )
                    }
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="repeater-card-grid">
                  <label>
                    Icon keyword
                    <input
                      value={String(item.icon ?? "")}
                      placeholder="member, credential, learning…"
                      onChange={(event) =>
                        updateItems(
                          items.map((current, index) =>
                            index === itemIndex
                              ? { ...current, icon: event.target.value }
                              : current,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Title
                    <input
                      value={String(item.title ?? "")}
                      onChange={(event) =>
                        updateItems(
                          items.map((current, index) =>
                            index === itemIndex
                              ? { ...current, title: event.target.value }
                              : current,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="full">
                    Description
                    <textarea
                      rows={2}
                      value={String(item.description ?? "")}
                      onChange={(event) =>
                        updateItems(
                          items.map((current, index) =>
                            index === itemIndex
                              ? { ...current, description: event.target.value }
                              : current,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Link label
                    <input
                      value={String(
                        (item.link as Record<string, unknown> | undefined)
                          ?.label ?? "",
                      )}
                      onChange={(event) =>
                        updateItems(
                          items.map((current, index) =>
                            index === itemIndex
                              ? {
                                  ...current,
                                  link: {
                                    ...((current.link as
                                      | Record<string, unknown>
                                      | undefined) ?? {}),
                                    label: event.target.value,
                                  },
                                }
                              : current,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Link URL
                    <input
                      value={String(
                        (item.link as Record<string, unknown> | undefined)
                          ?.href ?? "",
                      )}
                      onChange={(event) =>
                        updateItems(
                          items.map((current, index) =>
                            index === itemIndex
                              ? {
                                  ...current,
                                  link: {
                                    ...((current.link as
                                      | Record<string, unknown>
                                      | undefined) ?? {}),
                                    href: event.target.value,
                                  },
                                }
                              : current,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        {section.type === "hero" && (
          <>
            <label>
              Panel title
              <input
                value={String(section.panelTitle ?? "")}
                onChange={(event) =>
                  onChange({ ...section, panelTitle: event.target.value })
                }
              />
            </label>
            <label>
              Alignment
              <select
                value={String(section.alignment ?? "left")}
                onChange={(event) =>
                  onChange({ ...section, alignment: event.target.value })
                }
              >
                <option value="left">Split / left</option>
                <option value="center">Centered</option>
              </select>
            </label>
            <label className="full">
              Hero image URL{" "}
              <small>Optional; leave empty to show the workspace panel</small>
              <input
                value={String(section.image ?? "")}
                onChange={(event) =>
                  onChange({
                    ...section,
                    image: event.target.value || undefined,
                  })
                }
              />
            </label>
            <label className="full">
              Panel highlights <small>One item per line</small>
              <textarea
                rows={4}
                value={(Array.isArray(section.highlights)
                  ? section.highlights
                  : []
                ).join("\n")}
                onChange={(event) =>
                  onChange({
                    ...section,
                    highlights: event.target.value
                      .split("\n")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <label className="full">
              Proof points <small>One item per line</small>
              <textarea
                rows={3}
                value={(Array.isArray(section.proofPoints)
                  ? section.proofPoints
                  : []
                ).join("\n")}
                onChange={(event) =>
                  onChange({
                    ...section,
                    proofPoints: event.target.value
                      .split("\n")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <div className="repeater-card full">
              <strong>Hero actions</strong>
              <div className="repeater-card-grid">
                <label>
                  Primary label
                  <input
                    value={String(action("primaryAction").label ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        primaryAction: {
                          ...action("primaryAction"),
                          label: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Primary URL
                  <input
                    value={String(action("primaryAction").href ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        primaryAction: {
                          ...action("primaryAction"),
                          href: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Secondary label
                  <input
                    value={String(action("secondaryAction").label ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        secondaryAction: {
                          ...action("secondaryAction"),
                          label: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Secondary URL
                  <input
                    value={String(action("secondaryAction").href ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        secondaryAction: {
                          ...action("secondaryAction"),
                          href: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
            </div>
          </>
        )}
        {section.type === "contentFeed" && (
          <>
            <label>
              Content type
              <select
                value={String(section.contentType ?? "post")}
                onChange={(event) =>
                  onChange({ ...section, contentType: event.target.value })
                }
              >
                <option value="post">Stories</option>
                <option value="news">News</option>
                <option value="event">Events</option>
                <option value="campaign">Campaigns</option>
              </select>
            </label>
            <label>
              Item limit
              <input
                type="number"
                min="1"
                max="24"
                value={Number(section.limit ?? 6)}
                onChange={(event) =>
                  onChange({ ...section, limit: Number(event.target.value) })
                }
              />
            </label>
            <div className="repeater-card full">
              <strong>Feed action</strong>
              <div className="repeater-card-grid">
                <label>
                  Action label
                  <input
                    value={String(action("action").label ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        action: {
                          ...action("action"),
                          label: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Action URL
                  <input
                    value={String(action("action").href ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        action: {
                          ...action("action"),
                          href: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
            </div>
          </>
        )}
        {section.type === "organizationChart" && (
          <label>
            Hierarchy depth
            <input
              type="number"
              min="1"
              max="8"
              value={Number(section.depth ?? 4)}
              onChange={(event) =>
                onChange({ ...section, depth: Number(event.target.value) })
              }
            />
          </label>
        )}
        {section.type === "contact" && (
          <>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={Boolean(section.showForm)}
                onChange={(event) =>
                  onChange({ ...section, showForm: event.target.checked })
                }
              />{" "}
              Show contact form
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={Boolean(section.showMap)}
                onChange={(event) =>
                  onChange({ ...section, showMap: event.target.checked })
                }
              />{" "}
              Show map
            </label>
          </>
        )}
        {section.type === "cta" && (
          <>
            <label>
              Tone
              <select
                value={String(section.tone ?? "brand")}
                onChange={(event) =>
                  onChange({ ...section, tone: event.target.value })
                }
              >
                <option value="brand">Brand</option>
                <option value="contrast">Contrast</option>
                <option value="neutral">Neutral</option>
              </select>
            </label>
            <div className="repeater-card full">
              <strong>Call-to-action links</strong>
              <div className="repeater-card-grid">
                <label>
                  Primary label
                  <input
                    value={String(action("primaryAction").label ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        primaryAction: {
                          ...action("primaryAction"),
                          label: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Primary URL
                  <input
                    value={String(action("primaryAction").href ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        primaryAction: {
                          ...action("primaryAction"),
                          href: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Secondary label
                  <input
                    value={String(action("secondaryAction").label ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        secondaryAction: {
                          ...action("secondaryAction"),
                          label: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Secondary URL
                  <input
                    value={String(action("secondaryAction").href ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...section,
                        secondaryAction: {
                          ...action("secondaryAction"),
                          href: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function ImageUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const upload = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.set("file", file);
      return api<{ data: CmsMedia }>("/v1/admin/media", {
        method: "POST",
        body,
      });
    },
    onSuccess: (response) => setUrl(response.data.publicUrl),
  });
  return (
    <div className="media-upload-field full">
      <label htmlFor={`${name}-url`}>{label}</label>
      <div className="media-upload-control">
        {url ? (
          <img src={url} alt="Preview" />
        ) : (
          <span className="media-upload-placeholder">
            <ImagePlus size={25} />
          </span>
        )}
        <div className="media-upload-options">
          <input
            id={`${name}-url`}
            name={name}
            type="url"
            placeholder="https://"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <label className="button ghost media-upload-button">
            <ImagePlus size={16} />
            {upload.isPending ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              disabled={upload.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload.mutate(file);
                event.target.value = "";
              }}
            />
          </label>
          <small>PNG, JPEG, WebP, or GIF. Maximum 5 MB.</small>
          {upload.error && (
            <span className="field-error">{upload.error.message}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentManager() {
  const [type, setType] = useState("post");
  const [editor, setEditor] = useState<CmsContent | "new" | null>(null);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["contents", type],
    queryFn: () =>
      api<{ data: CmsContent[] }>(`/v1/admin/contents?limit=100&type=${type}`),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/contents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["contents"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  if (editor === "new")
    return <ContentEditor defaultType={type} onClose={() => setEditor(null)} />;
  if (editor)
    return <ContentEditor content={editor} onClose={() => setEditor(null)} />;
  return (
    <>
      <PageHeading
        eyebrow="Publishing"
        title="Stories & news"
        description="Manage articles, announcements, campaigns, and updates in one editorial workflow."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => setEditor("new")}
          >
            <Plus size={18} /> New story
          </button>
        }
      />
      <div className="segmented">
        <button
          type="button"
          className={type === "post" ? "active" : ""}
          onClick={() => setType("post")}
        >
          Stories
        </button>
        <button
          type="button"
          className={type === "news" ? "active" : ""}
          onClick={() => setType("news")}
        >
          News
        </button>
        <button
          type="button"
          className={type === "campaign" ? "active" : ""}
          onClick={() => setType("campaign")}
        >
          Campaigns
        </button>
      </div>
      <div className="content-grid">
        {query.data?.data.map((item) => (
          <article className="content-card" key={item.id}>
            <div className="content-cover">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt="" />
              ) : (
                <Newspaper size={28} />
              )}
            </div>
            <div>
              <Status value={item.status} />
              <h3>{item.title}</h3>
              <p>/{item.slug}</p>
              <footer>
                <span>
                  Updated {new Date(item.updatedAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setEditor(item)}
                >
                  Edit <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  aria-label={`Delete ${item.title}`}
                  onClick={() =>
                    confirm(`Delete ${item.title}?`) && remove.mutate(item.id)
                  }
                >
                  <X size={16} />
                </button>
              </footer>
            </div>
          </article>
        ))}
      </div>
      {!query.data?.data.length && (
        <div className="panel">
          <Empty
            message={`No ${type} content yet. Start with the first story your audience should see.`}
          />
        </div>
      )}
    </>
  );
}

function ContentEditor({
  content,
  defaultType = "post",
  onClose,
}: {
  content?: CmsContent;
  defaultType?: string;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: (form: HTMLFormElement) => {
      const data = new FormData(form);
      const value = (key: string) => String(data.get(key) ?? "").trim();
      const optional = (key: string) => value(key) || null;
      const seoTitle = value("seoTitle");
      const seoDescription = value("seoDescription");
      const seoImage = value("seoImage");
      return api(
        content ? `/v1/admin/contents/${content.id}` : "/v1/admin/contents",
        {
          method: content ? "PATCH" : "POST",
          body: JSON.stringify({
            type: value("type"),
            title: value("title"),
            slug: value("slug") || undefined,
            excerpt: optional("excerpt"),
            body: value("body"),
            coverUrl: optional("coverUrl"),
            authorName: optional("authorName"),
            sourceUrl: optional("sourceUrl"),
            status: value("status"),
            featured: data.get("featured") === "on",
            seo: {
              ...(seoTitle ? { title: seoTitle } : {}),
              ...(seoDescription ? { description: seoDescription } : {}),
              ...(seoImage ? { image: seoImage } : {}),
              noIndex: data.get("noIndex") === "on",
            },
          }),
        },
      );
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["contents"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (reason) => setError(reason.message),
  });
  const seo = content?.seo ?? {};
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    save.mutate(event.currentTarget);
  };
  return (
    <>
      <PageHeading
        eyebrow="Editorial workspace"
        title={content ? "Edit story" : "Create a story"}
        description="Write once, control publishing and search metadata, then reuse it across dynamic website feeds."
        action={
          <button type="button" className="button ghost" onClick={onClose}>
            ← Back to stories
          </button>
        }
      />
      {error && <div className="alert error">{error}</div>}
      <form className="panel entity-form" onSubmit={submit}>
        <label>
          Content type
          <select name="type" defaultValue={content?.type ?? defaultType}>
            <option value="post">Story</option>
            <option value="news">News</option>
            <option value="campaign">Campaign</option>
          </select>
        </label>
        <label>
          Publish status
          <select name="status" defaultValue={content?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="review">In review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="full">
          Title
          <input
            name="title"
            required
            minLength={2}
            defaultValue={content?.title}
          />
        </label>
        <label>
          URL slug
          <input
            name="slug"
            placeholder="generated-from-title"
            defaultValue={content?.slug}
          />
        </label>
        <label>
          Author
          <input name="authorName" defaultValue={content?.authorName ?? ""} />
        </label>
        <label className="full">
          Short excerpt
          <textarea
            name="excerpt"
            rows={3}
            maxLength={1000}
            defaultValue={content?.excerpt ?? ""}
          />
        </label>
        <label className="full">
          Article body
          <textarea
            name="body"
            rows={16}
            required
            defaultValue={content?.body ?? ""}
          />
          <small>
            Safe HTML is supported; scripts and unsafe attributes are removed by
            the API.
          </small>
        </label>
        <ImageUploadField
          name="coverUrl"
          label="Cover image"
          defaultValue={content?.coverUrl ?? ""}
        />
        <label className="full">
          Original source URL
          <input
            name="sourceUrl"
            type="url"
            placeholder="https://"
            defaultValue={content?.sourceUrl ?? ""}
          />
        </label>
        <label>
          SEO title
          <input
            name="seoTitle"
            maxLength={70}
            defaultValue={String(seo.title ?? "")}
          />
        </label>
        <label>
          SEO image URL
          <input
            name="seoImage"
            type="url"
            defaultValue={String(seo.image ?? "")}
          />
        </label>
        <label className="full">
          SEO description
          <textarea
            name="seoDescription"
            rows={3}
            maxLength={170}
            defaultValue={String(seo.description ?? "")}
          />
        </label>
        <label className="check-field">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={content?.featured}
          />
          Feature this content in feeds
        </label>
        <label className="check-field">
          <input
            name="noIndex"
            type="checkbox"
            defaultChecked={Boolean(seo.noIndex)}
          />
          Ask search engines not to index this content
        </label>
        <div className="form-actions full">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={save.isPending}
          >
            <Save size={17} /> {save.isPending ? "Saving…" : "Save content"}
          </button>
        </div>
      </form>
    </>
  );
}

function EventsManager() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<CmsEvent | "new" | null>(null);
  const query = useQuery({
    queryKey: ["events", search],
    queryFn: () =>
      api<{ data: CmsEvent[] }>(
        `/v1/admin/events?limit=100&search=${encodeURIComponent(search)}`,
      ),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["events"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  if (editor === "new") return <EventEditor onClose={() => setEditor(null)} />;
  if (editor)
    return <EventEditor event={editor} onClose={() => setEditor(null)} />;
  return (
    <>
      <PageHeading
        eyebrow="Programs"
        title="Events"
        description="Plan public, private, in-person, virtual, and hybrid activities from one calendar."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => setEditor("new")}
          >
            <Plus size={18} /> New event
          </button>
        }
      />
      <div className="table-panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search events…"
            />
          </label>
          <span className="result-count">
            {query.data?.data.length ?? 0} events
          </span>
        </div>
        <div className="data-table">
          <div className="table-row events-row table-head">
            <span>Event</span>
            <span>Schedule</span>
            <span>Status</span>
            <span />
          </div>
          {query.data?.data.map((item) => (
            <div className="table-row events-row" key={item.id}>
              <span className="primary-cell">
                <span className="doc-icon">
                  <CalendarDays size={18} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.locationName ?? "Location not set"}</small>
                </span>
              </span>
              <span>
                <strong>{new Date(item.startsAt).toLocaleDateString()}</strong>
                <small className="block-muted">
                  {new Date(item.startsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </span>
              <Status value={item.status} />
              <span className="row-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setEditor(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  aria-label={`Delete ${item.title}`}
                  onClick={() =>
                    confirm(`Delete ${item.title}?`) && remove.mutate(item.id)
                  }
                >
                  <X size={17} />
                </button>
              </span>
            </div>
          ))}
        </div>
        {!query.isLoading && !query.data?.data.length && (
          <Empty message="No events match this view." />
        )}
      </div>
    </>
  );
}

function EventEditor({
  event,
  onClose,
}: {
  event?: CmsEvent;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: (form: HTMLFormElement) => {
      const data = new FormData(form);
      const value = (key: string) => String(data.get(key) ?? "").trim();
      const optional = (key: string) => value(key) || null;
      const startsAt = value("startsAt");
      const endsAt = value("endsAt");
      return api(event ? `/v1/admin/events/${event.id}` : "/v1/admin/events", {
        method: event ? "PATCH" : "POST",
        body: JSON.stringify({
          title: value("title"),
          slug: value("slug") || undefined,
          description: optional("description"),
          locationName: optional("locationName"),
          address: optional("address"),
          meetingUrl: optional("meetingUrl"),
          registrationUrl: optional("registrationUrl"),
          coverUrl: optional("coverUrl"),
          startsAt: new Date(startsAt).toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
          timezone: value("timezone"),
          capacity: value("capacity") ? Number(value("capacity")) : null,
          status: value("status"),
        }),
      });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["events"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (reason) => setError(reason.message),
  });
  const submit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setError("");
    save.mutate(submitEvent.currentTarget);
  };
  return (
    <>
      <PageHeading
        eyebrow="Event editor"
        title={event ? "Edit event" : "Create an event"}
        description="Publishing controls when the event appears in public feeds."
        action={
          <button type="button" className="button ghost" onClick={onClose}>
            ← Back to events
          </button>
        }
      />
      {error && <div className="alert error">{error}</div>}
      <form className="panel entity-form" onSubmit={submit}>
        <label>
          Event title
          <input
            name="title"
            required
            minLength={2}
            defaultValue={event?.title}
          />
        </label>
        <label>
          URL slug
          <input
            name="slug"
            placeholder="generated-from-title"
            defaultValue={event?.slug}
          />
        </label>
        <label className="full">
          Description
          <textarea
            name="description"
            rows={5}
            defaultValue={event?.description ?? ""}
          />
        </label>
        <ImageUploadField
          name="coverUrl"
          label="Cover image"
          defaultValue={event?.coverUrl ?? ""}
        />
        <label>
          Starts at
          <input
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={dateTimeInput(event?.startsAt)}
          />
        </label>
        <label>
          Ends at
          <input
            name="endsAt"
            type="datetime-local"
            defaultValue={dateTimeInput(event?.endsAt)}
          />
        </label>
        <label>
          Location name
          <input name="locationName" defaultValue={event?.locationName ?? ""} />
        </label>
        <label>
          Capacity
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={event?.capacity ?? ""}
          />
        </label>
        <label className="full">
          Address
          <input name="address" defaultValue={event?.address ?? ""} />
        </label>
        <label>
          Meeting URL
          <input
            name="meetingUrl"
            type="url"
            placeholder="https://"
            defaultValue={event?.meetingUrl ?? ""}
          />
        </label>
        <label>
          Registration URL
          <input
            name="registrationUrl"
            type="url"
            placeholder="https://"
            defaultValue={event?.registrationUrl ?? ""}
          />
        </label>
        <label>
          Timezone
          <input
            name="timezone"
            required
            defaultValue={event?.timezone ?? "Asia/Jakarta"}
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={event?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="review">In review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="form-actions full">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={save.isPending}
          >
            <Save size={17} /> {save.isPending ? "Saving…" : "Save event"}
          </button>
        </div>
      </form>
    </>
  );
}

const credentialPresets: Array<{
  label: string;
  description: string;
  value: Omit<CmsCredentialScheme, "id">;
}> = [
  {
    label: "Professional competency",
    description:
      "For HVAC, construction, assessors, and other certified professionals.",
    value: {
      code: "COMPETENCY-L3",
      name: "Professional Competency Level 3",
      description:
        "Competency credential issued after an accredited assessment.",
      subjectType: "person",
      category: "competency",
      issuerName: "Accredited Certification Body",
      validityMonths: 36,
      renewalWindowDays: 60,
      minimumVerificationLevel: "issuer_confirmed",
      fields: [
        {
          key: "specialization",
          label: "Specialization",
          type: "text",
          required: true,
        },
        {
          key: "assessmentLocation",
          label: "Assessment location",
          type: "text",
          required: false,
        },
      ],
      isActive: true,
    },
  },
  {
    label: "Regulatory operating license",
    description:
      "For fintech, financial services, and regulated corporate members.",
    value: {
      code: "OPERATING-LICENSE",
      name: "Regulatory Operating License",
      description: "Operating authorization issued by the relevant regulator.",
      subjectType: "organization",
      category: "legal",
      issuerName: "Relevant Regulatory Authority",
      validityMonths: null,
      renewalWindowDays: 90,
      minimumVerificationLevel: "api_verified",
      fields: [
        {
          key: "businessModel",
          label: "Licensed business model",
          type: "text",
          required: true,
        },
        {
          key: "licenseScope",
          label: "License scope",
          type: "text",
          required: true,
        },
      ],
      isActive: true,
    },
  },
  {
    label: "Professional practice license",
    description:
      "For medical, legal, accounting, and other licensed professions.",
    value: {
      code: "PRACTICE-LICENSE",
      name: "Professional Practice License",
      description:
        "A professional license tied to a practice scope or location.",
      subjectType: "person",
      category: "license",
      issuerName: "Government Licensing Authority",
      validityMonths: 60,
      renewalWindowDays: 90,
      minimumVerificationLevel: "api_verified",
      fields: [
        {
          key: "profession",
          label: "Profession",
          type: "text",
          required: true,
        },
        {
          key: "practiceLocation",
          label: "Practice location",
          type: "text",
          required: true,
        },
        {
          key: "creditStatus",
          label: "Professional credit status",
          type: "text",
          required: false,
        },
      ],
      isActive: true,
    },
  },
];

function CredentialsManager() {
  const [view, setView] = useState<"queue" | "schemes">("queue");
  const [schemeEditor, setSchemeEditor] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="ComplyFlow"
        title="Credentials & compliance"
        description="Define reusable legal and professional credentials, assign requirements, and keep every verification decision auditable."
        action={
          view === "schemes" ? (
            <button
              className="button primary"
              type="button"
              onClick={() => setSchemeEditor(true)}
            >
              <Plus size={18} /> New scheme
            </button>
          ) : undefined
        }
      />
      <div className="segmented compliance-segmented">
        <button
          type="button"
          className={view === "queue" ? "active" : ""}
          onClick={() => setView("queue")}
        >
          Verification queue
        </button>
        <button
          type="button"
          className={view === "schemes" ? "active" : ""}
          onClick={() => setView("schemes")}
        >
          Schemes & requirements
        </button>
      </div>
      {view === "queue" ? <CredentialQueue /> : <CredentialSchemes />}
      {schemeEditor && (
        <CredentialSchemeEditor onClose={() => setSchemeEditor(false)} />
      )}
    </>
  );
}

function CredentialQueue() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("submitted");
  const [selected, setSelected] = useState<CmsMemberCredential | null>(null);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["member-credentials", search, status],
    queryFn: () =>
      api<{ data: CmsMemberCredential[] }>(
        `/v1/admin/credentials/credentials?limit=100&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ""}`,
      ),
  });
  const verify = useMutation({
    mutationFn: ({
      credential,
      decision,
      form,
    }: {
      credential: CmsMemberCredential;
      decision: "verify" | "reject" | "revoke";
      form: HTMLFormElement;
    }) => {
      const data = new FormData(form);
      return api(`/v1/admin/credentials/credentials/${credential.id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({
          decision,
          verificationLevel: String(data.get("verificationLevel")),
          method: String(data.get("method")),
          source: String(data.get("source") ?? "").trim() || null,
          notes: String(data.get("notes") ?? "").trim() || null,
        }),
      });
    },
    onSuccess: () => {
      setSelected(null);
      setError("");
      void client.invalidateQueries({ queryKey: ["member-credentials"] });
    },
    onError: (reason) => setError(reason.message),
  });
  const submitDecision = (
    form: HTMLFormElement,
    decision: "verify" | "reject" | "revoke",
  ) => {
    if (!selected) return;
    const notes = String(new FormData(form).get("notes") ?? "").trim();
    if (decision !== "verify" && !notes) {
      setError("Add a reason before rejecting or revoking a credential.");
      return;
    }
    verify.mutate({ credential: selected, decision, form });
  };
  const items = query.data?.data ?? [];
  return (
    <div className="inbox-layout applications-layout credential-layout">
      <section className="table-panel inbox-list">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Member, number, credential…"
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setSelected(null);
            }}
          >
            <option value="">All status</option>
            <option value="submitted">Needs verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
        <div className="submission-list application-list">
          {items.map((item) => (
            <button
              type="button"
              className={selected?.id === item.id ? "active" : ""}
              key={item.id}
              onClick={() => {
                setSelected(item);
                setError("");
              }}
            >
              <span
                className="submission-dot"
                data-status={item.effectiveStatus}
              />
              <span>
                <strong>{item.member.name}</strong>
                <small>
                  {item.scheme.name} · {item.scheme.code}
                </small>
                <p>
                  {item.credentialNumber ?? "Number not supplied"} ·{" "}
                  {item.verificationLevel.replaceAll("_", " ")}
                </p>
              </span>
              <Status value={item.effectiveStatus} />
            </button>
          ))}
        </div>
        {!query.isLoading && !items.length && (
          <Empty message="No credentials match this verification view." />
        )}
      </section>
      <section className="panel submission-detail credential-detail">
        {selected ? (
          <>
            <div className="panel-head">
              <div>
                <span className="eyebrow">Credential review</span>
                <h2>{selected.scheme.name}</h2>
                <p>
                  {selected.member.name} · {selected.member.memberNumber}
                </p>
              </div>
              <Status value={selected.effectiveStatus} />
            </div>
            <dl>
              <div>
                <dt>Credential number</dt>
                <dd>{selected.credentialNumber ?? "—"}</dd>
              </div>
              <div>
                <dt>Issuer</dt>
                <dd>
                  {selected.issuerName ?? selected.scheme.issuerName ?? "—"}
                </dd>
              </div>
              <div>
                <dt>Issued</dt>
                <dd>
                  {selected.issuedAt
                    ? new Date(selected.issuedAt).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>
                  {selected.expiresAt
                    ? new Date(selected.expiresAt).toLocaleDateString()
                    : "No expiry"}
                </dd>
              </div>
              {Object.entries(selected.data).map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd>{String(value || "—")}</dd>
                </div>
              ))}
              <div>
                <dt>Evidence source</dt>
                <dd>
                  {selected.sourceUrl ? (
                    <a
                      href={selected.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source record ↗
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>
            </dl>
            <form className="review-form">
              {error && <div className="alert error">{error}</div>}
              <label>
                Verification level
                <select
                  name="verificationLevel"
                  defaultValue={selected.scheme.minimumVerificationLevel}
                >
                  <option value="document_checked">Document checked</option>
                  <option value="issuer_confirmed">Issuer confirmed</option>
                  <option value="api_verified">API verified</option>
                  <option value="cryptographically_verified">
                    Cryptographically verified
                  </option>
                </select>
              </label>
              <label>
                Verification method
                <select name="method" defaultValue="document_review">
                  <option value="document_review">Document review</option>
                  <option value="issuer_confirmation">
                    Issuer confirmation
                  </option>
                  <option value="api">Official API</option>
                  <option value="digital_signature">Digital signature</option>
                </select>
              </label>
              <label>
                Verification source
                <input
                  name="source"
                  placeholder="Issuer, registry, API, or verifier identity"
                />
              </label>
              <label>
                Reviewer notes
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Record the evidence and basis for this decision…"
                />
              </label>
              <div className="submission-actions">
                <button
                  type="button"
                  className="button ghost destructive"
                  disabled={verify.isPending}
                  onClick={(event) => {
                    const form = event.currentTarget.form;
                    if (form)
                      submitDecision(
                        form,
                        selected.status === "verified" ? "revoke" : "reject",
                      );
                  }}
                >
                  {selected.status === "verified" ? "Revoke" : "Reject"}
                </button>
                <button
                  type="button"
                  className="button primary"
                  disabled={verify.isPending}
                  onClick={(event) => {
                    const form = event.currentTarget.form;
                    if (form) submitDecision(form, "verify");
                  }}
                >
                  <ShieldCheck size={17} />{" "}
                  {verify.isPending ? "Saving decision…" : "Verify credential"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <Empty message="Select a credential to inspect its data and verification basis." />
        )}
      </section>
    </div>
  );
}

function CredentialSchemes() {
  const schemes = useQuery({
    queryKey: ["credential-schemes"],
    queryFn: () =>
      api<{ data: CmsCredentialScheme[] }>("/v1/admin/credentials/schemes"),
  });
  const requirements = useQuery({
    queryKey: ["credential-requirements"],
    queryFn: () =>
      api<{ data: CmsCredentialRequirement[] }>(
        "/v1/admin/credentials/requirements",
      ),
  });
  return (
    <div className="credential-scheme-grid">
      {schemes.data?.data.map((scheme) => {
        const rules =
          requirements.data?.data.filter(
            (item) => item.schemeId === scheme.id,
          ) ?? [];
        return (
          <article className="panel credential-scheme-card" key={scheme.id}>
            <div className="credential-scheme-head">
              <span>
                <ShieldCheck size={19} />
              </span>
              <Status value={scheme.isActive ? "active" : "inactive"} />
            </div>
            <small>
              {scheme.category} · {scheme.code}
            </small>
            <h2>{scheme.name}</h2>
            <p>{scheme.description ?? "No description yet."}</p>
            <dl>
              <div>
                <dt>Issuer</dt>
                <dd>{scheme.issuerName ?? "Any approved issuer"}</dd>
              </div>
              <div>
                <dt>Minimum trust</dt>
                <dd>{scheme.minimumVerificationLevel.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt>Validity</dt>
                <dd>
                  {scheme.validityMonths
                    ? `${scheme.validityMonths} months`
                    : "Issuer-defined"}
                </dd>
              </div>
              <div>
                <dt>Dynamic fields</dt>
                <dd>{scheme.fields.length}</dd>
              </div>
            </dl>
            <div className="requirement-tags">
              {rules.length ? (
                rules.map((rule) => (
                  <span key={rule.id}>
                    {rule.membershipType}: {rule.rule.replace("_", " ")}
                  </span>
                ))
              ) : (
                <span>Not assigned to a membership type</span>
              )}
            </div>
          </article>
        );
      })}
      {!schemes.isLoading && !schemes.data?.data.length && (
        <div className="panel credential-empty-state">
          <ShieldCheck size={28} />
          <h2>No credential schemes yet</h2>
          <p>
            Create one from a sector preset or define your own legal,
            professional, or competency credential.
          </p>
        </div>
      )}
    </div>
  );
}

function CredentialSchemeEditor({ onClose }: { onClose: () => void }) {
  const client = useQueryClient();
  const [presetIndex, setPresetIndex] = useState<number | null>(null);
  const [fields, setFields] = useState<CmsCredentialField[]>([]);
  const [error, setError] = useState("");
  const preset = presetIndex === null ? null : credentialPresets[presetIndex];
  const save = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = new FormData(form);
      const value = (key: string) => String(data.get(key) ?? "").trim();
      const result = await api<{ data: CmsCredentialScheme }>(
        "/v1/admin/credentials/schemes",
        {
          method: "POST",
          body: JSON.stringify({
            code: value("code").toUpperCase(),
            name: value("name"),
            description: value("description") || null,
            subjectType: value("subjectType"),
            category: value("category"),
            issuerName: value("issuerName") || null,
            validityMonths: value("validityMonths")
              ? Number(value("validityMonths"))
              : null,
            renewalWindowDays: Number(value("renewalWindowDays") || 30),
            minimumVerificationLevel: value("minimumVerificationLevel"),
            fields,
            verificationConfig: {},
            isActive: true,
          }),
        },
      );
      if (data.get("assignDefault") === "on")
        await api("/v1/admin/credentials/requirements", {
          method: "POST",
          body: JSON.stringify({
            schemeId: result.data.id,
            membershipType: "default",
            rule: value("requirementRule"),
            requiredVerificationLevel: value("minimumVerificationLevel"),
            gracePeriodDays: Number(value("gracePeriodDays") || 0),
            blocksApproval: data.get("blocksApproval") === "on",
          }),
        });
      return result;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["credential-schemes"] });
      void client.invalidateQueries({ queryKey: ["credential-requirements"] });
      onClose();
    },
    onError: (reason) => setError(reason.message),
  });
  const choosePreset = (index: number) => {
    setPresetIndex(index);
    setFields(credentialPresets[index]?.value.fields ?? []);
  };
  const active = preset?.value;
  return (
    <div className="modal-backdrop">
      <div className="modal credential-editor-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">Configurable compliance</span>
            <h2>New credential scheme</h2>
            <p>
              Start from an editable industry pattern or define a neutral
              scheme.
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="credential-preset-grid">
          {credentialPresets.map((item, index) => (
            <button
              type="button"
              className={presetIndex === index ? "active" : ""}
              key={item.label}
              onClick={() => choosePreset(index)}
            >
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
        <form
          className="entity-form credential-scheme-form"
          key={presetIndex ?? "blank"}
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            save.mutate(event.currentTarget);
          }}
        >
          {error && <div className="alert error full">{error}</div>}
          <label>
            Scheme name
            <input name="name" required defaultValue={active?.name ?? ""} />
          </label>
          <label>
            Code
            <input
              name="code"
              required
              pattern="[A-Z0-9][A-Z0-9_-]*"
              defaultValue={active?.code ?? ""}
            />
          </label>
          <label>
            Category
            <input
              name="category"
              required
              defaultValue={active?.category ?? "general"}
            />
          </label>
          <label>
            Subject
            <select
              name="subjectType"
              defaultValue={active?.subjectType ?? "person"}
            >
              <option value="person">Individual/person</option>
              <option value="organization">Company/organization</option>
            </select>
          </label>
          <label className="full">
            Description
            <textarea
              name="description"
              rows={2}
              defaultValue={active?.description ?? ""}
            />
          </label>
          <label>
            Default issuer
            <input name="issuerName" defaultValue={active?.issuerName ?? ""} />
          </label>
          <label>
            Validity in months
            <input
              name="validityMonths"
              type="number"
              min={1}
              max={1200}
              defaultValue={active?.validityMonths ?? ""}
              placeholder="Leave empty if issuer-defined"
            />
          </label>
          <label>
            Renewal window (days)
            <input
              name="renewalWindowDays"
              type="number"
              min={0}
              defaultValue={active?.renewalWindowDays ?? 30}
            />
          </label>
          <label>
            Minimum verification
            <select
              name="minimumVerificationLevel"
              defaultValue={
                active?.minimumVerificationLevel ?? "document_checked"
              }
            >
              <option value="document_checked">Document checked</option>
              <option value="issuer_confirmed">Issuer confirmed</option>
              <option value="api_verified">API verified</option>
              <option value="cryptographically_verified">
                Cryptographically verified
              </option>
            </select>
          </label>
          <div className="full dynamic-fields-builder">
            <div className="panel-head">
              <div>
                <h3>Dynamic data fields</h3>
                <p>
                  These fields belong to the scheme—not the core member table.
                </p>
              </div>
              <button
                type="button"
                className="button ghost"
                onClick={() =>
                  setFields((current) => [
                    ...current,
                    {
                      key: `field${current.length + 1}`,
                      label: "New field",
                      type: "text",
                      required: false,
                    },
                  ])
                }
              >
                <Plus size={16} /> Add field
              </button>
            </div>
            {fields.map((field, index) => (
              <div className="dynamic-field-row" key={`${field.key}-${index}`}>
                <input
                  aria-label="Field label"
                  value={field.label}
                  onChange={(event) =>
                    setFields((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, label: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Field label"
                />
                <input
                  aria-label="Field key"
                  value={field.key}
                  pattern="[a-z][a-zA-Z0-9_]*"
                  onChange={(event) =>
                    setFields((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, key: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="fieldKey"
                />
                <select
                  aria-label="Field type"
                  value={field.type}
                  onChange={(event) =>
                    setFields((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              type: event.target
                                .value as CmsCredentialField["type"],
                            }
                          : item,
                      ),
                    )
                  }
                >
                  <option value="text">Text</option>
                  <option value="date">Date</option>
                  <option value="number">Number</option>
                  <option value="url">URL</option>
                  <option value="select">Select</option>
                </select>
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(event) =>
                      setFields((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, required: event.target.checked }
                            : item,
                        ),
                      )
                    }
                  />{" "}
                  Required
                </label>
                <button
                  type="button"
                  className="icon-button danger"
                  aria-label={`Remove ${field.label}`}
                  onClick={() =>
                    setFields((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <X size={17} />
                </button>
              </div>
            ))}
          </div>
          <div className="full requirement-config">
            <label className="check-field">
              <input name="assignDefault" type="checkbox" defaultChecked />
              <span>Assign to the default membership type</span>
            </label>
            <label>
              Requirement rule
              <select name="requirementRule" defaultValue="required">
                <option value="required">Required</option>
                <option value="one_of">One of a group</option>
                <option value="optional">Optional</option>
              </select>
            </label>
            <label>
              Grace period (days)
              <input
                name="gracePeriodDays"
                type="number"
                min={0}
                defaultValue={0}
              />
            </label>
            <label className="check-field">
              <input name="blocksApproval" type="checkbox" />
              <span>Block member approval until satisfied</span>
            </label>
          </div>
          <div className="form-actions full">
            <button type="button" className="button ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={save.isPending}
            >
              <Save size={17} />{" "}
              {save.isPending ? "Creating…" : "Create scheme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type AcademyEditorMode = "activity" | "scheme" | "enrollment";

function AcademyManager() {
  const client = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<AcademyEditorMode | null>(null);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["learning-overview"],
    queryFn: () =>
      api<{ data: CmsLearningData }>("/v1/admin/learning/overview"),
  });
  const overview = query.data?.data;
  const selected =
    overview?.activities.find((item) => item.id === selectedId) ??
    overview?.activities[0] ??
    null;
  const invalidate = () =>
    client.invalidateQueries({ queryKey: ["learning-overview"] });
  const save = useMutation({
    mutationFn: async ({
      mode,
      form,
    }: {
      mode: AcademyEditorMode;
      form: HTMLFormElement;
    }) => {
      const data = new FormData(form);
      const value = (key: string) => String(data.get(key) ?? "").trim();
      if (mode === "scheme")
        return api("/v1/admin/learning/schemes", {
          method: "POST",
          body: JSON.stringify({
            code: value("code").toUpperCase(),
            name: value("name"),
            unitLabel: value("unitLabel"),
            description: value("description") || null,
            validityMonths: value("validityMonths")
              ? Number(value("validityMonths"))
              : null,
            isActive: true,
          }),
        });
      if (mode === "enrollment") {
        if (!selected) throw new Error("Select an activity first.");
        return api(`/v1/admin/learning/activities/${selected.id}/enrollments`, {
          method: "POST",
          body: JSON.stringify({
            memberId: value("memberId"),
            status: "confirmed",
          }),
        });
      }
      const startsAt = value("startsAt");
      const endsAt = value("endsAt");
      return api("/v1/admin/learning/activities", {
        method: "POST",
        body: JSON.stringify({
          code: value("code").toUpperCase(),
          title: value("title"),
          description: value("description") || null,
          category: value("category"),
          deliveryMode: value("deliveryMode"),
          locationName: value("locationName") || null,
          meetingUrl: value("meetingUrl") || null,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
          timezone: "Asia/Jakarta",
          capacity: value("capacity") ? Number(value("capacity")) : null,
          creditSchemeId: value("creditSchemeId") || null,
          creditAmount: Number(value("creditAmount") || 0),
          status: value("status"),
        }),
      });
    },
    onSuccess: () => {
      setEditor(null);
      setError("");
      void invalidate();
    },
    onError: (reason) => setError(reason.message),
  });
  const attendance = useMutation({
    mutationFn: ({
      memberId,
      status,
    }: {
      memberId: string;
      status: string;
    }) => {
      if (!selected) throw new Error("Select an activity first.");
      return api(`/v1/admin/learning/activities/${selected.id}/attendance`, {
        method: "PATCH",
        body: JSON.stringify({
          memberId,
          status,
          checkInAt:
            status === "present" || status === "late"
              ? new Date().toISOString()
              : null,
          source: "cms",
        }),
      });
    },
    onSuccess: () => void invalidate(),
  });
  const complete = useMutation({
    mutationFn: (activity: CmsLearningActivity) =>
      api<{ data: { awarded: number; eligible: number } }>(
        `/v1/admin/learning/activities/${activity.id}/complete`,
        { method: "POST", body: "{}" },
      ),
    onSuccess: () => void invalidate(),
  });

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;
  if (!overview) return <Empty message="Learning data is unavailable." />;
  const roster = selected
    ? overview.enrollments.filter((item) => item.activityId === selected.id)
    : [];
  const totalEnrollments = overview.enrollments.filter(
    (item) => item.status !== "cancelled",
  ).length;
  const completedCredits = overview.activities
    .filter((item) => item.status === "completed")
    .reduce((total, item) => total + item.creditAmount, 0);

  return (
    <>
      <PageHeading
        eyebrow="Academy & Credit Ledger"
        title="Learning operations"
        description="Run training, verify attendance, and issue SKP, CPD, or compliance credits from one auditable workflow."
        action={
          <div className="heading-actions">
            <button
              className="button subtle"
              type="button"
              onClick={() => setEditor("scheme")}
            >
              <Award size={17} /> Credit scheme
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => setEditor("activity")}
            >
              <Plus size={17} /> New activity
            </button>
          </div>
        }
      />
      <div className="academy-stats governance-stats">
        <article>
          <BookOpen size={20} />
          <span>
            <strong>{overview.activities.length}</strong>
            <small>Learning activities</small>
          </span>
        </article>
        <article>
          <Users size={20} />
          <span>
            <strong>{totalEnrollments}</strong>
            <small>Enrollments</small>
          </span>
        </article>
        <article>
          <Award size={20} />
          <span>
            <strong>{completedCredits}</strong>
            <small>Credit value completed</small>
          </span>
        </article>
      </div>
      <div className="academy-layout inbox-layout">
        <section className="panel academy-activity-list">
          <div className="panel-head academy-panel-head">
            <div>
              <span className="eyebrow">Program calendar</span>
              <h2>Activities</h2>
            </div>
            <div className="academy-scheme-pills">
              {overview.schemes.map((scheme) => (
                <span key={scheme.id}>{scheme.code}</span>
              ))}
            </div>
          </div>
          <div className="academy-activities">
            {overview.activities.map((activity) => {
              const enrolled = overview.enrollments.filter(
                (item) =>
                  item.activityId === activity.id &&
                  item.status !== "cancelled",
              ).length;
              return (
                <button
                  type="button"
                  className={selected?.id === activity.id ? "active" : ""}
                  key={activity.id}
                  onClick={() => setSelectedId(activity.id)}
                >
                  <span className="academy-date">
                    <strong>{new Date(activity.startsAt).getDate()}</strong>
                    <small>
                      {new Date(activity.startsAt).toLocaleDateString(
                        undefined,
                        { month: "short" },
                      )}
                    </small>
                  </span>
                  <span className="academy-activity-copy">
                    <small>
                      {activity.code} ·{" "}
                      {activity.deliveryMode.replace("_", " ")}
                    </small>
                    <strong>{activity.title}</strong>
                    <span>
                      {enrolled}
                      {activity.capacity ? ` / ${activity.capacity}` : ""}{" "}
                      enrolled
                    </span>
                  </span>
                  <Status value={activity.status} />
                </button>
              );
            })}
            {!overview.activities.length && (
              <Empty message="Create the first learning activity to open enrollment." />
            )}
          </div>
        </section>
        <section className="panel academy-roster">
          {selected ? (
            <>
              <div className="panel-head academy-panel-head">
                <div>
                  <span className="eyebrow">Attendance & awards</span>
                  <h2>{selected.title}</h2>
                  <p>
                    {selected.creditAmount}{" "}
                    {selected.scheme?.unitLabel ?? "credits"} ·{" "}
                    {new Date(selected.startsAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  className="button subtle"
                  onClick={() => setEditor("enrollment")}
                  disabled={selected.status === "completed"}
                >
                  <Plus size={16} /> Add participant
                </button>
              </div>
              <div className="academy-roster-list">
                {roster.map((item) => (
                  <article key={item.id}>
                    <span className="roster-avatar">
                      {item.member.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>{item.member.name}</strong>
                      <small>
                        {item.member.memberNumber} · {item.status}
                      </small>
                    </div>
                    <div className="attendance-actions">
                      {(["present", "late", "absent"] as const).map(
                        (status) => (
                          <button
                            type="button"
                            key={status}
                            className={
                              item.attendance?.status === status ? "active" : ""
                            }
                            disabled={
                              selected.status === "completed" ||
                              attendance.isPending
                            }
                            onClick={() =>
                              attendance.mutate({
                                memberId: item.memberId,
                                status,
                              })
                            }
                          >
                            {status}
                          </button>
                        ),
                      )}
                    </div>
                  </article>
                ))}
                {!roster.length && (
                  <Empty message="No one is enrolled in this activity yet." />
                )}
              </div>
              <div className="academy-complete-bar">
                <div>
                  <strong>Complete activity & issue credit</strong>
                  <small>
                    Only present or late participants receive a ledger entry.
                    Re-running is safe.
                  </small>
                </div>
                <button
                  type="button"
                  className="button primary"
                  disabled={
                    selected.status === "completed" || complete.isPending
                  }
                  onClick={() => complete.mutate(selected)}
                >
                  <Award size={17} />{" "}
                  {selected.status === "completed"
                    ? "Completed"
                    : complete.isPending
                      ? "Issuing…"
                      : "Complete & award"}
                </button>
              </div>
            </>
          ) : (
            <Empty message="Select an activity to operate its roster." />
          )}
        </section>
      </div>
      {editor && (
        <AcademyEditor
          mode={editor}
          overview={overview}
          activity={selected}
          error={error}
          pending={save.isPending}
          onClose={() => {
            setEditor(null);
            setError("");
          }}
          onSubmit={(form) => save.mutate({ mode: editor, form })}
        />
      )}
    </>
  );
}

function AcademyEditor({
  mode,
  overview,
  activity,
  error,
  pending,
  onClose,
  onSubmit,
}: {
  mode: AcademyEditorMode;
  overview: CmsLearningData;
  activity: CmsLearningActivity | null;
  error: string;
  pending: boolean;
  onClose: () => void;
  onSubmit: (form: HTMLFormElement) => void;
}) {
  const title =
    mode === "scheme"
      ? "New credit scheme"
      : mode === "enrollment"
        ? "Add participant"
        : "New learning activity";
  return (
    <div className="modal-backdrop">
      <div className="modal academy-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">Academy & Credit Ledger</span>
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form
          className="entity-form academy-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(event.currentTarget);
          }}
        >
          {error && <div className="alert error full">{error}</div>}
          {mode === "scheme" && (
            <>
              <label>
                Code
                <input name="code" required placeholder="SKP, CPD, CEU" />
              </label>
              <label>
                Scheme name
                <input
                  name="name"
                  required
                  placeholder="Continuing Professional Development"
                />
              </label>
              <label>
                Unit label
                <input name="unitLabel" required placeholder="CPD points" />
              </label>
              <label>
                Validity (months)
                <input name="validityMonths" type="number" min={1} />
              </label>
              <label className="full">
                Description
                <textarea name="description" rows={3} />
              </label>
            </>
          )}
          {mode === "activity" && (
            <>
              <label>
                Activity code
                <input name="code" required placeholder="ETHICS-2026" />
              </label>
              <label>
                Title
                <input name="title" required />
              </label>
              <label>
                Category
                <input
                  name="category"
                  required
                  defaultValue="professional-development"
                />
              </label>
              <label>
                Delivery
                <select name="deliveryMode" defaultValue="onsite">
                  <option value="onsite">Onsite</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="self_paced">Self-paced</option>
                </select>
              </label>
              <label>
                Starts
                <input name="startsAt" type="datetime-local" required />
              </label>
              <label>
                Ends
                <input name="endsAt" type="datetime-local" />
              </label>
              <label>
                Location
                <input name="locationName" />
              </label>
              <label>
                Meeting URL
                <input name="meetingUrl" type="url" />
              </label>
              <label>
                Capacity
                <input name="capacity" type="number" min={1} />
              </label>
              <label>
                Status
                <select name="status" defaultValue="open">
                  <option value="draft">Draft</option>
                  <option value="open">Open enrollment</option>
                </select>
              </label>
              <label>
                Credit scheme
                <select name="creditSchemeId" defaultValue="">
                  <option value="">No credit</option>
                  {overview.schemes
                    .filter((item) => item.isActive)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Credit value
                <input
                  name="creditAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={0}
                />
              </label>
              <label className="full">
                Description
                <textarea name="description" rows={3} />
              </label>
            </>
          )}
          {mode === "enrollment" && (
            <label className="full">
              Active member
              <select name="memberId" required defaultValue="">
                <option value="" disabled>
                  Select a member for {activity?.title}
                </option>
                {overview.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.memberNumber}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="form-actions full">
            <button type="button" className="button subtle" onClick={onClose}>
              Cancel
            </button>
            <button className="button primary" type="submit" disabled={pending}>
              <Save size={17} /> {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type GovernanceEditorMode = "unit" | "position" | "appointment";

function GovernanceManager() {
  const client = useQueryClient();
  const [editor, setEditor] = useState<GovernanceEditorMode | null>(null);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["governance-overview"],
    queryFn: () =>
      api<{ data: CmsGovernanceData }>("/v1/admin/governance/overview"),
  });
  const save = useMutation({
    mutationFn: async ({
      mode,
      form,
    }: {
      mode: GovernanceEditorMode;
      form: HTMLFormElement;
    }) => {
      const data = new FormData(form);
      const value = (key: string) => String(data.get(key) ?? "").trim();
      if (mode === "unit")
        return api("/v1/admin/governance/units", {
          method: "POST",
          body: JSON.stringify({
            name: value("name"),
            type: value("type"),
            parentId: value("parentId") || null,
            description: value("description") || null,
            sortOrder: Number(value("sortOrder") || 0),
          }),
        });
      if (mode === "position")
        return api("/v1/admin/governance/positions", {
          method: "POST",
          body: JSON.stringify({
            title: value("title"),
            unitId: value("unitId"),
            parentId: value("parentId") || null,
            description: value("description") || null,
            sortOrder: Number(value("sortOrder") || 0),
          }),
        });
      const startsAt = value("startsAt");
      const endsAt = value("endsAt");
      return api("/v1/admin/governance/assignments", {
        method: "POST",
        body: JSON.stringify({
          positionId: value("positionId"),
          memberId: value("memberId"),
          startsAt: startsAt ? new Date(startsAt).toISOString() : null,
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
          isPrimary: true,
        }),
      });
    },
    onSuccess: () => {
      setEditor(null);
      setError("");
      void client.invalidateQueries({ queryKey: ["governance-overview"] });
    },
    onError: (reason) => setError(reason.message),
  });
  const endAppointment = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/governance/assignments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ endsAt: new Date().toISOString() }),
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["governance-overview"] }),
  });

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;
  const overview = query.data?.data;
  if (!overview) return <Empty message="No governance data is available." />;
  const now = Date.now();
  const isCurrent = (startsAt: string | null, endsAt: string | null) =>
    (!startsAt || new Date(startsAt).getTime() <= now) &&
    (!endsAt || new Date(endsAt).getTime() >= now);
  const currentAssignments = overview.assignments.filter((item) =>
    isCurrent(item.startsAt, item.endsAt),
  );

  return (
    <>
      <PageHeading
        eyebrow="GovernOS"
        title="Structure & appointments"
        description="Operate national, regional, chapter, and committee structures with traceable position terms—without fixing DPP or DPD into the codebase."
        action={
          <button
            className="button primary"
            type="button"
            onClick={() => setEditor("appointment")}
          >
            <Plus size={18} /> New appointment
          </button>
        }
      />
      <div className="governance-stats">
        <article>
          <Building2 size={20} />
          <span>
            <strong>
              {overview.units.filter((unit) => unit.isActive).length}
            </strong>
            <small>Active units</small>
          </span>
        </article>
        <article>
          <Network size={20} />
          <span>
            <strong>{overview.positions.length}</strong>
            <small>Defined positions</small>
          </span>
        </article>
        <article>
          <BadgeCheck size={20} />
          <span>
            <strong>{currentAssignments.length}</strong>
            <small>Current appointments</small>
          </span>
        </article>
      </div>
      <div className="governance-layout">
        <section className="panel governance-units">
          <div className="panel-head governance-panel-head">
            <div>
              <span className="eyebrow">Organization map</span>
              <h2>Units</h2>
            </div>
            <button
              type="button"
              className="button subtle"
              onClick={() => setEditor("unit")}
            >
              <Plus size={16} /> Add unit
            </button>
          </div>
          <div className="unit-tree">
            {overview.units.map((unit) => {
              const parent = overview.units.find(
                (candidate) => candidate.id === unit.parentId,
              );
              const unitPositions = overview.positions.filter(
                (position) => position.unitId === unit.id,
              );
              return (
                <article
                  key={unit.id}
                  className={!unit.isActive ? "inactive" : ""}
                >
                  <span className="unit-icon">
                    <Building2 size={18} />
                  </span>
                  <div>
                    <div className="unit-title-row">
                      <strong>{unit.name}</strong>
                      <Status value={unit.isActive ? "active" : "inactive"} />
                    </div>
                    <small>
                      {unit.type}{" "}
                      {parent ? `· under ${parent.name}` : "· root unit"}
                    </small>
                    <p>{unitPositions.length} configured positions</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="panel governance-positions">
          <div className="panel-head governance-panel-head">
            <div>
              <span className="eyebrow">Term register</span>
              <h2>Positions & office holders</h2>
            </div>
            <button
              type="button"
              className="button subtle"
              onClick={() => setEditor("position")}
            >
              <Plus size={16} /> Add position
            </button>
          </div>
          <div className="position-register">
            {overview.positions.map((position) => {
              const unit = overview.units.find(
                (candidate) => candidate.id === position.unitId,
              );
              const assignments = overview.assignments.filter(
                (item) => item.positionId === position.id,
              );
              const active = assignments.find((item) =>
                isCurrent(item.startsAt, item.endsAt),
              );
              return (
                <article key={position.id}>
                  <div className="position-copy">
                    <small>{unit?.name ?? "Unassigned unit"}</small>
                    <strong>{position.title}</strong>
                    <p>
                      {position.description ?? "No mandate description yet."}
                    </p>
                  </div>
                  <div className="office-holder">
                    {active ? (
                      <>
                        <span>
                          {active.member.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="office-holder-copy">
                          <strong>{active.member.name}</strong>
                          <small>
                            {active.member.memberNumber}
                            {active.startsAt
                              ? ` · since ${new Date(active.startsAt).toLocaleDateString()}`
                              : ""}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="text-button"
                          disabled={endAppointment.isPending}
                          onClick={() => endAppointment.mutate(active.id)}
                        >
                          End term
                        </button>
                      </>
                    ) : (
                      <span className="vacant">Vacant</span>
                    )}
                  </div>
                </article>
              );
            })}
            {!overview.positions.length && (
              <Empty message="Define positions to start the appointment register." />
            )}
          </div>
        </section>
      </div>
      {editor && (
        <GovernanceEditor
          mode={editor}
          overview={overview}
          error={error}
          pending={save.isPending}
          onClose={() => {
            setEditor(null);
            setError("");
          }}
          onSubmit={(form) => save.mutate({ mode: editor, form })}
        />
      )}
    </>
  );
}

function GovernanceEditor({
  mode,
  overview,
  error,
  pending,
  onClose,
  onSubmit,
}: {
  mode: GovernanceEditorMode;
  overview: CmsGovernanceData;
  error: string;
  pending: boolean;
  onClose: () => void;
  onSubmit: (form: HTMLFormElement) => void;
}) {
  const labels = {
    unit: [
      "Organization unit",
      "Add a national, regional, chapter, or committee node.",
    ],
    position: [
      "Governance position",
      "Define an office and its place in the organization.",
    ],
    appointment: [
      "Position appointment",
      "Assign an active member for a traceable term.",
    ],
  } as const;
  return (
    <div className="modal-backdrop">
      <div className="modal governance-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">GovernOS</span>
            <h2>{labels[mode][0]}</h2>
            <p>{labels[mode][1]}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form
          className="entity-form governance-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(event.currentTarget);
          }}
        >
          {error && <div className="alert error full">{error}</div>}
          {mode === "unit" && (
            <>
              <label>
                Unit name
                <input name="name" required placeholder="West Java Chapter" />
              </label>
              <label>
                Unit type
                <input
                  name="type"
                  required
                  defaultValue="regional"
                  placeholder="national, regional, committee…"
                />
              </label>
              <label>
                Parent unit
                <select name="parentId" defaultValue="">
                  <option value="">Root unit</option>
                  {overview.units
                    .filter((unit) => unit.isActive)
                    .map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Sort order
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={overview.units.length + 1}
                />
              </label>
              <label className="full">
                Description
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Coverage, mandate, or jurisdiction of this unit."
                />
              </label>
            </>
          )}
          {mode === "position" && (
            <>
              <label>
                Position title
                <input name="title" required placeholder="Regional Chair" />
              </label>
              <label>
                Organization unit
                <select name="unitId" required defaultValue="">
                  <option value="" disabled>
                    Select a unit
                  </option>
                  {overview.units
                    .filter((unit) => unit.isActive)
                    .map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Reports to
                <select name="parentId" defaultValue="">
                  <option value="">No parent position</option>
                  {overview.positions.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sort order
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={overview.positions.length + 1}
                />
              </label>
              <label className="full">
                Mandate
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Authority and responsibilities attached to this office."
                />
              </label>
            </>
          )}
          {mode === "appointment" && (
            <>
              <label>
                Position
                <select name="positionId" required defaultValue="">
                  <option value="" disabled>
                    Select a position
                  </option>
                  {overview.positions.map((position) => {
                    const unit = overview.units.find(
                      (item) => item.id === position.unitId,
                    );
                    return (
                      <option key={position.id} value={position.id}>
                        {position.title} · {unit?.name}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                Active member
                <select name="memberId" required defaultValue="">
                  <option value="" disabled>
                    Select a member
                  </option>
                  {overview.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} · {member.memberNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Term starts
                <input name="startsAt" type="date" />
              </label>
              <label>
                Term ends
                <input name="endsAt" type="date" />
              </label>
            </>
          )}
          <div className="form-actions full">
            <button type="button" className="button subtle" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={pending}>
              <Save size={17} /> {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplicationsManager() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");
  const [selected, setSelected] = useState<CmsMembershipApplication | null>(
    null,
  );
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["membership-applications", search, status],
    queryFn: () =>
      api<{ data: CmsMembershipApplication[]; meta: { total: number } }>(
        `/v1/admin/membership/applications?limit=100&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ""}`,
      ),
  });
  const review = useMutation({
    mutationFn: ({
      id,
      decision,
      reviewerNotes,
      rejectionReason,
      expiresAt,
    }: {
      id: string;
      decision: "approve" | "reject";
      reviewerNotes: string;
      rejectionReason?: string;
      expiresAt?: string;
    }) =>
      api(`/v1/admin/membership/applications/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          decision,
          reviewerNotes: reviewerNotes || undefined,
          rejectionReason: rejectionReason || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      }),
    onSuccess: (_, variables) => {
      setError("");
      setSelected(null);
      toast.success(
        variables.decision === "approve"
          ? "Pendaftaran anggota disetujui & KTA Digital berhasil diterbitkan!"
          : "Pendaftaran anggota telah ditolak."
      );
      void client.invalidateQueries({ queryKey: ["membership-applications"] });
      void client.invalidateQueries({ queryKey: ["members"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (reason) => {
      setError(reason.message);
      toast.error(`Gagal memproses pendaftaran: ${reason.message}`);
    },
  });
  const submitReview = (
    form: HTMLFormElement,
    decision: "approve" | "reject",
  ) => {
    if (!selected) return;
    const data = new FormData(form);
    const rejectionReason = String(data.get("rejectionReason") ?? "").trim();
    if (decision === "reject" && !rejectionReason) {
      setError(
        "Add a clear rejection reason before rejecting this application.",
      );
      return;
    }
    setError("");
    review.mutate({
      id: selected.id,
      decision,
      reviewerNotes: String(data.get("reviewerNotes") ?? "").trim(),
      rejectionReason,
      expiresAt: String(data.get("expiresAt") ?? ""),
    });
  };
  const items = query.data?.data ?? [];
  return (
    <>
      <PageHeading
        eyebrow="Member operations"
        title="Applications"
        description="Verify incoming registrations, record a review trail, and issue member numbers and cards in one controlled workflow."
      />
      <div className="inbox-layout applications-layout">
        <section className="table-panel inbox-list">
          <div className="table-toolbar">
            <label className="search-field">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search applicants…"
              />
            </label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setSelected(null);
              }}
            >
              <option value="">All status</option>
              <option value="applicant">Email unverified</option>
              <option value="pending">Pending review</option>
              <option value="active">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="submission-list application-list">
            {items.map((item) => (
              <button
                type="button"
                className={selected?.id === item.id ? "active" : ""}
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  setError("");
                }}
              >
                <span className="submission-dot" data-status={item.status} />
                <span>
                  <strong>{item.member.name}</strong>
                  <small>{item.unitName ?? "No organization unit"}</small>
                  <p>
                    {item.member.email ?? "No email"} · Submitted{" "}
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </p>
                </span>
                <Status value={item.status} />
              </button>
            ))}
          </div>
          {!query.isLoading && !items.length && (
            <Empty message="No membership applications match this view." />
          )}
        </section>
        <section className="panel submission-detail application-detail">
          {selected ? (
            <>
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Application detail</span>
                  <h2>{selected.member.name}</h2>
                  <p>
                    {selected.member.memberNumber} ·{" "}
                    {selected.unitName ?? "Unassigned"}
                  </p>
                </div>
                <Status value={selected.status} />
              </div>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{selected.member.email ?? "—"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selected.member.phone ?? "—"}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{selected.member.address ?? "—"}</dd>
                </div>
                {Object.entries(selected.member.customFields).map(
                  ([key, value]) => (
                    <div key={key}>
                      <dt>{key.replace(/_/g, " ")}</dt>
                      <dd>{String(value || "—")}</dd>
                    </div>
                  ),
                )}
                <div>
                  <dt>Submitted</dt>
                  <dd>{new Date(selected.submittedAt).toLocaleString()}</dd>
                </div>
              </dl>
              {selected.rejectionReason && (
                <div className="review-note rejected-note">
                  <strong>Rejection reason</strong>
                  <p>{selected.rejectionReason}</p>
                </div>
              )}
              {selected.reviewerNotes && (
                <div className="review-note">
                  <strong>Reviewer notes</strong>
                  <p>{selected.reviewerNotes}</p>
                </div>
              )}
              {(selected.status === "pending" ||
                selected.status === "applicant" ||
                selected.status === "rejected") && (
                <form className="review-form">
                  {error && <div className="alert error">{error}</div>}
                  <label>
                    Internal reviewer notes
                    <textarea
                      name="reviewerNotes"
                      rows={3}
                      placeholder="Verification notes, document checks, or follow-up…"
                    />
                  </label>
                  <label>
                    Card expiry date
                    <input
                      name="expiresAt"
                      type="date"
                      defaultValue={new Date(
                        Date.now() + 365 * 24 * 60 * 60 * 1000,
                      )
                        .toISOString()
                        .slice(0, 10)}
                    />
                  </label>
                  <label>
                    Rejection reason
                    <textarea
                      name="rejectionReason"
                      rows={2}
                      placeholder="Required only when rejecting"
                    />
                  </label>
                  <div className="submission-actions">
                    <button
                      type="button"
                      className="button ghost destructive"
                      disabled={review.isPending}
                      onClick={(event) => {
                        const form = event.currentTarget.form;
                        if (form) submitReview(form, "reject");
                      }}
                    >
                      Reject application
                    </button>
                    <button
                      type="button"
                      className="button primary"
                      disabled={review.isPending}
                      onClick={(event) => {
                        const form = event.currentTarget.form;
                        if (form) submitReview(form, "approve");
                      }}
                    >
                      <BadgeCheck size={17} />
                      {review.isPending
                        ? "Processing…"
                        : "Approve & issue card"}
                    </button>
                  </div>
                </form>
              )}
              {selected.status === "active" && (
                <div className="success-callout">
                  <BadgeCheck size={20} />
                  <span>
                    <strong>Membership approved</strong>
                    <small>
                      The member number and active card have been issued.
                    </small>
                  </span>
                </div>
              )}
            </>
          ) : (
            <Empty message="Select an application to review its submitted information." />
          )}
        </section>
      </div>
    </>
  );
}

function KtaCardModal({
  member,
  onClose,
}: {
  member: CmsMember;
  onClose: () => void;
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const cardQuery = useQuery({
    queryKey: ["member-card", member.id],
    queryFn: () =>
      api<{
        data: {
          member: CmsMember & { unitName?: string };
          card: {
            code: string;
            version: number;
            issuedAt: string;
            expiresAt: string | null;
          };
          organization: { name: string; logoUrl: string | null };
        };
      }>(`/v1/admin/membership/members/${member.id}/card`),
  });

  const cardData = cardQuery.data?.data;
  const cardCode = cardData?.card.code ?? `KTA-${member.memberNumber}`;

  useEffect(() => {
    if (!cardCode) return;
    const verifyUrl = `${window.location.origin.replace("5173", "3000")}/verify?code=${encodeURIComponent(cardCode)}`;
    QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then(setQrCodeUrl)
      .catch((err) => console.error(err));
  }, [cardCode]);

  const generateNewCard = async () => {
    if (
      !confirm(
        "Terbitkan kode KTA versi baru untuk anggota ini? Kode lama akan dinonaktifkan.",
      )
    )
      return;
    setIsGenerating(true);
    try {
      await api(`/v1/admin/membership/members/${member.id}/card/generate`, {
        method: "POST",
      });
      toast.success("Kode KTA versi baru berhasil diterbitkan!");
      void cardQuery.refetch();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat kartu KTA baru.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyVerifyLink = () => {
    const verifyUrl = `${window.location.origin.replace("5173", "3000")}/verify?code=${encodeURIComponent(cardCode)}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Link verifikasi KTA disalin ke clipboard!");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content kta-modal-box"
        style={{ maxWidth: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Kartu Tanda Anggota (KTA Digital)</h2>
            <p className="subtext">
              Pratinjau KTA Digital & Kode Verifikasi Resmi {member.name}
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {cardQuery.isLoading ? (
          <div className="portal-loading" style={{ padding: "40px 0" }}>
            Menyiapkan pratinjau KTA...
          </div>
        ) : (
          <div className="kta-card-preview-container">
            {/* Visual KTA Card */}
            <div
              className="kta-card-graphic"
              style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                borderRadius: "16px",
                padding: "24px",
                color: "#ffffff",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                position: "relative",
                overflow: "hidden",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingBottom: "14px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "#F59E0B",
                      color: "#0F172A",
                      fontWeight: 800,
                      display: "grid",
                      placeItems: "center",
                      fontSize: "14px",
                    }}
                  >
                    APTI
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" }}>
                      {cardData?.organization.name ?? "APTI INDONESIA"}
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>
                      Asosiasi Pengusaha & Teknisi Pendingin Indonesia
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#F59E0B",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                  }}
                >
                  KTA DIGITAL RESMI
                </span>
              </div>

              <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    background: "#334155",
                    border: "2px solid #F59E0B",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#F8FAFC",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    member.name.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#FFFFFF" }}>
                    {member.name}
                  </h3>
                  <div style={{ fontSize: "13px", marginTop: "4px", color: "#F59E0B", fontWeight: 600 }}>
                    No. KTA: {cardCode}
                  </div>
                  <div style={{ fontSize: "12px", marginTop: "2px", opacity: 0.8 }}>
                    Unit: {cardData?.member.unitName ?? member.unitName ?? "DPP INDONESIA"}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "6px",
                      background: "rgba(34, 197, 94, 0.15)",
                      color: "#4ADE80",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    <BadgeCheck size={13} /> ANGGOTA AKTIF BERLISENSI
                  </div>
                </div>

                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Verifikasi"
                      style={{ width: "76px", height: "76px", borderRadius: "6px", background: "#FFFFFF", padding: "4px" }}
                    />
                  ) : (
                    <QrCode size={60} />
                  )}
                  <div style={{ fontSize: "9px", opacity: 0.6, marginTop: "2px" }}>Scan Verifikasi</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px dashed rgba(255, 255, 255, 0.15)",
                  fontSize: "11px",
                  opacity: 0.7,
                }}
              >
                <span>Kartu Versi v{cardData?.card.version ?? 1}</span>
                <span>
                  Berlaku s/d:{" "}
                  {cardData?.card.expiresAt
                    ? new Date(cardData.card.expiresAt).toLocaleDateString("id-ID")
                    : "Seumur Hidup / Selama Aktif"}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="button secondary"
                onClick={copyVerifyLink}
              >
                <Copy size={16} /> Salin Link Verifikasi
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={generateNewCard}
                disabled={isGenerating}
              >
                <RefreshCw size={16} className={isGenerating ? "spin" : ""} /> Terbitkan Ulang KTA
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Cetak / Download KTA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KtaVerificationModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const query = useQuery({
    queryKey: ["verify-card", searchCode],
    queryFn: () =>
      api<{
        data: {
          valid: boolean;
          member: {
            id: string;
            name: string;
            memberNumber: string;
            unitName: string | null;
            joinedAt: string | null;
            email?: string;
            phone?: string;
          };
          card: {
            code: string;
            issuedAt: string;
            expiresAt: string | null;
            version: number;
          };
          organization: { name: string };
        };
      }>(`/v1/public/membership/cards/${encodeURIComponent(searchCode)}`),
    enabled: Boolean(searchCode),
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSearchCode(code.trim());
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "560px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Verifikasi Keabsahan Anggota & KTA</h2>
            <p className="subtext">
              Cek status keaktifan KTA digital di database pusat APTI Indonesia
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ marginTop: "16px" }}>
          <div className="form-group" style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masukkan No. KTA (cth: KTA-APTI-DPP-001)..."
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="button primary">
              <Search size={16} /> Cek Status
            </button>
          </div>
        </form>

        {query.isLoading && (
          <div className="portal-loading" style={{ padding: "30px 0" }}>
            Memeriksa registri resmi...
          </div>
        )}

        {query.isError && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "12px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#991B1B",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: 600,
              }}
            >
              <X size={20} /> KTA / Anggota Tidak Ditemukan
            </div>
            <p style={{ marginTop: "6px", fontSize: "14px", color: "#7F1D1D" }}>
              Kode KTA <strong>"{searchCode}"</strong> tidak terdaftar atau sudah dicabut.
            </p>
          </div>
        )}

        {query.data?.data && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "12px",
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#166534",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                fontSize: "17px",
                color: "#15803D",
              }}
            >
              <BadgeCheck size={24} /> KTA RESMI DITEMUKAN & AKTIF
            </div>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "16px",
                fontSize: "14px",
              }}
            >
              <div>
                <dt style={{ fontSize: "11px", color: "#15803D", textTransform: "uppercase" }}>
                  Nama Anggota
                </dt>
                <dd style={{ fontWeight: 700, fontSize: "16px", color: "#0F172A" }}>
                  {query.data.data.member.name}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "11px", color: "#15803D", textTransform: "uppercase" }}>
                  No. KTA / Anggota
                </dt>
                <dd style={{ fontWeight: 700, fontSize: "16px", color: "#0F172A" }}>
                  {query.data.data.member.memberNumber}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "11px", color: "#15803D", textTransform: "uppercase" }}>
                  Unit Organisasi
                </dt>
                <dd style={{ fontWeight: 600, color: "#334155" }}>
                  {query.data.data.member.unitName ?? "DPP INDONESIA"}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "11px", color: "#15803D", textTransform: "uppercase" }}>
                  Kode KTA Card
                </dt>
                <dd style={{ fontWeight: 600, color: "#334155" }}>
                  {query.data.data.card.code}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function MembersManager() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<CmsMember | "new" | null>(null);
  const [selectedCardMember, setSelectedCardMember] = useState<CmsMember | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const query = useQuery({
    queryKey: ["members", search],
    queryFn: () =>
      api<{ data: CmsMember[] }>(
        `/v1/admin/members?limit=100&search=${encodeURIComponent(search)}`,
      ),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/members/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["members"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Anggota berhasil dihapus.");
    },
  });

  if (editor === "new") return <MemberEditor onClose={() => setEditor(null)} />;
  if (editor)
    return <MemberEditor member={editor} onClose={() => setEditor(null)} />;

  return (
    <>
      {selectedCardMember && (
        <KtaCardModal
          member={selectedCardMember}
          onClose={() => setSelectedCardMember(null)}
        />
      )}
      {showVerifyModal && (
        <KtaVerificationModal onClose={() => setShowVerifyModal(false)} />
      )}

      <PageHeading
        eyebrow="Community"
        title="Members & KTA"
        description="Manage members, generate KTA digital cards, verify credentials, and manage regional units."
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="button secondary"
              onClick={() => setShowVerifyModal(true)}
            >
              <BadgeCheck size={18} /> Verifikasi KTA
            </button>
            <button
              type="button"
              className="button primary"
              onClick={() => setEditor("new")}
            >
              <Plus size={18} /> Add member
            </button>
          </div>
        }
      />
      <div className="table-panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or KTA number…"
            />
          </label>
          <span className="result-count">
            {query.data?.data.length ?? 0} members
          </span>
        </div>
        <div className="data-table">
          <div className="table-row members-row table-head">
            <span>Member</span>
            <span>Unit</span>
            <span>Status</span>
            <span />
          </div>
          {query.data?.data.map((item) => (
            <div className="table-row members-row" key={item.id}>
              <span className="primary-cell">
                <span className="member-avatar">
                  {item.name.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.memberNumber} · {item.email ?? "No email"}
                  </small>
                </span>
              </span>
              <span className="muted">{item.unitName ?? "Unassigned"}</span>
              <span>
                <Status value={item.status} />
                {item.isPublic && (
                  <small className="block-muted">Public profile</small>
                )}
              </span>
              <span className="row-actions">
                <button
                  type="button"
                  className="button secondary text-button"
                  style={{ padding: "4px 8px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={() => setSelectedCardMember(item)}
                >
                  <CreditCard size={14} /> Kartu KTA
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setEditor(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  aria-label={`Delete ${item.name}`}
                  onClick={() =>
                    confirm(`Delete ${item.name}?`) && remove.mutate(item.id)
                  }
                >
                  <X size={17} />
                </button>
              </span>
            </div>
          ))}
        </div>
        {!query.isLoading && !query.data?.data.length && (
          <Empty message="No members match this view." />
        )}
      </div>
    </>
  );
}

function MemberEditor({
  member,
  onClose,
}: {
  member?: CmsMember;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [error, setError] = useState("");
  const units = useQuery({
    queryKey: ["organization-units"],
    queryFn: () => api<{ data: CmsUnit[] }>("/v1/admin/organization-units"),
  });
  const save = useMutation({
    mutationFn: (form: HTMLFormElement) => {
      const data = new FormData(form);
      const value = (key: string) => String(data.get(key) ?? "").trim();
      let customFields: Record<string, unknown> = {};
      let socialLinks: Array<{ platform: string; url: string }> = [];
      try {
        customFields = JSON.parse(value("customFields") || "{}");
        socialLinks = JSON.parse(value("socialLinks") || "[]");
      } catch {
        throw new Error(
          "Custom fields and social links must contain valid JSON.",
        );
      }
      return api(
        member ? `/v1/admin/members/${member.id}` : "/v1/admin/members",
        {
          method: member ? "PATCH" : "POST",
          body: JSON.stringify({
            memberNumber: value("memberNumber"),
            name: value("name"),
            email: value("email") || null,
            phone: value("phone") || null,
            unitId: value("unitId") || null,
            address: value("address") || null,
            biography: value("biography") || null,
            joinedAt: value("joinedAt")
              ? new Date(value("joinedAt")).toISOString()
              : null,
            status: value("status"),
            isPublic: data.get("isPublic") === "on",
            customFields,
            socialLinks,
          }),
        },
      );
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["members"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (reason) => setError(reason.message),
  });
  const submit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setError("");
    save.mutate(submitEvent.currentTarget);
  };
  return (
    <>
      <PageHeading
        eyebrow="Member editor"
        title={member ? "Edit member" : "Add a member"}
        description="Custom fields make this profile adaptable to any organization sector."
        action={
          <button type="button" className="button ghost" onClick={onClose}>
            ← Back to members
          </button>
        }
      />
      {error && <div className="alert error">{error}</div>}
      <form className="panel entity-form" onSubmit={submit}>
        <label>
          Full name
          <input
            name="name"
            required
            minLength={2}
            defaultValue={member?.name}
          />
        </label>
        <label>
          Member number
          <input
            name="memberNumber"
            required
            defaultValue={member?.memberNumber}
          />
        </label>
        <label>
          Email
          <input name="email" type="email" defaultValue={member?.email ?? ""} />
        </label>
        <label>
          Phone
          <input name="phone" defaultValue={member?.phone ?? ""} />
        </label>
        <label>
          Organization unit
          <select name="unitId" defaultValue={member?.unitId ?? ""}>
            <option value="">Unassigned</option>
            {units.data?.data.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} · {unit.type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Joined date
          <input
            name="joinedAt"
            type="date"
            defaultValue={dateInput(member?.joinedAt)}
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={member?.status ?? "applicant"}>
            <option value="applicant">Applicant</option>
            <option value="pending">Pending review</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label className="check-field">
          <input
            name="isPublic"
            type="checkbox"
            defaultChecked={member?.isPublic}
          />
          <span>Show this member in the public directory</span>
        </label>
        <label className="full">
          Address
          <input name="address" defaultValue={member?.address ?? ""} />
        </label>
        <label className="full">
          Biography
          <textarea
            name="biography"
            rows={4}
            defaultValue={member?.biography ?? ""}
          />
        </label>
        <label className="full">
          Custom fields (JSON)
          <textarea
            className="code-field"
            name="customFields"
            rows={5}
            defaultValue={JSON.stringify(member?.customFields ?? {}, null, 2)}
          />
          <small>
            Store sector-specific fields without changing the database schema.
          </small>
        </label>
        <label className="full">
          Social links (JSON)
          <textarea
            className="code-field"
            name="socialLinks"
            rows={4}
            defaultValue={JSON.stringify(member?.socialLinks ?? [], null, 2)}
          />
        </label>
        <div className="form-actions full">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={save.isPending}
          >
            <Save size={17} /> {save.isPending ? "Saving…" : "Save member"}
          </button>
        </div>
      </form>
    </>
  );
}

function InboxManager() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<CmsSubmission | null>(null);
  const query = useQuery({
    queryKey: ["submissions", search, status],
    queryFn: () =>
      api<{ data: CmsSubmission[] }>(
        `/v1/admin/submissions?limit=100&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ""}`,
      ),
  });
  const update = useMutation({
    mutationFn: ({
      id,
      nextStatus,
    }: {
      id: string;
      nextStatus: CmsSubmission["status"];
    }) =>
      api<{ data: CmsSubmission }>(`/v1/admin/submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      }),
    onSuccess: (result) => {
      setSelected((current) =>
        current ? { ...current, ...result.data } : null,
      );
      void client.invalidateQueries({ queryKey: ["submissions"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const items = query.data?.data ?? [];
  return (
    <>
      <PageHeading
        eyebrow="Conversations"
        title="Inbox"
        description="Review contact messages, applications, and form submissions as a shared workflow."
      />
      <div className="inbox-layout">
        <section className="table-panel inbox-list">
          <div className="table-toolbar">
            <label className="search-field">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search submissions…"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All status</option>
              <option value="new">New</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="spam">Spam</option>
            </select>
          </div>
          <div className="submission-list">
            {items.map((item) => (
              <button
                type="button"
                className={selected?.id === item.id ? "active" : ""}
                key={item.id}
                onClick={() => setSelected(item)}
              >
                <span className="submission-dot" data-status={item.status} />
                <span>
                  <strong>{submissionTitle(item)}</strong>
                  <small>
                    {item.formName} ·{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </small>
                  <p>{submissionPreview(item)}</p>
                </span>
                <Status value={item.status} />
              </button>
            ))}
          </div>
          {!query.isLoading && !items.length && (
            <Empty message="No submissions match this view." />
          )}
        </section>
        <section className="panel submission-detail">
          {selected ? (
            <>
              <div className="panel-head">
                <div>
                  <span className="eyebrow">{selected.formName}</span>
                  <h2>{submissionTitle(selected)}</h2>
                  <p>
                    Received {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <Status value={selected.status} />
              </div>
              <dl>
                {Object.entries(selected.payload).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replace(/_/g, " ")}</dt>
                    <dd>
                      {typeof value === "string"
                        ? value
                        : JSON.stringify(value)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="submission-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() =>
                    update.mutate({ id: selected.id, nextStatus: "spam" })
                  }
                >
                  Mark spam
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    update.mutate({
                      id: selected.id,
                      nextStatus: "in_progress",
                    })
                  }
                >
                  Take ownership
                </button>
                <button
                  type="button"
                  className="button primary"
                  onClick={() =>
                    update.mutate({ id: selected.id, nextStatus: "resolved" })
                  }
                >
                  Resolve
                </button>
              </div>
            </>
          ) : (
            <Empty message="Select a submission to see its full details." />
          )}
        </section>
      </div>
    </>
  );
}

function submissionTitle(item: CmsSubmission) {
  const name =
    item.payload.name ?? item.payload.full_name ?? item.payload.email;
  return typeof name === "string" ? name : "Anonymous submission";
}

function submissionPreview(item: CmsSubmission) {
  const message = item.payload.message ?? item.payload.description;
  return typeof message === "string"
    ? message.slice(0, 110)
    : "Open to view submitted fields";
}

function dateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function dateInput(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

const defaultTheme: Theme = {
  colors: {
    primary: "#3b5bdb",
    secondary: "#182230",
    accent: "#f97066",
    surface: "#f8fafc",
    foreground: "#101828",
  },
  radius: "large",
  fontHeading: "Manrope",
  fontBody: "Inter",
};

const themePresets: Array<{ name: string; description: string; theme: Theme }> =
  [
    {
      name: "Clear momentum",
      description: "Royal blue, graphite, and a precise coral accent",
      theme: defaultTheme,
    },
    {
      name: "Indigo studio",
      description: "Calm, creative, and contemporary",
      theme: {
        ...defaultTheme,
        colors: {
          primary: "#5b5bd6",
          secondary: "#24213d",
          accent: "#f59e0b",
          surface: "#fafafc",
          foreground: "#17151f",
        },
      },
    },
    {
      name: "Coral editorial",
      description: "Warm, confident, and content-focused",
      theme: {
        ...defaultTheme,
        colors: {
          primary: "#e5484d",
          secondary: "#1f2937",
          accent: "#6366f1",
          surface: "#fff9f7",
          foreground: "#18181b",
        },
      },
    },
  ];

function Appearance() {
  const organization = useQuery({
    queryKey: ["organization-theme"],
    queryFn: () => api<{ data: CmsOrganization }>("/v1/admin/organization"),
  });
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  useEffect(() => {
    if (organization.data?.data.theme) setTheme(organization.data.data.theme);
  }, [organization.data]);
  const [saved, setSaved] = useState(false);
  const save = useMutation({
    mutationFn: () =>
      api("/v1/admin/organization", {
        method: "PATCH",
        body: JSON.stringify({ theme }),
      }),
    onSuccess: () => {
      void organization.refetch();
      setSaved(true);
      toast.success("Pengaturan tampilan & warna berhasil disimpan secara permanen!");
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => {
      toast.error(`Gagal menyimpan tampilan: ${err.message}`);
    },
  });
  const colorFields: Array<{
    key: keyof Theme["colors"];
    label: string;
    hint: string;
  }> = [
    {
      key: "primary",
      label: "Primary",
      hint: "Buttons, links, and key actions",
    },
    {
      key: "secondary",
      label: "Secondary",
      hint: "Hero gradients and deep contrast",
    },
    { key: "accent", label: "Accent", hint: "Highlights that add energy" },
    { key: "surface", label: "Surface", hint: "Soft section backgrounds" },
    { key: "foreground", label: "Foreground", hint: "Headings and body text" },
  ];
  return (
    <>
      <PageHeading
        eyebrow="Design system"
        title="Brand & theme"
        description="A small set of choices updates every page, component, and screen size."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => save.mutate()}
          >
            <Save size={17} /> {saved ? "Saved" : "Save changes"}
          </button>
        }
      />
      <div className="appearance-grid">
        <section className="panel form-panel">
          <h2>Curated palettes</h2>
          <p>
            Start with an accessible combination, then make every token yours.
          </p>
          <div className="palette-presets">
            {themePresets.map((preset) => (
              <button
                type="button"
                key={preset.name}
                onClick={() => setTheme(preset.theme)}
              >
                <span className="palette-swatches">
                  {Object.values(preset.theme.colors).map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </span>
                <strong>{preset.name}</strong>
                <small>{preset.description}</small>
              </button>
            ))}
          </div>
          <h2>Brand colors</h2>
          <p>
            Every value is stored per organization and applied to the public
            site.
          </p>
          {colorFields.map((field) => (
            <label className="color-field" key={field.key}>
              <span>
                {field.label}
                <small>{field.hint}</small>
              </span>
              <span>
                <input
                  type="color"
                  value={theme.colors[field.key]}
                  onChange={(event) =>
                    setTheme((current) => ({
                      ...current,
                      colors: {
                        ...current.colors,
                        [field.key]: event.target.value,
                      },
                    }))
                  }
                />
                <input
                  className="hex-input"
                  value={theme.colors[field.key]}
                  pattern="#[0-9a-fA-F]{6}"
                  aria-label={`${field.label} hex color`}
                  onChange={(event) =>
                    setTheme((current) => ({
                      ...current,
                      colors: {
                        ...current.colors,
                        [field.key]: event.target.value,
                      },
                    }))
                  }
                />
              </span>
            </label>
          ))}
          <div className="theme-controls">
            <label>
              Heading font
              <select
                value={theme.fontHeading}
                onChange={(event) =>
                  setTheme((current) => ({
                    ...current,
                    fontHeading: event.target.value,
                  }))
                }
              >
                <option>Manrope</option>
                <option>Inter</option>
                <option>DM Sans</option>
                <option>Georgia</option>
              </select>
            </label>
            <label>
              Body font
              <select
                value={theme.fontBody}
                onChange={(event) =>
                  setTheme((current) => ({
                    ...current,
                    fontBody: event.target.value,
                  }))
                }
              >
                <option>Inter</option>
                <option>DM Sans</option>
                <option>Arial</option>
                <option>Georgia</option>
              </select>
            </label>
            <label>
              Corner style
              <select
                value={theme.radius}
                onChange={(event) =>
                  setTheme((current) => ({
                    ...current,
                    radius: event.target.value as Theme["radius"],
                  }))
                }
              >
                <option value="none">Square</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="pill">Pill</option>
              </select>
            </label>
          </div>
        </section>
        <section
          className="theme-preview"
          style={
            {
              "--preview-primary": theme.colors.primary,
              "--preview-secondary": theme.colors.secondary,
              "--preview-accent": theme.colors.accent,
              "--preview-surface": theme.colors.surface,
              "--preview-foreground": theme.colors.foreground,
              "--preview-radius":
                theme.radius === "pill"
                  ? "999px"
                  : theme.radius === "large"
                    ? "18px"
                    : theme.radius === "medium"
                      ? "12px"
                      : theme.radius === "small"
                        ? "6px"
                        : "0px",
              "--preview-heading": theme.fontHeading,
              "--preview-body": theme.fontBody,
            } as CSSProperties
          }
        >
          <div className="preview-nav">
            <span className="preview-logo" />
            <i />
            <i />
            <button type="button">Join us</button>
          </div>
          <div className="preview-hero">
            <small>TOGETHER, WE CAN</small>
            <h2>A stronger community starts here.</h2>
            <p>
              Build trust, share your mission, and turn visitors into active
              supporters.
            </p>
            <button type="button">Discover our work</button>
          </div>
          <div className="preview-cards">
            <span />
            <span />
            <span />
          </div>
        </section>
      </div>
    </>
  );
}

const defaultPublicSettings: CmsPublicSettings = {
  footer: { description: "", copyright: "", links: [] },
  announcement: {
    enabled: false,
    eyebrow: "Announcement",
    title: "",
    message: "",
    imageUrl: null,
    actionLabel: "Learn more",
    actionUrl: "/",
    startsAt: null,
    endsAt: null,
  },
  quickContact: {
    enabled: false,
    label: "Contact us",
    href: "/contact",
    channel: "message",
  },
};

type OrganizationProfile = Pick<
  CmsOrganization,
  | "name"
  | "tagline"
  | "description"
  | "logoUrl"
  | "faviconUrl"
  | "email"
  | "phone"
  | "address"
  | "locale"
  | "timezone"
>;

const emptyProfile: OrganizationProfile = {
  name: "",
  tagline: null,
  description: null,
  logoUrl: null,
  faviconUrl: null,
  email: null,
  phone: null,
  address: null,
  locale: "id-ID",
  timezone: "Asia/Jakarta",
};

function SettingsManager() {
  const client = useQueryClient();
  const organization = useQuery({
    queryKey: ["organization-settings"],
    queryFn: () => api<{ data: CmsOrganization }>("/v1/admin/organization"),
  });
  const publicSettings = useQuery({
    queryKey: ["public-settings"],
    queryFn: () =>
      api<{ data: CmsPublicSettings }>("/v1/admin/settings/public"),
  });
  const [profile, setProfile] = useState<OrganizationProfile>(emptyProfile);
  const [settings, setSettings] = useState<CmsPublicSettings>(
    defaultPublicSettings,
  );
  const [footerLinks, setFooterLinks] = useState("[]");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!organization.data?.data) return;
    const data = organization.data.data;
    setProfile({
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      logoUrl: data.logoUrl,
      faviconUrl: data.faviconUrl,
      email: data.email,
      phone: data.phone,
      address: data.address,
      locale: data.locale,
      timezone: data.timezone,
    });
  }, [organization.data]);

  useEffect(() => {
    if (!publicSettings.data?.data) return;
    const data = publicSettings.data.data;
    const safeSettings: CmsPublicSettings = {
      ...defaultPublicSettings,
      ...data,
      quickContact: {
        ...defaultPublicSettings.quickContact,
        ...(data.quickContact ?? {}),
      },
      announcement: {
        ...defaultPublicSettings.announcement,
        ...(data.announcement ?? {}),
      },
      footer: {
        ...defaultPublicSettings.footer,
        ...(data.footer ?? {}),
        links: data.footer?.links ?? defaultPublicSettings.footer.links,
      },
    };
    setSettings(safeSettings);
    setFooterLinks(
      JSON.stringify(safeSettings.footer.links, null, 2),
    );
  }, [publicSettings.data]);

  const save = useMutation({
    mutationFn: async (nextSettings: CmsPublicSettings) =>
      Promise.all([
        api("/v1/admin/organization", {
          method: "PATCH",
          body: JSON.stringify(profile),
        }),
        api("/v1/admin/settings/public", {
          method: "PATCH",
          body: JSON.stringify(nextSettings),
        }),
      ]),
    onSuccess: () => {
      setMessage("Saved. Public pages will use these settings automatically.");
      toast.success("Pengaturan website, kontak & footer berhasil disimpan!");
      void client.invalidateQueries({ queryKey: ["organization-settings"] });
      void client.invalidateQueries({ queryKey: ["public-settings"] });
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (reason) => {
      setMessage(reason.message);
      toast.error(`Gagal menyimpan pengaturan: ${reason.message}`);
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    try {
      const parsed = JSON.parse(footerLinks);
      if (!Array.isArray(parsed)) throw new Error();
      const next = {
        ...settings,
        footer: { ...settings.footer, links: parsed },
      } as CmsPublicSettings;
      setSettings(next);
      save.mutate(next);
    } catch {
      setMessage("Footer links must be a valid JSON array.");
    }
  };

  if (organization.isLoading || publicSettings.isLoading)
    return <PageLoading />;

  return (
    <form onSubmit={submit}>
      <PageHeading
        eyebrow="Workspace configuration"
        title="Settings"
        description="Manage public identity, quick contact, campaign announcements, and footer content without code changes."
        action={
          <button
            type="submit"
            className="button primary"
            disabled={save.isPending}
          >
            <Save size={17} /> {save.isPending ? "Saving…" : "Save settings"}
          </button>
        }
      />
      {message && (
        <div className={save.isError ? "alert error" : "alert success"}>
          {message}
        </div>
      )}
      <div className="settings-grid">
        <section className="panel settings-panel">
          <span className="eyebrow">Public identity</span>
          <h2>Organization profile</h2>
          <p>These details are shared by the API and public website.</p>
          <div className="entity-form compact-form">
            <label>
              Organization name
              <input
                required
                minLength={2}
                value={profile.name}
                onChange={(event) =>
                  setProfile({ ...profile, name: event.target.value })
                }
              />
            </label>
            <label>
              Tagline
              <input
                value={profile.tagline ?? ""}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    tagline: event.target.value || null,
                  })
                }
              />
            </label>
            <label>
              Public email
              <input
                type="email"
                value={profile.email ?? ""}
                onChange={(event) =>
                  setProfile({ ...profile, email: event.target.value || null })
                }
              />
            </label>
            <label>
              Phone
              <input
                value={profile.phone ?? ""}
                onChange={(event) =>
                  setProfile({ ...profile, phone: event.target.value || null })
                }
              />
            </label>
            <label className="full-span">
              Description
              <textarea
                rows={4}
                value={profile.description ?? ""}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    description: event.target.value || null,
                  })
                }
              />
            </label>
            <label className="full-span">
              Address
              <textarea
                rows={2}
                value={profile.address ?? ""}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    address: event.target.value || null,
                  })
                }
              />
            </label>
            <label>
              Logo URL
              <input
                type="url"
                value={profile.logoUrl ?? ""}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    logoUrl: event.target.value || null,
                  })
                }
              />
            </label>
            <label>
              Favicon URL
              <input
                type="url"
                value={profile.faviconUrl ?? ""}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    faviconUrl: event.target.value || null,
                  })
                }
              />
            </label>
            <label>
              Locale
              <input
                value={profile.locale}
                onChange={(event) =>
                  setProfile({ ...profile, locale: event.target.value })
                }
              />
            </label>
            <label>
              Timezone
              <input
                value={profile.timezone}
                onChange={(event) =>
                  setProfile({ ...profile, timezone: event.target.value })
                }
              />
            </label>
          </div>
        </section>

        <section className="panel settings-panel">
          <span className="eyebrow">Always available</span>
          <h2>Quick contact</h2>
          <p>Add a floating message, WhatsApp, or email action.</p>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.quickContact.enabled}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  quickContact: {
                    ...settings.quickContact,
                    enabled: event.target.checked,
                  },
                })
              }
            />
            Show quick contact on public pages
          </label>
          <div className="entity-form compact-form">
            <label>
              Button label
              <input
                value={settings.quickContact.label}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    quickContact: {
                      ...settings.quickContact,
                      label: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Channel
              <select
                value={settings.quickContact.channel}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    quickContact: {
                      ...settings.quickContact,
                      channel: event.target.value as
                        | "message"
                        | "whatsapp"
                        | "email",
                    },
                  })
                }
              >
                <option value="message">Message</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </label>
            <label className="full-span">
              Destination URL
              <input
                required
                value={settings.quickContact.href}
                placeholder="/contact or https://wa.me/..."
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    quickContact: {
                      ...settings.quickContact,
                      href: event.target.value,
                    },
                  })
                }
              />
            </label>
          </div>
        </section>

        <section className="panel settings-panel wide-panel">
          <span className="eyebrow">Campaign layer</span>
          <h2>Scheduled announcement</h2>
          <p>
            Inspired by the Asisi campaign popup, but reusable for any
            celebration, registration drive, appeal, or urgent update.
          </p>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.announcement.enabled}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  announcement: {
                    ...settings.announcement,
                    enabled: event.target.checked,
                  },
                })
              }
            />
            Show announcement while its schedule is active
          </label>
          <div className="entity-form compact-form">
            <label>
              Eyebrow
              <input
                value={settings.announcement.eyebrow}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      eyebrow: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Title
              <input
                value={settings.announcement.title}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      title: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label className="full-span">
              Message
              <textarea
                rows={3}
                value={settings.announcement.message}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      message: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Action label
              <input
                value={settings.announcement.actionLabel}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      actionLabel: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Action URL
              <input
                value={settings.announcement.actionUrl}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      actionUrl: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label className="full-span">
              Image URL (optional)
              <input
                type="url"
                value={settings.announcement.imageUrl ?? ""}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      imageUrl: event.target.value || null,
                    },
                  })
                }
              />
            </label>
            <label>
              Starts at (optional)
              <input
                type="datetime-local"
                value={dateTimeInput(settings.announcement.startsAt)}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      startsAt: event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null,
                    },
                  })
                }
              />
            </label>
            <label>
              Ends at (optional)
              <input
                type="datetime-local"
                value={dateTimeInput(settings.announcement.endsAt)}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      endsAt: event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null,
                    },
                  })
                }
              />
            </label>
          </div>
        </section>

        <section className="panel settings-panel wide-panel">
          <span className="eyebrow">Site footer</span>
          <h2>Footer content and links</h2>
          <div className="entity-form compact-form">
            <label>
              Description
              <textarea
                rows={3}
                value={settings.footer.description ?? ""}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      description: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Copyright
              <textarea
                rows={3}
                value={settings.footer.copyright ?? ""}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      copyright: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label className="full-span">
              Links (JSON)
              <textarea
                className="code-input"
                rows={8}
                value={footerLinks}
                onChange={(event) => setFooterLinks(event.target.value)}
              />
            </label>
          </div>
        </section>
      </div>
    </form>
  );
}

type RevenueDialog =
  | "product"
  | "invoice"
  | "payment"
  | "segment"
  | "campaign"
  | null;

function RevenueManager() {
  const client = useQueryClient();
  const [tab, setTab] = useState<"billing" | "engagement">("billing");
  const [dialog, setDialog] = useState<RevenueDialog>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["revenue-overview"],
    queryFn: () => api<{ data: CmsRevenueData }>("/v1/admin/revenue/overview"),
  });
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["revenue-overview"] });
  const action = useMutation({
    mutationFn: ({ path, body }: { path: string; body: unknown }) =>
      api(path, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      setDialog(null);
      setError("");
      void refresh();
    },
    onError: (reason) =>
      setError(reason instanceof Error ? reason.message : "The action failed."),
  });
  if (query.isLoading) return <PageLoading />;
  const data = query.data?.data;
  if (!data) return <Empty message="Revenue data is unavailable." />;
  const outstanding = data.invoices.reduce(
    (sum, invoice) => sum + Math.max(0, invoice.total - invoice.paid),
    0,
  );
  const collected = data.invoices.reduce(
    (sum, invoice) => sum + invoice.paid,
    0,
  );
  const activeBenefits = data.entitlements.filter(
    (item) =>
      item.status === "active" &&
      (!item.endsAt || new Date(item.endsAt) > new Date()),
  ).length;
  const openPayment = (id: string) => {
    setSelectedInvoice(id);
    setDialog("payment");
    setError("");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    if (dialog === "product")
      action.mutate({
        path: "/v1/admin/revenue/products",
        body: {
          code: String(form.get("code")),
          name: String(form.get("name")),
          description: String(form.get("description") || "") || null,
          type: String(form.get("type")),
          price: Number(form.get("price")),
          currency: "IDR",
          billingInterval: String(form.get("billingInterval")),
          entitlementKey: String(form.get("entitlementKey") || "") || null,
          entitlementLabel: String(form.get("entitlementLabel") || "") || null,
          entitlementDurationMonths: form.get("entitlementDurationMonths")
            ? Number(form.get("entitlementDurationMonths"))
            : null,
        },
      });
    if (dialog === "invoice")
      action.mutate({
        path: "/v1/admin/revenue/invoices",
        body: {
          memberId: String(form.get("memberId")),
          productId: String(form.get("productId")),
          quantity: Number(form.get("quantity")),
          dueAt: form.get("dueAt")
            ? new Date(String(form.get("dueAt"))).toISOString()
            : null,
          notes: String(form.get("notes") || "") || null,
        },
      });
    if (dialog === "payment" && selectedInvoice)
      action.mutate({
        path: `/v1/admin/revenue/invoices/${selectedInvoice}/payments`,
        body: {
          amount: Number(form.get("amount")),
          method: String(form.get("method")),
          reference: String(form.get("reference") || "") || null,
        },
      });
    if (dialog === "segment")
      action.mutate({
        path: "/v1/admin/revenue/segments",
        body: {
          name: String(form.get("name")),
          description: String(form.get("description") || "") || null,
          criteria: {
            membershipStatuses: form.get("membershipStatus")
              ? [String(form.get("membershipStatus"))]
              : undefined,
            membershipTypes: form.get("membershipType")
              ? [String(form.get("membershipType"))]
              : undefined,
            hasEntitlement:
              String(form.get("hasEntitlement") || "") || undefined,
          },
        },
      });
    if (dialog === "campaign")
      action.mutate({
        path: "/v1/admin/revenue/campaigns",
        body: {
          segmentId: String(form.get("segmentId")),
          name: String(form.get("name")),
          channel: String(form.get("channel")),
          subject: String(form.get("subject") || "") || null,
          message: String(form.get("message")),
        },
      });
  };
  return (
    <>
      <PageHeading
        eyebrow="Revenue & Engagement Hub"
        title="From dues to durable relationships"
        description="Issue auditable invoices, reconcile payments, unlock benefits, and prepare precisely segmented outreach."
        action={
          <div className="heading-actions">
            <button
              className="button secondary"
              type="button"
              onClick={() =>
                setDialog(tab === "billing" ? "product" : "segment")
              }
            >
              <Plus size={17} />{" "}
              {tab === "billing" ? "New product" : "New segment"}
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() =>
                setDialog(tab === "billing" ? "invoice" : "campaign")
              }
            >
              <Plus size={17} />{" "}
              {tab === "billing" ? "Issue invoice" : "New campaign"}
            </button>
          </div>
        }
      />
      <div className="revenue-tabs" role="tablist">
        <button
          type="button"
          className={tab === "billing" ? "active" : ""}
          onClick={() => setTab("billing")}
        >
          Billing & benefits
        </button>
        <button
          type="button"
          className={tab === "engagement" ? "active" : ""}
          onClick={() => setTab("engagement")}
        >
          Segments & campaigns
        </button>
      </div>
      {tab === "billing" ? (
        <>
          <div className="governance-stats revenue-stats">
            <article>
              <span>Outstanding</span>
              <strong>{formatRevenueMoney(outstanding)}</strong>
              <small>
                {
                  data.invoices.filter((item) =>
                    ["open", "overdue"].includes(item.effectiveStatus),
                  ).length
                }{" "}
                invoice(s) need action
              </small>
            </article>
            <article>
              <span>Collected</span>
              <strong>{formatRevenueMoney(collected)}</strong>
              <small>Confirmed ledger payments</small>
            </article>
            <article>
              <span>Active benefits</span>
              <strong>{activeBenefits}</strong>
              <small>Issued automatically after payment</small>
            </article>
          </div>
          <div className="revenue-layout">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <span>Receivables</span>
                  <h3>Invoice ledger</h3>
                </div>
              </div>
              <div className="revenue-invoices">
                {data.invoices.map((invoice) => (
                  <article key={invoice.id}>
                    <div>
                      <Status value={invoice.effectiveStatus} />
                      <strong>{invoice.invoiceNumber}</strong>
                      <span>
                        {invoice.member.name} · {invoice.member.memberNumber}
                      </span>
                    </div>
                    <div>
                      <strong>{formatRevenueMoney(invoice.total)}</strong>
                      <span>Paid {formatRevenueMoney(invoice.paid)}</span>
                    </div>
                    {invoice.status === "open" && (
                      <button
                        className="button small secondary"
                        type="button"
                        onClick={() => openPayment(invoice.id)}
                      >
                        Record payment
                      </button>
                    )}
                  </article>
                ))}
                {!data.invoices.length && (
                  <Empty message="Issue the first invoice to start the receivables ledger." />
                )}
              </div>
            </section>
            <section className="panel revenue-products">
              <div className="panel-head">
                <div>
                  <span>Reusable catalog</span>
                  <h3>Products & benefit rules</h3>
                </div>
              </div>
              {data.products.map((product) => (
                <article key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>
                      {product.code} ·{" "}
                      {product.billingInterval.replace("_", " ")}
                    </span>
                  </div>
                  <b>{formatRevenueMoney(product.price)}</b>
                  {product.entitlementLabel && (
                    <small>Unlocks {product.entitlementLabel}</small>
                  )}
                </article>
              ))}
            </section>
          </div>
        </>
      ) : (
        <div className="revenue-layout engagement-layout">
          <section className="panel">
            <div className="panel-head">
              <div>
                <span>Dynamic rules</span>
                <h3>Audience segments</h3>
              </div>
            </div>
            <div className="segment-list">
              {data.segments.map((segment) => (
                <article key={segment.id}>
                  <span className="segment-icon">
                    <Users size={18} />
                  </span>
                  <div>
                    <strong>{segment.name}</strong>
                    <p>{segment.description || "Reusable member audience"}</p>
                    <small>
                      {[
                        ...(segment.criteria.membershipStatuses || []),
                        ...(segment.criteria.membershipTypes || []),
                        segment.criteria.hasEntitlement,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "All members"}
                    </small>
                  </div>
                </article>
              ))}
              {!data.segments.length && (
                <Empty message="Create a segment from membership status, type, unit, or active benefit." />
              )}
            </div>
          </section>
          <section className="panel">
            <div className="panel-head">
              <div>
                <span>Delivery workspace</span>
                <h3>Campaign queue</h3>
              </div>
            </div>
            <div className="campaign-list">
              {data.campaigns.map((campaign) => (
                <article key={campaign.id}>
                  <div>
                    <Status value={campaign.status} />
                    <strong>{campaign.name}</strong>
                    <span>
                      {campaign.channel} · {campaign.recipientCount}{" "}
                      recipient(s)
                    </span>
                  </div>
                  {["draft", "scheduled"].includes(campaign.status) && (
                    <button
                      className="button small secondary"
                      type="button"
                      disabled={action.isPending}
                      onClick={() =>
                        action.mutate({
                          path: `/v1/admin/revenue/campaigns/${campaign.id}/queue`,
                          body: {},
                        })
                      }
                    >
                      Prepare queue
                    </button>
                  )}
                </article>
              ))}
              {!data.campaigns.length && (
                <Empty message="Create a campaign and materialize its recipient queue." />
              )}
            </div>
            <p className="delivery-note">
              <ShieldCheck size={16} /> Queued means ready for an external
              email, WhatsApp, SMS, or in-app adapter—not falsely marked as
              delivered.
            </p>
          </section>
        </div>
      )}
      {dialog && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal revenue-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close"
              type="button"
              onClick={() => setDialog(null)}
            >
              <X size={19} />
            </button>
            <div className="modal-title">
              <span>{dialog === "payment" ? "Reconcile" : "Configure"}</span>
              <h2>
                {
                  (
                    {
                      product: "New revenue product",
                      invoice: "Issue member invoice",
                      payment: "Record confirmed payment",
                      segment: "New audience segment",
                      campaign: "New engagement campaign",
                    } as const
                  )[dialog]
                }
              </h2>
            </div>
            <form className="entity-form revenue-form" onSubmit={submit}>
              {dialog === "product" && (
                <>
                  <label>
                    Code
                    <input name="code" required placeholder="PRO-ANNUAL" />
                  </label>
                  <label>
                    Product name
                    <input name="name" required />
                  </label>
                  <label>
                    Type
                    <select name="type">
                      <option value="membership_dues">Membership dues</option>
                      <option value="event_ticket">Event ticket</option>
                      <option value="service">Service</option>
                      <option value="donation">Donation</option>
                      <option value="sponsorship">Sponsorship</option>
                    </select>
                  </label>
                  <label>
                    Price (IDR)
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                  </label>
                  <label>
                    Billing interval
                    <select name="billingInterval">
                      <option value="annual">Annual</option>
                      <option value="one_time">One time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </label>
                  <label>
                    Benefit key
                    <input
                      name="entitlementKey"
                      placeholder="member-benefits"
                    />
                  </label>
                  <label>
                    Benefit label
                    <input
                      name="entitlementLabel"
                      placeholder="Member Benefit Access"
                    />
                  </label>
                  <label>
                    Benefit duration (months)
                    <input
                      name="entitlementDurationMonths"
                      type="number"
                      min="1"
                    />
                  </label>
                  <label className="full">
                    Description
                    <textarea name="description" />
                  </label>
                </>
              )}
              {dialog === "invoice" && (
                <>
                  <label>
                    Member
                    <select name="memberId" required>
                      {data.members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} · {member.memberNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Product
                    <select name="productId" required>
                      {data.products
                        .filter((product) => product.isActive)
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} · {formatRevenueMoney(product.price)}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Quantity
                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      defaultValue="1"
                      required
                    />
                  </label>
                  <label>
                    Due date
                    <input name="dueAt" type="datetime-local" />
                  </label>
                  <label className="full">
                    Internal note
                    <textarea name="notes" />
                  </label>
                </>
              )}
              {dialog === "payment" && (
                <>
                  <label>
                    Amount (IDR)
                    <input
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </label>
                  <label>
                    Method
                    <select name="method">
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="payment_gateway">Payment gateway</option>
                      <option value="cash">Cash</option>
                      <option value="adjustment">Adjustment</option>
                    </select>
                  </label>
                  <label className="full">
                    Reference
                    <input name="reference" placeholder="BANK-2026-0001" />
                  </label>
                </>
              )}
              {dialog === "segment" && (
                <>
                  <label>
                    Segment name
                    <input name="name" required />
                  </label>
                  <label>
                    Member status
                    <select name="membershipStatus">
                      <option value="">Any status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <label>
                    Membership type
                    <input
                      name="membershipType"
                      placeholder="hvac-professional"
                    />
                  </label>
                  <label>
                    Required benefit key
                    <input
                      name="hasEntitlement"
                      placeholder="member-benefits"
                    />
                  </label>
                  <label className="full">
                    Description
                    <textarea name="description" />
                  </label>
                </>
              )}
              {dialog === "campaign" && (
                <>
                  <label>
                    Campaign name
                    <input name="name" required />
                  </label>
                  <label>
                    Audience segment
                    <select name="segmentId" required>
                      {data.segments.map((segment) => (
                        <option key={segment.id} value={segment.id}>
                          {segment.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Channel
                    <select name="channel">
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                      <option value="in_app">In-app</option>
                    </select>
                  </label>
                  <label>
                    Subject
                    <input name="subject" />
                  </label>
                  <label className="full">
                    Message
                    <textarea name="message" required rows={5} />
                  </label>
                </>
              )}
              {error && <p className="form-error full">{error}</p>}
              <div className="form-actions full">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setDialog(null)}
                >
                  Cancel
                </button>
                <button
                  className="button primary"
                  type="submit"
                  disabled={action.isPending}
                >
                  {action.isPending ? "Saving…" : "Save & continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function formatRevenueMoney(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function Status({ value }: { value: string }) {
  return <span className={`status ${value}`}>{value.replace("_", " ")}</span>;
}
function InboxCount() {
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<{ data: DashboardData }>("/v1/admin/dashboard"),
    staleTime: 30_000,
  });
  const count = dashboard.data?.data.counts.inbox ?? 0;
  return count > 0 ? <b className="count-badge">{count}</b> : null;
}
function ApplicationCount() {
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<{ data: DashboardData }>("/v1/admin/dashboard"),
    staleTime: 30_000,
  });
  const count = dashboard.data?.data.counts.applications ?? 0;
  return count > 0 ? <b className="count-badge">{count}</b> : null;
}
function Empty({ message }: { message: string }) {
  return (
    <div className="empty">
      <span>
        <FileText size={22} />
      </span>
      <p>{message}</p>
    </div>
  );
}
function PageLoading() {
  return (
    <div className="page-loading">
      <span />
      <span />
      <span />
    </div>
  );
}
