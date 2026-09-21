import { useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Package,
  PenLine,
  Printer,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

type AdminPage = 'Dashboard' | 'Products' | 'Services' | 'Orders' | 'Website Content' | 'Settings';

type AdminProps = {
  authenticated: boolean;
};

const navigation: Array<{ label: AdminPage; description: string; icon: typeof LayoutDashboard }> = [
  { label: 'Dashboard', description: 'Overview', icon: LayoutDashboard },
  { label: 'Products', description: 'Print catalogue', icon: Package },
  { label: 'Services', description: 'Capabilities', icon: Printer },
  { label: 'Orders', description: 'Production queue', icon: ClipboardList },
  { label: 'Website Content', description: 'Public pages', icon: FileText },
  { label: 'Settings', description: 'Workspace setup', icon: Settings },
];

const workspaceSections: Record<Exclude<AdminPage, 'Dashboard'>, { eyebrow: string; title: string; copy: string; icon: typeof Package }> = {
  Products: {
    eyebrow: 'Catalogue workspace',
    title: 'Products will live here.',
    copy: 'Create and organise the printed pieces, signage formats, and branded materials your team offers.',
    icon: Package,
  },
  Services: {
    eyebrow: 'Capabilities workspace',
    title: 'Services will live here.',
    copy: 'Shape the service catalogue behind the public experience, from large-format print to graphic design.',
    icon: Printer,
  },
  Orders: {
    eyebrow: 'Production workspace',
    title: 'Orders will live here.',
    copy: 'A focused place for enquiries, production stages, delivery notes, and the work moving through your studio.',
    icon: ClipboardList,
  },
  'Website Content': {
    eyebrow: 'Publishing workspace',
    title: 'Website content will live here.',
    copy: 'Manage the words, services, portfolio pieces, and contact details that appear across the public site.',
    icon: FileText,
  },
  Settings: {
    eyebrow: 'Workspace controls',
    title: 'Settings will live here.',
    copy: 'Configure the workspace once the administration and content foundations are connected.',
    icon: Settings,
  },
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? 'justify-center' : 'gap-3'}`} data-testid="brand-admin">
      <img src="/new-national-advertising-logo.png" alt="New National Advertising" className={`object-contain ${compact ? 'h-9 w-14' : 'h-12 w-[112px]'}`} />
    </div>
  );
}

function LockedAdminState() {
  return (
    <main className="site-noise flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f2f6f8] px-5 py-10 text-[#14213d]">
      <div className="pointer-events-none absolute left-[-12vw] top-[-16vw] h-[46vw] w-[46vw] rounded-full bg-[#d9edf2] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-18vw] right-[-12vw] h-[44vw] w-[44vw] rounded-full bg-[#f8ebc7] opacity-55 blur-3xl" />
      <section className="relative w-full max-w-[520px] overflow-hidden rounded-[22px] border border-[#d8e4eb] bg-[#fffdf9] shadow-[0_22px_70px_rgba(31,65,91,.13)]" data-testid="state-admin-locked">
        <div className="h-1.5 bg-[linear-gradient(90deg,#00a8c6_0%,#d9468c_33%,#f2c94c_66%,#14213d_100%)]" />
        <div className="px-7 py-9 sm:px-11 sm:py-12">
          <BrandMark />
          <div className="mt-12 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5f8] text-[#1769aa]">
            <LockKeyhole size={25} strokeWidth={1.7} />
          </div>
          <p className="eyebrow mt-8" data-testid="text-admin-eyebrow">Private workspace</p>
          <h1 className="display mt-3 max-w-[390px] text-[clamp(2rem,7vw,3.3rem)] font-extrabold leading-[.98] tracking-[-.07em] text-[#14213d]" data-testid="heading-admin-locked">
            Admin access is locked.
          </h1>
           <p className="mt-5 max-w-[390px] text-[14px] leading-6 text-[#5b6b79]" data-testid="text-admin-locked-copy">
             This workspace is available after authentication is connected. No admin data or controls are exposed until a secure session is present.
          </p>
          <div className="mt-8 flex items-center gap-2 border-t border-[#e8eef1] pt-5 text-[11px] font-semibold text-[#687986]" data-testid="status-admin-auth">
            <ShieldCheck size={15} className="text-[#3ba776]" />
             Secure authentication is required before admin access
          </div>
        </div>
      </section>
    </main>
  );
}

function EmptyMetric({ label, icon: Icon, tone }: { label: string; icon: typeof BarChart3; tone: string }) {
  return (
    <div className="rounded-[16px] border border-[#dce7ec] bg-[#fffdf9] p-5 shadow-[0_7px_20px_rgba(31,65,91,.045)]" data-testid={`card-metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={17} strokeWidth={1.8} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9aa8b0]">Not connected</span>
      </div>
      <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.16em] text-[#75858f]">{label}</p>
      <p className="display mt-1 text-[29px] font-extrabold tracking-[-.07em] text-[#203954]" data-testid={`text-metric-${label.toLowerCase().replaceAll(' ', '-')}`}>—</p>
    </div>
  );
}

function DashboardHome({ onNavigate }: { onNavigate: (page: AdminPage) => void }) {
  return (
    <div className="space-y-7" data-testid="admin-dashboard-content">
      <section className="relative overflow-hidden rounded-[20px] border border-[#d4e4eb] bg-[#eaf5f7] px-6 py-7 sm:px-9 sm:py-9" data-testid="card-dashboard-welcome">
        <div className="pointer-events-none absolute right-[-3%] top-[-45%] h-[340px] w-[340px] rounded-full border-[1px] border-[#98ccd3]/45" />
        <div className="pointer-events-none absolute right-[9%] top-[-31%] h-[260px] w-[260px] rounded-full border-[1px] border-[#98ccd3]/35" />
        <div className="relative max-w-[630px]">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.19em] text-[#2274ad]">
            <Sparkles size={14} />
            Foundation view
          </div>
          <h1 className="display mt-4 text-[clamp(2rem,4vw,3.65rem)] font-extrabold leading-[.97] tracking-[-.075em] text-[#14213d]" data-testid="heading-admin-dashboard">
            A clear desk for the work ahead.
          </h1>
          <p className="mt-4 max-w-[530px] text-[14px] leading-6 text-[#536b79]" data-testid="text-dashboard-intro">
            The admin foundation is ready. Connect your catalogue, services, orders, and website content when those workflows are ready to come online.
          </p>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={() => onNavigate('Products')} className="inline-flex items-center gap-2 rounded-full bg-[#1769aa] px-4 py-2.5 text-[11px] font-bold text-white shadow-[0_7px_16px_rgba(23,105,170,.16)] transition hover:-translate-y-0.5 hover:bg-[#125b94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf5f7]" data-testid="button-open-products">
            Open catalogue <ArrowUpRight size={14} />
          </button>
          <button type="button" onClick={() => onNavigate('Website Content')} className="inline-flex items-center gap-2 rounded-full border border-[#a8c7d3] bg-[#fffdf9]/70 px-4 py-2.5 text-[11px] font-bold text-[#23425b] transition hover:-translate-y-0.5 hover:border-[#1769aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf5f7]" data-testid="button-open-content">
            Website content <FileText size={14} />
          </button>
        </div>
      </section>

      <section aria-labelledby="overview-heading">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Workspace pulse</p>
            <h2 id="overview-heading" className="display mt-1 text-[22px] font-extrabold tracking-[-.06em] text-[#203954]">Overview</h2>
          </div>
          <span className="hidden items-center gap-1.5 text-[10px] font-semibold text-[#84939b] sm:flex" data-testid="status-dashboard-data">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f2c94c]" />
            Awaiting connected data
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <EmptyMetric label="Products" icon={Package} tone="bg-[#eef7f8] text-[#00a8c6]" />
          <EmptyMetric label="Services" icon={Printer} tone="bg-[#fff6df] text-[#c39513]" />
          <EmptyMetric label="Orders" icon={ClipboardList} tone="bg-[#fff0f6] text-[#d9468c]" />
          <EmptyMetric label="Content pages" icon={FileText} tone="bg-[#edf3fb] text-[#1769aa]" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-[16px] border border-[#dce7ec] bg-[#fffdf9] p-6 shadow-[0_7px_20px_rgba(31,65,91,.045)]" data-testid="card-setup-progress">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Next steps</p>
              <h2 className="display mt-1 text-[22px] font-extrabold tracking-[-.06em] text-[#203954]">Set up the workspace</h2>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5f8] text-[#1769aa]"><PenLine size={16} /></span>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e8eef1]" aria-label="Setup progress" data-testid="progress-setup">
            <div className="h-full w-[18%] rounded-full bg-[#1769aa]" />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-[#71818d]" data-testid="text-setup-progress">The foundation is in place. Add your first connected workspace area to begin.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {[
              { label: 'Add products', target: 'Products', icon: Package },
              { label: 'Define services', target: 'Services', icon: Printer },
              { label: 'Review content', target: 'Website Content', icon: FileText },
              { label: 'Configure settings', target: 'Settings', icon: Settings },
            ].map(({ label, target, icon: Icon }) => (
              <button type="button" key={target} onClick={() => onNavigate(target as AdminPage)} className="group flex items-center justify-between rounded-xl border border-[#e4ecef] bg-[#fbfcfb] px-3.5 py-3 text-left transition hover:border-[#9dc7d3] hover:bg-[#f2f9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa]" data-testid={`button-setup-${target.toLowerCase().replaceAll(' ', '-')}`}>
                <span className="flex items-center gap-2.5 text-[11px] font-bold text-[#3d5669]"><Icon size={15} className="text-[#1769aa]" />{label}</span>
                <ChevronRight size={14} className="text-[#94a5ae] transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[16px] border border-[#dce7ec] bg-[#14213d] p-6 text-white shadow-[0_7px_20px_rgba(31,65,91,.09)]" data-testid="card-admin-note">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#f2c94c]"><CircleHelp size={17} /></span>
            <span className="ink-strip w-[74px] opacity-80"><span /><span /><span /><span /></span>
          </div>
          <p className="eyebrow mt-8 !text-[#9bc8d8]">A considered start</p>
          <h2 className="display mt-2 text-[25px] font-extrabold leading-[1.02] tracking-[-.065em]">No sample records. No noise.</h2>
          <p className="mt-4 text-[12px] leading-5 text-[#b9cbd4]">This foundation stays intentionally empty until real business information is connected.</p>
        </div>
      </section>
    </div>
  );
}

export default function AdminPage({ authenticated }: AdminProps) {
  const [activePage, setActivePage] = useState<AdminPage>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!authenticated) return <LockedAdminState />;

  const activeSection = activePage === 'Dashboard' ? null : workspaceSections[activePage];
  const ActiveIcon = activeSection?.icon;

  const navigate = (page: AdminPage) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <div className="site-noise min-h-[100dvh] bg-[#f3f6f7] text-[#14213d]" data-testid="admin-shell">
      <div className="flex min-h-[100dvh]">
        {sidebarOpen && (
          <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#14213d]/25 backdrop-blur-[2px] lg:hidden" data-testid="button-close-navigation-overlay" />
        )}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[274px] flex-col border-r border-[#dce7ec] bg-[#fffdf9] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:w-[78px]' : ''}`} data-testid="admin-sidebar">
          <div className={`flex h-[79px] shrink-0 items-center border-b border-[#e8eef1] px-5 ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
            <BrandMark compact={sidebarCollapsed} />
            <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-[#79909e] hover:bg-[#edf4f7] lg:hidden" data-testid="button-close-navigation"><X size={17} /></button>
          </div>
          <div className={`px-3 py-6 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            {!sidebarCollapsed && <p className="px-3 text-[9px] font-bold uppercase tracking-[.2em] text-[#9aa8b0]">Workspace</p>}
            <nav className="mt-3 space-y-1" aria-label="Admin navigation">
              {navigation.map(({ label, description, icon: Icon }) => {
                const selected = activePage === label;
                return (
                  <button type="button" key={label} onClick={() => navigate(label)} title={sidebarCollapsed ? label : undefined} aria-current={selected ? 'page' : undefined} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa] ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''} ${selected ? 'bg-[#eaf5f7] text-[#1769aa]' : 'text-[#5d7180] hover:bg-[#f2f7f8] hover:text-[#203954]'}`} data-testid={`nav-admin-${label.toLowerCase().replaceAll(' ', '-')}`}>
                    <Icon size={17} strokeWidth={selected ? 2.2 : 1.8} />
                    {!sidebarCollapsed && <span className="min-w-0"><span className="block truncate text-[12px] font-bold">{label}</span><span className={`mt-0.5 block truncate text-[10px] ${selected ? 'text-[#5e91a4]' : 'text-[#95a4ac]'}`}>{description}</span></span>}
                    {!sidebarCollapsed && selected && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00a8c6]" />}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto border-t border-[#e8eef1] p-4">
            {!sidebarCollapsed ? (
              <div className="rounded-xl bg-[#f2f7f8] p-3" data-testid="status-admin-session">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3ba776]" /><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#527282]">Authenticated session</span></div>
                <p className="mt-2 text-[10px] leading-4 text-[#7d8e97]">Admin foundation access is active.</p>
              </div>
            ) : (
              <span className="mx-auto block h-2 w-2 rounded-full bg-[#3ba776]" title="Authenticated session" data-testid="status-admin-session-collapsed" />
            )}
          </div>
          <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} className="hidden h-12 shrink-0 items-center justify-center gap-2 border-t border-[#e8eef1] text-[10px] font-bold uppercase tracking-[.14em] text-[#81929b] hover:bg-[#f4f8f9] hover:text-[#1769aa] lg:flex" data-testid="button-toggle-sidebar">
            {sidebarCollapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /> Collapse</>}
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[79px] items-center justify-between border-b border-[#dce7ec] bg-[#f3f6f7]/92 px-5 backdrop-blur-md sm:px-8" data-testid="admin-header">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation" className="rounded-lg p-2 text-[#536c7c] hover:bg-[#e7f0f3] lg:hidden" data-testid="button-open-navigation"><Menu size={20} /></button>
              <div>
                <p className="hidden text-[9px] font-bold uppercase tracking-[.2em] text-[#93a2aa] sm:block">New National Advertising / Admin</p>
                <p className="display mt-0.5 text-[18px] font-extrabold tracking-[-.055em] text-[#203954]" data-testid="text-active-admin-page">{activePage}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-[#d9e5ea] bg-[#fffdf9] px-3 py-2 text-[10px] font-bold text-[#68808d] sm:flex" data-testid="status-workspace-ready"><span className="h-1.5 w-1.5 rounded-full bg-[#3ba776]" />Workspace ready</div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14213d] text-[11px] font-bold text-white" aria-label="Authenticated admin profile" data-testid="avatar-admin">NN</div>
            </div>
          </header>
          <main className="mx-auto max-w-[1260px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10" data-testid="admin-main">
            {activePage === 'Dashboard' ? (
              <DashboardHome onNavigate={navigate} />
            ) : (
              <section className="relative overflow-hidden rounded-[20px] border border-[#d4e4eb] bg-[#fffdf9] px-6 py-10 shadow-[0_9px_28px_rgba(31,65,91,.05)] sm:px-12 sm:py-14" data-testid={`state-admin-${activePage.toLowerCase().replaceAll(' ', '-')}`}>
                <div className="pointer-events-none absolute right-[-5%] top-[-35%] h-[390px] w-[390px] rounded-full border border-[#d4e4eb] opacity-75" />
                <div className="pointer-events-none absolute right-[9%] top-[-24%] h-[270px] w-[270px] rounded-full border border-[#e3edf0]" />
                <div className="relative max-w-[680px]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5f7] text-[#1769aa]">{ActiveIcon && <ActiveIcon size={22} strokeWidth={1.8} />}</span>
                  <p className="eyebrow mt-8">{activeSection?.eyebrow}</p>
                  <h1 className="display mt-3 text-[clamp(2.1rem,5vw,4.4rem)] font-extrabold leading-[.96] tracking-[-.08em] text-[#14213d]" data-testid={`heading-admin-${activePage.toLowerCase().replaceAll(' ', '-')}`}>{activeSection?.title}</h1>
                  <p className="mt-5 max-w-[570px] text-[14px] leading-6 text-[#5d7180]" data-testid={`text-admin-${activePage.toLowerCase().replaceAll(' ', '-')}-copy`}>{activeSection?.copy}</p>
                  <div className="mt-9 flex items-center gap-2 border-t border-[#e6edef] pt-5 text-[11px] font-semibold text-[#84939b]" data-testid="status-admin-placeholder"><Check size={15} className="text-[#3ba776]" />Navigation is ready for connected content</div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}