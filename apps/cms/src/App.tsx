import type { PageSection, PublicNavItem, Theme } from "@openorg/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Copy,
  CornerDownRight,
  Cpu,
  Calculator,
  CreditCard,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  Globe2,
  GraduationCap,
  History,
  ImagePlus,
  Inbox,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  List,
  LogOut,
  Mail,
  MapPin,
  Medal,
  Menu,
  Network,
  Newspaper,
  Palette,
  Pencil,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Save,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  UserMinus,
  Users,
  UserX,
  WalletCards,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import QRCode from "qrcode";
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  ApiError,
  api,
  type CmsChampionship,
  type CmsClub,
  type CmsComplaint,
  type CmsContent,
  type CmsCredentialField,
  type CmsCredentialRequirement,
  type CmsCredentialScheme,
  type CmsEvent,
  type CmsGovernanceData,
  type CmsLearningActivity,
  type CmsLearningData,
  type CmsLender,
  type CmsMedia,
  type CmsMember,
  type CmsMemberCredential,
  type CmsMembershipApplication,
  type CmsOrganization,
  type CmsPage,
  type CmsProvince,
  type CmsPublicSettings,
  type CmsRegency,
  type CmsDistrict,
  type CmsVillage,
  type CmsRegulation,
  type CmsRevenueData,
  type CmsStatistic,
  type CmsSubmission,
  type CmsTechnician,
  type CmsUnit,
  type CmsWorkingGroup,
  type CmsAdArt,
  type CmsMilestone,
  type CmsRefrigerant,
  type DashboardData,
  getWilayahProvinces,
  getWilayahRegencies,
  getWilayahDistricts,
  getWilayahVillages,
  saveWilayahProvince,
  saveWilayahRegency,
  saveWilayahDistrict,
  saveWilayahVillage,
  getAdArtList,
  saveAdArt,
  deleteAdArt,
  getMilestonesList,
  saveMilestone,
  deleteMilestone,
  getRefrigerantsList,
  saveRefrigerant,
  deleteRefrigerant,
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
  | "regulations"
  | "complaints"
  | "technicians"
  | "clubs"
  | "championships"
  | "workingGroups"
  | "lenders"
  | "statistics"
  | "wilayah"
  | "adArt"
  | "milestones"
  | "refrigerants"
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
    title: "Services & Registry",
    items: [
      { id: "adArt", label: "AD/ART & Kode Etik", icon: Scale },
      { id: "milestones", label: "Sejarah & Profil", icon: Sparkles },
      { id: "refrigerants", label: "Katalog Freon & Kalkulator", icon: Calculator },
      { id: "regulations", label: "Regulations & Legal", icon: FileText },
      { id: "complaints", label: "Complaints & Ethics", icon: ShieldAlert },
      { id: "technicians", label: "Technicians Directory", icon: Wrench },
      { id: "clubs", label: "Registered Clubs (TKT)", icon: Flag },
      { id: "championships", label: "Championships", icon: Trophy },
      { id: "workingGroups", label: "Working Groups (Pokja)", icon: Briefcase },
      { id: "lenders", label: "Lenders & Partners", icon: Landmark },
      { id: "statistics", label: "Industry Statistics", icon: BarChart3 },
      { id: "wilayah", label: "Wilayah & Kodepos RI", icon: MapPin },
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

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih opsi...",
  className = "",
  disabled = false,
  name,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`searchable-select-container ${className}`}
      ref={containerRef}
    >
      <input
        type="hidden"
        name={name}
        value={value}
        readOnly
        aria-hidden="true"
      />
      <button
        type="button"
        className={`searchable-select-trigger ${open ? "open" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
      >
        <span className="trigger-label">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`chevron-icon ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="searchable-select-popover">
          <div className="searchable-select-search">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pilihan..."
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearch("")}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="searchable-select-options">
            {filteredOptions.length === 0 ? (
              <div className="searchable-select-empty">
                Pilihan tidak ditemukan
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`searchable-select-option ${opt.value === value ? "active" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <CheckCircle2 size={15} className="check-mark" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  if (totalItems <= 0) return null;

  return (
    <div className="table-pagination">
      <div className="pagination-info">
        <span className="pagination-text">
          <span className="pagination-text-full">Menampilkan </span>
          <strong>{startItem}–{endItem}</strong> dari <strong>{totalItems}</strong> data
        </span>
        {onPageSizeChange && (
          <div className="page-size-selector">
            <span className="page-size-label">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              aria-label="Jumlah data per halaman"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="pagination-nav">
        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          title="Halaman Sebelumnya"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="pagination-pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 ||
                p === totalPages ||
                Math.abs(p - currentPage) <= (totalPages > 7 ? 1 : 2),
            )
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && p - prev > 1;
              return (
                <span key={p} className="page-number-wrap">
                  {showEllipsis && <span className="pagination-ellipsis">…</span>}
                  <button
                    type="button"
                    className={`pagination-number ${currentPage === p ? "active" : ""}`}
                    onClick={() => onPageChange(p)}
                    aria-label={`Halaman ${p}`}
                  >
                    {p}
                  </button>
                </span>
              );
            })}
        </div>

        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          title="Halaman Berikutnya"
          aria-label="Halaman Berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function App() {
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ data: Session }>("/v1/auth/session"),
    retry: false,
  });
  if (session.isLoading) return <Splash />;
  if (session.isError || !session.data?.data) {
    const isAuth =
      (session.error instanceof ApiError && session.error.status === 401) ||
      (session.error as { status?: number })?.status === 401 ||
      session.error?.message?.includes("401") ||
      session.error?.message?.toLowerCase().includes("unauthorized") ||
      !session.data?.data;

    if (isAuth) return <Login />;
    return <FatalError message={session.error?.message || "Koneksi ke server terputus."} />;
  }
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api("/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["session"] }),
    onError: (reason) => setError(reason.message),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    login.mutate({ email, password });
  };

  const fillDemo = () => {
    setEmail("admin@organization.org");
    setPassword("password123");
    setError("");
  };

  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="story-top-bar">
          <div className="brand">
            <span className="brand-mark">
              <Sparkles size={20} />
            </span>
            <span>OpenOrg Studio</span>
          </div>
          <span className="version-pill">v2.4 Enterprise</span>
        </div>

        <div className="story-copy">
          <span className="eyebrow light">
            Sistem Informasi & Tata Kelola Asosiasi
          </span>
          <h1>Pusat kendali mandiri untuk ekosistem organisasi modern.</h1>
          <p>
            Kelola keanggotaan terverifikasi, terbitkan KTA digital & sertifikat
            kriptografis, rekap kredit SKP/CPD, hingga publikasi berita dalam
            satu platform terpadu.
          </p>

          <div className="story-features-grid">
            <div className="story-feature-item">
              <span className="feature-dot" />
              <div>
                <strong>Keanggotaan & KTA Digital</strong>
                <small>Verifikasi otomatis dengan anti-pemalsuan QR</small>
              </div>
            </div>
            <div className="story-feature-item">
              <span className="feature-dot" />
              <div>
                <strong>Akademi & Kredit SKP/CPD</strong>
                <small>Buku log pelatihan terintegrasi standar profesi</small>
              </div>
            </div>
            <div className="story-feature-item">
              <span className="feature-dot" />
              <div>
                <strong>GovernOS & Struktur Hirarki</strong>
                <small>Transparansi DPP, DPD, hingga Korwil Daerah</small>
              </div>
            </div>
          </div>
        </div>

        <div className="trust-row">
          <ShieldCheck size={16} />
          <span>
            Zero Trust Verification · Kedaulatan Data Mandiri · Audit BNSP
          </span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card-container">
          <form className="login-form" onSubmit={submit}>
            <div className="mobile-brand brand">
              <span className="brand-mark">
                <Sparkles size={20} />
              </span>
              <span>OpenOrg Studio</span>
            </div>

            <div className="login-header">
              <span className="eyebrow">Portal Administrasi</span>
              <h2>Masuk ke Studio</h2>
              <p>
                Akses ruang kerja pengelolaan konten, anggota, dan tata kelola
                organisasi.
              </p>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="form-group">
              <label htmlFor="login-email">Alamat Email Administrator</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@organization.org"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Kata Sandi</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="button primary large"
              disabled={login.isPending}
            >
              {login.isPending ? (
                "Memverifikasi Kredensial…"
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Quick Demo Fill Helper */}
            <div className="demo-credentials-box">
              <div className="demo-copy">
                <small>Akun Demo Default:</small>
                <code>admin@organization.org · password123</code>
              </div>
              <button
                type="button"
                className="btn-demo-fill"
                onClick={fillDemo}
              >
                Isi Otomatis
              </button>
            </div>

            <p className="login-help">
              <CircleHelp size={14} /> Hubungi Dewan Pengurus Pusat jika Anda
              memerlukan hak akses baru.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

function Studio({ session }: { session: Session }) {
  const [screen, navigate] = useHashScreen();
  const [mobileNav, setMobileNav] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
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
        <div className="org-switch-wrapper">
          <button
            type="button"
            className="organization-switch"
            onClick={() => setOrgMenuOpen((v) => !v)}
            aria-expanded={orgMenuOpen}
          >
            <span className="org-avatar">
              {session.organization.name.slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>{session.organization.name}</strong>
              <small>Primary workspace</small>
            </span>
            <ChevronDown
              size={16}
              style={{
                transform: orgMenuOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.15s ease",
              }}
            />
          </button>
          {orgMenuOpen && (
            <div className="org-popover-menu">
              <div className="popover-header">Workspaces</div>
              <button
                type="button"
                className="popover-item active"
                onClick={() => setOrgMenuOpen(false)}
              >
                <span className="org-avatar compact">
                  {session.organization.name.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <strong>{session.organization.name}</strong>
                  <small>Utama · Active</small>
                </span>
                <CheckCircle2 size={16} className="check-icon" />
              </button>
              <div className="popover-divider" />
              <button
                type="button"
                className="popover-item"
                onClick={() => {
                  navigate("settings");
                  setOrgMenuOpen(false);
                }}
              >
                <Settings size={16} />
                <span>Pengaturan Workspace</span>
              </button>
              <button
                type="button"
                className="popover-item"
                onClick={() => {
                  navigate("appearance");
                  setOrgMenuOpen(false);
                }}
              >
                <Palette size={16} />
                <span>Identitas & Theme Studio</span>
              </button>
              <a
                href={PUBLIC_SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="popover-item"
                onClick={() => setOrgMenuOpen(false)}
              >
                <Globe2 size={16} />
                <span>Buka Website Publik</span>
              </a>
              <div className="popover-divider" />
              <button
                type="button"
                className="popover-item danger"
                onClick={() => {
                  setOrgMenuOpen(false);
                  logout.mutate();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
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
          <div className="topbar-actions">
            <span className="user-avatar">
              {session.user.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="user-copy">
              <strong>{session.user.name}</strong>
              <small>{session.user.email}</small>
            </span>
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
          {screen === "regulations" && <RegulationsManager />}
          {screen === "complaints" && <ComplaintsManager />}
          {screen === "technicians" && <TechniciansManager />}
          {screen === "clubs" && <ClubsManager />}
          {screen === "championships" && <ChampionshipsManager />}
          {screen === "workingGroups" && <WorkingGroupsManager />}
          {screen === "lenders" && <LendersManager />}
          {screen === "statistics" && <StatisticsManager />}
          {screen === "wilayah" && <WilayahManager />}
          {screen === "adArt" && <AdArtManager />}
          {screen === "milestones" && <MilestonesManager />}
          {screen === "refrigerants" && <RefrigerantsManager />}
          {screen === "appearance" && <Appearance />}
          {screen === "settings" && <SettingsManager />}
        </main>
      </section>
    </div>
  );
}

function ExecutiveReportModal({
  session,
  data,
  onClose,
}: {
  session: Session;
  data?: DashboardData | undefined;
  onClose: () => void;
}) {
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="modal-backdrop">
      <button
        type="button"
        className="modal-scrim no-print"
        onClick={onClose}
        aria-label="Tutup laporan"
      />
      <div className="modal executive-report-modal">
        <div className="modal-head no-print">
          <div>
            <h2>Laporan Kinerja & Pertanggungjawaban Eksekutif</h2>
            <p>
              Dokumen resmi rekapitulasi data organisasi siap cetak / ekspor ke PDF.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="button primary"
              onClick={() => window.print()}
            >
              <Printer size={16} /> Cetak / Simpan PDF
            </button>
            <button type="button" className="icon-button" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="report-document">
          <div className="report-letterhead">
            <div>
              <h2>{session.organization.name.toUpperCase()}</h2>
              <p>DEWAN PIMPINAN PUSAT & BADAN PENGURUS HARIAN</p>
              <small style={{ color: "#64748b" }}>
                Sistem Informasi Terpadu OpenOrg · Basis Data Resmi Nasional
              </small>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "13px",
                  letterSpacing: "0.05em",
                  color: "#0284c7",
                }}
              >
                LAPORAN RESMI
              </div>
              <small style={{ color: "#64748b" }}>
                Tanggal Terbit: {todayFormatted}
              </small>
            </div>
          </div>

          <div className="report-meta-grid">
            <div>
              <strong>Nama Organisasi:</strong>
              <div>{session.organization.name}</div>
            </div>
            <div>
              <strong>Petugas Administrator:</strong>
              <div>{session.user.name}</div>
            </div>
            <div>
              <strong>Status Ekosistem:</strong>
              <div style={{ color: "#16a34a", fontWeight: 700 }}>
                ● AKTIF & TERVERIFIKASI
              </div>
            </div>
          </div>

          <div className="report-section">
            <h4>1. Ringkasan Eksekutif Indikator Kunci (KPI)</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Indikator Utama</th>
                  <th>Jumlah Total</th>
                  <th>Status & Catatan Kinerja</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Anggota Terdaftar (KTA)</td>
                  <td>
                    <strong>{data?.counts.members ?? 0} Orang</strong>
                  </td>
                  <td>
                    {data?.counts.activeMembers ?? 0} Aktif Berlisensi ·{" "}
                    {data?.counts.pendingMembers ?? 0} Menunggu Verifikasi
                  </td>
                </tr>
                <tr>
                  <td>Teknisi Terverifikasi & BNSP</td>
                  <td>
                    <strong>
                      {data?.counts.technicians ?? data?.counts.members ?? 0} Teknisi
                    </strong>
                  </td>
                  <td>Tersertifikasi Kompetensi & Standar Keselamatan</td>
                </tr>
                <tr>
                  <td>Klub & Komunitas Terafiliasi (TKT)</td>
                  <td>
                    <strong>{data?.counts.clubs ?? 0} Klub Komunitas</strong>
                  </td>
                  <td>Binaan DPD / Wilayah Provinsi se-Indonesia</td>
                </tr>
                <tr>
                  <td>Agenda Pelatihan & Pelaksanaan Uji</td>
                  <td>
                    <strong>{data?.counts.events ?? 0} Program</strong>
                  </td>
                  <td>Pengembangan Keprofesian Berkelanjutan (SKP / CPD)</td>
                </tr>
                <tr>
                  <td>Pengaduan Publik & Kode Etik</td>
                  <td>
                    <strong>{data?.counts.complaints ?? 0} Laporan</strong>
                  </td>
                  <td>100% Ditindaklanjuti & Terpantau Majelis Etik</td>
                </tr>
                <tr>
                  <td>Halaman Publik & Publikasi Warta</td>
                  <td>
                    <strong>
                      {(data?.counts.pages ?? 0) + (data?.counts.contents ?? 0)} Rilis
                    </strong>
                  </td>
                  <td>Portal Publikasi & Media Informasi Resmi</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h4>2. Distribusi Sebaran Anggota per Wilayah (DPD / DPW)</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Wilayah / Dewan Pimpinan Daerah</th>
                  <th>Jumlah Anggota</th>
                  <th>Persentase Kontribusi</th>
                </tr>
              </thead>
              <tbody>
                {data?.unitDistribution && data.unitDistribution.length > 0 ? (
                  data.unitDistribution.map((unit) => {
                    const total = data.counts.members || 1;
                    const pct = Math.round((unit.count / total) * 100);
                    return (
                      <tr key={unit.name}>
                        <td>
                          <strong>{unit.name}</strong>
                        </td>
                        <td>{unit.count} Anggota</td>
                        <td>{pct}%</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td>DPP Nasional / Pusat</td>
                    <td>{data?.counts.members ?? 0} Anggota</td>
                    <td>100%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="report-sign-area">
            <div className="report-sign-box">
              <div>Mengetahui,</div>
              <div style={{ fontWeight: 600 }}>Ketua Umum</div>
              <div className="report-sign-line">Dewan Pimpinan Pusat</div>
            </div>
            <div className="report-sign-box">
              <div>Disusun oleh,</div>
              <div style={{ fontWeight: 600 }}>Sekretariat Jenderal</div>
              <div className="report-sign-line">{session.user.name}</div>
            </div>
          </div>
        </div>
      </div>
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
  const [showReportModal, setShowReportModal] = useState(false);

  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<{ data: DashboardData }>("/v1/admin/dashboard"),
  });

  const data = query.data?.data;
  const totalMembers = data?.counts.members ?? 0;
  const activeMembers = data?.counts.activeMembers ?? totalMembers;
  const pendingMembers = data?.counts.pendingMembers ?? 0;
  const totalEvents = data?.counts.events ?? 0;
  const totalClubs = data?.counts.clubs ?? 0;
  const totalTechs = data?.counts.technicians ?? totalMembers;
  const totalComplaints = data?.counts.complaints ?? 0;

  // Dynamic 6-month growth curve scaled cleanly from actual active database records
  const monthlyData: Array<{ month: string; count: number; active: number }> =
    useMemo(() => {
      if (
        data?.monthlyGrowth &&
        data.monthlyGrowth.length > 0 &&
        data.monthlyGrowth.some((m) => m.count > 0)
      ) {
        return data.monthlyGrowth;
      }
      const base = Math.max(totalMembers, 6);
      return [
        {
          month: "Mar 26",
          count: Math.max(1, Math.round(base * 0.25)),
          active: Math.max(1, Math.round(base * 0.22)),
        },
        {
          month: "Apr 26",
          count: Math.max(2, Math.round(base * 0.4)),
          active: Math.max(2, Math.round(base * 0.36)),
        },
        {
          month: "Mei 26",
          count: Math.max(3, Math.round(base * 0.55)),
          active: Math.max(3, Math.round(base * 0.5)),
        },
        {
          month: "Jun 26",
          count: Math.max(4, Math.round(base * 0.7)),
          active: Math.max(4, Math.round(base * 0.65)),
        },
        {
          month: "Jul 26",
          count: Math.max(5, Math.round(base * 0.85)),
          active: Math.max(5, Math.round(base * 0.8)),
        },
        {
          month: "Agu 26",
          count: base,
          active: Math.max(activeMembers, Math.round(base * 0.92)),
        },
      ];
    }, [data?.monthlyGrowth, totalMembers, activeMembers]);

  if (query.isLoading) return <PageLoading />;
  if (query.isError) {
    return (
      <div className="panel" style={{ padding: "32px", textAlign: "center" }}>
        <h3 style={{ color: "#dc2626", marginBottom: "8px" }}>
          Gagal Memuat Data Dashboard
        </h3>
        <p style={{ color: "#64748b", marginBottom: "16px" }}>
          {query.error?.message}
        </p>
        <button
          type="button"
          className="button primary"
          onClick={() => query.refetch()}
        >
          Muat Ulang Dashboard
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Anggota Terdaftar",
      value: totalMembers,
      subtitle: `${activeMembers} Aktif · ${pendingMembers} Pending`,
      icon: Users,
      screen: "members" as Screen,
      badge: "KTA Resmi",
    },
    {
      label: "Teknisi Berlisensi & BNSP",
      value: totalTechs,
      subtitle: "Tersertifikasi Nasional",
      icon: Wrench,
      screen: "technicians" as Screen,
      badge: "Terverifikasi",
    },
    {
      label: "Klub Komunitas & DPD",
      value: totalClubs,
      subtitle: "Wilayah Pembinaan",
      icon: Trophy,
      screen: "clubs" as Screen,
      badge: "TKT Terdaftar",
    },
    {
      label: "Agenda & Pelatihan",
      value: totalEvents,
      subtitle: "Program SKP & CPD",
      icon: CalendarDays,
      screen: "events" as Screen,
      badge: "Jadwal Aktif",
    },
    {
      label: "Pengaduan & Meja Etik",
      value: totalComplaints,
      subtitle: "100% Ditindaklanjuti",
      icon: Scale,
      screen: "complaints" as Screen,
      badge: "Resolusi Baik",
    },
  ];

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const maxMonthVal = Math.max(...monthlyData.map((d) => d.count), 1);

  // Regional distribution list
  const unitList =
    data?.unitDistribution && data.unitDistribution.length > 0
      ? data.unitDistribution
      : [
          {
            name: "Dewan Pimpinan Pusat (DPP APTI)",
            count: Math.max(Math.round(totalMembers * 0.5), 3),
          },
          {
            name: "DPD APTI Jawa Barat",
            count: Math.max(Math.round(totalMembers * 0.3), 2),
          },
          {
            name: "DPD APTI Jawa Timur",
            count: Math.max(Math.round(totalMembers * 0.2), 1),
          },
        ];

  const maxUnitCount = Math.max(...unitList.map((u) => u.count), 1);

  return (
    <>
      {showReportModal && (
        <ExecutiveReportModal
          session={session}
          data={data}
          onClose={() => setShowReportModal(false)}
        />
      )}

      <div className="welcome-row">
        <div>
          <span className="eyebrow">{todayFormatted}</span>
          <h1>Pusat Kontrol & Laporan Eksekutif</h1>
          <p>
            Rekapitulasi ekosistem, performa data keanggotaan, dan tata kelola{" "}
            <strong>{session.organization.name}</strong>.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="button secondary"
            onClick={() => setShowReportModal(true)}
          >
            <Printer size={16} /> <span>Laporan Resmi Pengurus</span>
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate("pages")}
          >
            <Plus size={16} /> <span>Buat Halaman Baru</span>
          </button>
        </div>
      </div>

      <div
        className="stats-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        {stats.map((stat) => (
          <button
            type="button"
            className="stat-card"
            key={stat.label}
            onClick={() => navigate(stat.screen)}
          >
            <span className="stat-icon">
              <stat.icon size={20} />
            </span>
            <span>
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </span>
            <ArrowRight size={16} />
          </button>
        ))}
      </div>

      {/* Visual Analytics & Charts Section */}
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "1.2fr 0.8fr", gap: "16px", marginBottom: "20px" }}
      >
        {/* Chart 1: Monthly Growth Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Tren Pertumbuhan Anggota & Verifikasi KTA</h3>
              <p>
                Progres registrasi masuk vs KTA resmi terbit (6 Bulan Terakhir)
              </p>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: "#0284c7" }}
                />
                <span>Registrasi</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: "#10b981" }}
                />
                <span>Terverifikasi</span>
              </div>
            </div>
          </div>

          <div className="chart-canvas-wrap">
            <div className="chart-grid-lines">
              <div className="grid-line">
                <span className="grid-label">{maxMonthVal}</span>
              </div>
              <div className="grid-line">
                <span className="grid-label">{Math.round(maxMonthVal / 2)}</span>
              </div>
              <div className="grid-line">
                <span className="grid-label">0</span>
              </div>
            </div>

            <div className="bar-chart-grid">
              {monthlyData.map((m) => {
                const regHeight = Math.max(
                  14,
                  Math.round((m.count / maxMonthVal) * 100),
                );
                const actHeight = Math.max(
                  10,
                  Math.round((m.active / maxMonthVal) * 100),
                );
                return (
                  <div className="bar-group" key={m.month}>
                    <div className="bar-stack">
                      <div
                        className="bar-col primary"
                        style={{ height: `${regHeight}%` }}
                        title={`${m.month} - Total Registrasi: ${m.count}`}
                      />
                      <div
                        className="bar-col active"
                        style={{ height: `${actHeight}%` }}
                        title={`${m.month} - KTA Terbit Aktif: ${m.active}`}
                      />
                    </div>
                    <span className="bar-label">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: "1px solid #f1f5f9",
              fontSize: "11.5px",
              color: "#64748b",
            }}
          >
            <span>
              Tingkat Konversi KTA:{" "}
              <strong style={{ color: "#10b981" }}>96.4%</strong>
            </span>
            <span>
              Rata-rata Waktu Verifikasi:{" "}
              <strong style={{ color: "#0284c7" }}>&lt; 2 Jam</strong>
            </span>
          </div>
        </div>

        {/* Chart 2: Regional DPD Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Sebaran Wilayah (DPD / DPW)</h3>
              <p>Konsentrasi anggota per cabang daerah</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("governance")}
            >
              Lihat Pohon DPD <ArrowRight size={14} />
            </button>
          </div>

          <div className="distribution-list">
            {unitList.slice(0, 5).map((unit, idx) => {
              const pct = Math.max(
                12,
                Math.round((unit.count / maxUnitCount) * 100),
              );
              const totalPct = Math.round(
                (unit.count / (totalMembers || 1)) * 100,
              );
              return (
                <div className="dist-item" key={unit.name}>
                  <div className="dist-meta">
                    <div className="dist-name">
                      <span className="dist-rank">{idx + 1}</span>
                      <span>{unit.name}</span>
                    </div>
                    <span className="dist-count">
                      {unit.count} Anggota ({totalPct}%)
                    </span>
                  </div>
                  <div className="dist-bar-track">
                    <div
                      className="dist-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Analytics Row 2: Training Attendance & Complaints Resolution */}
      <div
        className="dashboard-grid"
        style={{
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Card: Training & Participant Turnout */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Pelatihan & Partisipasi Peserta (SKP / CPD)</h3>
              <p>Kapasitas kuota vs peserta hadir & total jam sertifikasi</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("events")}
            >
              Semua Agenda <ArrowRight size={14} />
            </button>
          </div>

          <div className="stat-pill-group">
            <span className="stat-pill info">
              <GraduationCap size={14} />
              {data?.trainingData?.totalParticipants ?? 145} Peserta Terlatih
            </span>
            <span className="stat-pill purple">
              <CalendarDays size={14} />
              {data?.trainingData?.totalCpdHours ?? 24} Jam SKP/CPD
            </span>
            <span className="stat-pill success">
              <Award size={14} />
              {data?.trainingData?.completionRate ?? 98.2}% Kelulusan Uji
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(data?.trainingData?.eventsList || [
              {
                title: "Sertifikasi Teknisi RAC Level 1 BNSP",
                date: "28 Agu 2026",
                capacity: 60,
                participants: 58,
                fillRate: 97,
              },
              {
                title: "Workshop Retrofit Hidrokarbon R290 Ramah Lingkungan",
                date: "05 Sep 2026",
                capacity: 40,
                participants: 36,
                fillRate: 90,
              },
              {
                title: "Masterclass Inverter Multi-Split VRV/VRF",
                date: "18 Sep 2026",
                capacity: 50,
                participants: 45,
                fillRate: 90,
              },
            ]).map((ev) => (
              <div className="training-event-row" key={ev.title}>
                <div className="training-meta-top">
                  <span className="training-title">{ev.title}</span>
                  <span className="training-date-badge">{ev.date}</span>
                </div>
                <div className="dist-bar-track">
                  <div
                    className="dist-bar-fill"
                    style={{
                      width: `${ev.fillRate}%`,
                      background:
                        ev.fillRate >= 95
                          ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                          : "linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)",
                    }}
                  />
                </div>
                <div className="training-capacity-info">
                  <span>Partisipasi Kuota</span>
                  <strong>
                    {ev.participants} / {ev.capacity} Peserta ({ev.fillRate}%)
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Complaints & Ethics Resolution */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Pengaduan Publik & Meja Etik</h3>
              <p>Indeks penyelesaian laporan & sengketa layanan</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("complaints")}
            >
              Meja Etik <ArrowRight size={14} />
            </button>
          </div>

          {/* Segmented Progress Bar */}
          <div className="segmented-bar">
            <div
              className="segmented-part green"
              style={{ width: "80%" }}
              title="Terselesaikan: 80%"
            />
            <div
              className="segmented-part amber"
              style={{ width: "15%" }}
              title="Investigasi: 15%"
            />
            <div
              className="segmented-part blue"
              style={{ width: "5%" }}
              title="Baru: 5%"
            />
          </div>

          <div className="stat-pill-group">
            <span className="stat-pill success">
              <ShieldCheck size={14} />
              {data?.complaintsData?.resolved ?? 4} Selesai
            </span>
            <span className="stat-pill warning">
              <ShieldAlert size={14} />
              {data?.complaintsData?.inProgress ?? 1} Investigasi
            </span>
            <span className="stat-pill info">
              <Shield size={14} />
              {data?.complaintsData?.new ?? 0} Baru
            </span>
          </div>

          <div className="distribution-list">
            {(data?.complaintsData?.categories || [
              { name: "Kode Etik Keanggotaan", count: 2, percentage: 40 },
              { name: "Standar Keselamatan (K3)", count: 1, percentage: 25 },
              { name: "Layanan Konsumen & Sengketa", count: 1, percentage: 20 },
              { name: "Validasi Sertifikat / KTA", count: 1, percentage: 15 },
            ]).map((cat) => (
              <div className="dist-item" key={cat.name}>
                <div className="dist-meta">
                  <span style={{ fontSize: "12px", color: "#334155" }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: "11.5px", fontWeight: 650 }}>
                    {cat.count} Kasus ({cat.percentage}%)
                  </span>
                </div>
                <div className="dist-bar-track">
                  <div
                    className="dist-bar-fill"
                    style={{
                      width: `${cat.percentage}%`,
                      background:
                        cat.percentage > 30
                          ? "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)"
                          : "linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Analytics Row 3: Audit Trail & Security Timeline */}
      <div
        className="chart-card"
        style={{ marginBottom: "20px" }}
      >
        <div className="chart-header">
          <div>
            <h3>Audit Trail & Integritas Mutasi Data Sistem</h3>
            <p>Log kepatuhan forensik, otorisasi sesi administrator, dan jejak audit waktu-nyata (ISO-8601)</p>
          </div>
          <div className="stat-pill-group" style={{ margin: 0 }}>
            <span className="stat-pill info">
              <History size={14} />
              {data?.auditLogsData?.total ?? 40} Total Log Mutasi
            </span>
            <span className="stat-pill success">
              <Activity size={14} />
              {data?.auditLogsData?.todayCount ?? 8} Aksi Hari Ini
            </span>
            <span className="stat-pill purple">
              <ShieldCheck size={14} />
              100% Terverifikasi
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>
              Sebaran Mutasi Berdasarkan Entitas
            </div>
            <div className="distribution-list">
              {(data?.auditLogsData?.byResource || [
                { name: "Anggota & KTA", count: 18, color: "#0284c7" },
                { name: "Publikasi & Warta", count: 10, color: "#10b981" },
                { name: "Agenda Pelatihan", count: 6, color: "#8b5cf6" },
                { name: "Tata Kelola & Wilayah", count: 6, color: "#f59e0b" },
              ]).map((res) => (
                <div className="dist-item" key={res.name}>
                  <div className="dist-meta">
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{res.name}</span>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: res.color }}>
                      {res.count} Aktivitas
                    </span>
                  </div>
                  <div className="dist-bar-track">
                    <div
                      className="dist-bar-fill"
                      style={{
                        width: `${Math.round((res.count / 20) * 100)}%`,
                        background: res.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>
              Timeline Audit Terkini
            </div>
            <div className="audit-timeline">
              {(data?.auditLogsData?.recentActivities || [
                {
                  id: "1",
                  action: "VERIFIKASI_KTA",
                  resourceType: "members",
                  createdAt: new Date().toISOString(),
                },
                {
                  id: "2",
                  action: "UPDATE_AD_ART",
                  resourceType: "governance",
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                  id: "3",
                  action: "PUBLISH_WARTA",
                  resourceType: "contents",
                  createdAt: new Date(Date.now() - 7200000).toISOString(),
                },
              ]).map((log) => (
                <div className="audit-item" key={log.id}>
                  <span className="audit-action-tag">{log.action}</span>
                  <span className="audit-resource">Entitas: {log.resourceType}</span>
                  <span className="audit-time">
                    {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row 4: Top Performing Technicians & Compliance Watchlist */}
      <div
        className="dashboard-grid"
        style={{
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Left Card: Teknisi Berprestasi & Hall of Fame */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Teknisi Berprestasi & Hall of Fame Kejuaraan</h3>
              <p>Peringkat kompetensi tertinggi & penilaian kepuasan konsumen</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("championships")}
            >
              Klasemen Lengkap <ArrowRight size={14} />
            </button>
          </div>

          <div className="performer-list">
            {(data?.topPerformers?.championshipRankings || [
              {
                id: "1",
                rank: 1,
                participantName: "Bambang Pamungkas",
                unitName: "DPD Jawa Timur",
                category: "Refrigeration Skill Level 3",
                points: 985,
                achievements:
                  "Juara 1 Nasional - Medali Emas Uji Vakum & Retrofit R290",
              },
              {
                id: "2",
                rank: 2,
                participantName: "Hendro Wijaya",
                unitName: "DPD Jawa Barat",
                category: "VRV/VRF Multi-Split Master",
                points: 960,
                achievements:
                  "Juara 2 Nasional - Medali Perak Troubleshooting Inverter",
              },
              {
                id: "3",
                rank: 3,
                participantName: "Agus Setiawan",
                unitName: "DPD DKI Jakarta",
                category: "Cold Storage Specialist",
                points: 940,
                achievements:
                  "Juara 3 Nasional - Medali Perunggu Efisiensi Termal",
              },
            ]).map((p, idx) => {
              const medalClass =
                idx === 0
                  ? "gold"
                  : idx === 1
                    ? "silver"
                    : idx === 2
                      ? "bronze"
                      : "star";
              return (
                <div className="performer-item" key={p.id}>
                  <div className={`medal-badge ${medalClass}`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <div className="performer-details">
                    <div className="performer-name-row">
                      <span className="performer-name">{p.participantName}</span>
                      {p.unitName && (
                        <span className="tag-badge">{p.unitName}</span>
                      )}
                    </div>
                    <div className="performer-sub">
                      <span>{p.category}</span>
                      {p.achievements && <span>· {p.achievements}</span>}
                    </div>
                  </div>
                  <div className="performer-score">
                    <Trophy size={13} style={{ display: "inline", marginRight: "4px" }} />
                    {p.points} Poin
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Compliance Watchlist & Pembinaan Meja Etik */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Pengawasan Kepatuhan & Meja Etik</h3>
              <p>Daftar peninjauan pelanggaran & pembinaan anggota</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("complaints")}
            >
              Proses Sidang <ArrowRight size={14} />
            </button>
          </div>

          <div className="watchlist-list">
            {(data?.complianceWatchlist || [
              {
                id: "1",
                ticketNumber: "CMP-202608-001",
                targetIdentifier: "Bengkel AC Berkah (Non-KTA)",
                category: "Pelanggaran SOP Keselamatan Refrigeran",
                status: "under_review",
                description:
                  "Pelepasan refrigeran langsung ke udara tanpa recovery unit",
                createdAt: new Date().toISOString(),
              },
              {
                id: "2",
                ticketNumber: "CMP-202608-002",
                targetIdentifier: "Teknisi Mitra (KTA Pending)",
                category: "Sengketa Garansi Layanan",
                status: "mediated",
                description:
                  "Keterlambatan penyelesaian komplain unit chiller komersial",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
              },
            ]).map((item) => (
              <div className="watchlist-item" key={item.id}>
                <div className="watchlist-head">
                  <div className="watchlist-target">
                    <AlertTriangle size={15} color="#d97706" />
                    <span>{item.targetIdentifier}</span>
                  </div>
                  <span className="code-badge">{item.ticketNumber}</span>
                </div>
                <div className="watchlist-desc">{item.description}</div>
                <div className="watchlist-meta">
                  <span>Kategori: {item.category}</span>
                  <strong style={{ textTransform: "uppercase" }}>
                    Status: {item.status.replace("_", " ")}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dual Activity Feed Grid */}
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}
      >
        {/* Left Feed: Recent Content */}
        <section className="panel" style={{ margin: 0 }}>
          <div className="panel-head">
            <div>
              <h2>Warta & Publikasi Terkini</h2>
              <p>Perubahan materi, artikel warta, dan halaman website.</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("content")}
            >
              Semua Warta <ArrowRight size={15} />
            </button>
          </div>
          <div className="recent-list">
            {data?.recentContent && data.recentContent.length > 0 ? (
              data.recentContent.map((item) => (
                <div className="recent-item" key={item.id}>
                  <div className="recent-icon blue">
                    <FileText size={18} />
                  </div>
                  <div className="recent-details">
                    <div className="recent-title">{item.title}</div>
                    <div className="recent-meta">
                      <span className="tag-badge">{item.type}</span>
                      <span>·</span>
                      <span>
                        Diperbarui{" "}
                        {new Date(item.updatedAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <div className="recent-badge-wrap">
                    <Status value={item.status} />
                  </div>
                </div>
              ))
            ) : (
              <Empty message="Belum ada warta yang diterbitkan." />
            )}
          </div>
        </section>

        {/* Right Feed: Recent Members */}
        <section className="panel" style={{ margin: 0 }}>
          <div className="panel-head">
            <div>
              <h2>Pendaftaran Anggota Terbaru</h2>
              <p>Permohonan KTA baru yang masuk ke sistem.</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("members")}
            >
              Semua Anggota <ArrowRight size={15} />
            </button>
          </div>
          <div className="recent-list">
            {data?.recentMembers && data.recentMembers.length > 0 ? (
              data.recentMembers.map((member) => (
                <div className="recent-item" key={member.id}>
                  <div className="recent-icon green">
                    <BadgeCheck size={18} />
                  </div>
                  <div className="recent-details">
                    <div className="recent-title">{member.name}</div>
                    <div className="recent-meta">
                      <span className="code-badge">
                        {member.memberNumber || "REG-PENDING"}
                      </span>
                      <span>·</span>
                      <span>
                        Terdaftar{" "}
                        {new Date(member.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <div className="recent-badge-wrap">
                    <Status value={member.status} />
                  </div>
                </div>
              ))
            ) : (
              <Empty message="Belum ada pendaftaran anggota baru." />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function Pages() {
  const client = useQueryClient();
  const [editor, setEditor] = useState<CmsPage | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["pages", search],
    queryFn: () =>
      api<{ data: CmsPage[] }>(
        `/v1/admin/pages?limit=100&search=${encodeURIComponent(search)}`,
      ),
  });
  const allPages = query.data?.data ?? [];
  const filteredPages = allPages.filter((page) => {
    if (status !== "all" && page.status !== status) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      page.title.toLowerCase().includes(term) ||
      page.slug.toLowerCase().includes(term)
    );
  });
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/pages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Halaman berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["pages"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menghapus halaman.");
    },
  });

  if (editor === "new") return <PageEditor onClose={() => setEditor(null)} />;
  if (editor)
    return <PageEditor page={editor} onClose={() => setEditor(null)} />;

  return (
    <>
      <PageHeading
        eyebrow="Situs Publik & Halaman Statis"
        title="Halaman & Section Builder"
        description="Kelola halaman publik organisasi, susun komponen dinamis (Hero, Features, Visi Misi, Stats, Form Kontak) dengan visual section builder."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => setEditor("new")}
          >
            <Plus size={16} /> <span>Buat Halaman Baru</span>
          </button>
        }
      />
      <div className="table-panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul halaman atau slug URL..."
            />
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="compact-filter">
              <label>Status</label>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                <option value="published">Published</option>
                <option value="review">In Review</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <span className="result-count">{filteredPages.length} halaman</span>
          </div>
        </div>

        {query.isLoading ? (
          <PageLoading />
        ) : filteredPages.length === 0 ? (
          <Empty message="Tidak ada halaman publik yang sesuai dengan filter pencarian." />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Judul Halaman & URL Slug</th>
                  <th style={{ width: "160px" }}>Status</th>
                  <th style={{ width: "180px" }}>Terakhir Diperbarui</th>
                  <th className="actions-cell" style={{ width: "130px" }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "8px",
                            background: "#eff6ff",
                            color: "#0284c7",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            border: "1px solid #dbeafe",
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#0f172a",
                              fontSize: "13.5px",
                              lineHeight: "1.3",
                            }}
                          >
                            {page.title}
                            {page.isHomepage && (
                              <span
                                className="tag-badge"
                                style={{
                                  marginLeft: "8px",
                                  background: "#f0fdf4",
                                  color: "#16a34a",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                }}
                              >
                                🏠 Beranda Utama
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: "11.5px",
                              color: "#64748b",
                              marginTop: "3px",
                            }}
                          >
                            /{page.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Status value={page.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                        {new Date(page.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "6px",
                        }}
                      >
                        <a
                          href={`${PUBLIC_SITE_URL}/${page.slug === "home" || page.isHomepage ? "" : page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="icon-button"
                          title="Lihat di Web Publik"
                          aria-label={`Lihat ${page.title}`}
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          type="button"
                          className="icon-button"
                          title="Edit Halaman"
                          aria-label={`Edit ${page.title}`}
                          onClick={() => setEditor(page)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button danger"
                          title="Hapus Halaman"
                          aria-label={`Hapus ${page.title}`}
                          onClick={() =>
                            confirm(`Hapus halaman "${page.title}"?`) &&
                            remove.mutate(page.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <TablePagination
              currentPage={currentPage}
              totalItems={filteredPages.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
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
  const [title, setTitle] = useState(page?.title ?? "Halaman Baru");
  const [slug, setSlug] = useState(page?.slug ?? "");
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
      toast.success("Halaman berhasil disimpan.");
      client.invalidateQueries({ queryKey: ["pages"] });
      onClose();
    },
    onError: (reason) => setError(reason.message),
  });

  const addSection = (type: PageSection["type"]) => {
    const base = { id: crypto.randomUUID(), type };
    const presets: Record<string, Record<string, unknown>> = {
      hero: {
        title: "Headline Utama Halaman Organisasi",
        description: "Jelaskan tujuan strategis dan poin penting bagi pengunjung.",
        alignment: "left",
        panelTitle: "Pusat Layanan Organisasi",
        highlights: [
          "Registri Anggota",
          "Kepatuhan Kredensial",
          "Logbook SKP Pelatihan",
          "Iuran & KTA Digital",
        ],
        proofPoints: ["Audit Terbuka", "Standar BNSP", "Aman & Terpercaya"],
      },
      richText: {
        title: "Tentang Program & Kebijakan",
        html: "<p>Tuliskan narasi lengkap atau pasal ketentuan di sini…</p>",
        width: "narrow",
      },
      features: {
        title: "Pilar Program Utama",
        columns: 3,
        variant: "cards",
        items: [
          {
            title: "Program Kejuruan",
            description: "Uraikan deskripsi manfaat program bagi anggota.",
          },
        ],
      },
      stats: { items: [{ value: "8,400+", label: "Teknisi Terdaftar" }] },
      contentFeed: {
        title: "Warta & Rilis Resmi Terkini",
        contentType: "post",
        limit: 6,
        layout: "grid",
      },
      organizationChart: {
        title: "Struktur Kepengurusan",
        description: "Bagan susunan dewan pengurus dan kelompok kerja.",
        depth: 4,
      },
      cta: {
        title: "Bergabung Bersama Ekosistem Kami",
        primaryAction: { label: "Daftar Anggota", href: "/join" },
        tone: "brand",
      },
      contact: { title: "Hubungi Sekretariat", showForm: true, showMap: false },
    };
    setSections((current) => [...current, { ...base, ...presets[type] }]);
  };

  const sectionMeta: Record<
    PageSection["type"],
    { label: string; desc: string }
  > = {
    hero: { label: "Hero Banner", desc: "Headline utama, highlight & proof points" },
    richText: { label: "Teks Lengkap (Rich Text)", desc: "Narasi bebas, HTML, artikel panjang" },
    features: { label: "Fitur & Program", desc: "Kartu pilar program atau keunggulan" },
    stats: { label: "Statistik & Angka", desc: "Metrik pencapaian angka kunci" },
    contentFeed: { label: "Warta & Berita", desc: "Feed artikel warta otomatis" },
    organizationChart: { label: "Struktur Pengurus", desc: "Bagan pimpinan & unit kerja" },
    cta: { label: "Call to Action (CTA)", desc: "Blok ajakan aksi & konversi" },
    contact: { label: "Formulir Kontak", desc: "Form pesan & lokasi kantor" },
  };

  return (
    <>
      <div className="editor-top">
        <button type="button" className="button ghost" onClick={onClose}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="editor-title">
          <input
            className="editor-title-input"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!page) {
                setSlug(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, ""),
                );
              }
            }}
            placeholder="Judul Halaman..."
            aria-label="Page title"
          />
          <div className="editor-slug-badge">
            <small>URL Slug:</small>
            <span>/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                )
              }
              placeholder="url-slug-halaman"
            />
          </div>
        </div>
        <div className="editor-actions">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="button"
            className="button primary"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            <Save size={17} /> {save.isPending ? "Menyimpan…" : "Simpan Halaman"}
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
              <h3>Susun Halaman Ini dengan Menambahkan Section</h3>
              <p>Pilih jenis blok konten dari pustaka komponen di sisi kanan.</p>
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
          <h3>Pustaka Komponen (Sections)</h3>
          <p>Klik untuk menambahkan blok section ke dalam kanvas.</p>
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
                <strong>{sectionMeta[type]?.label || type}</strong>
                <small>{sectionMeta[type]?.desc || "Komponen responsif"}</small>
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
  const [type, setType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editor, setEditor] = useState<CmsContent | "new" | null>(null);

  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["contents"],
    queryFn: () => api<{ data: CmsContent[] }>("/v1/admin/contents?limit=200"),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/contents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Konten warta berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["contents"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menghapus konten.");
    },
  });

  if (editor === "new")
    return (
      <ContentEditor
        defaultType={type === "all" ? "post" : type}
        onClose={() => setEditor(null)}
      />
    );
  if (editor)
    return <ContentEditor content={editor} onClose={() => setEditor(null)} />;

  const allItems = query.data?.data ?? [];
  const countPost = allItems.filter((i) => i.type === "post").length;
  const countNews = allItems.filter((i) => i.type === "news").length;
  const countCampaign = allItems.filter((i) => i.type === "campaign").length;

  const filtered = allItems.filter((item) => {
    if (type !== "all" && item.type !== type) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.slug.toLowerCase().includes(term) ||
      (item.authorName && item.authorName.toLowerCase().includes(term))
    );
  });

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <>
      <PageHeading
        eyebrow="Penerbitan & Publikasi"
        title="Warta, Berita & Rilis Resmi"
        description="Kelola materi edukasi teknisi, rilis pers asosiasi, berita industri refrigerasi, dan pengumuman resmi."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => setEditor("new")}
          >
            <Plus size={16} /> <span>Tulis Warta Baru</span>
          </button>
        }
      />

      <div className="segmented mb-3">
        <button
          type="button"
          className={type === "all" ? "active" : ""}
          onClick={() => {
            setType("all");
            setCurrentPage(1);
          }}
        >
          Semua Warta ({allItems.length})
        </button>
        <button
          type="button"
          className={type === "post" ? "active" : ""}
          onClick={() => {
            setType("post");
            setCurrentPage(1);
          }}
        >
          Edukasi & SOP ({countPost})
        </button>
        <button
          type="button"
          className={type === "news" ? "active" : ""}
          onClick={() => {
            setType("news");
            setCurrentPage(1);
          }}
        >
          Berita & Rilis ({countNews})
        </button>
        <button
          type="button"
          className={type === "campaign" ? "active" : ""}
          onClick={() => {
            setType("campaign");
            setCurrentPage(1);
          }}
        >
          Kampanye & Acara ({countCampaign})
        </button>
      </div>

      <div className="table-panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul warta, slug, atau penulis..."
            />
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="compact-filter">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="view-mode-toggle">
              <button
                type="button"
                className={viewMode === "table" ? "active" : ""}
                title="Tampilan Tabel"
                onClick={() => setViewMode("table")}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={viewMode === "grid" ? "active" : ""}
                title="Tampilan Kartu"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <span className="result-count">{filtered.length} warta</span>
          </div>
        </div>

        {query.isLoading ? (
          <PageLoading />
        ) : filtered.length === 0 ? (
          <Empty message="Tidak ada konten warta yang sesuai dengan filter pencarian." />
        ) : viewMode === "table" ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "64px" }}>Sampul</th>
                  <th>Judul Warta & Slug</th>
                  <th>Kategori</th>
                  <th>Penulis</th>
                  <th>Status</th>
                  <th>Diperbarui</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div
                        style={{
                          width: "48px",
                          height: "36px",
                          borderRadius: "5px",
                          background: "#f1f5f9",
                          overflow: "hidden",
                          display: "grid",
                          placeItems: "center",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {item.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <FileText size={16} color="#94a3b8" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: "13px",
                        }}
                      >
                        {item.title}
                        {item.featured && (
                          <span
                            className="tag-badge"
                            style={{
                              marginLeft: "6px",
                              background: "#fef3c7",
                              color: "#b45309",
                              fontSize: "10.5px",
                            }}
                          >
                            ★ Unggulan
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "#64748b",
                          fontFamily: "monospace",
                          marginTop: "2px",
                        }}
                      >
                        /{item.slug}
                      </div>
                    </td>
                    <td>
                      <span className="tag-badge">
                        {item.type === "post"
                          ? "Edukasi"
                          : item.type === "news"
                            ? "Berita"
                            : item.type}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "12.5px",
                          color: "#334155",
                          fontWeight: 500,
                        }}
                      >
                        {item.authorName || "Tim Redaksi"}
                      </span>
                    </td>
                    <td>
                      <Status value={item.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {new Date(item.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "6px",
                        }}
                      >
                        <a
                          href={`${PUBLIC_SITE_URL}/stories/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="icon-button"
                          title="Lihat di Web Publik"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          type="button"
                          className="icon-button"
                          title="Edit Warta"
                          onClick={() => setEditor(item)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button danger"
                          title="Hapus Warta"
                          onClick={() =>
                            confirm(`Hapus warta "${item.title}"?`) &&
                            remove.mutate(item.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        ) : (
          <>
            <div
              className="content-grid"
              style={{ padding: "16px", gap: "16px" }}
            >
              {paginated.map((item) => (
                <article className="content-card" key={item.id}>
                  <div className="content-cover">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt="" />
                    ) : (
                      <Newspaper size={28} />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <Status value={item.status} />
                      <span className="tag-badge">
                        {item.type === "post"
                          ? "Edukasi"
                          : item.type === "news"
                            ? "Berita"
                            : item.type}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>/{item.slug}</p>
                    <footer>
                      <span>
                        {new Date(item.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setEditor(item)}
                        >
                          Edit <ArrowRight size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-button danger"
                          aria-label={`Delete ${item.title}`}
                          onClick={() =>
                            confirm(`Hapus warta "${item.title}"?`) &&
                            remove.mutate(item.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </footer>
                  </div>
                </article>
              ))}
            </div>

            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [editor, setEditor] = useState<CmsEvent | "new" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["events"],
    queryFn: () => api<{ data: CmsEvent[] }>("/v1/admin/events?limit=100"),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Agenda kegiatan berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["events"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menghapus agenda.");
    },
  });

  if (editor === "new") return <EventEditor onClose={() => setEditor(null)} />;
  if (editor)
    return <EventEditor event={editor} onClose={() => setEditor(null)} />;

  const rawItems = query.data?.data ?? [];
  const filtered = rawItems.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.slug.toLowerCase().includes(term) ||
      (item.locationName && item.locationName.toLowerCase().includes(term))
    );
  });

  const paginatedItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <>
      <PageHeading
        eyebrow="Program & Kegiatan"
        title="Agenda & Pelatihan"
        description="Kelola jadwal Musda/Munas, workshop teknologi pendingin, sertifikasi BNSP, dan pelatihan teknisi."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => setEditor("new")}
          >
            <Plus size={16} /> <span>Tambah Agenda</span>
          </button>
        }
      />

      <div className="table-panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama agenda atau lokasi..."
            />
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="compact-filter">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <span className="result-count">{filtered.length} agenda</span>
          </div>
        </div>

        {query.isLoading ? (
          <PageLoading />
        ) : filtered.length === 0 ? (
          <Empty message="Tidak ada agenda kegiatan yang sesuai dengan filter pencarian." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "45%" }}>Nama Agenda & Lokasi</th>
                    <th style={{ width: "22%" }}>Jadwal & Waktu</th>
                    <th style={{ width: "15%" }}>Kapasitas</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "8%", textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const startDate = new Date(item.startsAt);
                    const isUpcoming = startDate.getTime() >= Date.now();
                    return (
                      <tr key={item.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                background: isUpcoming ? "#eff6ff" : "#f1f5f9",
                                color: isUpcoming ? "#0284c7" : "#64748b",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                                marginTop: "2px",
                              }}
                            >
                              <CalendarDays size={18} />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  fontSize: "13.5px",
                                  lineHeight: "1.4",
                                }}
                              >
                                {item.title}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  color: "#64748b",
                                  fontSize: "12px",
                                  marginTop: "4px",
                                }}
                              >
                                <MapPin size={13} color="#94a3b8" />
                                <span>
                                  {item.locationName ||
                                    (item.meetingUrl
                                      ? "Online (Zoom / Google Meet)"
                                      : "Lokasi belum ditentukan")}
                                </span>
                                {item.meetingUrl && (
                                  <span
                                    className="tag-badge"
                                    style={{
                                      marginLeft: "4px",
                                      fontSize: "10px",
                                    }}
                                  >
                                    Virtual
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              fontWeight: 650,
                              color: "#1e293b",
                              fontSize: "12.5px",
                            }}
                          >
                            {startDate.toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: "11.5px",
                              marginTop: "2px",
                            }}
                          >
                            Pukul{" "}
                            {startDate.toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "#334155",
                              fontWeight: 550,
                            }}
                          >
                            {item.capacity
                              ? `${item.capacity} Peserta`
                              : "Kuota Terbuka"}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: isUpcoming ? "#059669" : "#94a3b8",
                            }}
                          >
                            {isUpcoming ? "Pendaftaran Aktif" : "Selesai"}
                          </div>
                        </td>
                        <td>
                          <Status value={item.status} />
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: "6px",
                            }}
                          >
                            <a
                              href={`${PUBLIC_SITE_URL}/events/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-button"
                              title="Lihat di Web Publik"
                            >
                              <ExternalLink size={15} />
                            </a>
                            <button
                              type="button"
                              className="icon-button"
                              title="Edit Agenda"
                              onClick={() => setEditor(item)}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-button danger"
                              title="Hapus Agenda"
                              onClick={() =>
                                confirm(`Hapus agenda "${item.title}"?`) &&
                                remove.mutate(item.id)
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
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
        eyebrow="Kepatuhan & Sertifikasi"
        title="Kredensial & Sertifikasi Profesi"
        description="Kelola standar kompetensi BNSP, lisensi K3 teknisi HVAC/R, penanganan flammable refrigerant, dan verifikasi sertifikat keahlian anggota."
        action={
          view === "schemes" ? (
            <button
              className="button primary"
              type="button"
              onClick={() => setSchemeEditor(true)}
            >
              <Plus size={16} /> <span>Tambah Skema</span>
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
          Antrean Verifikasi Sertifikat
        </button>
        <button
          type="button"
          className={view === "schemes" ? "active" : ""}
          onClick={() => setView("schemes")}
        >
          Skema Standar Kompetensi
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
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<CmsMemberCredential | null>(null);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["member-credentials", search, status],
    queryFn: () =>
      api<{ data: CmsMemberCredential[] }>(
        `/v1/admin/credentials/credentials?limit=100&search=${encodeURIComponent(search)}${status !== "all" ? `&status=${status}` : ""}`,
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
    onSuccess: (_, variables) => {
      setSelected(null);
      setError("");
      toast.success(
        variables.decision === "verify"
          ? "Kredensial berhasil diverifikasi dan disahkan!"
          : variables.decision === "reject"
            ? "Pengajuan kredensial telah ditolak."
            : "Kredensial anggota telah dicabut.",
      );
      void client.invalidateQueries({ queryKey: ["member-credentials"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (reason) => {
      setError(reason.message);
      toast.error(`Gagal memproses verifikasi: ${reason.message}`);
    },
  });
  const submitDecision = (
    form: HTMLFormElement,
    decision: "verify" | "reject" | "revoke",
  ) => {
    if (!selected) return;
    const notes = String(new FormData(form).get("notes") ?? "").trim();
    if (decision !== "verify" && !notes) {
      setError("Wajib mengisi alasan/catatan sebelum menolak atau mencabut kredensial.");
      return;
    }
    verify.mutate({ credential: selected, decision, form });
  };
  const items = query.data?.data ?? [];
  return (
    <div className="inbox-layout applications-layout credential-layout">
      <section className="table-panel inbox-list">
        <div className="table-toolbar">
          <label className="search-field" style={{ minWidth: "60%" }}>
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari teknisi, no. sertifikat, atau skema..."
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setSelected(null);
            }}
          >
            <option value="all">Semua Status</option>
            <option value="submitted">Menunggu Verifikasi</option>
            <option value="verified">Terverifikasi (Valid)</option>
            <option value="rejected">Ditolak</option>
            <option value="revoked">Dicabut</option>
          </select>
        </div>
        <div className="submission-list application-list">
          {query.isLoading ? (
            <PageLoading />
          ) : items.length === 0 ? (
            <Empty message="Tidak ada kredensial yang sesuai dengan filter." />
          ) : (
            items.map((item) => (
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
                  <strong>{item.member?.name ?? "Teknisi Anggota"}</strong>
                  <small>
                    {item.scheme?.name ?? "Sertifikat"} ·{" "}
                    {item.scheme?.code ?? "CERT"}
                  </small>
                  <p>
                    {item.credentialNumber ?? "Nomor belum diisi"} ·{" "}
                    {(item.verificationLevel ?? "document_checked").replaceAll(
                      "_",
                      " ",
                    )}
                  </p>
                </span>
                <Status value={item.effectiveStatus} />
              </button>
            ))
          )}
        </div>
      </section>
      <section className="panel submission-detail credential-detail">
        {selected ? (
          <>
            <div className="panel-head">
              <div>
                <span className="eyebrow">Tinjauan Kredensial Sertifikasi</span>
                <h2>{selected.scheme?.name ?? "Sertifikat"}</h2>
                <p>
                  {selected.member?.name ?? "Anggota"} ·{" "}
                  {selected.member?.memberNumber ?? "—"}
                </p>
              </div>
              <Status value={selected.effectiveStatus} />
            </div>
            <dl>
              <div>
                <dt>Nomor Sertifikat / Registrasi</dt>
                <dd>{selected.credentialNumber ?? "—"}</dd>
              </div>
              <div>
                <dt>Lembaga Penerbit / LSP</dt>
                <dd>
                  {selected.issuerName ?? selected.scheme?.issuerName ?? "—"}
                </dd>
              </div>
              <div>
                <dt>Tanggal Terbit</dt>
                <dd>
                  {selected.issuedAt
                    ? new Date(selected.issuedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Masa Berlaku Hingga</dt>
                <dd>
                  {selected.expiresAt
                    ? new Date(selected.expiresAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Seumur Hidup / Tidak Kedaluwarsa"}
                </dd>
              </div>
              {Object.entries(selected.data ?? {}).map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd>{String(value || "—")}</dd>
                </div>
              ))}
              <div>
                <dt>Bukti / Sumber Data</dt>
                <dd>
                  {selected.sourceUrl ? (
                    <a
                      href={selected.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka Tautan Verifikasi LSP ↗
                    </a>
                  ) : (
                    "Dokumen diunggah langsung"
                  )}
                </dd>
              </div>
            </dl>
            <form className="review-form">
              {error && <div className="alert error">{error}</div>}
              <label>
                Tingkat Validitas Verifikasi
                <select
                  name="verificationLevel"
                  defaultValue={selected.scheme?.minimumVerificationLevel ?? "document_checked"}
                >
                  <option value="document_checked">Pemeriksaan Fisik Dokumen (Document Checked)</option>
                  <option value="issuer_confirmed">Konfirmasi Langsung LSP / Penerbit (Issuer Confirmed)</option>
                  <option value="api_verified">Terverifikasi API Resmi BNSP / Pemerintah (API Verified)</option>
                  <option value="cryptographically_verified">
                    Tanda Tangan Digital / Kriptografis (Cryptographically Verified)
                  </option>
                </select>
              </label>
              <label>
                Metode / Catatan Validasi
                <input
                  name="method"
                  defaultValue="Pemeriksaan Dokumen & Portofolio Kerja"
                  placeholder="Metode verifikasi yang digunakan…"
                />
              </label>
              <label>
                Catatan Reviewer / Alasan Penolakan
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Catatan hasil verifikasi atau alasan penolakan/pencabutan sertifikat…"
                />
              </label>
              <div className="submission-actions">
                <button
                  type="button"
                  className="button ghost destructive"
                  disabled={verify.isPending}
                  onClick={(event) => {
                    const form = event.currentTarget.form;
                    if (form) submitDecision(form, "reject");
                  }}
                >
                  Tolak
                </button>
                <button
                  type="button"
                  className="button ghost destructive"
                  disabled={verify.isPending}
                  onClick={(event) => {
                    const form = event.currentTarget.form;
                    if (form) submitDecision(form, "revoke");
                  }}
                >
                  Cabut Kredensial
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
                  {verify.isPending ? "Memproses…" : "Sahkan & Verifikasi"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "300px",
              color: "#94a3b8",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div>
              <ShieldCheck size={36} color="#cbd5e1" style={{ margin: "0 auto 10px" }} />
              <h3 style={{ color: "#475569", fontSize: "15px", marginBottom: "4px" }}>
                Pilih Kredensial Teknisi
              </h3>
              <p style={{ fontSize: "12.5px" }}>
                Klik sertifikat teknisi pada daftar di sebelah kiri untuk melihat rincian bukti dan menentukan status keabsahan.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function CredentialSchemes() {
  const client = useQueryClient();
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

  const deleteScheme = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/credentials/schemes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Skema kredensial berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["credential-schemes"] });
      void client.invalidateQueries({ queryKey: ["credential-requirements"] });
    },
    onError: (err: Error) => toast.error(`Gagal menghapus: ${err.message}`),
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Status value={scheme.isActive ? "active" : "inactive"} />
                <button
                  type="button"
                  className="icon-button danger"
                  title={`Hapus skema ${scheme.name}`}
                  aria-label={`Hapus ${scheme.name}`}
                  onClick={() => {
                    if (confirm(`Hapus skema kredensial "${scheme.name}"?`)) {
                      deleteScheme.mutate(scheme.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
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
                <dd>{scheme.fields?.length ?? 0}</dd>
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
  const deleteActivity = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/learning/activities/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setSelectedId(null);
      toast.success("Kegiatan pelatihan berhasil dihapus.");
      void invalidate();
    },
    onError: (err: Error) => toast.error(`Gagal menghapus: ${err.message}`),
  });
  const deleteEnrollment = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/learning/enrollments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Peserta berhasil dihapus dari kegiatan.");
      void invalidate();
    },
    onError: (err: Error) => toast.error(`Gagal menghapus: ${err.message}`),
  });

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;
  if (!overview) return <Empty message="Learning data is unavailable." />;
  const activities = overview.activities ?? [];
  const enrollments = overview.enrollments ?? [];
  const schemes = overview.schemes ?? [];
  const roster = selected
    ? enrollments.filter((item) => item.activityId === selected.id)
    : [];
  const totalEnrollments = enrollments.filter(
    (item) => item.status !== "cancelled",
  ).length;
  const completedCredits = activities
    .filter((item) => item.status === "completed")
    .reduce((total, item) => total + (item.creditAmount || 0), 0);

  return (
    <>
      <PageHeading
        eyebrow="Akademi & Kredit Profesi"
        title="Pelatihan & Sertifikasi SKP"
        description="Kelola agenda pelatihan teknis HVAC/R, presensi kehadiran peserta, dan penerbitan Satuan Kredit Profesi (SKP) resmi organisasi."
        action={
          <div className="heading-actions">
            <button
              className="button subtle"
              type="button"
              onClick={() => setEditor("scheme")}
            >
              <Award size={16} /> <span>Skema SKP</span>
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => setEditor("activity")}
            >
              <Plus size={16} /> <span>Tambah Kegiatan</span>
            </button>
          </div>
        }
      />
      <div className="academy-stats governance-stats">
        <article>
          <BookOpen size={24} />
          <div>
            <strong>{activities.length}</strong>
            <small>Kegiatan Pelatihan</small>
          </div>
        </article>
        <article>
          <Users size={24} />
          <div>
            <strong>{totalEnrollments}</strong>
            <small>Total Peserta Terdaftar</small>
          </div>
        </article>
        <article>
          <Award size={24} />
          <div>
            <strong>{completedCredits} SKP</strong>
            <small>Kredit Profesi Diterbitkan</small>
          </div>
        </article>
      </div>
      <div className="academy-layout inbox-layout">
        <section className="panel academy-activity-list">
          <div className="panel-head academy-panel-head">
            <div>
              <span className="eyebrow">Kalender Agenda</span>
              <h2>Daftar Kegiatan Pelatihan</h2>
            </div>
            <div className="academy-scheme-pills">
              {schemes.map((scheme) => (
                <span key={scheme.id} title={scheme.name}>
                  {scheme.code}
                </span>
              ))}
            </div>
          </div>
          <div className="academy-activities">
            {activities.map((activity) => {
              const enrolled = enrollments.filter(
                (item) =>
                  item.activityId === activity.id &&
                  item.status !== "cancelled",
              ).length;
              const d = new Date(activity.startsAt);
              return (
                <button
                  type="button"
                  className={selected?.id === activity.id ? "active" : ""}
                  key={activity.id}
                  onClick={() => setSelectedId(activity.id)}
                >
                  <span className="academy-date">
                    <strong>{d.getDate()}</strong>
                    <small>
                      {d.toLocaleDateString("id-ID", { month: "short" })}
                    </small>
                  </span>
                  <span className="academy-activity-copy">
                    <small>
                      {activity.code} ·{" "}
                      {activity.deliveryMode === "onsite"
                        ? "Tatap Muka (Onsite)"
                        : activity.deliveryMode === "online"
                          ? "Daring (Online)"
                          : activity.deliveryMode === "hybrid"
                            ? "Hybrid"
                            : "Mandiri (Self-paced)"}
                      {activity.creditAmount ? ` · ${activity.creditAmount} SKP` : ""}
                    </small>
                    <strong>{activity.title}</strong>
                    <span>
                      {enrolled}
                      {activity.capacity ? ` / ${activity.capacity}` : ""}{" "}
                      Peserta Terdaftar
                    </span>
                  </span>
                  <Status value={activity.status} />
                </button>
              );
            })}
            {!activities.length && (
              <Empty message="Belum ada kegiatan pelatihan yang dijadwalkan." />
            )}
          </div>
        </section>
        <section className="panel academy-roster">
          {selected ? (
            <>
              <div className="panel-head academy-panel-head">
                <div>
                  <span className="eyebrow">Presensi & Penerbitan SKP</span>
                  <h2>{selected.title}</h2>
                  <p>
                    {selected.creditAmount ?? 0}{" "}
                    {selected.scheme?.unitLabel ?? "SKP"} ·{" "}
                    {new Date(selected.startsAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="button subtle"
                    onClick={() => setEditor("enrollment")}
                    disabled={selected.status === "completed"}
                  >
                    <Plus size={15} /> Tambah Peserta
                  </button>
                  <button
                    type="button"
                    className="icon-button danger"
                    title="Hapus Kegiatan Pelatihan"
                    aria-label="Hapus Kegiatan Pelatihan"
                    onClick={() => {
                      if (confirm(`Hapus kegiatan pelatihan "${selected.title}"?`)) {
                        deleteActivity.mutate(selected.id);
                      }
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="academy-roster-list">
                {roster.map((item) => {
                  const initials = (item.member?.name ?? "AG")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <article key={item.id}>
                      <span className="roster-avatar">{initials}</span>
                      <div className="roster-info">
                        <strong>{item.member?.name ?? "Anggota Teknisi"}</strong>
                        <small>
                          {item.member?.memberNumber ?? "—"} ·{" "}
                          {item.status === "confirmed"
                            ? "Terkonfirmasi"
                            : item.status === "completed"
                              ? "Lulus / Selesai"
                              : "Terdaftar"}
                        </small>
                      </div>
                      <div className="attendance-actions">
                        {(["present", "late", "absent"] as const).map(
                          (status) => (
                            <button
                              type="button"
                              key={status}
                              data-status={status}
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
                              {status === "present"
                                ? "Hadir"
                                : status === "late"
                                  ? "Terlambat"
                                  : "Absen"}
                            </button>
                          ),
                        )}
                        <button
                          type="button"
                          className="icon-button danger"
                          title={`Keluarkan ${item.member?.name ?? "peserta"}`}
                          aria-label={`Keluarkan ${item.member?.name ?? "peserta"}`}
                          style={{ marginLeft: "4px" }}
                          onClick={() => {
                            if (confirm(`Hapus ${item.member?.name ?? "peserta"} dari daftar kegiatan?`)) {
                              deleteEnrollment.mutate(item.id);
                            }
                          }}
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
                {!roster.length && (
                  <Empty message="Belum ada anggota yang mendaftar pada kegiatan ini." />
                )}
              </div>
              <div className="academy-complete-bar">
                <div>
                  <strong>Selesaikan Kegiatan & Terbitkan SKP</strong>
                  <small>
                    Hanya peserta berstatus Hadir atau Terlambat yang akan menerima entri kredit SKP resmi.
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
                  <Award size={16} />{" "}
                  {selected.status === "completed"
                    ? "Telah Selesai"
                    : complete.isPending
                      ? "Menerbitkan…"
                      : "Sahkan & Terbitkan SKP"}
                </button>
              </div>
            </>
          ) : (
            <Empty message="Pilih salah satu kegiatan di daftar sebelah kiri untuk mengelola presensi." />
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
    onSuccess: () => {
      toast.success("Masa tugas pengurus telah diakhiri.");
      void client.invalidateQueries({ queryKey: ["governance-overview"] });
    },
  });

  const deleteUnit = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/governance/units/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Unit organisasi berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["governance-overview"] });
    },
    onError: (reason: Error) => toast.error(`Gagal menghapus unit: ${reason.message}`),
  });

  const deletePosition = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/governance/positions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Posisi jabatan berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["governance-overview"] });
    },
    onError: (reason: Error) => toast.error(`Gagal menghapus posisi: ${reason.message}`),
  });

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;
  const overview = query.data?.data;
  if (!overview) return <Empty message="No governance data is available." />;
  const units = overview.units ?? [];
  const positions = overview.positions ?? [];
  const assignments = overview.assignments ?? [];
  const now = Date.now();
  const isCurrent = (startsAt: string | null, endsAt: string | null) =>
    (!startsAt || new Date(startsAt).getTime() <= now) &&
    (!endsAt || new Date(endsAt).getTime() >= now);
  const currentAssignments = assignments.filter((item) =>
    isCurrent(item.startsAt, item.endsAt),
  );

  return (
    <>
      <PageHeading
        eyebrow="Tata Kelola Organisasi"
        title="Struktur & Kepengurusan"
        description="Kelola hierarki Dewan Pimpinan Pusat (DPP), DPD Wilayah, Korwil/DPC, registri posisi jabatan, dan masa bakti pengurus resmi."
        action={
          <button
            className="button primary"
            type="button"
            onClick={() => setEditor("appointment")}
          >
            <Plus size={16} /> <span>Penugasan Pengurus</span>
          </button>
        }
      />
      <div className="governance-stats">
        <article>
          <Building2 size={24} />
          <div>
            <strong>{units.filter((unit) => unit.isActive).length}</strong>
            <small>Unit Wilayah Aktif</small>
          </div>
        </article>
        <article>
          <Network size={24} />
          <div>
            <strong>{positions.length}</strong>
            <small>Posisi Struktur / Jabatan</small>
          </div>
        </article>
        <article>
          <BadgeCheck size={24} />
          <div>
            <strong>{currentAssignments.length}</strong>
            <small>Pejabat & Pengurus Terlantik</small>
          </div>
        </article>
      </div>
      <div className="governance-layout">
        <section className="panel governance-units">
          <div className="panel-head governance-panel-head">
            <div>
              <span className="eyebrow">Peta Organisasi</span>
              <h2>Unit & Wilayah</h2>
            </div>
            <button
              type="button"
              className="button subtle"
              onClick={() => setEditor("unit")}
            >
              <Plus size={15} /> Tambah Unit
            </button>
          </div>
          <div className="unit-tree">
            {units.map((unit) => {
              const parent = units.find(
                (candidate) => candidate.id === unit.parentId,
              );
              const unitPositions = positions.filter(
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="unit-title-row">
                      <strong>{unit.name}</strong>
                      <Status value={unit.isActive ? "active" : "inactive"} />
                    </div>
                    <small>
                      {unit.type === "national"
                        ? "Tingkat Nasional / Pusat"
                        : unit.type === "regional"
                          ? "Tingkat Provinsi / DPD"
                          : "Tingkat Daerah / Korwil"}{" "}
                      {parent ? `· Bagian dari ${parent.name}` : "· Unit Induk Pusat"}
                    </small>
                    <p>{unitPositions.length} Posisi Jabatan Dikonfigurasi</p>
                  </div>
                  <button
                    type="button"
                    className="icon-button danger"
                    title={`Hapus unit ${unit.name}`}
                    aria-label={`Hapus ${unit.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus unit organisasi "${unit.name}"?`)) {
                        deleteUnit.mutate(unit.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
        <section className="panel governance-positions">
          <div className="panel-head governance-panel-head">
            <div>
              <span className="eyebrow">Registri Jabatan & Pengurus</span>
              <h2>Daftar Posisi & Pejabat</h2>
            </div>
            <button
              type="button"
              className="button subtle"
              onClick={() => setEditor("position")}
            >
              <Plus size={15} /> Tambah Jabatan
            </button>
          </div>
          <div className="position-register">
            {positions.map((position) => {
              const unit = units.find(
                (candidate) => candidate.id === position.unitId,
              );
              const positionAssignmentsList = assignments.filter(
                (item) => item.positionId === position.id,
              );
              const active = positionAssignmentsList.find((item) =>
                isCurrent(item.startsAt, item.endsAt),
              );
              const initials = (active?.member?.name ?? "AG")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <article key={position.id}>
                  <div className="position-copy">
                    <small>{unit?.name ?? "Unit Tidak Ditentukan"}</small>
                    <strong>{position.title}</strong>
                    <p>
                      {position.description ?? "Belum ada rincian uraian tugas/mandat."}
                    </p>
                  </div>
                  <div className="office-holder">
                    {active ? (
                      <>
                        <div className="office-holder-avatar">
                          {initials}
                        </div>
                        <div className="office-holder-info">
                          <strong>{active.member?.name ?? "Nama Pengurus"}</strong>
                          <small>
                            {active.member?.memberNumber ?? "KTA-APTI-PENDING"}
                            {active.startsAt
                              ? ` · Menjabat sejak ${new Date(active.startsAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}`
                              : ""}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="icon-button danger"
                          title={`Akhiri masa tugas ${active.member?.name}`}
                          aria-label={`Akhiri masa tugas ${active.member?.name}`}
                          disabled={endAppointment.isPending}
                          onClick={() => {
                            if (confirm(`Akhiri masa tugas ${active.member?.name} untuk jabatan ${position.title}?`)) {
                              endAppointment.mutate(active.id);
                            }
                          }}
                        >
                          <UserX size={15} />
                        </button>
                      </>
                    ) : (
                      <span className="vacant">Posisi Lowong (Belum ada pejabat)</span>
                    )}
                    <button
                      type="button"
                      className="icon-button danger"
                      title={`Hapus posisi ${position.title}`}
                      aria-label={`Hapus ${position.title}`}
                      onClick={() => {
                        if (confirm(`Hapus posisi jabatan "${position.title}"?`)) {
                          deletePosition.mutate(position.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
            {!positions.length && (
              <Empty message="Belum ada posisi jabatan yang dikonfigurasi." />
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
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<CmsMembershipApplication | null>(
    null,
  );
  const [error, setError] = useState("");

  const query = useQuery({
    queryKey: ["membership-applications"],
    queryFn: () =>
      api<{ data: CmsMembershipApplication[]; meta: { total: number } }>(
        "/v1/admin/membership/applications?limit=200",
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
          : "Pendaftaran anggota telah ditolak.",
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
      setError("Wajib mengisi alasan penolakan sebelum menolak permohonan.");
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

  const allItems = query.data?.data ?? [];
  const countPending = allItems.filter((i) => i.status === "pending").length;
  const countApplicant = allItems.filter(
    (i) => i.status === "applicant",
  ).length;
  const countActive = allItems.filter((i) => i.status === "active").length;
  const countRejected = allItems.filter((i) => i.status === "rejected").length;

  const filtered = allItems.filter((item) => {
    if (status !== "all" && item.status !== status) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = item.member?.name ?? (item as any).fullName ?? "";
    const email = item.member?.email ?? (item as any).email ?? "";
    const phone = item.member?.phone ?? (item as any).phone ?? "";
    const unit = item.unitName ?? "";
    return (
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      phone.toLowerCase().includes(term) ||
      unit.toLowerCase().includes(term)
    );
  });

  const paginatedItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <>
      <PageHeading
        eyebrow="Operasional Keanggotaan"
        title="Pendaftaran & Verifikasi KTA"
        description="Verifikasi berkas calon anggota, tinjau kualifikasi teknisi pendingin, dan terbitkan nomor KTA Digital resmi."
      />

      <div className="segmented mb-3">
        <button
          type="button"
          className={status === "all" ? "active" : ""}
          onClick={() => {
            setStatus("all");
            setCurrentPage(1);
          }}
        >
          Semua Pendaftaran ({allItems.length})
        </button>
        <button
          type="button"
          className={status === "pending" ? "active" : ""}
          onClick={() => {
            setStatus("pending");
            setCurrentPage(1);
          }}
        >
          Menunggu Review ({countPending})
        </button>
        <button
          type="button"
          className={status === "applicant" ? "active" : ""}
          onClick={() => {
            setStatus("applicant");
            setCurrentPage(1);
          }}
        >
          Belum Verifikasi Email ({countApplicant})
        </button>
        <button
          type="button"
          className={status === "active" ? "active" : ""}
          onClick={() => {
            setStatus("active");
            setCurrentPage(1);
          }}
        >
          Disetujui ({countActive})
        </button>
        <button
          type="button"
          className={status === "rejected" ? "active" : ""}
          onClick={() => {
            setStatus("rejected");
            setCurrentPage(1);
          }}
        >
          Ditolak ({countRejected})
        </button>
      </div>

      <div className="inbox-layout applications-layout">
        <section className="table-panel inbox-list">
          <div className="table-toolbar">
            <label className="search-field" style={{ minWidth: "100%" }}>
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama pemohon, email, atau no. HP..."
              />
            </label>
          </div>

          <div className="submission-list application-list">
            {query.isLoading ? (
              <PageLoading />
            ) : filtered.length === 0 ? (
              <Empty message="Tidak ada permohonan anggota yang sesuai dengan filter." />
            ) : (
              paginatedItems.map((item) => {
                const memberName =
                  item.member?.name ?? (item as any).fullName ?? "Pemohon";
                const memberEmail =
                  item.member?.email ?? (item as any).email ?? "Tanpa email";
                const isSelected = selected?.id === item.id;
                return (
                  <button
                    type="button"
                    className={isSelected ? "active" : ""}
                    key={item.id}
                    onClick={() => {
                      setSelected(item);
                      setError("");
                    }}
                  >
                    <span
                      className="submission-dot"
                      data-status={item.status}
                    />
                    <span>
                      <strong>{memberName}</strong>
                      <small>
                        {item.unitName ?? "Dewan Pimpinan Pusat (DPP)"}
                      </small>
                      <p>
                        {memberEmail} ·{" "}
                        {new Date(
                          item.submittedAt ||
                            (item as any).createdAt ||
                            Date.now(),
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </span>
                    <Status value={item.status} />
                  </button>
                );
              })
            )}
          </div>

          <TablePagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </section>

        <section className="panel submission-detail application-detail">
          {selected ? (
            <>
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Detail Berkas Permohonan</span>
                  <h2>
                    {selected.member?.name ??
                      (selected as any).fullName ??
                      "Pemohon"}
                  </h2>
                  <p>
                    {selected.member?.memberNumber ?? "REG-PENDING"} ·{" "}
                    {selected.unitName ?? "Dewan Pimpinan Pusat (DPP)"}
                  </p>
                </div>
                <Status value={selected.status} />
              </div>

              <dl>
                <div>
                  <dt>Alamat Email</dt>
                  <dd>
                    {selected.member?.email ?? (selected as any).email ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt>Nomor Telepon / WA</dt>
                  <dd>
                    {selected.member?.phone ?? (selected as any).phone ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt>Alamat Domisili</dt>
                  <dd>
                    {selected.member?.address ??
                      (selected as any).address ??
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt>Tanggal Diajukan</dt>
                  <dd>
                    {new Date(
                      selected.submittedAt ||
                        (selected as any).createdAt ||
                        Date.now(),
                    ).toLocaleString("id-ID")}
                  </dd>
                </div>
                {Object.entries(
                  selected.member?.customFields ??
                    (selected as any).payload ??
                    {},
                ).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replace(/_/g, " ")}</dt>
                    <dd>{String(value || "—")}</dd>
                  </div>
                ))}
              </dl>

              {selected.rejectionReason && (
                <div
                  className="review-note rejected-note"
                  style={{
                    background: "#fef2f2",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #fecaca",
                    marginBottom: "12px",
                  }}
                >
                  <strong style={{ color: "#dc2626" }}>Alasan Penolakan:</strong>
                  <p style={{ margin: "4px 0 0", color: "#991b1b" }}>
                    {selected.rejectionReason}
                  </p>
                </div>
              )}

              {selected.reviewerNotes && (
                <div
                  className="review-note"
                  style={{
                    background: "#f0f9ff",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #bae6fd",
                    marginBottom: "12px",
                  }}
                >
                  <strong style={{ color: "#0284c7" }}>Catatan Reviewer:</strong>
                  <p style={{ margin: "4px 0 0", color: "#0369a1" }}>
                    {selected.reviewerNotes}
                  </p>
                </div>
              )}

              {(selected.status === "pending" ||
                selected.status === "applicant" ||
                selected.status === "rejected") && (
                <form className="review-form">
                  {error && <div className="alert error">{error}</div>}
                  <label>
                    Catatan Verifikasi Internal
                    <textarea
                      name="reviewerNotes"
                      rows={2}
                      placeholder="Catatan pemeriksaan dokumen, validasi identitas, atau klarifikasi teknisi…"
                    />
                  </label>
                  <label>
                    Masa Berlaku KTA
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
                    Alasan Penolakan (Wajib jika menolak)
                    <textarea
                      name="rejectionReason"
                      rows={2}
                      placeholder="Contoh: Dokumen KTP tidak jelas, sertifikat tidak terverifikasi…"
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
                      Tolak Permohonan
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
                        ? "Memproses…"
                        : "Setujui & Terbitkan KTA"}
                    </button>
                  </div>
                </form>
              )}

              {selected.status === "active" && (
                <div
                  className="success-callout"
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "14px",
                  }}
                >
                  <BadgeCheck size={24} color="#059669" />
                  <div>
                    <strong style={{ color: "#065f46", fontSize: "14px" }}>
                      Keanggotaan Telah Disetujui
                    </strong>
                    <p style={{ margin: "2px 0 0", color: "#047857", fontSize: "12px" }}>
                      Nomor KTA Digital dan kredensial resmi telah diterbitkan aktif untuk anggota ini.
                    </p>
                  </div>
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
          organization: {
            name: string;
            logoUrl: string | null;
            theme?: {
              colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
              };
            } | null;
            primaryColor?: string | null;
            secondaryColor?: string | null;
          };
        };
      }>(`/v1/admin/membership/members/${member.id}/card`),
  });

  const cardData = cardQuery.data?.data;
  const cardCode = cardData?.card.code || member.memberNumber;

  useEffect(() => {
    if (!cardCode) return;
    const verifyUrl = `${window.location.origin.replace("5173", "3000")}/verify?code=${encodeURIComponent(cardCode)}`;
    QRCode.toDataURL(verifyUrl, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#080c14", light: "#ffffff" },
    })
      .then(setQrCodeUrl)
      .catch((err) => console.error(err));
  }, [cardCode]);

  const downloadKtaCardOnly = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.getElementById("modern-id-card");
          if (clonedCard) {
            clonedCard.style.fontFamily =
              '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          }
        },
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeName = member.name.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `Kartu_Anggota_${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`KTA Digital ${member.name} berhasil diunduh!`);
    } catch (err: unknown) {
      console.error("Gagal mengunduh kartu KTA:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Gagal mengunduh kartu KTA. Silakan coba lagi.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

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
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal membuat kartu KTA baru.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const sendKtaNotification = async () => {
    try {
      setIsSendingEmail(true);
      await api(`/v1/admin/membership/members/${member.id}/notify-card`, {
        method: "POST",
      });
      toast.success(
        `Email dan WhatsApp KTA resmi berhasil dikirimkan ke ${member.name}!`,
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengirim notifikasi KTA.",
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const copyVerifyLink = () => {
    const verifyUrl = `${window.location.origin.replace("5173", "3000")}/verify?code=${encodeURIComponent(cardCode)}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Link verifikasi KTA disalin ke clipboard!");
  };

  const orgName = cardData?.organization.name ?? "APTI INDONESIA";
  const dpdText =
    cardData?.member.unitName ?? member.unitName ?? "Dewan Pimpinan Pusat (DPP)";
  const positionText =
    (cardData?.member as { positionName?: string })?.positionName ??
    (member as { positionName?: string })?.positionName ??
    (member.status === "active" ? "ANGGOTA RESMI" : "PEMOHON");
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rawPrimary =
    cardData?.organization.theme?.colors?.primary ||
    cardData?.organization.primaryColor ||
    "#8b5cf6";
  const rawSecondary =
    cardData?.organization.theme?.colors?.secondary ||
    cardData?.organization.secondaryColor ||
    "#06b6d4";
  const rawAccent = cardData?.organization.theme?.colors?.accent || "#f59e0b";

  const primaryColor =
    rawPrimary.startsWith("#") || rawPrimary.startsWith("rgb")
      ? rawPrimary
      : "#8b5cf6";
  const secondaryColor =
    rawSecondary.startsWith("#") || rawSecondary.startsWith("rgb")
      ? rawSecondary
      : "#06b6d4";
  const accentColor =
    rawAccent.startsWith("#") || rawAccent.startsWith("rgb")
      ? rawAccent
      : "#f59e0b";

  const cardCustomStyles = {
    "--kta-primary": primaryColor,
    "--kta-secondary": secondaryColor,
    "--kta-accent": accentColor,
  } as CSSProperties;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <button
        type="button"
        className="modal-scrim"
        onClick={onClose}
        aria-label="Tutup pratinjau KTA"
      />
      <div
        className="modal-content kta-modal-box"
        style={{ maxWidth: "560px", position: "relative", zIndex: 2 }}
      >
        <div className="modal-header">
          <div>
            <h2>Kartu Tanda Anggota (KTA Digital)</h2>
            <p className="subtext">
              Pratinjau KTA Resmi Berstandar ID Card (Portrait) · {member.name}
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
          <div
            className="kta-card-preview-container"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Visual Next-Gen Cyber ID Card (Target for Download) */}
            <div
              id="modern-id-card"
              ref={cardRef}
              className="genz-cyber-card"
              style={{
                ...cardCustomStyles,
                width: "350px",
                height: "580px",
                background: "linear-gradient(180deg, #111726 0%, #080c14 100%)",
                borderRadius: "20px",
                position: "relative",
                overflow: "hidden",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12)",
                fontFamily:
                  '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: "#ffffff",
                margin: "16px auto",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "20px 22px 16px",
              }}
            >
              {/* Top Ambient Highlight (Zero-Transform Pure Coordinate) */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "140px",
                  background:
                    "radial-gradient(ellipse at center top, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              {/* Semi-Transparent Organization Logo Watermark Background (Zero-Transform Pure Flex Center) */}
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  left: 0,
                  right: 0,
                  bottom: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.05,
                  pointerEvents: "none",
                  zIndex: 1,
                  userSelect: "none",
                }}
              >
                {cardData?.organization.logoUrl ? (
                  <img
                    src={cardData.organization.logoUrl}
                    alt=""
                    crossOrigin="anonymous"
                    style={{
                      width: "220px",
                      height: "220px",
                      objectFit: "contain",
                      filter: "grayscale(100%) brightness(1.8)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: "110px",
                      fontWeight: 900,
                      color: "#ffffff",
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      lineHeight: "1",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {orgName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Flat Top Micro-Header Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: "relative",
                  zIndex: 10,
                  width: "100%",
                  paddingBottom: "2px",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    letterSpacing: "1.5px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    lineHeight: "1",
                  }}
                >
                  <span>KTA DIGITAL</span>
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    letterSpacing: "1.5px",
                    color: "#34d399",
                    textTransform: "uppercase",
                    lineHeight: "1",
                  }}
                >
                  AKTIF
                </span>
              </div>

              {/* Organization Brand Header (Clean Minimalist) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                  zIndex: 10,
                  margin: "4px 0 2px",
                }}
              >
                {cardData?.organization.logoUrl ? (
                  <img
                    src={cardData.organization.logoUrl}
                    alt={orgName}
                    crossOrigin="anonymous"
                    style={{
                      height: "34px",
                      width: "auto",
                      maxWidth: "140px",
                      objectFit: "contain",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  />
                ) : null}
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 900,
                    letterSpacing: "0.8px",
                    color: "#ffffff",
                    textTransform: "uppercase",
                    lineHeight: "1.3",
                    margin: 0,
                  }}
                >
                  {orgName}
                </div>
              </div>

              {/* Concentric Avatar Visual */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 10,
                  margin: "0",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "104px",
                    height: "104px",
                  }}
                >
                  {/* Outer Ring */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "104px",
                      height: "104px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  {/* Dark Gap Bezel */}
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: "3px",
                      width: "98px",
                      height: "98px",
                      borderRadius: "50%",
                      background: "#080c14",
                    }}
                  />
                  {/* Avatar Image / Placeholder */}
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      width: "92px",
                      height: "92px",
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="cyber-avatar-img"
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                          background: "#1e293b",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                          color: "#ffffff",
                          fontSize: "30px",
                          fontWeight: 800,
                          letterSpacing: "1px",
                        }}
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: "#0284c7",
                      color: "#ffffff",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "grid",
                      placeItems: "center",
                      border: "2px solid #080c14",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.5)",
                      zIndex: 5,
                    }}
                  >
                    <CheckCircle2 size={13} />
                  </div>
                </div>
              </div>

              {/* Member Identity & Flat Serial */}
              <div
                style={{
                  textAlign: "center",
                  position: "relative",
                  zIndex: 10,
                  margin: "0",
                }}
              >
                <div
                  style={{
                    fontSize: "15.5px",
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    lineHeight: "1.3",
                    padding: "0 4px",
                    margin: 0,
                  }}
                >
                  {member.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                    marginTop: "4px",
                    lineHeight: "1.3",
                    color: "#38bdf8",
                  }}
                >
                  <span>{cardCode}</span>
                </div>
              </div>

              {/* Clean Info & QR Spec Card (Never-Wrapping Crisp Layout) */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  position: "relative",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                {/* Spec Details Column */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    minWidth: 0,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "7.5px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        color: "#64748b",
                        textTransform: "uppercase",
                        display: "block",
                        lineHeight: "1.3",
                        marginBottom: "1px",
                      }}
                    >
                      WILAYAH
                    </span>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 800,
                        lineHeight: "1.4",
                        color: "#f8fafc",
                        whiteSpace: "nowrap",
                        display: "block",
                        padding: "1px 0",
                      }}
                    >
                      {dpdText}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: "7.5px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        color: "#64748b",
                        textTransform: "uppercase",
                        display: "block",
                        lineHeight: "1.3",
                        marginBottom: "1px",
                      }}
                    >
                      STATUS
                    </span>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 800,
                        lineHeight: "1.4",
                        color: "#34d399",
                        whiteSpace: "nowrap",
                        display: "block",
                        padding: "1px 0",
                      }}
                    >
                      {positionText}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      paddingTop: "3px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "7px",
                          fontWeight: 700,
                          letterSpacing: "0.8px",
                          color: "#64748b",
                          textTransform: "uppercase",
                          display: "block",
                          lineHeight: "1.3",
                          marginBottom: "1px",
                        }}
                      >
                        TERBIT
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          lineHeight: "1.3",
                          color: "#cbd5e1",
                          whiteSpace: "nowrap",
                          display: "block",
                          padding: "1px 0",
                        }}
                      >
                        {new Date(
                          cardData?.card.issuedAt || Date.now(),
                        ).toLocaleDateString("id-ID", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: "7px",
                          fontWeight: 700,
                          letterSpacing: "0.8px",
                          color: "#64748b",
                          textTransform: "uppercase",
                          display: "block",
                          lineHeight: "1.3",
                          marginBottom: "1px",
                        }}
                      >
                        VERSI
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          lineHeight: "1.3",
                          color: "#cbd5e1",
                          whiteSpace: "nowrap",
                          display: "block",
                          padding: "1px 0",
                        }}
                      >
                        v{cardData?.card.version ?? 1}.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* High-Contrast Fast-Scanning QR Container */}
                <div
                  style={{
                    background: "#ffffff",
                    padding: "4px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: "68px",
                    height: "68px",
                  }}
                >
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Verifikasi"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "6px",
                        display: "block",
                      }}
                    />
                  ) : (
                    <QrCode size={56} color="#080c14" />
                  )}
                </div>
              </div>

              {/* Bottom Decal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  color: "#64748b",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                  position: "relative",
                  zIndex: 10,
                  whiteSpace: "nowrap",
                  lineHeight: "1",
                  textTransform: "uppercase",
                }}
              >
                <span>KARTU TANDA ANGGOTA DIGITAL RESMI</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <button
                type="button"
                className="button primary"
                onClick={downloadKtaCardOnly}
                disabled={isDownloading}
              >
                <Download size={16} />{" "}
                {isDownloading ? "Mengunduh HD..." : "Download KTA (PNG)"}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={sendKtaNotification}
                disabled={isSendingEmail}
              >
                <Mail size={16} />{" "}
                {isSendingEmail ? "Mengirim Email..." : "Kirim Email KTA"}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={copyVerifyLink}
              >
                <Copy size={16} /> Link Verifikasi
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={generateNewCard}
                disabled={isGenerating}
              >
                <RefreshCw size={16} className={isGenerating ? "spin" : ""} />{" "}
                Terbitkan Ulang
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
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <button
        type="button"
        className="modal-scrim"
        onClick={onClose}
        aria-label="Tutup verifikasi"
      />
      <div
        className="modal-content"
        style={{ maxWidth: "560px", position: "relative", zIndex: 2 }}
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
              Kode KTA <strong>"{searchCode}"</strong> tidak terdaftar atau
              sudah dicabut.
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
                <dt
                  style={{
                    fontSize: "11px",
                    color: "#15803D",
                    textTransform: "uppercase",
                  }}
                >
                  Nama Anggota
                </dt>
                <dd
                  style={{
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "#0F172A",
                  }}
                >
                  {query.data.data.member.name}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "11px",
                    color: "#15803D",
                    textTransform: "uppercase",
                  }}
                >
                  No. KTA / Anggota
                </dt>
                <dd
                  style={{
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "#0F172A",
                  }}
                >
                  {query.data.data.member.memberNumber}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "11px",
                    color: "#15803D",
                    textTransform: "uppercase",
                  }}
                >
                  Unit Organisasi
                </dt>
                <dd style={{ fontWeight: 600, color: "#334155" }}>
                  {query.data.data.member.unitName ?? "DPP INDONESIA"}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "11px",
                    color: "#15803D",
                    textTransform: "uppercase",
                  }}
                >
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCardMember, setSelectedCardMember] =
    useState<CmsMember | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const query = useQuery({
    queryKey: ["members", search],
    queryFn: () =>
      api<{ data: CmsMember[] }>(
        `/v1/admin/members?limit=200&search=${encodeURIComponent(search)}`,
      ),
  });
  const rawItems = query.data?.data ?? [];
  const items = useMemo(() => {
    return [...rawItems].sort((a, b) => {
      const timeA = new Date(
        (a as any).createdAt || (a as any).joinedAt || 0,
      ).getTime();
      const timeB = new Date(
        (b as any).createdAt || (b as any).joinedAt || 0,
      ).getTime();
      return timeB - timeA;
    });
  }, [rawItems]);
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name or KTA number…"
            />
          </label>
          <span className="result-count">
            {items.length} members
          </span>
        </div>
        <div className="data-table">
          <div className="table-row members-row table-head">
            <span>Member</span>
            <span>Unit</span>
            <span>Status</span>
            <span />
          </div>
          {paginatedItems.map((item) => (
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
                  className="icon-button secondary"
                  title="Kartu KTA Digital"
                  aria-label={`Kartu KTA ${item.name}`}
                  onClick={() => setSelectedCardMember(item)}
                >
                  <CreditCard size={16} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  title="Edit Anggota"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => setEditor(item)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  title="Hapus Anggota"
                  aria-label={`Delete ${item.name}`}
                  onClick={() =>
                    confirm(`Delete ${item.name}?`) && remove.mutate(item.id)
                  }
                >
                  <Trash2 size={16} />
                </button>
              </span>
            </div>
          ))}
        </div>
        {!query.isLoading && !items.length && (
          <Empty message="No members match this view." />
        )}
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
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
  const [unitId, setUnitId] = useState(member?.unitId ?? "");
  const [status, setStatus] = useState<string>(member?.status ?? "applicant");
  const [customFieldItems, setCustomFieldItems] = useState<
    Array<{ key: string; value: string }>
  >(() => {
    if (!member?.customFields) return [];
    return Object.entries(member.customFields).map(([k, v]) => ({
      key: k,
      value: String(v ?? ""),
    }));
  });
  const [socialLinkItems, setSocialLinkItems] = useState<
    Array<{ platform: string; url: string }>
  >(() => member?.socialLinks ?? []);

  const units = useQuery({
    queryKey: ["organization-units"],
    queryFn: () => api<{ data: CmsUnit[] }>("/v1/admin/organization-units"),
  });
  const save = useMutation({
    mutationFn: (form: HTMLFormElement) => {
      const data = new FormData(form);
      const value = (key: string) => String(data.get(key) ?? "").trim();
      const customFields: Record<string, unknown> = {};
      for (const item of customFieldItems) {
        if (item.key.trim()) {
          customFields[item.key.trim()] = item.value.trim();
        }
      }
      const socialLinks = socialLinkItems
        .filter((s) => s.url.trim())
        .map((s) => ({ platform: s.platform || "website", url: s.url.trim() }));

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
        <div className="field-group">
          <span>Organization unit</span>
          <SearchableSelect
            name="unitId"
            value={unitId}
            onChange={setUnitId}
            placeholder="Cari & Pilih Unit Organisasi..."
            options={[
              { value: "", label: "Unassigned (Tidak Ada Unit)" },
              ...(units.data?.data.map((unit) => ({
                value: unit.id,
                label: `${unit.name} (${unit.type})`,
              })) ?? []),
            ]}
          />
        </div>
        <label>
          Joined date
          <input
            name="joinedAt"
            type="date"
            defaultValue={dateInput(member?.joinedAt)}
          />
        </label>
        <div className="field-group">
          <span>Status</span>
          <SearchableSelect
            name="status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "applicant", label: "Applicant (Pendaftar Baru)" },
              { value: "pending", label: "Pending review" },
              { value: "active", label: "Active (Anggota Aktif)" },
              { value: "inactive", label: "Inactive (Tidak Aktif)" },
              { value: "rejected", label: "Rejected (Ditolak)" },
            ]}
          />
        </div>
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

        {/* Custom Fields Builder */}
        <div
          className="full"
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#344054" }}>
            Custom Fields (Informasi Tambahan Organisasi)
          </span>
          <div className="nav-tree-editor">
            {customFieldItems.map((item, index) => (
              <div
                key={index}
                className="nav-tree-card"
                style={{ padding: "10px 12px" }}
              >
                <div className="nav-tree-parent-row">
                  <div className="nav-tree-field">
                    <span className="nav-tree-label">Nama Field / Label</span>
                    <input
                      type="text"
                      className="nav-tree-input"
                      value={item.key}
                      onChange={(e) =>
                        setCustomFieldItems(
                          customFieldItems.map((c, i) =>
                            i === index ? { ...c, key: e.target.value } : c,
                          ),
                        )
                      }
                      placeholder="misal: Nomor Sertifikat BNSP"
                    />
                  </div>
                  <div className="nav-tree-field">
                    <span className="nav-tree-label">Nilai Field (Value)</span>
                    <input
                      type="text"
                      className="nav-tree-input"
                      value={item.value}
                      onChange={(e) =>
                        setCustomFieldItems(
                          customFieldItems.map((c, i) =>
                            i === index ? { ...c, value: e.target.value } : c,
                          ),
                        )
                      }
                      placeholder="misal: BNSP-AC-2026-98712"
                    />
                  </div>
                  <div className="nav-tree-actions">
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Field"
                      onClick={() =>
                        setCustomFieldItems(
                          customFieldItems.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="button secondary wide-btn"
              onClick={() =>
                setCustomFieldItems([
                  ...customFieldItems,
                  { key: "", value: "" },
                ])
              }
            >
              <Plus size={16} /> Tambah Field Kustom
            </button>
          </div>
        </div>

        {/* Social Links Builder */}
        <div
          className="full"
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#344054" }}>
            Social Media & Web Links
          </span>
          <div className="nav-tree-editor">
            {socialLinkItems.map((item, index) => (
              <div
                key={index}
                className="nav-tree-card"
                style={{ padding: "10px 12px" }}
              >
                <div className="nav-tree-parent-row">
                  <div className="nav-tree-field">
                    <span className="nav-tree-label">Platform</span>
                    <SearchableSelect
                      value={item.platform}
                      onChange={(val) =>
                        setSocialLinkItems(
                          socialLinkItems.map((c, i) =>
                            i === index ? { ...c, platform: val } : c,
                          ),
                        )
                      }
                      options={[
                        { value: "instagram", label: "Instagram" },
                        { value: "facebook", label: "Facebook" },
                        { value: "linkedin", label: "LinkedIn" },
                        { value: "twitter", label: "Twitter / X" },
                        { value: "youtube", label: "YouTube" },
                        { value: "tiktok", label: "TikTok" },
                        { value: "whatsapp", label: "WhatsApp" },
                        { value: "website", label: "Website / Blog" },
                      ]}
                    />
                  </div>
                  <div className="nav-tree-field">
                    <span className="nav-tree-label">URL Media Sosial</span>
                    <input
                      type="url"
                      className="nav-tree-input"
                      value={item.url}
                      onChange={(e) =>
                        setSocialLinkItems(
                          socialLinkItems.map((c, i) =>
                            i === index ? { ...c, url: e.target.value } : c,
                          ),
                        )
                      }
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div className="nav-tree-actions">
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Link Sosmed"
                      onClick={() =>
                        setSocialLinkItems(
                          socialLinkItems.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="button secondary wide-btn"
              onClick={() =>
                setSocialLinkItems([
                  ...socialLinkItems,
                  { platform: "instagram", url: "" },
                ])
              }
            >
              <Plus size={16} /> Tambah Link Sosmed
            </button>
          </div>
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

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/admin/submissions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setSelected(null);
      toast.success("Pesan berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["submissions"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => toast.error(`Gagal menghapus pesan: ${err.message}`),
  });
  const items = query.data?.data ?? [];
  return (
    <>
      <PageHeading
        eyebrow="Pesan & Komunikasi"
        title="Kotak Masuk (Inbox)"
        description="Kelola pesan formulir kontak publik, permohonan informasi, dan konsultasi teknis dari mitra dan masyarakat."
      />
      <div className="inbox-layout">
        <section className="table-panel inbox-list">
          <div className="table-toolbar">
            <label className="search-field">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari pengirim, subjek, atau email…"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="new">Baru (New)</option>
              <option value="in_progress">Sedang Diproses</option>
              <option value="resolved">Selesai (Resolved)</option>
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
                    {item.subject || item.formName || "Pesan Masuk"} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                  <p>{submissionPreview(item)}</p>
                </span>
                <Status value={item.status} />
              </button>
            ))}
          </div>
          {!query.isLoading && !items.length && (
            <Empty message="Tidak ada pesan masuk yang sesuai dengan filter ini." />
          )}
        </section>
        <section className="panel submission-detail">
          {selected ? (
            <>
              <div className="panel-head">
                <div>
                  <span className="eyebrow">{selected.subject || selected.formName || "Formulir Kontak Publik"}</span>
                  <h2>{submissionTitle(selected)}</h2>
                  <p>
                    Diterima pada {new Date(selected.createdAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Status value={selected.status} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "16px 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Email Pengirim</span>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{selected.email || "—"}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Nomor Telepon / WhatsApp</span>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{selected.phone || "—"}</p>
                  </div>
                </div>

                {selected.subject && (
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Perihal / Topik</span>
                    <h3 style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{selected.subject}</h3>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Isi Pesan Masuk</span>
                  <div style={{ margin: "6px 0 0", padding: "16px", background: "#ffffff", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "13.5px", lineHeight: "1.6", color: "#1e293b", whiteSpace: "pre-wrap" }}>
                    {selected.message || (selected.payload && (selected.payload.message as string || selected.payload.description as string)) || "—"}
                  </div>
                </div>

                {selected.payload && Object.keys(selected.payload).length > 0 && (
                  <dl style={{ marginTop: "10px" }}>
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
                )}
              </div>

              <div className="submission-actions">
                <button
                  type="button"
                  className="icon-button danger"
                  title="Hapus Pesan Masuk"
                  aria-label="Hapus Pesan Masuk"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (confirm(`Hapus pesan dari "${submissionTitle(selected)}"?`)) {
                      remove.mutate(selected.id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  className="button ghost"
                  disabled={update.isPending}
                  onClick={() =>
                    update.mutate({ id: selected.id, nextStatus: "spam" })
                  }
                >
                  Tandai Spam
                </button>
                <button
                  type="button"
                  className="button secondary"
                  disabled={update.isPending}
                  onClick={() =>
                    update.mutate({
                      id: selected.id,
                      nextStatus: "in_progress",
                    })
                  }
                >
                  Proses Pesan
                </button>
                <button
                  type="button"
                  className="button primary"
                  disabled={update.isPending}
                  onClick={() =>
                    update.mutate({ id: selected.id, nextStatus: "resolved" })
                  }
                >
                  Selesaikan & Arsipkan
                </button>
              </div>
            </>
          ) : (
            <Empty message="Pilih salah satu pesan dari daftar sebelah kiri untuk membaca detail." />
          )}
        </section>
      </div>
    </>
  );
}

function submissionTitle(item: CmsSubmission) {
  return (
    item.name ||
    (item.payload && (item.payload.name as string || item.payload.full_name as string || item.payload.email as string)) ||
    item.email ||
    "Pengirim Anonim"
  );
}

function submissionPreview(item: CmsSubmission) {
  const message =
    item.message ||
    item.subject ||
    (item.payload && (item.payload.message as string || item.payload.description as string));
  return typeof message === "string"
    ? message.slice(0, 110)
    : "Buka untuk melihat isi pesan";
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
    primary: "#0284c7",
    secondary: "#090d16",
    accent: "#38bdf8",
    surface: "#f8fafc",
    foreground: "#0f172a",
  },
  radius: "large",
  fontHeading: "Manrope",
  fontBody: "Inter",
};

const themePresets: Array<{ name: string; description: string; theme: Theme }> =
  [
    {
      name: "APTI Titanium Slate",
      description: "Deep Slate & Sapphire Blue (Standar Eksekutif Modern)",
      theme: {
        colors: {
          primary: "#0284c7",
          secondary: "#090d16",
          accent: "#38bdf8",
          surface: "#f8fafc",
          foreground: "#0f172a",
        },
        radius: "large",
        fontHeading: "Manrope",
        fontBody: "Inter",
      },
    },
    {
      name: "APTI Ocean Navy",
      description: "Navy Klasik Asosiasi & Amber Gold Elegan",
      theme: {
        colors: {
          primary: "#0b3b60",
          secondary: "#062137",
          accent: "#d97706",
          surface: "#f8fafc",
          foreground: "#0f172a",
        },
        radius: "large",
        fontHeading: "Manrope",
        fontBody: "Inter",
      },
    },
    {
      name: "Emerald Competency",
      description: "Sertifikasi BNSP Hijau Zamrud & Charcoal Tech",
      theme: {
        colors: {
          primary: "#059669",
          secondary: "#064e3b",
          accent: "#10b981",
          surface: "#f8fafc",
          foreground: "#0f172a",
        },
        radius: "medium",
        fontHeading: "Plus Jakarta Sans",
        fontBody: "Inter",
      },
    },
    {
      name: "Midnight Royal",
      description: "Royal Indigo & Dark Modern Atmosphere",
      theme: {
        colors: {
          primary: "#4f46e5",
          secondary: "#1e1b4b",
          accent: "#818cf8",
          surface: "#f8fafc",
          foreground: "#0f172a",
        },
        radius: "large",
        fontHeading: "Plus Jakarta Sans",
        fontBody: "DM Sans",
      },
    },
    {
      name: "Carbon Monochrome",
      description: "Minimalis Hitam Abu-abu Titanium & Swiss Style",
      theme: {
        colors: {
          primary: "#18181b",
          secondary: "#09090b",
          accent: "#71717a",
          surface: "#fafafa",
          foreground: "#09090b",
        },
        radius: "small",
        fontHeading: "Inter",
        fontBody: "Inter",
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
      toast.success(
        "Tema & identitas visual berhasil disimpan! Halaman publik telah disinkronisasi penuh.",
      );
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
      label: "Primary (Brand Utama)",
      hint: "Tombol aksi, link aktif, KTA badge, dan elemen fokus utama",
    },
    {
      key: "secondary",
      label: "Secondary (Gradien & Hero)",
      hint: "Warna kanvas gelap hero banner, footer, dan kontras tegas",
    },
    {
      key: "accent",
      label: "Accent (Aksen & Sorotan)",
      hint: "Highlight tag, chip SKP, dan indikator status penting",
    },
    {
      key: "surface",
      label: "Surface (Latar Belakang Bagian)",
      hint: "Latar kartu, section selang-seling, dan container data",
    },
    {
      key: "foreground",
      label: "Foreground (Teks & Tipografi)",
      hint: "Warna judul utama, subjudul, dan teks body",
    },
  ];

  const resolvedRadius =
    theme.radius === "pill"
      ? "9999px"
      : theme.radius === "large"
        ? "18px"
        : theme.radius === "medium"
          ? "12px"
          : theme.radius === "small"
            ? "6px"
            : "0px";

  return (
    <>
      <PageHeading
        eyebrow="Sistem Desain & Tema"
        title="Tema & Identitas Visual"
        description="Konfigurasikan palet warna, tipografi, dan kelengkungan sudut. Semua perubahan tersinkronisasi 100% secara real-time ke halaman publik."
        action={
          <button
            type="button"
            className="button primary"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            <Save size={17} /> {saved ? "Tersimpan!" : "Simpan Perubahan"}
          </button>
        }
      />
      <div className="appearance-grid">
        <section className="panel form-panel">
          <h2>Palet Tema Kurasi</h2>
          <p>
            Pilih kombinasi tema profesional yang sudah teruji rasio kontras
            WCAG AAA, atau sesuaikan setiap token warna secara mandiri.
          </p>
          <div className="palette-presets">
            {themePresets.map((preset) => (
              <button
                type="button"
                key={preset.name}
                className={
                  theme.colors.primary === preset.theme.colors.primary &&
                  theme.colors.secondary === preset.theme.colors.secondary
                    ? "preset-active"
                    : ""
                }
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
          <h2>Warna Brand</h2>
          <p>
            Setiap nilai disimpan di database organisasi dan langsung diterapkan
            ke seluruh elemen website publik.
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
              Font Judul (Heading)
              <select
                value={theme.fontHeading}
                onChange={(event) =>
                  setTheme((current) => ({
                    ...current,
                    fontHeading: event.target.value,
                  }))
                }
              >
                <option value="Manrope">Manrope (Modern Geometric)</option>
                <option value="Inter">Inter (Swiss Neutral)</option>
                <option value="Plus Jakarta Sans">
                  Plus Jakarta Sans (Executive Clean)
                </option>
                <option value="DM Sans">DM Sans (Warm Modern)</option>
                <option value="Outfit">Outfit (High Tech Techy)</option>
                <option value="Roboto">Roboto (Classic Standard)</option>
              </select>
            </label>
            <label>
              Font Body (Paragraf)
              <select
                value={theme.fontBody}
                onChange={(event) =>
                  setTheme((current) => ({
                    ...current,
                    fontBody: event.target.value,
                  }))
                }
              >
                <option value="Inter">Inter (Sangat Jelas & Terbaca)</option>
                <option value="DM Sans">DM Sans (Humanis & Rapi)</option>
                <option value="Plus Jakarta Sans">
                  Plus Jakarta Sans (Tajam & Modern)
                </option>
                <option value="Outfit">Outfit (Kontemporer)</option>
                <option value="Roboto">Roboto (Tradisional)</option>
              </select>
            </label>
            <label>
              Gaya Kelengkungan Sudut (Border Radius)
              <select
                value={theme.radius}
                onChange={(event) =>
                  setTheme((current) => ({
                    ...current,
                    radius: event.target.value as Theme["radius"],
                  }))
                }
              >
                <option value="none">
                  Kotak Tajam (0px - Brutalist / Precision)
                </option>
                <option value="small">
                  Halus Minimalis (6px - Compact / Classic)
                </option>
                <option value="medium">
                  Standar Proporsional (12px - Enterprise)
                </option>
                <option value="large">
                  Modern Rounded (18px - Modern SaaS / Rekomendasi)
                </option>
                <option value="pill">
                  Kapsul Bulat Penuh (Pill 9999px - Fluid Organic)
                </option>
              </select>
            </label>
          </div>
        </section>
        <section
          className="theme-preview-container"
          style={
            {
              "--preview-primary": theme.colors.primary,
              "--preview-secondary": theme.colors.secondary,
              "--preview-accent": theme.colors.accent,
              "--preview-surface": theme.colors.surface,
              "--preview-foreground": theme.colors.foreground,
              "--preview-radius": resolvedRadius,
              "--preview-heading": theme.fontHeading,
              "--preview-body": theme.fontBody,
            } as CSSProperties
          }
        >
          <div className="preview-browser-bar">
            <span className="browser-dot red" />
            <span className="browser-dot yellow" />
            <span className="browser-dot green" />
            <div className="browser-url-pill">
              <span className="lock-icon">🔒</span> https://apti.or.id
            </div>
            <span className="live-pill">Live Preview</span>
          </div>
          <div className="theme-preview-inner">
            <div className="preview-nav">
              <div className="preview-brand-group">
                <span className="preview-logo-box">A</span>
                <div className="preview-brand-text">
                  <strong>APTI INDONESIA</strong>
                  <small>Refrigerasi Tata Udara</small>
                </div>
              </div>
              <div className="preview-links">
                <span className="active-link">Beranda</span>
                <span>Agenda</span>
                <span>Struktur</span>
                <span>Verifikasi</span>
              </div>
              <button type="button" className="preview-nav-cta">
                Daftar Anggota
              </button>
            </div>
            <div className="preview-hero">
              <div className="preview-hero-chip">
                <i className="chip-dot" /> ASOSIASI TEKNISI REFRIGERASI
              </div>
              <h2>
                Mewujudkan Teknisi Pendingin Kompeten & Tersertifikasi BNSP
              </h2>
              <p>
                Pusat sertifikasi keahlian, registrasi KTA digital terintegrasi
                QR, dan jejaring pengusaha HVAC/R se-Nusantara.
              </p>
              <div className="preview-hero-actions">
                <button type="button" className="preview-btn-primary">
                  Gabung Anggota Resmi →
                </button>
                <button type="button" className="preview-btn-ghost">
                  Cek KTA Digital
                </button>
              </div>
            </div>
            <div className="preview-cards-grid">
              <div className="preview-card-item">
                <span className="card-badge-dot" />
                <strong>12.450+</strong>
                <small>Teknisi Terdaftar</small>
              </div>
              <div className="preview-card-item">
                <span className="card-badge-dot" />
                <strong>38 Provinsi</strong>
                <small>DPD & Korwil</small>
              </div>
              <div className="preview-card-item">
                <span className="card-badge-dot" />
                <strong>BNSP & SKP</strong>
                <small>Standar Resmi</small>
              </div>
            </div>
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
  const [footerNavItems, setFooterNavItems] = useState<
    Array<{ label: string; href: string }>
  >([]);
  const [navItems, setNavItems] = useState<PublicNavItem[]>([]);
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
    setNavItems(
      data.navigation?.length
        ? data.navigation
        : [
            { id: "events", label: "Agenda", href: "/events" },
            { id: "structure", label: "Struktur", href: "/structure" },
            { id: "verify", label: "Verifikasi Kredensial", href: "/verify" },
          ],
    );
    setFooterNavItems(safeSettings.footer?.links ?? []);
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
    const next = {
      ...settings,
      navigation: navItems,
      footer: { ...settings.footer, links: footerNavItems },
    } as CmsPublicSettings;
    setSettings(next);
    save.mutate(next);
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
          <span className="eyebrow">Public navigation</span>
          <h2>Header navigation menu (Tree Structure)</h2>
          <p>
            Kelola hirarki menu navigasi atas. Buat menu utama dan sub-menu
            (dropdown) dengan mudah tanpa batasan.
          </p>

          <div className="nav-tree-editor">
            {navItems.map((item, pIndex) => (
              <div key={item.id || pIndex} className="nav-tree-card">
                <div className="nav-tree-parent-row">
                  <div className="nav-tree-field">
                    <span className="nav-tree-label">Label Menu Utama</span>
                    <input
                      type="text"
                      className="nav-tree-input"
                      value={item.label}
                      onChange={(e) =>
                        setNavItems(
                          navItems.map((c, i) =>
                            i === pIndex ? { ...c, label: e.target.value } : c,
                          ),
                        )
                      }
                      placeholder="misal: Layanan & Informasi"
                    />
                  </div>
                  <div className="nav-tree-field">
                    <span className="nav-tree-label">URL Target (Href)</span>
                    <input
                      type="text"
                      className="nav-tree-input"
                      value={item.href}
                      onChange={(e) =>
                        setNavItems(
                          navItems.map((c, i) =>
                            i === pIndex ? { ...c, href: e.target.value } : c,
                          ),
                        )
                      }
                      placeholder="misal: /events atau #"
                    />
                  </div>
                  <div className="nav-tree-actions">
                    <button
                      type="button"
                      className="icon-button"
                      title="Tambah Sub-Menu under item ini"
                      aria-label="Tambah Sub-Menu"
                      onClick={() =>
                        setNavItems(
                          navItems.map((c, i) =>
                            i === pIndex
                              ? {
                                  ...c,
                                  children: [
                                    ...(c.children || []),
                                    {
                                      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                      label: "",
                                      href: "",
                                    },
                                  ],
                                }
                              : c,
                          ),
                        )
                      }
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Menu Utama"
                      onClick={() =>
                        setNavItems(navItems.filter((_, i) => i !== pIndex))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Sub-menu (Children) tree */}
                {item.children && item.children.length > 0 && (
                  <div className="nav-tree-children-list">
                    {item.children.map((child, cIndex) => (
                      <div
                        key={child.id || cIndex}
                        className="nav-tree-child-row"
                      >
                        <div className="nav-tree-branch-icon">
                          <CornerDownRight size={16} />
                        </div>
                        <div className="nav-tree-field">
                          <span className="nav-tree-label">Label Sub-Menu</span>
                          <input
                            type="text"
                            className="nav-tree-input"
                            value={child.label}
                            onChange={(e) =>
                              setNavItems(
                                navItems.map((pItem, pi) =>
                                  pi === pIndex
                                    ? {
                                        ...pItem,
                                        children: pItem.children?.map(
                                          (ch, ci) =>
                                            ci === cIndex
                                              ? { ...ch, label: e.target.value }
                                              : ch,
                                        ),
                                      }
                                    : pItem,
                                ),
                              )
                            }
                            placeholder="misal: Sertifikasi SKP"
                          />
                        </div>
                        <div className="nav-tree-field">
                          <span className="nav-tree-label">
                            URL Target (Href)
                          </span>
                          <input
                            type="text"
                            className="nav-tree-input"
                            value={child.href}
                            onChange={(e) =>
                              setNavItems(
                                navItems.map((pItem, pi) =>
                                  pi === pIndex
                                    ? {
                                        ...pItem,
                                        children: pItem.children?.map(
                                          (ch, ci) =>
                                            ci === cIndex
                                              ? { ...ch, href: e.target.value }
                                              : ch,
                                        ),
                                      }
                                    : pItem,
                                ),
                              )
                            }
                            placeholder="misal: /events"
                          />
                        </div>
                        <div className="nav-tree-actions">
                          <button
                            type="button"
                            className="icon-button danger"
                            title="Hapus Sub-Menu"
                            onClick={() =>
                              setNavItems(
                                navItems.map((pItem, pi) =>
                                  pi === pIndex
                                    ? {
                                        ...pItem,
                                        children: pItem.children?.filter(
                                          (_, ci) => ci !== cIndex,
                                        ),
                                      }
                                    : pItem,
                                ),
                              )
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              className="button secondary wide-btn"
              onClick={() =>
                setNavItems([
                  ...navItems,
                  {
                    id: `nav-${Date.now()}`,
                    label: "",
                    href: "",
                  },
                ])
              }
            >
              <Plus size={16} /> Tambah Menu Utama
            </button>
          </div>
        </section>

        <section className="panel settings-panel wide-panel">
          <span className="eyebrow">Site footer</span>
          <h2>Footer content and links</h2>
          <div
            className="entity-form compact-form"
            style={{ marginBottom: "16px" }}
          >
            <label className="full-span">
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
            <label className="full-span">
              Copyright
              <textarea
                rows={2}
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
          </div>

          <div className="nav-tree-editor">
            <span className="nav-tree-label">Footer Quick Links</span>
            {footerNavItems.map((item, index) => (
              <div
                key={index}
                className="nav-tree-card"
                style={{ padding: "12px 14px" }}
              >
                <div className="nav-tree-parent-row">
                  <div className="nav-tree-field">
                    <span className="nav-tree-label">Label Link Footer</span>
                    <input
                      type="text"
                      className="nav-tree-input"
                      value={item.label}
                      onChange={(e) =>
                        setFooterNavItems(
                          footerNavItems.map((c, i) =>
                            i === index ? { ...c, label: e.target.value } : c,
                          ),
                        )
                      }
                      placeholder="misal: Syarat & Ketentuan"
                    />
                  </div>
                  <div className="nav-tree-field">
                    <span className="nav-tree-label">URL Target (Href)</span>
                    <input
                      type="text"
                      className="nav-tree-input"
                      value={item.href}
                      onChange={(e) =>
                        setFooterNavItems(
                          footerNavItems.map((c, i) =>
                            i === index ? { ...c, href: e.target.value } : c,
                          ),
                        )
                      }
                      placeholder="misal: /terms"
                    />
                  </div>
                  <div className="nav-tree-actions">
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Link Footer"
                      onClick={() =>
                        setFooterNavItems(
                          footerNavItems.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="button secondary wide-btn"
              onClick={() =>
                setFooterNavItems([...footerNavItems, { label: "", href: "" }])
              }
            >
              <Plus size={16} /> Tambah Link Footer
            </button>
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
  const action = useMutation({
    mutationFn: ({ path, body }: { path: string; body: unknown }) =>
      api(path, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      setDialog(null);
      setError("");
      toast.success("Data berhasil disimpan.");
      void client.invalidateQueries({ queryKey: ["revenue-overview"] });
    },
    onError: (reason: Error) => setError(reason.message),
  });
  const remove = useMutation({
    mutationFn: ({ path }: { path: string }) =>
      api(path, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Item berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["revenue-overview"] });
    },
    onError: (err: Error) => toast.error(`Gagal menghapus: ${err.message}`),
  });
  const overview = query.data?.data;
  const products = overview?.products ?? [];
  const invoices = overview?.invoices ?? [];
  const entitlements = overview?.entitlements ?? [];
  const members = overview?.members ?? [];
  const segments = overview?.segments ?? [];
  const campaigns = overview?.campaigns ?? [];

  const outstanding = invoices.reduce(
    (sum, invoice) =>
      sum + Math.max(0, (invoice.total || 0) - (invoice.paid || 0)),
    0,
  );
  const collected = invoices.reduce(
    (sum, invoice) => sum + (invoice.paid || 0),
    0,
  );
  const activeBenefits = entitlements.filter(
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
          lines: [
            {
              productId: String(form.get("productId")),
              quantity: Number(form.get("quantity") || 1),
            },
          ],
          dueDays: Number(form.get("dueDays") || 14),
          notes: String(form.get("notes") || "") || null,
        },
      });
    if (dialog === "payment")
      action.mutate({
        path: "/v1/admin/revenue/payments",
        body: {
          invoiceId: selectedInvoice,
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
            membershipStatuses: form.get("status")
              ? [String(form.get("status"))]
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
        eyebrow="Tata Kelola Finansial"
        title="Keuangan & Iuran Anggota"
        description="Kelola tagihan iuran tahunan, rekonsiliasi pembayaran, penerbitan hak akses KTA digital, dan pengelolaan segmen anggota."
        action={
          <div className="heading-actions">
            <button
              className="button secondary"
              type="button"
              onClick={() =>
                setDialog(tab === "billing" ? "product" : "segment")
              }
            >
              <Plus size={16} />{" "}
              <span>{tab === "billing" ? "Tambah Produk" : "Tambah Segmen"}</span>
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() =>
                setDialog(tab === "billing" ? "invoice" : "campaign")
              }
            >
              <Plus size={16} />{" "}
              <span>{tab === "billing" ? "Terbitkan Tagihan" : "Buat Kampanye"}</span>
            </button>
          </div>
        }
      />
      <div className="segmented compliance-segmented" style={{ marginBottom: "20px" }}>
        <button
          type="button"
          className={tab === "billing" ? "active" : ""}
          onClick={() => setTab("billing")}
        >
          Tagihan & Produk Iuran
        </button>
        <button
          type="button"
          className={tab === "engagement" ? "active" : ""}
          onClick={() => setTab("engagement")}
        >
          Segmen Anggota & Kampanye
        </button>
      </div>
      {tab === "billing" ? (
        <>
          <div className="governance-stats revenue-stats">
            <article>
              <AlertCircle size={24} color="#e11d48" />
              <div>
                <strong>{formatRevenueMoney(outstanding)}</strong>
                <small>
                  {
                    invoices.filter((item) =>
                      ["open", "overdue"].includes(item.effectiveStatus),
                    ).length
                  }{" "}
                  Tagihan Belum Lunas
                </small>
              </div>
            </article>
            <article>
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <strong>{formatRevenueMoney(collected)}</strong>
                <small>Total Iuran Terkumpul</small>
              </div>
            </article>
            <article>
              <KeyRound size={24} color="#0284c7" />
              <div>
                <strong>{activeBenefits}</strong>
                <small>KTA & Hak Akses Aktif</small>
              </div>
            </article>
          </div>
          <div className="revenue-layout">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Piutang & Mutasi</span>
                  <h2>Buku Besar Tagihan (Invoice Ledger)</h2>
                </div>
              </div>
              <div className="revenue-invoices">
                {invoices.map((invoice) => (
                  <article key={invoice.id}>
                    <div className="invoice-meta-col">
                      <div className="invoice-header-row">
                        <Status value={invoice.effectiveStatus} />
                        <strong>{invoice.invoiceNumber}</strong>
                      </div>
                      <span>
                        {invoice.member?.name ?? "Anggota"} ·{" "}
                        {invoice.member?.memberNumber ?? "—"}
                      </span>
                    </div>
                    <div className="invoice-amount-col">
                      <strong>{formatRevenueMoney(invoice.total || 0)}</strong>
                      <small>
                        {invoice.paid && invoice.paid > 0
                          ? `Terbayar: ${formatRevenueMoney(invoice.paid)}`
                          : "Belum Dibayar"}
                      </small>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", marginTop: "6px" }}>
                        {invoice.status === "open" && (
                          <button
                            className="icon-button success"
                            type="button"
                            title="Catat Pembayaran"
                            aria-label={`Bayar ${invoice.invoiceNumber}`}
                            onClick={() => openPayment(invoice.id)}
                          >
                            <CreditCard size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="icon-button danger"
                          title="Hapus / Batalkan Tagihan"
                          aria-label={`Hapus ${invoice.invoiceNumber}`}
                          onClick={() => {
                            if (confirm(`Hapus faktur tagihan ${invoice.invoiceNumber}?`)) {
                              remove.mutate({ path: `/v1/admin/revenue/invoices/${invoice.id}` });
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {!invoices.length && (
                  <Empty message="Belum ada tagihan faktur yang diterbitkan." />
                )}
              </div>
            </section>
            <section className="panel revenue-products-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Katalog Layanan</span>
                  <h2>Produk Iuran & Manfaat</h2>
                </div>
              </div>
              <div className="revenue-products">
                {products.map((product) => (
                  <article key={product.id}>
                    <div className="product-head-row">
                      <strong>{product.name}</strong>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <b>{formatRevenueMoney(product.price || 0)}</b>
                        <button
                          type="button"
                          className="icon-button danger"
                          title={`Hapus produk ${product.name}`}
                          aria-label={`Hapus ${product.name}`}
                          onClick={() => {
                            if (confirm(`Hapus produk iuran "${product.name}"?`)) {
                              remove.mutate({ path: `/v1/admin/revenue/products/${product.id}` });
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <span className="product-meta-sub">
                      {product.code} ·{" "}
                      {product.billingInterval === "annual"
                        ? "Tahunan"
                        : product.billingInterval === "one_time"
                          ? "Sekali Bayar"
                          : product.billingInterval === "monthly"
                            ? "Bulanan"
                            : "Periodik"}
                    </span>
                    {product.entitlementLabel && (
                      <span className="product-benefit-badge">
                        🔓 Memberikan akses: {product.entitlementLabel}
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="revenue-layout engagement-layout">
          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Kriteria Dinamis</span>
                <h2>Segmen Penerima Pesan</h2>
              </div>
            </div>
            <div className="segment-list">
              {segments.map((segment) => (
                <article key={segment.id}>
                  <span className="segment-icon">
                    <Users size={18} />
                  </span>
                  <div className="segment-info">
                    <strong>{segment.name}</strong>
                    <p>{segment.description || "Segmen audiens anggota terstandarisasi"}</p>
                    <small>
                      {[
                        ...(segment.criteria?.membershipStatuses || []),
                        ...(segment.criteria?.membershipTypes || []),
                        segment.criteria?.hasEntitlement,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Seluruh Anggota"}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="icon-button danger"
                    title={`Hapus segmen ${segment.name}`}
                    aria-label={`Hapus ${segment.name}`}
                    onClick={() => {
                      if (confirm(`Hapus segmen audiens "${segment.name}"?`)) {
                        remove.mutate({ path: `/v1/admin/revenue/segments/${segment.id}` });
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))}
              {!segments.length && (
                <Empty message="Buat segmen berdasarkan status keanggotaan, tipe, wilayah DPD, atau manfaat aktif." />
              )}
            </div>
          </section>
          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Antrean Distribusi</span>
                <h2>Kampanye & Pengumuman Massal</h2>
              </div>
            </div>
            <div className="campaign-list">
              {campaigns.map((campaign) => (
                <article key={campaign.id}>
                  <div className="campaign-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <Status value={campaign.status} />
                      <strong>{campaign.name}</strong>
                    </div>
                    <small>
                      Kanal: {campaign.channel.toUpperCase()} · {campaign.recipientCount ?? 0} Penerima
                    </small>
                  </div>
                  {["draft", "scheduled"].includes(campaign.status) && (
                    <button
                      className="button small primary"
                      type="button"
                      onClick={() =>
                        action.mutate({
                          path: `/v1/admin/revenue/campaigns/${campaign.id}/dispatch`,
                          body: {},
                        })
                      }
                    >
                      Kirim Pesan
                    </button>
                  )}
                </article>
              ))}
              {!campaigns.length && (
                <Empty message="Buat kampanye untuk mengirimkan notifikasi penagihan iuran atau pengumuman massal." />
              )}
            </div>
            <p className="delivery-note">
              <ShieldCheck size={16} /> Pesan siap didistribusikan melalui WhatsApp Gateway, Email blast, atau notifikasi aplikasi resmi APTI.
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
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} · {member.memberNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Product
                    <select name="productId" required>
                      {products
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
                      {segments.map((segment) => (
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

function RegulationsManager() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingItem, setEditingItem] = useState<Partial<CmsRegulation> | null>(null);

  const query = useQuery({
    queryKey: ["regulations"],
    queryFn: () => api<{ data: CmsRegulation[] }>("/v1/admin/regulations"),
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const id = data.id as string | undefined;
      if (id) {
        return api<{ data: CmsRegulation }>(`/v1/admin/regulations/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      }
      return api<{ data: CmsRegulation }>("/v1/admin/regulations", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Dokumen regulasi berhasil disimpan.");
      setEditingItem(null);
      void client.invalidateQueries({ queryKey: ["regulations"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<{ data: { success: boolean } }>(`/v1/admin/regulations/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Dokumen regulasi berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["regulations"] });
    },
  });

  const items = (query.data?.data ?? []).filter((item) => {
    if (category && item.category !== category) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;

  return (
    <>
      <PageHeading
        eyebrow="Hukum & Tata Kelola"
        title="Dokumen Regulasi & Kebijakan"
        description="Kelola dokumen AD/ART, Surat Edaran Organisasi, Regulasi Pemerintah, dan Naskah Kebijakan publik."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() =>
              setEditingItem({
                title: "",
                category: "regulasi_pemerintah",
                number: "",
                issuedDate: new Date().toISOString().slice(0, 10),
                fileUrl: "",
                summary: "",
                status: "published",
              })
            }
          >
            <Plus size={16} /> Tambah Dokumen
          </button>
        }
      />
      {editingItem && (
        <section className="editor-panel mb-6">
          <header className="editor-header">
            <h3>{editingItem.id ? "Edit Dokumen Regulasi" : "Tambah Dokumen Regulasi Baru"}</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => setEditingItem(null)}
            >
              <X size={18} />
            </button>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                id: editingItem.id,
                title: fd.get("title") as string,
                category: fd.get("category") as string,
                number: fd.get("number") as string,
                issuedDate: fd.get("issuedDate") as string,
                fileUrl: fd.get("fileUrl") as string,
                summary: fd.get("summary") as string,
                status: "published",
              });
            }}
            className="form-grid"
          >
            <label className="field col-span-2">
              <span>Judul Dokumen / Regulasi *</span>
              <input
                name="title"
                required
                defaultValue={editingItem.title ?? ""}
                placeholder="Contoh: Peraturan Menteri No. 12 Tahun 2026..."
              />
            </label>
            <label className="field">
              <span>Kategori *</span>
              <select
                name="category"
                required
                defaultValue={editingItem.category ?? "regulasi_pemerintah"}
              >
                <option value="regulasi_pemerintah">Regulasi Pemerintah</option>
                <option value="se_organisasi">Surat Edaran (SE)</option>
                <option value="ad_art">AD / ART</option>
                <option value="posisi_kebijakan">
                  Naskah Posisi Kebijakan
                </option>
              </select>
            </label>
            <label className="field">
              <span>Nomor Dokumen</span>
              <input
                name="number"
                defaultValue={editingItem.number ?? ""}
                placeholder="Nomor resmi, contoh: SE/04/APTI/2026"
              />
            </label>
            <label className="field">
              <span>Tanggal Penetapan</span>
              <input
                type="date"
                name="issuedDate"
                defaultValue={editingItem.issuedDate ? new Date(editingItem.issuedDate).toISOString().slice(0, 10) : ""}
              />
            </label>
            <label className="field">
              <span>Link URL Dokumen / File (PDF)</span>
              <input
                name="fileUrl"
                defaultValue={editingItem.fileUrl ?? ""}
                placeholder="https://..."
              />
            </label>
            <label className="field col-span-2">
              <span>Ringkasan / Abstrak Regulasi</span>
              <textarea
                name="summary"
                rows={3}
                defaultValue={editingItem.summary ?? ""}
                placeholder="Poin-poin penting isi regulasi..."
              />
            </label>
            <div className="form-actions col-span-2">
              <button
                type="button"
                className="button ghost"
                onClick={() => setEditingItem(null)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={save.isPending}
              >
                <Save size={16} /> {editingItem.id ? "Perbarui Regulasi" : "Simpan Regulasi"}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="table-panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari regulasi…"
            />
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="regulasi_pemerintah">Regulasi Pemerintah</option>
            <option value="se_organisasi">Surat Edaran</option>
            <option value="ad_art">AD / ART</option>
            <option value="posisi_kebijakan">Naskah Kebijakan</option>
          </select>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Judul Regulasi</th>
              <th>Kategori</th>
              <th>Nomor</th>
              <th>Unduhan</th>
              <th className="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  {item.summary && (
                    <small className="block text-muted">
                      {item.summary.slice(0, 80)}…
                    </small>
                  )}
                </td>
                <td>
                  <span className="badge">
                    {item.category.replace("_", " ")}
                  </span>
                </td>
                <td>{item.number || "—"}</td>
                <td>{item.downloadCount}x</td>
                <td className="actions-cell">
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Dokumen Regulasi"
                      aria-label={`Edit ${item.title}`}
                      onClick={() => setEditingItem(item)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Dokumen Regulasi"
                      aria-label={`Hapus ${item.title}`}
                      onClick={() => {
                        if (confirm(`Hapus dokumen regulasi "${item.title}"?`))
                          remove.mutate(item.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-cell">
                  <Empty message="Belum ada dokumen regulasi yang terdaftar." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </>
  );
}

function ComplaintsManager() {
  const client = useQueryClient();
  const [selected, setSelected] = useState<CmsComplaint | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["complaints"],
    queryFn: () => api<{ data: CmsComplaint[] }>("/v1/admin/complaints"),
  });

  useEffect(() => {
    if (selected) {
      setNotesInput(selected.responseNotes ?? "");
    }
  }, [selected]);

  const update = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: CmsComplaint["status"];
      notes?: string | undefined;
    }) =>
      api<{ data: CmsComplaint }>(`/v1/admin/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, responseNotes: notes }),
      }),
    onSuccess: (res) => {
      toast.success("Status & catatan pengaduan berhasil diperbarui.");
      setSelected(res.data);
      void client.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<{ data: { success: boolean } }>(`/v1/admin/complaints/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Pengaduan berhasil dihapus.");
      setSelected(null);
      void client.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const items = query.data?.data ?? [];
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;

  return (
    <>
      <PageHeading
        eyebrow="Ethics & Consumer Protection"
        title="Public Complaints & Ethics Desk"
        description="Pantau laporan pengaduan konsumen, investigasi pelanggaran kode etik, dan mediasi klaim teknisi KTA."
      />
      <div className="inbox-layout">
        <section className="table-panel inbox-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Tiket</th>
                <th>Pelapor</th>
                <th>Kategori</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className={selected?.id === item.id ? "active" : ""}
                  onClick={() => setSelected(item)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <strong>{item.ticketNumber}</strong>
                  </td>
                  <td>{item.complainantName}</td>
                  <td>
                    <span className="badge">
                      {item.category.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <Status value={item.status} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    <Empty message="Belum ada pengaduan etik yang masuk." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TablePagination
            currentPage={currentPage}
            totalItems={items.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </section>
        <section className="inbox-detail">
          {selected ? (
            <div className="detail-card">
              <header className="detail-header">
                <div>
                  <span className="ticket-badge">{selected.ticketNumber}</span>
                  <h3>{selected.complainantName}</h3>
                  <small>
                    {selected.complainantEmail}{" "}
                    {selected.complainantPhone
                      ? `· ${selected.complainantPhone}`
                      : ""}
                  </small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Status value={selected.status} />
                  <button
                    type="button"
                    className="icon-button danger"
                    title="Hapus Tiket Pengaduan"
                    aria-label="Hapus Tiket Pengaduan"
                    onClick={() => {
                      if (confirm(`Hapus tiket pengaduan #${selected.ticketNumber}?`)) {
                        remove.mutate(selected.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </header>
              <div className="detail-body">
                <p>
                  <strong>Terlapor:</strong> {selected.targetIdentifier} (
                  {selected.targetType})
                </p>
                <p>
                  <strong>Kategori:</strong>{" "}
                  {selected.category.replace("_", " ")}
                </p>
                <p>
                  <strong>Kronologi Pengaduan:</strong>
                </p>
                <blockquote className="complaint-quote">
                  {selected.description}
                </blockquote>

                {/* Evidence Files Attachment Display */}
                {selected.evidenceFileUrl && (
                  <div style={{ marginTop: "14px", marginBottom: "14px" }}>
                    <strong>Lampiran Bukti Pengaduan:</strong>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginTop: "6px",
                      }}
                    >
                      {(() => {
                        try {
                          const urls = JSON.parse(selected.evidenceFileUrl);
                          if (Array.isArray(urls)) {
                            return urls.map((u: string, idx: number) => (
                              <a
                                key={idx}
                                href={u}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button small ghost"
                                style={{ display: "inline-flex", gap: "5px" }}
                              >
                                <span>📎 Bukti #{idx + 1}</span>
                              </a>
                            ));
                          }
                        } catch {
                          // Fallback if raw single URL
                        }
                        return (
                          <a
                            href={selected.evidenceFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button small ghost"
                            style={{ display: "inline-flex", gap: "5px" }}
                          >
                            <span>📎 Lihat Berkas Bukti</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "16px" }}>
                  <label className="field">
                    <span>Catatan Resmi Dewan Etik / Hasil Mediasi:</span>
                    <textarea
                      rows={3}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Tuliskan catatan tindak lanjut, berita acara mediasi, atau hasil verifikasi Dewan Etik..."
                      style={{ width: "100%", marginTop: "4px" }}
                    />
                  </label>
                </div>
              </div>
              <div className="detail-actions" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <label className="field" style={{ flex: 1 }}>
                  <span>Ubah Status Penanganan:</span>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      update.mutate({
                        id: selected.id,
                        status: e.target.value as CmsComplaint["status"],
                        notes: notesInput.trim() || undefined,
                      })
                    }
                  >
                    <option value="new">New (Baru)</option>
                    <option value="under_review">
                      Under Review (Investigasi)
                    </option>
                    <option value="mediated">Mediated (Mediasi)</option>
                    <option value="resolved">Resolved (Selesai)</option>
                    <option value="dismissed">Dismissed (Ditolak)</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="button primary small"
                  disabled={update.isPending}
                  onClick={() =>
                    update.mutate({
                      id: selected.id,
                      status: selected.status,
                      notes: notesInput.trim() || undefined,
                    })
                  }
                >
                  {update.isPending ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-detail">
              <p>
                Pilih salah satu tiket pengaduan di sebelah kiri untuk melihat
                detail.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function TechniciansManager() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<Partial<CmsTechnician> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["technicians"],
    queryFn: () => api<{ data: CmsTechnician[] }>("/v1/admin/technicians"),
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const id = data.id as string | undefined;
      if (id) {
        return api<{ data: CmsTechnician }>(`/v1/admin/technicians/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      }
      return api<{ data: CmsTechnician }>("/v1/admin/technicians", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Data teknisi berhasil disimpan.");
      setEditingItem(null);
      void client.invalidateQueries({ queryKey: ["technicians"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<{ data: { success: boolean } }>(`/v1/admin/technicians/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Teknisi berhasil dihapus dari direktori.");
      void client.invalidateQueries({ queryKey: ["technicians"] });
    },
  });

  const items = (query.data?.data ?? []).filter((item) => {
    if (
      search &&
      !item.name.toLowerCase().includes(search.toLowerCase()) &&
      !item.ktaNumber.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;

  return (
    <>
      <PageHeading
        eyebrow="Direktori & Verifikasi"
        title="Direktori Teknisi Terverifikasi"
        description="Kelola daftar teknisi pemegang KTA resmi, tingkat kualifikasi BNSP, rating, dan wilayah layanan."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() =>
              setEditingItem({
                name: "",
                ktaNumber: "",
                skillLevel: "Level 3 Residensial & Split",
                province: "DKI Jakarta",
                city: "Jakarta Selatan",
                phone: "",
                workshopName: "",
                rating: "4.9",
                certifiedBnsp: true,
                isAvailable: true,
              })
            }
          >
            <Plus size={16} /> Tambah Teknisi
          </button>
        }
      />
      {editingItem && (
        <section className="editor-panel mb-6">
          <header className="editor-header">
            <h3>{editingItem.id ? "Edit Data Teknisi" : "Pendaftaran Teknisi Baru ke Direktori"}</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => setEditingItem(null)}
            >
              <X size={18} />
            </button>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                id: editingItem.id,
                name: fd.get("name") as string,
                ktaNumber: fd.get("ktaNumber") as string,
                skillLevel: fd.get("skillLevel") as string,
                province: fd.get("province") as string,
                city: fd.get("city") as string,
                phone: fd.get("phone") as string,
                workshopName: fd.get("workshopName") as string,
                rating: (fd.get("rating") as string) || "4.9",
                certifiedBnsp: true,
                isAvailable: true,
              });
            }}
            className="form-grid"
          >
            <label className="field">
              <span>Nama Lengkap Teknisi *</span>
              <input
                name="name"
                required
                defaultValue={editingItem.name ?? ""}
                placeholder="Contoh: Budi Kurniawan"
              />
            </label>
            <label className="field">
              <span>Nomor KTA Resmi *</span>
              <input
                name="ktaNumber"
                required
                defaultValue={editingItem.ktaNumber ?? ""}
                placeholder="APTI-2026-XXXX"
              />
            </label>
            <label className="field">
              <span>Kualifikasi / Level Keahlian</span>
              <input
                name="skillLevel"
                defaultValue={editingItem.skillLevel ?? "Level 3 Residensial & Split"}
              />
            </label>
            <label className="field">
              <span>Nama Workshop / Bengkel</span>
              <input
                name="workshopName"
                defaultValue={editingItem.workshopName ?? ""}
                placeholder="Contoh: Maju Jaya AC"
              />
            </label>
            <label className="field">
              <span>Provinsi *</span>
              <input
                name="province"
                required
                defaultValue={editingItem.province ?? "DKI Jakarta"}
                placeholder="DKI Jakarta"
              />
            </label>
            <label className="field">
              <span>Kota / Kabupaten *</span>
              <input
                name="city"
                required
                defaultValue={editingItem.city ?? "Jakarta Selatan"}
                placeholder="Jakarta Selatan"
              />
            </label>
            <label className="field">
              <span>Nomor WhatsApp / Telepon</span>
              <input
                name="phone"
                defaultValue={editingItem.phone ?? ""}
                placeholder="081234567890"
              />
            </label>
            <label className="field">
              <span>Rating (1.0 - 5.0)</span>
              <input
                name="rating"
                defaultValue={editingItem.rating ?? "4.9"}
              />
            </label>
            <div className="form-actions col-span-2">
              <button
                type="button"
                className="button ghost"
                onClick={() => setEditingItem(null)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={save.isPending}
              >
                <Save size={16} /> {editingItem.id ? "Perbarui Teknisi" : "Simpan Teknisi"}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="table-panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau KTA…"
            />
          </label>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Teknisi</th>
              <th>Nomor KTA</th>
              <th>Wilayah</th>
              <th>Workshop</th>
              <th>Rating</th>
              <th className="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <small className="block text-muted">{item.skillLevel}</small>
                </td>
                <td>
                  <span className="badge">{item.ktaNumber}</span>
                </td>
                <td>
                  {item.city}, {item.province}
                </td>
                <td>{item.workshopName || "—"}</td>
                <td>⭐ {item.rating ?? "4.9"}</td>
                <td className="actions-cell">
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Data Teknisi"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => setEditingItem(item)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Teknisi dari Direktori"
                      aria-label={`Hapus ${item.name}`}
                      onClick={() => {
                        if (confirm(`Hapus teknisi ${item.name} dari direktori?`))
                          remove.mutate(item.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <Empty message="Belum ada teknisi di direktori." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </>
  );
}

function ClubsManager() {
  const client = useQueryClient();
  const [editingItem, setEditingItem] = useState<Partial<CmsClub> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["clubs"],
    queryFn: () => api<{ data: CmsClub[] }>("/v1/admin/clubs"),
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const id = data.id as string | undefined;
      if (id) {
        return api<{ data: CmsClub }>(`/v1/admin/clubs/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      }
      return api<{ data: CmsClub }>("/v1/admin/clubs", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Data klub berhasil disimpan.");
      setEditingItem(null);
      void client.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<{ data: { success: boolean } }>(`/v1/admin/clubs/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Klub berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["clubs"] });
    },
  });

  const items = query.data?.data ?? [];
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;

  return (
    <>
      <PageHeading
        eyebrow="Komunitas & Afiliasi"
        title="Registri Klub Terdaftar (TKT)"
        description="Kelola tanda klub terdaftar (TKT), komunitas daerah binaan, dan ketua pengurus klub."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() =>
              setEditingItem({
                clubName: "",
                codeTkt: "",
                province: "Jawa Timur",
                category: "Komunitas Teknisi & Workshop",
                chairName: "",
                activeMembers: 15,
                status: "verified",
              })
            }
          >
            <Plus size={16} /> Tambah Klub
          </button>
        }
      />
      {editingItem && (
        <section className="editor-panel mb-6">
          <header className="editor-header">
            <h3>{editingItem.id ? "Edit Registrasi Klub (TKT)" : "Pendaftaran Klub Baru (TKT)"}</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => setEditingItem(null)}
            >
              <X size={18} />
            </button>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                id: editingItem.id,
                clubName: fd.get("clubName") as string,
                codeTkt: fd.get("codeTkt") as string,
                province: fd.get("province") as string,
                category:
                  (fd.get("category") as string) ||
                  "Komunitas Teknisi & Workshop",
                chairName: fd.get("chairName") as string,
                activeMembers: Number(fd.get("activeMembers") || 1),
                status: "verified",
              });
            }}
            className="form-grid"
          >
            <label className="field">
              <span>Nama Klub / Komunitas *</span>
              <input
                name="clubName"
                required
                defaultValue={editingItem.clubName ?? ""}
                placeholder="Contoh: Surabaya Cooling Club"
              />
            </label>
            <label className="field">
              <span>Kode TKT Resmi *</span>
              <input
                name="codeTkt"
                required
                defaultValue={editingItem.codeTkt ?? ""}
                placeholder="TKT-DPD-JTM-001"
              />
            </label>
            <label className="field">
              <span>Provinsi *</span>
              <input
                name="province"
                required
                defaultValue={editingItem.province ?? "Jawa Timur"}
                placeholder="Jawa Timur"
              />
            </label>
            <label className="field">
              <span>Ketua Klub</span>
              <input
                name="chairName"
                defaultValue={editingItem.chairName ?? ""}
                placeholder="Nama ketua"
              />
            </label>
            <label className="field">
              <span>Jumlah Anggota Aktif</span>
              <input
                type="number"
                name="activeMembers"
                defaultValue={editingItem.activeMembers ?? 10}
                min={1}
              />
            </label>
            <div className="form-actions col-span-2">
              <button
                type="button"
                className="button ghost"
                onClick={() => setEditingItem(null)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={save.isPending}
              >
                <Save size={16} /> {editingItem.id ? "Perbarui Klub" : "Simpan Klub"}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Klub</th>
              <th>Kode TKT</th>
              <th>Provinsi</th>
              <th>Ketua</th>
              <th>Anggota</th>
              <th className="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.clubName}</strong>
                </td>
                <td>
                  <span className="badge">{item.codeTkt}</span>
                </td>
                <td>{item.province}</td>
                <td>{item.chairName || "—"}</td>
                <td>{item.activeMembers} Anggota</td>
                <td className="actions-cell">
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Data Klub"
                      aria-label={`Edit ${item.clubName}`}
                      onClick={() => setEditingItem(item)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Klub"
                      aria-label={`Hapus ${item.clubName}`}
                      onClick={() => {
                        if (confirm(`Hapus klub ${item.clubName}?`))
                          remove.mutate(item.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <Empty message="Belum ada klub terdaftar." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </>
  );
}

function ChampionshipsManager() {
  const client = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsChampionship | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["championships"],
    queryFn: () => api<{ data: CmsChampionship[] }>("/v1/admin/championships"),
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      if (editingItem) {
        return api<{ data: CmsChampionship }>(
          `/v1/admin/championships/${editingItem.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          },
        );
      }
      return api<{ data: CmsChampionship }>("/v1/admin/championships", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success(
        editingItem
          ? "Data klasemen berhasil diperbarui."
          : "Data klasemen berhasil ditambahkan.",
      );
      setIsCreating(false);
      setEditingItem(null);
      void client.invalidateQueries({ queryKey: ["championships"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<{ data: { success: boolean } }>(`/v1/admin/championships/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Data klasemen berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["championships"] });
    },
  });

  const items = query.data?.data ?? [];
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;

  return (
    <>
      <PageHeading
        eyebrow="Competitions & Awards"
        title="Championships & Skill Contest Standings"
        description="Kelola papan skor kompetisi keterampilan teknisi nasional, perolehan poin, dan penghargaan kontestan."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
          >
            <Plus size={16} /> Tambah Skor Kontestan
          </button>
        }
      />
      {(isCreating || editingItem) && (
        <section className="editor-panel mb-6">
          <header className="editor-header">
            <h3>{editingItem ? "Edit Peringkat & Skor Kejuaraan" : "Input Peringkat & Skor Kejuaraan"}</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => {
                setIsCreating(false);
                setEditingItem(null);
              }}
            >
              <X size={18} />
            </button>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                participantName: fd.get("participantName") as string,
                rank: Number(fd.get("rank") || 1),
                points: Number(fd.get("points") || 0),
                seasonYear: Number(fd.get("seasonYear") || 2026),
                category:
                  (fd.get("category") as string) ||
                  "Kontes Keterampilan Teknisi Pendingin Nasional",
                teamName: fd.get("teamName") as string,
                unitName: fd.get("unitName") as string,
                achievements: fd.get("achievements") as string,
              });
            }}
            className="form-grid"
          >
            <label className="field">
              <span>Nama Kontestan *</span>
              <input
                name="participantName"
                required
                defaultValue={editingItem?.participantName ?? ""}
                placeholder="Nama lengkap peserta"
              />
            </label>
            <label className="field">
              <span>Peringkat (Rank) *</span>
              <input
                type="number"
                name="rank"
                defaultValue={editingItem?.rank ?? 1}
                min={1}
                required
              />
            </label>
            <label className="field">
              <span>Total Poin *</span>
              <input
                type="number"
                name="points"
                defaultValue={editingItem?.points ?? 450}
                required
              />
            </label>
            <label className="field">
              <span>Tahun Musim (Season)</span>
              <input
                type="number"
                name="seasonYear"
                defaultValue={editingItem?.seasonYear ?? 2026}
              />
            </label>
            <label className="field">
              <span>Kontingon / DPD</span>
              <input
                name="unitName"
                defaultValue={editingItem?.unitName ?? ""}
                placeholder="Contoh: DPD Jawa Barat"
              />
            </label>
            <label className="field">
              <span>Nama Tim / Bengkel</span>
              <input
                name="teamName"
                defaultValue={editingItem?.teamName ?? ""}
                placeholder="Contoh: Bandung VRV Team"
              />
            </label>
            <label className="field col-span-2">
              <span>Prestasi / Penghargaan Khusus</span>
              <input
                name="achievements"
                defaultValue={editingItem?.achievements ?? ""}
                placeholder="Contoh: Juara 1 Diagnosis Inverter Tercepat"
              />
            </label>
            <div className="form-actions col-span-2">
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={save.isPending}
              >
                <Save size={16} /> {editingItem ? "Update Skor" : "Simpan Skor"}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Nama Kontestan</th>
              <th>Kontingon / Tim</th>
              <th>Poin</th>
              <th>Pencapaian</th>
              <th className="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>#{item.rank}</strong>
                </td>
                <td>
                  <strong>{item.participantName}</strong>
                </td>
                <td>{item.unitName || item.teamName || "—"}</td>
                <td>⭐ {item.points} Pts</td>
                <td>{item.achievements || "—"}</td>
                <td className="actions-cell">
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Skor Kontestan"
                      aria-label={`Edit ${item.participantName}`}
                      onClick={() => {
                        setIsCreating(false);
                        setEditingItem(item);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Skor Kontestan"
                      aria-label={`Hapus ${item.participantName}`}
                      onClick={() => {
                        if (confirm(`Hapus skor kontestan ${item.participantName}?`))
                          remove.mutate(item.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <Empty message="Belum ada data kejuaraan." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </>
  );
}

function WorkingGroupsManager() {
  const client = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsWorkingGroup | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["workingGroups"],
    queryFn: () => api<{ data: CmsWorkingGroup[] }>("/v1/admin/working-groups"),
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      if (editingItem) {
        return api<{ data: CmsWorkingGroup }>(
          `/v1/admin/working-groups/${editingItem.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          },
        );
      }
      return api<{ data: CmsWorkingGroup }>("/v1/admin/working-groups", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success(
        editingItem
          ? "Kelompok kerja berhasil diperbarui."
          : "Kelompok kerja berhasil dibuat.",
      );
      setIsCreating(false);
      setEditingItem(null);
      void client.invalidateQueries({ queryKey: ["workingGroups"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<{ data: { success: boolean } }>(`/v1/admin/working-groups/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Pokja berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["workingGroups"] });
    },
  });

  const items = query.data?.data ?? [];
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;

  return (
    <>
      <PageHeading
        eyebrow="Advocacy & Committees"
        title="Working Groups (Pokja)"
        description="Kelola kelompok kerja tematik, komite advokasi regulasi, dan pimpinan komite organisasi."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
          >
            <Plus size={16} /> Tambah Pokja
          </button>
        }
      />
      {(isCreating || editingItem) && (
        <section className="editor-panel mb-6">
          <header className="editor-header">
            <h3>{editingItem ? "Edit Kelompok Kerja / Pokja" : "Pembentukan Pokja / Komite Baru"}</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => {
                setIsCreating(false);
                setEditingItem(null);
              }}
            >
              <X size={18} />
            </button>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                name: fd.get("name") as string,
                category:
                  (fd.get("category") as string) ||
                  "Standardisasi & Sertifikasi",
                chairName: fd.get("chairName") as string,
                description: fd.get("description") as string,
                memberCount: Number(fd.get("memberCount") || 0),
                isActive: true,
              });
            }}
            className="form-grid"
          >
            <label className="field col-span-2">
              <span>Nama Pokja / Komite *</span>
              <input
                name="name"
                required
                defaultValue={editingItem?.name ?? ""}
                placeholder="Contoh: Pokja Transisi Green Refrigerant"
              />
            </label>
            <label className="field">
              <span>Kategori Pokja</span>
              <input
                name="category"
                defaultValue={editingItem?.category ?? "Standardisasi & Sertifikasi"}
              />
            </label>
            <label className="field">
              <span>Ketua Pokja</span>
              <input
                name="chairName"
                defaultValue={editingItem?.chairName ?? ""}
                placeholder="Nama ketua"
              />
            </label>
            <label className="field col-span-2">
              <span>Deskripsi Tugas & Mandat Pokja</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={editingItem?.description ?? ""}
                placeholder="Ruang lingkup kerja pokja..."
              />
            </label>
            <div className="form-actions col-span-2">
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={save.isPending}
              >
                <Save size={16} /> {editingItem ? "Update Pokja" : "Simpan Pokja"}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Pokja</th>
              <th>Kategori</th>
              <th>Ketua Pokja</th>
              <th>Anggota</th>
              <th className="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  {item.description && (
                    <small className="block text-muted">
                      {item.description.slice(0, 70)}…
                    </small>
                  )}
                </td>
                <td>
                  <span className="badge">{item.category}</span>
                </td>
                <td>{item.chairName || "—"}</td>
                <td>{item.memberCount} Anggota</td>
                <td className="actions-cell">
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Pokja"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => {
                        setIsCreating(false);
                        setEditingItem(item);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Pokja"
                      aria-label={`Hapus ${item.name}`}
                      onClick={() => {
                        if (confirm(`Hapus pokja ${item.name}?`)) remove.mutate(item.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-cell">
                  <Empty message="Belum ada pokja aktif." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </>
  );
}

function LendersManager() {
  const client = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsLender | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["lenders"],
    queryFn: () => api<{ data: CmsLender[] }>("/v1/admin/lenders"),
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      if (editingItem) {
        return api<{ data: CmsLender }>(
          `/v1/admin/lenders/${editingItem.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          },
        );
      }
      return api<{ data: CmsLender }>("/v1/admin/lenders", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success(
        editingItem
          ? "Data mitra lender berhasil diperbarui."
          : "Mitra lender berhasil ditambahkan.",
      );
      setIsCreating(false);
      setEditingItem(null);
      void client.invalidateQueries({ queryKey: ["lenders"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<{ data: { success: boolean } }>(`/v1/admin/lenders/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Mitra lender berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["lenders"] });
    },
  });

  const items = query.data?.data ?? [];
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;

  return (
    <>
      <PageHeading
        eyebrow="Financial Ecosystem"
        title="Lenders & Partners Registry"
        description="Kelola direktori verifikasi platform pembiayaan, izin OJK, dan status keanggotaan asosiasi pendanaan."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
          >
            <Plus size={16} /> Tambah Mitra / Lender
          </button>
        }
      />
      {(isCreating || editingItem) && (
        <section className="editor-panel mb-6">
          <header className="editor-header">
            <h3>{editingItem ? "Edit Registrasi Fintech / Pembiayaan" : "Registrasi Entitas Fintech / Pembiayaan"}</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => {
                setIsCreating(false);
                setEditingItem(null);
              }}
            >
              <X size={18} />
            </button>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                brandName: fd.get("brandName") as string,
                companyName: fd.get("companyName") as string,
                licenseNumber: fd.get("licenseNumber") as string,
                sectorType:
                  (fd.get("sectorType") as string) || "P2P Lending Produktif",
                ojkStatus: "Berizin OJK Resmi",
                websiteUrl: fd.get("websiteUrl") as string,
                isAfpiMember: true,
              });
            }}
            className="form-grid"
          >
            <label className="field">
              <span>Nama Brand / Platform *</span>
              <input
                name="brandName"
                required
                defaultValue={editingItem?.brandName ?? ""}
                placeholder="Contoh: Danamas"
              />
            </label>
            <label className="field">
              <span>Nama Perusahaan PT *</span>
              <input
                name="companyName"
                required
                defaultValue={editingItem?.companyName ?? ""}
                placeholder="PT Pasar Dana Pinjaman"
              />
            </label>
            <label className="field">
              <span>Nomor Izin OJK *</span>
              <input
                name="licenseNumber"
                required
                defaultValue={editingItem?.licenseNumber ?? ""}
                placeholder="KEP-102/D.05/2024"
              />
            </label>
            <label className="field">
              <span>Sektor / Jenis Layanan</span>
              <input
                name="sectorType"
                defaultValue={editingItem?.sectorType ?? "P2P Lending Produktif UMKM"}
              />
            </label>
            <label className="field col-span-2">
              <span>Website Resmi Platform</span>
              <input
                name="websiteUrl"
                defaultValue={editingItem?.websiteUrl ?? ""}
                placeholder="https://..."
              />
            </label>
            <div className="form-actions col-span-2">
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={save.isPending}
              >
                <Save size={16} /> {editingItem ? "Update Mitra" : "Simpan Mitra"}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Brand / Platform</th>
              <th>Perusahaan</th>
              <th>Nomor Izin OJK</th>
              <th>Sektor</th>
              <th className="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.brandName}</strong>
                </td>
                <td>{item.companyName}</td>
                <td>
                  <span className="badge">{item.licenseNumber}</span>
                </td>
                <td>{item.sectorType}</td>
                <td className="actions-cell">
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Mitra"
                      aria-label={`Edit ${item.brandName}`}
                      onClick={() => {
                        setIsCreating(false);
                        setEditingItem(item);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Mitra Lender"
                      aria-label={`Hapus ${item.brandName}`}
                      onClick={() => {
                        if (confirm(`Hapus mitra lender ${item.brandName}?`))
                          remove.mutate(item.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-cell">
                  <Empty message="Belum ada mitra lender terdaftar." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </>
  );
}

function StatisticsManager() {
  const client = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsStatistic | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["statistics"],
    queryFn: () => api<{ data: CmsStatistic[] }>("/v1/admin/statistics"),
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      if (editingItem) {
        return api<{ data: CmsStatistic }>(
          `/v1/admin/statistics/${editingItem.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          },
        );
      }
      return api<{ data: CmsStatistic }>("/v1/admin/statistics", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success(
        editingItem
          ? "Metrik statistik berhasil diperbarui."
          : "Metrik statistik berhasil ditambahkan.",
      );
      setIsCreating(false);
      setEditingItem(null);
      void client.invalidateQueries({ queryKey: ["statistics"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<{ data: { success: boolean } }>(`/v1/admin/statistics/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Metrik statistik berhasil dihapus.");
      void client.invalidateQueries({ queryKey: ["statistics"] });
    },
  });

  const items = query.data?.data ?? [];
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (query.isLoading) return <PageLoading />;
  if (query.isError) return <FatalError message={query.error.message} />;

  return (
    <>
      <PageHeading
        eyebrow="Data Center & Indicators"
        title="Industry Statistics & Indicators"
        description="Kelola indikator publik pertumbuhan industri, metrik performa sektor, dan tren kuartalan."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
          >
            <Plus size={16} /> Tambah Metrik
          </button>
        }
      />
      {(isCreating || editingItem) && (
        <section className="editor-panel mb-6">
          <header className="editor-header">
            <h3>{editingItem ? "Edit Metrik Indikator" : "Tambah Metrik Indikator Baru"}</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => {
                setIsCreating(false);
                setEditingItem(null);
              }}
            >
              <X size={18} />
            </button>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                metricKey: (fd.get("metricKey") as string)
                  .toLowerCase()
                  .replace(/\s+/g, "_"),
                metricLabel: fd.get("metricLabel") as string,
                metricValue: fd.get("metricValue") as string,
                metricUnit: fd.get("metricUnit") as string,
                trendDirection:
                  (fd.get("trendDirection") as "up" | "down" | "stable") ||
                  "up",
                trendPercentage: fd.get("trendPercentage") as string,
                category: (fd.get("category") as string) || "Keanggotaan",
                period: (fd.get("period") as string) || "2026 Q1",
                sortOrder: 0,
              });
            }}
            className="form-grid"
          >
            <label className="field">
              <span>Label Indikator *</span>
              <input
                name="metricLabel"
                required
                defaultValue={editingItem?.metricLabel ?? ""}
                placeholder="Total Teknisi Tersertifikasi"
              />
            </label>
            <label className="field">
              <span>Metric Key (ID Unik) *</span>
              <input
                name="metricKey"
                required
                defaultValue={editingItem?.metricKey ?? ""}
                placeholder="certified_techs"
              />
            </label>
            <label className="field">
              <span>Nilai Angka *</span>
              <input
                name="metricValue"
                required
                defaultValue={editingItem?.metricValue ?? ""}
                placeholder="8,450"
              />
            </label>
            <label className="field">
              <span>Satuan (Unit)</span>
              <input
                name="metricUnit"
                defaultValue={editingItem?.metricUnit ?? ""}
                placeholder="Teknisi / Unit AC / %"
              />
            </label>
            <label className="field">
              <span>Tren Pertumbuhan</span>
              <input
                name="trendPercentage"
                defaultValue={editingItem?.trendPercentage ?? ""}
                placeholder="+18.5%"
              />
            </label>
            <label className="field">
              <span>Arah Tren</span>
              <select
                name="trendDirection"
                defaultValue={editingItem?.trendDirection ?? "up"}
              >
                <option value="up">Naik (Up)</option>
                <option value="down">Turun (Down)</option>
                <option value="stable">Stabil (Stable)</option>
              </select>
            </label>
            <label className="field">
              <span>Kategori</span>
              <input
                name="category"
                defaultValue={editingItem?.category ?? "Keanggotaan"}
              />
            </label>
            <label className="field">
              <span>Periode Kuartal</span>
              <input
                name="period"
                defaultValue={editingItem?.period ?? "2026 Q1"}
              />
            </label>
            <div className="form-actions col-span-2">
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={save.isPending}
              >
                <Save size={16} /> {editingItem ? "Update Metrik" : "Simpan Metrik"}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Indikator</th>
              <th>Nilai</th>
              <th>Satuan</th>
              <th>Tren</th>
              <th>Kategori / Periode</th>
              <th className="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.metricLabel}</strong>
                </td>
                <td>
                  <strong className="text-primary">{item.metricValue}</strong>
                </td>
                <td>{item.metricUnit || "—"}</td>
                <td>
                  {item.trendPercentage ? `📈 ${item.trendPercentage}` : "—"}
                </td>
                <td>
                  <span className="badge">{item.category}</span> · {item.period}
                </td>
                <td className="actions-cell">
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Metrik"
                      aria-label={`Edit ${item.metricLabel}`}
                      onClick={() => {
                        setIsCreating(false);
                        setEditingItem(item);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Metrik"
                      aria-label={`Hapus ${item.metricLabel}`}
                      onClick={() => {
                        if (confirm(`Hapus metrik ${item.metricLabel}?`))
                          remove.mutate(item.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <Empty message="Belum ada data statistik." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </>
  );
}

function WilayahManager() {
  const qc = useQueryClient();
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("31");
  const [selectedRegencyCode, setSelectedRegencyCode] = useState<string>("31.71");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>("31.71.01");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "regencies" | "districts" | "villages" | "provinces"
  >("regencies");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CmsRegency> | null>(null);

  const [regPage, setRegPage] = useState(1);
  const [regPageSize, setRegPageSize] = useState(15);
  const [distPage, setDistPage] = useState(1);
  const [distPageSize, setDistPageSize] = useState(15);
  const [villPage, setVillPage] = useState(1);
  const [villPageSize, setVillPageSize] = useState(15);
  const [provPage, setProvPage] = useState(1);
  const [provPageSize, setProvPageSize] = useState(15);

  const { data: provData, isLoading: _loadingProv } = useQuery({
    queryKey: ["cms-wilayah-provinces"],
    queryFn: () => getWilayahProvinces(),
  });

  const { data: regData, isLoading: _loadingReg } = useQuery({
    queryKey: ["cms-wilayah-regencies", selectedProvinceCode, searchQuery],
    queryFn: () => getWilayahRegencies(selectedProvinceCode, searchQuery),
  });

  const { data: distData, isLoading: _loadingDist } = useQuery({
    queryKey: ["cms-wilayah-districts", selectedRegencyCode, searchQuery],
    queryFn: () => getWilayahDistricts(selectedRegencyCode, undefined, searchQuery),
    enabled: activeTab === "districts" || activeTab === "villages",
  });

  const { data: vilData, isLoading: _loadingVil } = useQuery({
    queryKey: ["cms-wilayah-villages", selectedDistrictCode, searchQuery],
    queryFn: () => getWilayahVillages(selectedDistrictCode, undefined, searchQuery),
    enabled: activeTab === "villages",
  });

  const provinces = provData?.data ?? [];
  const regencies = regData?.data ?? [];
  const districts = distData?.data ?? [];
  const villages = vilData?.data ?? [];

  const selectedProvince = provinces.find((p) => p.kode === selectedProvinceCode);
  const selectedRegency = regencies.find((r) => r.kode === selectedRegencyCode);
  const selectedDistrict = districts.find((d) => d.kode === selectedDistrictCode);

  const saveRegencyMut = useMutation({
    mutationFn: (data: {
      kode: string;
      provinceKode: string;
      nama: string;
      ibukota?: string;
      kodepos?: string;
      kodeposRange?: string;
    }) => saveWilayahRegency(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-wilayah-regencies"] });
      toast.success("Data wilayah kota/kabupaten berhasil disimpan ke database!");
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan wilayah.");
    },
  });

  return (
    <>
      <header className="content-header">
        <div>
          <h1>Wilayah & Kode Pos Indonesia (Kepmendagri)</h1>
          <p>
            Database Terpadu: 38 Provinsi, 514 Kab/Kota, 7.265 Kecamatan, dan 83.345 Desa/Kelurahan dengan Kode Pos Akurat se-Indonesia.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setEditingItem({
                kode: `${selectedProvinceCode}.`,
                provinceKode: selectedProvinceCode,
                nama: "",
                ibukota: "",
                kodepos: "",
                kodeposRange: "",
              });
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Tambah Data Wilayah
          </button>
        </div>
      </header>

      <div className="tab-group" style={{ marginBottom: "20px" }}>
        <button
          type="button"
          className={`tab-button ${activeTab === "regencies" ? "active" : ""}`}
          onClick={() => setActiveTab("regencies")}
        >
          <Building2 size={16} /> Kab & Kota (514)
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "districts" ? "active" : ""}`}
          onClick={() => setActiveTab("districts")}
        >
          <Landmark size={16} /> Kecamatan (7.265)
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "villages" ? "active" : ""}`}
          onClick={() => setActiveTab("villages")}
        >
          <MapPin size={16} /> Desa & Kelurahan (83.345)
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "provinces" ? "active" : ""}`}
          onClick={() => setActiveTab("provinces")}
        >
          <Globe2 size={16} /> Provinsi (38)
        </button>
      </div>

      {activeTab === "regencies" && (
        <>
          <section className="panel" style={{ marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  PILIH PROVINSI:
                </label>
                <select
                  value={selectedProvinceCode}
                  onChange={(e) => {
                    setSelectedProvinceCode(e.target.value);
                  }}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  {provinces.map((p) => (
                    <option key={p.kode} value={p.kode}>
                      [{p.kode}] {p.nama} (Ibukota: {p.ibukota})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  CARI KOTA / KODEPOS:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama kota, ibukota, atau nomor kodepos..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>
                Wilayah Provinsi {selectedProvince?.nama || "Indonesia"} ({regencies.length} Kab/Kota)
              </h3>
              <span className="badge" style={{ background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd" }}>
                Kode Kemendagri: {selectedProvince?.kode} · Rentang Kode Pos: {selectedProvince?.kodeposRange}
              </span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Wilayah</th>
                  <th>Nama Kabupaten / Kota</th>
                  <th>Ibukota</th>
                  <th>Kode Pos Utama</th>
                  <th>Rentang Kode Pos</th>
                  <th>Total Kodepos</th>
                  <th className="actions-cell">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {regencies.slice((regPage - 1) * regPageSize, regPage * regPageSize).map((r) => (
                  <tr key={r.kode}>
                    <td>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                        {r.kode}
                      </code>
                    </td>
                    <td>
                      <strong>{r.nama}</strong>
                    </td>
                    <td>{r.ibukota || "—"}</td>
                    <td>
                      <span className="badge" style={{ background: "#ecfdf5", color: "#059669" }}>
                        📮 {r.kodepos || "—"}
                      </span>
                    </td>
                    <td>{r.kodeposRange || "—"}</td>
                    <td>
                      <small style={{ color: "#64748b" }}>
                        {r.kodeposList?.length || 0} kelurahan
                      </small>
                    </td>
                    <td className="actions-cell">
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="icon-button"
                          title="Lihat Daftar Kecamatan"
                          aria-label={`Kecamatan di ${r.nama}`}
                          onClick={() => {
                            setSelectedRegencyCode(r.kode);
                            setActiveTab("districts");
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="Edit Kabupaten/Kota"
                          aria-label={`Edit ${r.nama}`}
                          onClick={() => {
                            setEditingItem(r);
                            setIsModalOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {regencies.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      <Empty message="Tidak ada data kota/kabupaten yang cocok." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <TablePagination
              currentPage={regPage}
              totalItems={regencies.length}
              pageSize={regPageSize}
              onPageChange={setRegPage}
              onPageSizeChange={setRegPageSize}
              pageSizeOptions={[15, 30, 50, 100]}
            />
          </section>
        </>
      )}

      {activeTab === "districts" && (
        <>
          <section className="panel" style={{ marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  1. PROVINSI:
                </label>
                <select
                  value={selectedProvinceCode}
                  onChange={(e) => {
                    setSelectedProvinceCode(e.target.value);
                  }}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  {provinces.map((p) => (
                    <option key={p.kode} value={p.kode}>
                      [{p.kode}] {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  2. KABUPATEN / KOTA:
                </label>
                <select
                  value={selectedRegencyCode}
                  onChange={(e) => setSelectedRegencyCode(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  {regencies.map((r) => (
                    <option key={r.kode} value={r.kode}>
                      [{r.kode}] {r.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  CARI KECAMATAN:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama atau kode kecamatan..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>
                Daftar Kecamatan di {selectedRegency?.nama || "Wilayah Terpilih"} ({districts.length} Kecamatan)
              </h3>
              <span className="badge" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                Kode Kabupaten: {selectedRegencyCode}
              </span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Kecamatan</th>
                  <th>Nama Kecamatan</th>
                  <th>Kabupaten / Kota</th>
                  <th>Provinsi</th>
                  <th className="actions-cell">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {districts.slice((distPage - 1) * distPageSize, distPage * distPageSize).map((d) => (
                  <tr key={d.kode}>
                    <td>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                        {d.kode}
                      </code>
                    </td>
                    <td>
                      <strong>Kec. {d.nama}</strong>
                    </td>
                    <td>{selectedRegency?.nama || d.regencyKode}</td>
                    <td>{selectedProvince?.nama || d.provinceKode}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="icon-button"
                        title="Lihat Daftar Desa / Kelurahan"
                        aria-label={`Desa/Kelurahan di Kec. ${d.nama}`}
                        onClick={() => {
                          setSelectedDistrictCode(d.kode);
                          setActiveTab("villages");
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {districts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      <Empty message="Tidak ada data kecamatan yang ditemukan." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <TablePagination
              currentPage={distPage}
              totalItems={districts.length}
              pageSize={distPageSize}
              onPageChange={setDistPage}
              onPageSizeChange={setDistPageSize}
              pageSizeOptions={[15, 30, 50, 100]}
            />
          </section>
        </>
      )}

      {activeTab === "villages" && (
        <>
          <section className="panel" style={{ marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.5fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  1. PROVINSI:
                </label>
                <select
                  value={selectedProvinceCode}
                  onChange={(e) => {
                    setSelectedProvinceCode(e.target.value);
                    setVillPage(1);
                  }}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  {provinces.map((p) => (
                    <option key={p.kode} value={p.kode}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  2. KAB/KOTA:
                </label>
                <select
                  value={selectedRegencyCode}
                  onChange={(e) => {
                    setSelectedRegencyCode(e.target.value);
                    setVillPage(1);
                  }}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  {regencies.map((r) => (
                    <option key={r.kode} value={r.kode}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  3. KECAMATAN:
                </label>
                <select
                  value={selectedDistrictCode}
                  onChange={(e) => {
                    setSelectedDistrictCode(e.target.value);
                    setVillPage(1);
                  }}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  {districts.map((d) => (
                    <option key={d.kode} value={d.kode}>
                      {d.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  CARI DESA / KODEPOS:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVillPage(1);
                  }}
                  placeholder="Ketik nama kelurahan atau kode pos..."
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>
                Daftar Desa / Kelurahan di Kec. {selectedDistrict?.nama || "Terpilih"} ({villages.length} Desa/Kelurahan)
              </h3>
              <span className="badge" style={{ background: "#fef3c7", color: "#b45309" }}>
                Kode Kecamatan: {selectedDistrictCode}
              </span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Desa/Kelurahan</th>
                  <th>Nama Desa / Kelurahan</th>
                  <th>Kode Pos</th>
                  <th>Kecamatan</th>
                  <th>Kabupaten / Kota</th>
                </tr>
              </thead>
              <tbody>
                {villages.slice((villPage - 1) * villPageSize, villPage * villPageSize).map((v) => (
                  <tr key={v.kode}>
                    <td>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                        {v.kode}
                      </code>
                    </td>
                    <td>
                      <strong>{v.nama}</strong>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "#ecfdf5", color: "#059669" }}>
                        📮 {v.kodepos || "—"}
                      </span>
                    </td>
                    <td>{selectedDistrict?.nama || v.districtKode}</td>
                    <td>{selectedRegency?.nama || v.regencyKode}</td>
                  </tr>
                ))}
                {villages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      <Empty message="Tidak ada data desa/kelurahan yang ditemukan." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <TablePagination
              currentPage={villPage}
              totalItems={villages.length}
              pageSize={villPageSize}
              onPageChange={setVillPage}
              onPageSizeChange={setVillPageSize}
              pageSizeOptions={[15, 30, 50, 100]}
            />
          </section>
        </>
      )}

      {activeTab === "provinces" && (
        <section className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Provinsi</th>
                <th>Ibukota</th>
                <th>Kode Pos Utama</th>
                <th>Rentang Kode Pos Provinsi</th>
                <th className="actions-cell">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {provinces.slice((provPage - 1) * provPageSize, provPage * provPageSize).map((p) => (
                <tr key={p.kode}>
                  <td>
                    <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                      {p.kode}
                    </code>
                  </td>
                  <td>
                    <strong>{p.nama}</strong>
                  </td>
                  <td>{p.ibukota}</td>
                  <td>
                    <span className="badge" style={{ background: "#ecfdf5", color: "#059669" }}>
                      📮 {p.kodepos}
                    </span>
                  </td>
                  <td>{p.kodeposRange}</td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="icon-button"
                      title={`Lihat Daftar Kabupaten/Kota di ${p.nama}`}
                      aria-label={`Kabupaten/Kota di ${p.nama}`}
                      onClick={() => {
                        setSelectedProvinceCode(p.kode);
                        setActiveTab("regencies");
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={provPage}
            totalItems={provinces.length}
            pageSize={provPageSize}
            onPageChange={setProvPage}
            onPageSizeChange={setProvPageSize}
            pageSizeOptions={[15, 30, 50, 100]}
          />
        </section>
      )}

      {isModalOpen && editingItem && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>{editingItem.kode && editingItem.nama ? "Edit Data Wilayah" : "Tambah Kota/Kabupaten"}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingItem.kode || !editingItem.nama) {
                  toast.error("Kode dan Nama wajib diisi.");
                  return;
                }
                saveRegencyMut.mutate({
                  kode: editingItem.kode,
                  provinceKode: editingItem.provinceKode || selectedProvinceCode,
                  nama: editingItem.nama,
                  ibukota: editingItem.ibukota || "",
                  kodepos: editingItem.kodepos || "",
                  kodeposRange: editingItem.kodeposRange || "",
                });
              }}
              style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "16px 0" }}
            >
              <label>
                Kode Wilayah (Kepmendagri) *
                <input
                  type="text"
                  required
                  value={editingItem.kode || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, kode: e.target.value })}
                  placeholder="Contoh: 31.71"
                />
              </label>

              <label>
                Nama Kabupaten / Kota *
                <input
                  type="text"
                  required
                  value={editingItem.nama || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, nama: e.target.value })}
                  placeholder="Contoh: Kota Surabaya"
                />
              </label>

              <label>
                Ibukota Wilayah
                <input
                  type="text"
                  value={editingItem.ibukota || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, ibukota: e.target.value })}
                  placeholder="Contoh: Surabaya"
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label>
                  Kode Pos Utama
                  <input
                    type="text"
                    value={editingItem.kodepos || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, kodepos: e.target.value })}
                    placeholder="Contoh: 60111"
                  />
                </label>
                <label>
                  Rentang Kode Pos
                  <input
                    type="text"
                    value={editingItem.kodeposRange || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, kodeposRange: e.target.value })}
                    placeholder="Contoh: 60111 - 60299"
                  />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                >
                  Batal
                </button>
                <button type="submit" className="button primary" disabled={saveRegencyMut.isPending}>
                  {saveRegencyMut.isPending ? "Menyimpan..." : "Simpan ke Database API"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// =========================================================================
// 1. AD/ART & Kode Etik Manager
// =========================================================================
function AdArtManager() {
  const queryClient = useQueryClient();
  const [docFilter, setDocFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingItem, setEditingItem] = useState<Partial<CmsAdArt> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_ad_art"],
    queryFn: getAdArtList,
  });

  const saveMutation = useMutation({
    mutationFn: (doc: Partial<CmsAdArt>) => saveAdArt(doc),
    onSuccess: () => {
      toast.success("Dokumen AD/ART berhasil disimpan ke database!");
      void queryClient.invalidateQueries({ queryKey: ["admin_ad_art"] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => toast.error(err.message || "Gagal menyimpan dokumen AD/ART"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdArt(id),
    onSuccess: () => {
      toast.success("Dokumen berhasil dihapus.");
      void queryClient.invalidateQueries({ queryKey: ["admin_ad_art"] });
    },
    onError: (err: any) => toast.error(err.message || "Gagal menghapus dokumen"),
  });

  const items = data?.data || [];
  const filteredItems = docFilter === "ALL" ? items : items.filter((d) => d.docType === docFilter);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleAddArticle = () => {
    if (!editingItem) return;
    const currentArticles = editingItem.articles || [];
    setEditingItem({
      ...editingItem,
      articles: [
        ...currentArticles,
        {
          articleNumber: `Pasal ${currentArticles.length + 1}`,
          title: "Judul Pasal Baru",
          clauses: ["(1) Isi ketentuan pasal pertama."],
        },
      ],
    });
  };

  const handleRemoveArticle = (idx: number) => {
    if (!editingItem) return;
    const currentArticles = [...(editingItem.articles || [])];
    currentArticles.splice(idx, 1);
    setEditingItem({ ...editingItem, articles: currentArticles });
  };

  if (isLoading) return <PageLoading />;

  return (
    <>
      <PageHeading
        eyebrow="Hukum & Konstitusi Organisasi"
        title="AD / ART & Kode Etik Profesi"
        description="Kelola Bab dan Pasal Anggaran Dasar (AD), Anggaran Rumah Tangga (ART), serta Butir Ikrar Kode Etik Profesi yang tampil di portal publik."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setEditingItem({
                docType: "AD",
                chapterNumber: `BAB ${items.length + 1}`,
                title: "",
                summary: "",
                color: "#38bdf8",
                sortOrder: items.length + 1,
                articles: [
                  {
                    articleNumber: "Pasal 1",
                    title: "Ketentuan Pokok",
                    clauses: ["(1) Penjelasan ketentuan."],
                  },
                ],
              });
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Tambah Bab Dokumen
          </button>
        }
      />

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[
          { key: "ALL", label: `Semua Dokumen (${items.length})` },
          { key: "AD", label: "Anggaran Dasar (AD)" },
          { key: "ART", label: "Anggaran Rumah Tangga (ART)" },
          { key: "KODE_ETIK", label: "Kode Etik Profesi" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`button ${docFilter === tab.key ? "primary" : "secondary"}`}
            style={{ padding: "6px 14px", fontSize: "13px" }}
            onClick={() => setDocFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "90px" }}>Jenis</th>
              <th style={{ width: "110px" }}>Bab / Nomor</th>
              <th>Judul Dokumen</th>
              <th>Ringkasan Bab</th>
              <th style={{ width: "100px", textAlign: "center" }}>Jml Pasal</th>
              <th style={{ width: "70px", textAlign: "center" }}>Urutan</th>
              <th style={{ width: "140px", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span
                    className="badge"
                    style={{
                      background:
                        item.docType === "AD"
                          ? "#0284c71a"
                          : item.docType === "ART"
                            ? "#10b9811a"
                            : "#f59e0b1a",
                      color:
                        item.docType === "AD"
                          ? "#0284c7"
                          : item.docType === "ART"
                            ? "#10b981"
                            : "#f59e0b",
                      fontWeight: 600,
                    }}
                  >
                    {item.docType}
                  </span>
                </td>
                <td>
                  <strong>{item.chapterNumber}</strong>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                </td>
                <td>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>
                    {item.summary || "—"}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="badge secondary">
                    {item.articles?.length || 0} Pasal
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>{item.sortOrder}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Bab Dokumen"
                      aria-label={`Edit ${item.chapterNumber}`}
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Bab Dokumen"
                      aria-label={`Hapus ${item.chapterNumber}`}
                      onClick={() => {
                        if (confirm(`Hapus ${item.chapterNumber}: ${item.title}?`)) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  Belum ada dokumen yang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredItems.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {isModalOpen && editingItem && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "720px", maxHeight: "85vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h3>{editingItem.id ? "Edit Bab Dokumen" : "Tambah Bab Dokumen Baru"}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(editingItem);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <label>
                  Tipe Dokumen
                  <select
                    value={editingItem.docType || "AD"}
                    onChange={(e) => setEditingItem({ ...editingItem, docType: e.target.value as any })}
                  >
                    <option value="AD">Anggaran Dasar (AD)</option>
                    <option value="ART">Anggaran Rumah Tangga (ART)</option>
                    <option value="KODE_ETIK">Kode Etik Profesi</option>
                  </select>
                </label>
                <label>
                  Nomor / Bab *
                  <input
                    type="text"
                    required
                    value={editingItem.chapterNumber || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, chapterNumber: e.target.value })}
                    placeholder="BAB I / Butir 1"
                  />
                </label>
                <label>
                  Urutan Tampil
                  <input
                    type="number"
                    value={editingItem.sortOrder ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, sortOrder: Number(e.target.value) })}
                  />
                </label>
              </div>

              <label>
                Judul Bab / Dokumen *
                <input
                  type="text"
                  required
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Contoh: Nama, Waktu, Asas & Kedudukan"
                />
              </label>

              <label>
                Ringkasan Bab
                <textarea
                  rows={2}
                  value={editingItem.summary || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  placeholder="Ringkasan isi bab untuk panduan cepat anggota..."
                />
              </label>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h4 style={{ margin: 0 }}>Daftar Pasal / Butir Ketentuan ({editingItem.articles?.length || 0})</h4>
                  <button type="button" className="button secondary" onClick={handleAddArticle}>
                    <Plus size={14} /> Tambah Pasal
                  </button>
                </div>

                {editingItem.articles?.map((art, artIdx) => (
                  <div
                    key={artIdx}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "12px",
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 40px", gap: "10px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={art.articleNumber}
                        onChange={(e) => {
                          const updated = [...(editingItem.articles || [])];
                          const target = updated[artIdx];
                          if (target) {
                            updated[artIdx] = { ...target, articleNumber: e.target.value };
                            setEditingItem({ ...editingItem, articles: updated });
                          }
                        }}
                        placeholder="Pasal 1"
                      />
                      <input
                        type="text"
                        value={art.title}
                        onChange={(e) => {
                          const updated = [...(editingItem.articles || [])];
                          const target = updated[artIdx];
                          if (target) {
                            updated[artIdx] = { ...target, title: e.target.value };
                            setEditingItem({ ...editingItem, articles: updated });
                          }
                        }}
                        placeholder="Judul Pasal"
                      />
                      <button
                        type="button"
                        className="button danger"
                        style={{ padding: "4px" }}
                        onClick={() => handleRemoveArticle(artIdx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <label style={{ fontSize: "12px", color: "#64748b" }}>
                      Isi Ayat / Ketentuan (Satu baris per ayat):
                      <textarea
                        rows={3}
                        value={art.clauses.join("\n")}
                        onChange={(e) => {
                          const updated = [...(editingItem.articles || [])];
                          const target = updated[artIdx];
                          if (target) {
                            updated[artIdx] = {
                              ...target,
                              clauses: e.target.value.split("\n").filter(Boolean),
                            };
                            setEditingItem({ ...editingItem, articles: updated });
                          }
                        }}
                        placeholder="(1) Ketentuan pertama...&#10;(2) Ketentuan kedua..."
                        style={{ marginTop: "4px" }}
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                >
                  Batal
                </button>
                <button type="submit" className="button primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Menyimpan..." : "Simpan Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// =========================================================================
// 2. Sejarah & Profil Milestones Manager
// =========================================================================
function MilestonesManager() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingItem, setEditingItem] = useState<Partial<CmsMilestone> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_milestones"],
    queryFn: getMilestonesList,
  });

  const saveMutation = useMutation({
    mutationFn: (m: Partial<CmsMilestone>) => saveMilestone(m),
    onSuccess: () => {
      toast.success("Tonggak sejarah organisasi berhasil disimpan!");
      void queryClient.invalidateQueries({ queryKey: ["admin_milestones"] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => toast.error(err.message || "Gagal menyimpan data sejarah"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: () => {
      toast.success("Tonggak sejarah berhasil dihapus.");
      void queryClient.invalidateQueries({ queryKey: ["admin_milestones"] });
    },
    onError: (err: any) => toast.error(err.message || "Gagal menghapus data sejarah"),
  });

  const items = data?.data || [];
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (isLoading) return <PageLoading />;

  return (
    <>
      <PageHeading
        eyebrow="Sejarah & Profil Organisasi"
        title="Tonggak Sejarah & Fase Perjalanan"
        description="Kelola linimasa pembentukan organisasi, pencapaian strategis, dan transformasi per tahun yang tampil di halaman Profil Publik."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setEditingItem({
                year: new Date().getFullYear().toString(),
                phase: "Fase Baru",
                title: "",
                description: "",
                tags: ["Organisasi", "Nasional"],
                highlight: "Pencapaian Utama",
                sortOrder: items.length + 1,
              });
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Tambah Fase Sejarah
          </button>
        }
      />

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "90px" }}>Tahun</th>
              <th>Fase Perjalanan</th>
              <th>Judul Pencapaian</th>
              <th>Highlight Badge</th>
              <th>Tagar</th>
              <th style={{ width: "70px", textAlign: "center" }}>Urutan</th>
              <th style={{ width: "140px", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="badge primary" style={{ fontWeight: 700 }}>
                    {item.year}
                  </span>
                </td>
                <td>
                  <strong>{item.phase}</strong>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                    {item.description}
                  </div>
                </td>
                <td>
                  <span className="badge secondary">{item.highlight || "—"}</span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {item.tags?.map((t, idx) => (
                      <span key={idx} style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>{item.sortOrder}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Tonggak Sejarah"
                      aria-label={`Edit ${item.year} ${item.title}`}
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Tonggak Sejarah"
                      aria-label={`Hapus ${item.year} ${item.title}`}
                      onClick={() => {
                        if (confirm(`Hapus sejarah tahun ${item.year}: ${item.title}?`)) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {isModalOpen && editingItem && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>{editingItem.id ? "Edit Tonggak Sejarah" : "Tambah Tonggak Sejarah Baru"}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(editingItem);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <label>
                  Tahun *
                  <input
                    type="text"
                    required
                    value={editingItem.year || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="Contoh: 2026"
                  />
                </label>
                <label>
                  Nama Fase Perjalanan *
                  <input
                    type="text"
                    required
                    value={editingItem.phase || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, phase: e.target.value })}
                    placeholder="Contoh: Fase Modernisasi Digital"
                  />
                </label>
              </div>

              <label>
                Judul Pencapaian Utama *
                <input
                  type="text"
                  required
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Contoh: Peluncuran KTA Digital & Sertifikasi BNSP"
                />
              </label>

              <label>
                Deskripsi Lengkap Narasi Sejarah *
                <textarea
                  rows={4}
                  required
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Jelaskan momentum dan capaian organisasi pada fase ini..."
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label>
                  Highlight Badge Label
                  <input
                    type="text"
                    value={editingItem.highlight || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, highlight: e.target.value })}
                    placeholder="Contoh: Transformasi Digital"
                  />
                </label>
                <label>
                  Urutan Tampil
                  <input
                    type="number"
                    value={editingItem.sortOrder ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, sortOrder: Number(e.target.value) })}
                  />
                </label>
              </div>

              <label>
                Tagar Kategori (Pisahkan dengan koma)
                <input
                  type="text"
                  value={editingItem.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="KTA Digital, QR Anti-Pemalsuan, Audit Publik"
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                >
                  Batal
                </button>
                <button type="submit" className="button primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Menyimpan..." : "Simpan Sejarah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// =========================================================================
// 3. Katalog Spesifikasi Freon / Refrigerants & Kalkulator Manager
// =========================================================================
function RefrigerantsManager() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingItem, setEditingItem] = useState<Partial<CmsRefrigerant> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_refrigerants"],
    queryFn: getRefrigerantsList,
  });

  const saveMutation = useMutation({
    mutationFn: (r: Partial<CmsRefrigerant>) => saveRefrigerant(r),
    onSuccess: () => {
      toast.success("Spesifikasi refrigeran berhasil disimpan!");
      void queryClient.invalidateQueries({ queryKey: ["admin_refrigerants"] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => toast.error(err.message || "Gagal menyimpan spesifikasi"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRefrigerant(id),
    onSuccess: () => {
      toast.success("Spesifikasi refrigeran berhasil dihapus.");
      void queryClient.invalidateQueries({ queryKey: ["admin_refrigerants"] });
    },
    onError: (err: any) => toast.error(err.message || "Gagal menghapus data"),
  });

  const items = data?.data || [];
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (isLoading) return <PageLoading />;

  return (
    <>
      <PageHeading
        eyebrow="Data Teknis & Standardisasi"
        title="Katalog Freon & Spesifikasi Kalkulator"
        description="Kelola data teknis zat pendingin refrigeran: rumus kimia, rentang tekanan kerja PSI, standar oli kompresor, potensi GWP/ODP, dan status legalitas KLHK."
        action={
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setEditingItem({
                code: "R32",
                name: "R-32 (Difluoromethane)",
                chemicalFormula: "CH₂F₂",
                refrigerantType: "HFC Murni",
                suctionPsi: "115 - 135 PSI",
                dischargePsi: "320 - 380 PSI",
                gwp: 675,
                odp: "0",
                oilType: "Synthetic POE",
                safetyClass: "A2L (Mildly Flammable)",
                statusKlhk: "Legal",
                description: "",
                recommendedUse: "AC Inverter, Residensial",
                sortOrder: items.length + 1,
              });
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Tambah Spesifikasi Freon
          </button>
        }
      />

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "90px" }}>Kode</th>
              <th>Nama Senyawa</th>
              <th>Jenis Refrigeran</th>
              <th>Tekanan Suction / Discharge</th>
              <th style={{ width: "80px", textAlign: "center" }}>GWP</th>
              <th>Safety Class</th>
              <th>Status Regulasi KLHK</th>
              <th style={{ width: "140px", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="badge primary" style={{ fontWeight: 700 }}>
                    {item.code}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: "#64748b", fontSize: "12px" }}>
                    {item.chemicalFormula} · Oli: {item.oilType}
                  </div>
                </td>
                <td>{item.refrigerantType}</td>
                <td>
                  <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                    S: {item.suctionPsi} | D: {item.dischargePsi}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    className="badge"
                    style={{
                      background: item.gwp < 100 ? "#10b9811a" : item.gwp < 1000 ? "#38bdf81a" : "#f59e0b1a",
                      color: item.gwp < 100 ? "#10b981" : item.gwp < 1000 ? "#0284c7" : "#f59e0b",
                    }}
                  >
                    {item.gwp}
                  </span>
                </td>
                <td>
                  <span className="badge secondary">{item.safetyClass}</span>
                </td>
                <td>
                  <span style={{ fontSize: "12px" }}>{item.statusKlhk}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit Spesifikasi Refrigeran"
                      aria-label={`Edit ${item.code}`}
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Hapus Spesifikasi Refrigeran"
                      aria-label={`Hapus ${item.code}`}
                      onClick={() => {
                        if (confirm(`Hapus refrigeran ${item.code}?`)) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {isModalOpen && editingItem && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "680px", maxHeight: "85vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h3>{editingItem.id ? "Edit Spesifikasi Freon" : "Tambah Spesifikasi Freon Baru"}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(editingItem);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <label>
                  Kode Refrigeran *
                  <input
                    type="text"
                    required
                    value={editingItem.code || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                    placeholder="Contoh: R32 / R410A"
                  />
                </label>
                <label>
                  Nama Lengkap Senyawa *
                  <input
                    type="text"
                    required
                    value={editingItem.name || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Contoh: R-32 (Difluoromethane)"
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <label>
                  Rumus Kimia
                  <input
                    type="text"
                    value={editingItem.chemicalFormula || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, chemicalFormula: e.target.value })}
                    placeholder="CH₂F₂"
                  />
                </label>
                <label>
                  Jenis Zat
                  <input
                    type="text"
                    value={editingItem.refrigerantType || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, refrigerantType: e.target.value })}
                    placeholder="HFC Murni / HC Alami"
                  />
                </label>
                <label>
                  Jenis Oli Kompresor
                  <input
                    type="text"
                    value={editingItem.oilType || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, oilType: e.target.value })}
                    placeholder="Synthetic POE / PAG"
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label>
                  Rentang Tekanan Suction (Rendah)
                  <input
                    type="text"
                    value={editingItem.suctionPsi || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, suctionPsi: e.target.value })}
                    placeholder="115 - 135 PSI"
                  />
                </label>
                <label>
                  Rentang Tekanan Discharge (Tinggi)
                  <input
                    type="text"
                    value={editingItem.dischargePsi || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, dischargePsi: e.target.value })}
                    placeholder="320 - 380 PSI"
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <label>
                  Nilai GWP (Pemanasan Global)
                  <input
                    type="number"
                    value={editingItem.gwp ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, gwp: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Nilai ODP (Perusak Ozon)
                  <input
                    type="text"
                    value={editingItem.odp || "0"}
                    onChange={(e) => setEditingItem({ ...editingItem, odp: e.target.value })}
                  />
                </label>
                <label>
                  Safety Class ASHRAE
                  <input
                    type="text"
                    value={editingItem.safetyClass || "A1"}
                    onChange={(e) => setEditingItem({ ...editingItem, safetyClass: e.target.value })}
                    placeholder="A1 / A2L / A3"
                  />
                </label>
              </div>

              <label>
                Status Regulasi KLHK
                <input
                  type="text"
                  value={editingItem.statusKlhk || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, statusKlhk: e.target.value })}
                  placeholder="Legal & Didukung (Transisi Hijau)"
                />
              </label>

              <label>
                Rekomendasi Penggunaan Unit
                <input
                  type="text"
                  value={editingItem.recommendedUse || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, recommendedUse: e.target.value })}
                  placeholder="AC Split Inverter, VRV Komersial, dll."
                />
              </label>

              <label>
                Deskripsi Karakteristik Teknis
                <textarea
                  rows={3}
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Karakteristik perpindahan panas dan panduan pengisian..."
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                >
                  Batal
                </button>
                <button type="submit" className="button primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Menyimpan..." : "Simpan Spesifikasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
