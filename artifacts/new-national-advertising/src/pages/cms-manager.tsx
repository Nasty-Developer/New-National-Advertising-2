import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CircleAlert,
  ImagePlus,
  PenLine,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  getGetAdminContactNumbersQueryKey,
  getGetAdminMachinesQueryKey,
  getGetAdminServicesQueryKey,
  getGetAdminSettingsQueryKey,
  getGetAdminWebsiteContentQueryKey,
  useCreateContactNumber,
  useCreateMachine,
  useCreateService,
  useDeleteContactNumber,
  useDeleteMachine,
  useDeleteService,
  useGetAdminContactNumbers,
  useGetAdminMachines,
  useGetAdminServices,
  useGetAdminSettings,
  useGetAdminWebsiteContent,
  useRequestProductImageUploadUrl,
  useUpdateContactNumber,
  useUpdateMachine,
  useUpdateService,
  useUpdateSettings,
  useUpdateWebsiteContent,
  type ContactNumber,
  type ContactNumberInput,
  type Machine,
  type MachineInput,
  type Service,
  type ServiceInput,
  type WebsiteContent,
  type WebsiteContentInput,
  type WebsiteSettings,
  type WebsiteSettingsInput,
} from "@workspace/api-client-react";
import { uploadFileToServer } from "@/lib/image-upload";

type CmsPage = "Machines" | "Services" | "Website Content" | "Settings";

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Something went wrong. Please try again.";
}

function splitLines(value: string | undefined) {
  return (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
}

function joinLines(value: string[] | undefined) {
  return (value ?? []).join("\n");
}

function imageUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/new-") || path.startsWith("/machine") || path.startsWith("/service") || path.startsWith("/favicon")) return path;
  return `/api/storage/read?path=${encodeURIComponent(path)}`;
}

function Button({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-[#1769aa] text-white hover:bg-[#125b94]",
    secondary: "border border-[#b7cdd8] bg-[#fffefa] text-[#294861] hover:border-[#1769aa] hover:bg-[#f4fafb]",
    danger: "border border-[#e7bdb8] bg-[#fff5f3] text-[#a3443c] hover:bg-[#feeae7]",
  }[variant];
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 ${styles} ${props.className ?? ""}`}>{children}</button>;
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block"><span className="mb-2 flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#667d8b]">{label}{hint && <span className="normal-case tracking-normal text-[#9aa8b0]">{hint}</span>}</span>{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`admin-input ${props.className ?? ""}`} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`admin-input min-h-[100px] resize-y py-3 ${props.className ?? ""}`} />;
}

function ManagerHeader({ page, description, onAdd }: { page: string; description: string; onAdd?: () => void }) {
  return <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Central CMS</p><h1 className="display mt-1 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-.075em] text-[#14213d]">{page}</h1><p className="mt-3 max-w-[650px] text-[13px] leading-6 text-[#6b7d89]">{description}</p></div>{onAdd && <Button onClick={onAdd}><Plus size={15} /> Add {page === "Website Content" ? "content" : page === "Machines" ? "machine" : "service"}</Button>}</section>;
}

function ListState({ loading, error, empty, onRetry }: { loading: boolean; error: boolean; empty: boolean; onRetry: () => void }) {
  if (loading) return <div className="space-y-3">{[1, 2, 3, 4].map((item) => <div key={item} className="admin-skeleton h-[78px] rounded-xl border border-[#e5ecef]" />)}</div>;
  if (error) return <div className="rounded-[16px] border border-[#edcbc7] bg-[#fff5f3] p-8 text-center"><CircleAlert className="mx-auto text-[#b04b43]" size={26} /><h2 className="display mt-4 text-xl font-extrabold text-[#703a36]">Couldn’t load this section</h2><Button variant="secondary" className="mt-5" onClick={onRetry}><RefreshCw size={14} /> Try again</Button></div>;
  if (empty) return <div className="rounded-[16px] border border-dashed border-[#b9d0d9] bg-[#f9fbfb] px-6 py-14 text-center"><ImagePlus className="mx-auto text-[#7db6c2]" size={28} /><h2 className="display mt-4 text-2xl font-extrabold text-[#203954]">Nothing here yet</h2><p className="mt-2 text-[12px] text-[#758792]">Add the first record to make this section editable.</p></div>;
  return null;
}

async function uploadFiles(files: File[], folder: "machines" | "services", request: ReturnType<typeof useRequestProductImageUploadUrl>) {
  const paths: string[] = [];
  for (const file of files) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error("Use JPG, PNG, or WebP images up to 10 MB.");
    paths.push(await uploadFileToServer(file, folder, request.mutateAsync));
  }
  return paths;
}

type MachineFormProps = { record: Machine | null; onClose: () => void; onSaved: () => void };
function MachineForm({ record, onClose, onSaved }: MachineFormProps) {
  const queryClient = useQueryClient();
  const create = useCreateMachine();
  const update = useUpdateMachine();
  const upload = useRequestProductImageUploadUrl();
  const [form, setForm] = useState<MachineInput>(() => record ? { ...record } : { name: "", slug: "", category: "", shortDescription: "", description: "", fullDescription: "", specifications: [], features: [], applications: [], images: [], relatedServices: [], displayOrder: 0, published: true });
  const [specs, setSpecs] = useState(joinLines(form.specifications));
  const [features, setFeatures] = useState(joinLines(form.features));
  const [applications, setApplications] = useState(joinLines(form.applications));
  const [related, setRelated] = useState(joinLines(form.relatedServices));
  const [feedback, setFeedback] = useState("");
  const set = <K extends keyof MachineInput>(key: K, value: MachineInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");
    const payload: MachineInput = { ...form, name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim(), fullDescription: form.fullDescription?.trim() || form.description.trim(), specifications: splitLines(specs), features: splitLines(features), applications: splitLines(applications), relatedServices: splitLines(related), images: form.images ?? [], imageUrl: form.images?.[0] ?? form.imageUrl ?? null };
    try {
      if (record) await update.mutateAsync({ id: record.id, data: payload });
      else await create.mutateAsync({ data: payload });
      await queryClient.invalidateQueries({ queryKey: getGetAdminMachinesQueryKey() });
      onSaved();
    } catch (error) {
      setFeedback(errorMessage(error));
    }
  };
  const busy = create.isPending || update.isPending || upload.isPending;
  return <CmsDialog title={record ? "Edit machine" : "Add machine"} onClose={onClose}><form onSubmit={save} className="space-y-5">
    {feedback && <div className="rounded-xl border border-[#edcbc7] bg-[#fff5f3] px-4 py-3 text-[12px] text-[#a3443c]">{feedback}</div>}
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Machine name"><TextInput required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field><Field label="Slug"><TextInput required value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><TextInput value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} /></Field><Field label="Display order"><TextInput type="number" min="0" value={String(form.displayOrder ?? 0)} onChange={(e) => set("displayOrder", Number(e.target.value))} /></Field></div>
    <Field label="Short description"><TextInput value={form.shortDescription ?? ""} onChange={(e) => set("shortDescription", e.target.value)} /></Field>
    <Field label="Full description"><TextArea required value={form.fullDescription || form.description} onChange={(e) => { set("description", e.target.value); set("fullDescription", e.target.value); }} /></Field>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Specifications" hint="one per line"><TextArea value={specs} onChange={(e) => setSpecs(e.target.value)} /></Field><Field label="Features" hint="one per line"><TextArea value={features} onChange={(e) => setFeatures(e.target.value)} /></Field></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Applications" hint="one per line"><TextArea value={applications} onChange={(e) => setApplications(e.target.value)} /></Field><Field label="Related service slugs" hint="one per line"><TextArea value={related} onChange={(e) => setRelated(e.target.value)} /></Field></div>
    <Field label="Image alt text"><TextInput value={form.imageAlt ?? ""} onChange={(e) => set("imageAlt", e.target.value)} /></Field>
    <ImagePicker paths={form.images ?? (form.imageUrl ? [form.imageUrl] : [])} folder="machines" onChange={(paths) => { set("images", paths); set("imageUrl", paths[0] ?? null); }} upload={upload} />
    <label className="flex items-center gap-2 text-[12px] font-semibold text-[#425d70]"><input type="checkbox" checked={form.published !== false} onChange={(e) => set("published", e.target.checked)} /> Published on the public Machines page</label>
    <div className="flex justify-end gap-3 border-t border-[#e4ecef] pt-5"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save machine"} <Check size={14} /></Button></div>
  </form></CmsDialog>;
}

type ServiceFormProps = { record: Service | null; onClose: () => void; onSaved: () => void };
function ServiceForm({ record, onClose, onSaved }: ServiceFormProps) {
  const queryClient = useQueryClient();
  const create = useCreateService();
  const update = useUpdateService();
  const upload = useRequestProductImageUploadUrl();
  const [form, setForm] = useState<ServiceInput>(() => record ? { ...record } : { title: "", slug: "", category: "", shortDescription: "", description: "", fullDescription: "", content: "", features: [], images: [], imageAlt: "", offerings: [], applications: [], materials: [], whyChoose: [], relatedSlugs: [], displayOrder: 0, status: "draft", featured: false });
  const [lists, setLists] = useState({ features: joinLines(form.features), offerings: joinLines(form.offerings), applications: joinLines(form.applications), materials: joinLines(form.materials), whyChoose: joinLines(form.whyChoose), relatedSlugs: joinLines(form.relatedSlugs) });
  const [feedback, setFeedback] = useState("");
  const set = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");
    const payload: ServiceInput = { ...form, title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim(), fullDescription: form.fullDescription?.trim() || form.description.trim(), content: form.content?.trim() || form.description.trim(), features: splitLines(lists.features), offerings: splitLines(lists.offerings), applications: splitLines(lists.applications), materials: splitLines(lists.materials), whyChoose: splitLines(lists.whyChoose), relatedSlugs: splitLines(lists.relatedSlugs), images: form.images ?? [] };
    try {
      if (record) await update.mutateAsync({ id: record.id, data: payload });
      else await create.mutateAsync({ data: payload });
      await queryClient.invalidateQueries({ queryKey: getGetAdminServicesQueryKey() });
      onSaved();
    } catch (error) {
      setFeedback(errorMessage(error));
    }
  };
  const busy = create.isPending || update.isPending || upload.isPending;
  return <CmsDialog title={record ? "Edit service" : "Add service"} onClose={onClose}><form onSubmit={save} className="space-y-5">
    {feedback && <div className="rounded-xl border border-[#edcbc7] bg-[#fff5f3] px-4 py-3 text-[12px] text-[#a3443c]">{feedback}</div>}
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Service name"><TextInput required value={form.title} onChange={(e) => set("title", e.target.value)} /></Field><Field label="Slug"><TextInput required value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><TextInput value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} /></Field><Field label="Display order"><TextInput type="number" min="0" value={String(form.displayOrder ?? 0)} onChange={(e) => set("displayOrder", Number(e.target.value))} /></Field></div>
    <Field label="Short description"><TextInput value={form.shortDescription ?? ""} onChange={(e) => set("shortDescription", e.target.value)} /></Field>
    <Field label="About / full description"><TextArea required value={form.fullDescription || form.description} onChange={(e) => { set("description", e.target.value); set("fullDescription", e.target.value); }} /></Field>
    <Field label="Additional service content"><TextArea value={form.content ?? ""} onChange={(e) => set("content", e.target.value)} /></Field>
    <div className="grid gap-4 sm:grid-cols-2">{(["features", "offerings", "applications", "materials", "whyChoose", "relatedSlugs"] as const).map((key) => <Field key={key} label={key === "whyChoose" ? "Why choose us" : key.replace(/([A-Z])/g, " $1")} hint="one per line"><TextArea value={lists[key]} onChange={(e) => setLists((current) => ({ ...current, [key]: e.target.value }))} /></Field>)}</div>
    <Field label="Image alt text"><TextInput value={form.imageAlt ?? ""} onChange={(e) => set("imageAlt", e.target.value)} /></Field>
    <ImagePicker paths={form.images ?? []} folder="services" onChange={(paths) => set("images", paths)} upload={upload} />
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Publishing status"><select value={form.status ?? "draft"} onChange={(e) => set("status", e.target.value as ServiceInput["status"])} className="admin-input"><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></Field><label className="flex items-center gap-2 self-end pb-3 text-[12px] font-semibold text-[#425d70]"><input type="checkbox" checked={form.featured === true} onChange={(e) => set("featured", e.target.checked)} /> Featured service</label></div>
    <div className="flex justify-end gap-3 border-t border-[#e4ecef] pt-5"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save service"} <Check size={14} /></Button></div>
  </form></CmsDialog>;
}

function ImagePicker({ paths, folder, onChange, upload }: { paths: string[]; folder: "machines" | "services"; onChange: (paths: string[]) => void; upload: ReturnType<typeof useRequestProductImageUploadUrl> }) {
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const addFiles = async (files: File[]) => {
    setBusy(true); setFeedback("");
    try { onChange([...paths, ...(await uploadFiles(files, folder, upload))]); } catch (error) { setFeedback(errorMessage(error)); } finally { setBusy(false); }
  };
  return <div><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em] text-[#667d8b]">Images <span className="normal-case tracking-normal text-[#9aa8b0]">multiple files supported</span></span><div className="grid gap-3 sm:grid-cols-3">{paths.map((path, index) => <div key={`${path}-${index}`} className="group relative aspect-[1.4/1] overflow-hidden rounded-xl border border-[#d7e4e9] bg-[#f5f9fa]"><img src={imageUrl(path)} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => onChange(paths.filter((_, item) => item !== index))} className="absolute right-2 top-2 rounded-lg bg-[#14213d]/80 p-1.5 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove image"><X size={13} /></button></div>)}<label className="flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#bcd1da] bg-[#f8fbfb] text-center text-[#718792]"><UploadCloud size={20} className="text-[#7db6c2]" /><span className="mt-2 text-[11px] font-bold">{busy ? "Uploading…" : "Choose images"}</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => { if (e.target.files?.length) void addFiles(Array.from(e.target.files)); }} className="sr-only" /></label></div>{feedback && <p className="mt-2 text-[10px] font-semibold text-[#a3443c]">{feedback}</p>}</div>;
}

function CmsDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102941]/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"><div className="admin-scrollbar max-h-[95dvh] w-full max-w-[900px] overflow-y-auto rounded-t-[22px] border border-[#d7e4e9] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(20,45,64,.2)] sm:rounded-[22px] sm:p-8]"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="eyebrow">Admin-controlled content</p><h2 className="display mt-1 text-2xl font-extrabold tracking-[-.065em] text-[#203954]">{title}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-[#738893] hover:bg-[#edf5f7]" aria-label="Close form"><X size={19} /></button></div>{children}</div></div>;
}

function MachineManager() {
  const query = useGetAdminMachines();
  const remove = useDeleteMachine();
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState<Machine | null | undefined>(undefined);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const rows = useMemo(() => (query.data ?? []).filter((item) => `${item.name} ${item.category ?? ""}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  const deleteItem = async (item: Machine) => { if (!window.confirm(`Delete ${item.name}? This is an intentional permanent action.`)) return; await remove.mutateAsync({ id: item.id }); await queryClient.invalidateQueries({ queryKey: getGetAdminMachinesQueryKey() }); setNotice("Machine deleted."); };
  return <div className="space-y-6"><ManagerHeader page="Machines" description="Manage the studio equipment shown on the public Machines page, including descriptions, applications, images, publishing, and display order." onAdd={() => setEditor(null)} />{notice && <div className="rounded-xl border border-[#c8e2d2] bg-[#f0faf4] px-4 py-3 text-[12px] text-[#31734f]"><Check size={15} className="mr-2 inline" />{notice}</div>}<div className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-4"><TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search machines" /></div><ListState loading={query.isLoading} error={query.isError} empty={!rows.length} onRetry={() => void query.refetch()} />{rows.length > 0 && <div className="grid gap-3">{rows.map((item) => <article key={item.id} className="flex flex-col gap-4 rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-4 shadow-[0_7px_20px_rgba(31,65,91,.045)] sm:flex-row sm:items-center"><div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#eaf2f4]">{(item.images?.[0] || item.imageUrl) && <img src={imageUrl(item.images?.[0] || item.imageUrl)} alt={item.imageAlt || item.name} className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[13px] font-bold text-[#203954]">{item.name}</h2><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${item.published === false ? "bg-[#f0f3f4] text-[#6c7b83]" : "bg-[#eaf7f0] text-[#277c57]"}`}>{item.published === false ? "Hidden" : "Published"}</span></div><p className="mt-1 text-[11px] text-[#87969e]">{item.category}</p><p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#697d88]">{item.shortDescription || item.description}</p></div><div className="flex gap-1 self-end sm:self-center"><button type="button" onClick={() => setEditor(item)} className="rounded-lg p-2 text-[#637b89] hover:bg-[#edf5f7] hover:text-[#1769aa]" aria-label={`Edit ${item.name}`}><PenLine size={15} /></button><button type="button" onClick={() => void deleteItem(item)} className="rounded-lg p-2 text-[#9a7772] hover:bg-[#fff0ee] hover:text-[#a3443c]" aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button></div></article>)}</div>}{editor !== undefined && <MachineForm record={editor} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); setNotice(editor ? "Machine updated." : "Machine added."); }} />}</div>;
}

function ServiceManager() {
  const query = useGetAdminServices();
  const remove = useDeleteService();
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState<Service | null | undefined>(undefined);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const rows = useMemo(() => (query.data ?? []).filter((item) => `${item.title} ${item.category ?? ""}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  const deleteItem = async (item: Service) => { if (!window.confirm(`Delete ${item.title}? This is an intentional permanent action.`)) return; await remove.mutateAsync({ id: item.id }); await queryClient.invalidateQueries({ queryKey: getGetAdminServicesQueryKey() }); setNotice("Service deleted."); };
  return <div className="space-y-6"><ManagerHeader page="Services" description="Create, edit, publish, order, and enrich every public service page without changing source code." onAdd={() => setEditor(null)} />{notice && <div className="rounded-xl border border-[#c8e2d2] bg-[#f0faf4] px-4 py-3 text-[12px] text-[#31734f]"><Check size={15} className="mr-2 inline" />{notice}</div>}<div className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-4"><TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services" /></div><ListState loading={query.isLoading} error={query.isError} empty={!rows.length} onRetry={() => void query.refetch()} />{rows.length > 0 && <div className="grid gap-3">{rows.map((item) => <article key={item.id} className="flex flex-col gap-4 rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-4 shadow-[0_7px_20px_rgba(31,65,91,.045)] sm:flex-row sm:items-center"><div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#eaf2f4]">{item.images?.[0] && <img src={imageUrl(item.images[0])} alt={item.imageAlt || item.title} className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[13px] font-bold text-[#203954]">{item.title}</h2><span className="rounded-full bg-[#eaf3fa] px-2 py-1 text-[9px] font-bold uppercase text-[#1769aa]">{item.status}</span></div><p className="mt-1 text-[11px] text-[#87969e]">{item.category}</p><p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#697d88]">{item.shortDescription || item.description}</p></div><div className="flex gap-1 self-end sm:self-center"><button type="button" onClick={() => setEditor(item)} className="rounded-lg p-2 text-[#637b89] hover:bg-[#edf5f7] hover:text-[#1769aa]" aria-label={`Edit ${item.title}`}><PenLine size={15} /></button><button type="button" onClick={() => void deleteItem(item)} className="rounded-lg p-2 text-[#9a7772] hover:bg-[#fff0ee] hover:text-[#a3443c]" aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></article>)}</div>}{editor !== undefined && <ServiceForm record={editor} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); setNotice(editor ? "Service updated." : "Service added."); }} />}</div>;
}

const contentFields: Array<[keyof WebsiteContentInput, string]> = [["heroHeading", "Homepage hero heading"], ["heroDescription", "Homepage hero description"], ["heroCtaText", "Homepage CTA text"], ["aboutTitle", "About title"], ["aboutBody", "About section"], ["qualityBody", "Quality section"], ["trustBody", "Trust section"], ["processBody", "Process section"], ["graphicsDesignBody", "Graphics Design section"], ["signageBody", "Signage section"], ["contactBody", "Contact section"], ["footerBody", "Footer content"], ["metadataTitle", "Metadata title"], ["metadataDescription", "Metadata description"]];
function WebsiteContentManager() {
  const query = useGetAdminWebsiteContent();
  const update = useUpdateWebsiteContent();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<WebsiteContentInput>({});
  const [notice, setNotice] = useState("");
  useEffect(() => { if (query.data) setForm(query.data); }, [query.data]);
  const save = async (event: FormEvent) => { event.preventDefault(); await update.mutateAsync({ data: form }); await queryClient.invalidateQueries({ queryKey: getGetAdminWebsiteContentQueryKey() }); setNotice("Website content saved."); };
  return <div className="space-y-6"><ManagerHeader page="Website Content" description="Edit the words and publishing copy that appear across the public website. Changes persist in Firebase and are available after a reload." />{notice && <div className="rounded-xl border border-[#c8e2d2] bg-[#f0faf4] px-4 py-3 text-[12px] text-[#31734f]"><Check size={15} className="mr-2 inline" />{notice}</div>}<ListState loading={query.isLoading} error={query.isError} empty={false} onRetry={() => void query.refetch()} />{!query.isLoading && !query.isError && <form onSubmit={save} className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-5 shadow-[0_7px_20px_rgba(31,65,91,.045)]"><div className="grid gap-5 md:grid-cols-2">{contentFields.map(([key, label]) => <Field key={key} label={label}><TextArea className={key === "heroHeading" || key === "heroCtaText" || key === "aboutTitle" || key === "metadataTitle" ? "min-h-0" : ""} rows={key === "heroHeading" || key === "heroCtaText" || key === "aboutTitle" || key === "metadataTitle" ? 2 : 4} value={String(form[key] ?? "")} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} /></Field>)}</div><div className="mt-6 flex justify-end"><Button type="submit" disabled={update.isPending}>{update.isPending ? "Saving…" : "Save website content"} <Check size={14} /></Button></div></form>}</div>;
}

function SettingsManager() {
  const query = useGetAdminSettings();
  const update = useUpdateSettings();
  const contacts = useGetAdminContactNumbers();
  const createContact = useCreateContactNumber();
  const updateContact = useUpdateContactNumber();
  const deleteContact = useDeleteContactNumber();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<WebsiteSettingsInput | null>(null);
  const [contactDraft, setContactDraft] = useState<ContactNumberInput>({ label: "", phone: "", showOnWebsite: true, useForCalls: true, useForWhatsApp: false, isPrimary: false, displayOrder: 0 });
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (query.data) setForm(query.data); }, [query.data]);
  const saveSettings = async (event: FormEvent) => { event.preventDefault(); if (!form) return; await update.mutateAsync({ data: form }); await queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() }); setNotice("Settings saved."); };
  const saveContact = async (event: FormEvent) => { event.preventDefault(); if (editingContact) await updateContact.mutateAsync({ id: editingContact, data: contactDraft }); else await createContact.mutateAsync({ data: contactDraft }); await queryClient.invalidateQueries({ queryKey: getGetAdminContactNumbersQueryKey() }); setContactDraft({ label: "", phone: "", showOnWebsite: true, useForCalls: true, useForWhatsApp: false, isPrimary: false, displayOrder: 0 }); setEditingContact(null); setNotice("Contact number saved."); };
  const startEdit = (item: ContactNumber) => { setEditingContact(item.id); setContactDraft({ label: item.label, phone: item.phone, showOnWebsite: item.showOnWebsite, useForCalls: item.useForCalls, useForWhatsApp: item.useForWhatsApp, isPrimary: item.isPrimary, displayOrder: item.displayOrder }); };
  return <div className="space-y-6"><ManagerHeader page="Settings" description="Centralize business information, phone numbers, WhatsApp routing, social links, map links, metadata, logo and footer settings." />{notice && <div className="rounded-xl border border-[#c8e2d2] bg-[#f0faf4] px-4 py-3 text-[12px] text-[#31734f]"><Check size={15} className="mr-2 inline" />{notice}</div>}<ListState loading={query.isLoading || contacts.isLoading} error={query.isError || contacts.isError} empty={false} onRetry={() => { void query.refetch(); void contacts.refetch(); }} />{form && <form onSubmit={saveSettings} className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-5 shadow-[0_7px_20px_rgba(31,65,91,.045)]"><h2 className="display text-xl font-extrabold text-[#203954]">Business settings</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Business name"><TextInput value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></Field><Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label="Address"><TextArea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field><Field label="Google Maps link"><TextInput value={form.googleMapsUrl} onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })} /></Field><Field label="Footer information"><TextArea value={form.footerInformation} onChange={(e) => setForm({ ...form, footerInformation: e.target.value })} /></Field><Field label="WhatsApp numbers" hint="one per line"><TextArea value={form.whatsappNumbers.join("\n")} onChange={(e) => setForm({ ...form, whatsappNumbers: splitLines(e.target.value) })} /></Field><Field label="Logo path"><TextInput value={form.logoPath ?? ""} onChange={(e) => setForm({ ...form, logoPath: e.target.value || null })} /></Field><Field label="Favicon path"><TextInput value={form.faviconPath ?? ""} onChange={(e) => setForm({ ...form, faviconPath: e.target.value || null })} /></Field><Field label="Metadata title"><TextInput value={form.metadataTitle} onChange={(e) => setForm({ ...form, metadataTitle: e.target.value })} /></Field><Field label="Metadata description"><TextArea value={form.metadataDescription} onChange={(e) => setForm({ ...form, metadataDescription: e.target.value })} /></Field></div><div className="mt-5 flex justify-end"><Button type="submit" disabled={update.isPending}>{update.isPending ? "Saving…" : "Save business settings"} <Check size={14} /></Button></div></form>}<section className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-5 shadow-[0_7px_20px_rgba(31,65,91,.045)]"><div className="flex items-end justify-between gap-3"><div><p className="eyebrow">Contact numbers</p><h2 className="display mt-1 text-xl font-extrabold text-[#203954]">Call and WhatsApp routing</h2></div></div><div className="mt-5 space-y-2">{(contacts.data ?? []).map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e4ecef] px-3 py-3"><div className="min-w-[140px] flex-1"><p className="text-[12px] font-bold text-[#203954]">{item.label}</p><p className="text-[11px] text-[#72858f]">{item.phone}</p></div><div className="flex flex-wrap gap-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#68808d]"><span>{item.showOnWebsite ? "Visible" : "Hidden"}</span>{item.useForCalls && <span>Calls</span>}{item.useForWhatsApp && <span>WhatsApp</span>}{item.isPrimary && <span>Primary</span>}</div><button type="button" onClick={() => startEdit(item)} className="rounded-lg p-2 text-[#637b89] hover:bg-[#edf5f7]"><PenLine size={15} /></button><button type="button" onClick={() => { if (window.confirm(`Delete ${item.phone}?`)) void deleteContact.mutateAsync({ id: item.id }).then(() => queryClient.invalidateQueries({ queryKey: getGetAdminContactNumbersQueryKey() })); }} className="rounded-lg p-2 text-[#9a7772] hover:bg-[#fff0ee]"><Trash2 size={15} /></button></div>)}</div><form onSubmit={saveContact} className="mt-5 grid gap-3 border-t border-[#e4ecef] pt-5 sm:grid-cols-[1fr_1fr_auto]"><TextInput required placeholder="Label" value={contactDraft.label} onChange={(e) => setContactDraft({ ...contactDraft, label: e.target.value })} /><TextInput required placeholder="Phone number" value={contactDraft.phone} onChange={(e) => setContactDraft({ ...contactDraft, phone: e.target.value })} /><Button type="submit" disabled={createContact.isPending || updateContact.isPending}>{editingContact ? "Update" : "Add"} number</Button><div className="flex flex-wrap gap-4 text-[11px] font-semibold text-[#536f7f] sm:col-span-3"><label><input type="checkbox" checked={contactDraft.showOnWebsite} onChange={(e) => setContactDraft({ ...contactDraft, showOnWebsite: e.target.checked })} /> Show on website</label><label><input type="checkbox" checked={contactDraft.useForCalls} onChange={(e) => setContactDraft({ ...contactDraft, useForCalls: e.target.checked })} /> Call button</label><label><input type="checkbox" checked={contactDraft.useForWhatsApp} onChange={(e) => setContactDraft({ ...contactDraft, useForWhatsApp: e.target.checked })} /> WhatsApp button</label><label><input type="checkbox" checked={contactDraft.isPrimary} onChange={(e) => setContactDraft({ ...contactDraft, isPrimary: e.target.checked })} /> Primary number</label>{editingContact && <button type="button" onClick={() => setEditingContact(null)} className="text-[#1769aa]">Cancel edit</button>}</div></form></section></div>;
}

export default function CmsManager({ page }: { page: CmsPage }) {
  if (page === "Machines") return <MachineManager />;
  if (page === "Services") return <ServiceManager />;
  if (page === "Website Content") return <WebsiteContentManager />;
  return <SettingsManager />;
}