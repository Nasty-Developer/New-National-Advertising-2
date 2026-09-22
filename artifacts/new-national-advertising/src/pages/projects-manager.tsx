import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CircleAlert, ImagePlus, PenLine, Plus, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import {
  getGetAdminProjectsQueryKey,
  useCreateProject,
  useDeleteProject,
  useGetAdminProjects,
  useRequestProductImageUploadUrl,
  useUpdateProject,
  type Project,
  type ProjectInput,
  type UploadRequestContentType,
} from "@workspace/api-client-react";

const blankProject: ProjectInput = {
  name: "",
  shortDescription: "",
  fullDescription: "",
  imagePath: null,
  additionalImages: [],
  videoUrl: "",
  published: true,
  featured: false,
  displayOrder: 0,
};

function friendlyError(error: unknown, fallback = "We could not complete that action. Please try again.") {
  if (error && typeof error === "object" && "status" in error && typeof error.status === "number") {
    if (error.status === 401 || error.status === 403) return "Your admin session has expired. Sign in again and try again.";
    if (error.status === 400) return "Please check the project details and try again.";
  }
  return fallback;
}

function imageUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/new-") || path.startsWith("/project")) return path;
  return `/api/storage${path.startsWith("/") ? path : `/${path}`}`;
}

async function uploadProjectImages(files: File[], upload: ReturnType<typeof useRequestProductImageUploadUrl>) {
  const paths: string[] = [];
  for (const file of files) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      throw new Error("Use JPG, PNG, or WebP images up to 10 MB.");
    }
    const response = await upload.mutateAsync({
      data: { name: file.name, size: file.size, contentType: file.type as UploadRequestContentType, folder: "projects" },
    });
    const result = await fetch(response.uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!result.ok) throw new Error("The image upload failed. Please try again.");
    paths.push(response.objectPath);
  }
  return paths;
}

function Button({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-[#1769aa] text-white hover:bg-[#125b94]",
    secondary: "border border-[#b7cdd8] bg-[#fffefa] text-[#294861] hover:border-[#1769aa] hover:bg-[#f4fafb]",
    danger: "border border-[#e7bdb8] bg-[#fff5f3] text-[#a3443c] hover:bg-[#feeae7]",
  }[variant];
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 ${styles} ${props.className ?? ""}`}>{children}</button>;
}

function ProjectForm({ record, onClose, onSaved }: { record: Project | null; onClose: () => void; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient();
  const create = useCreateProject();
  const update = useUpdateProject();
  const upload = useRequestProductImageUploadUrl();
  const [form, setForm] = useState<ProjectInput>(() => record ? { ...record } : blankProject);
  const [feedback, setFeedback] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(record ? { ...record } : blankProject);
    setFeedback("");
  }, [record]);

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const addImages = async (files: File[]) => {
    setUploading(true);
    setFeedback("");
    try {
      const paths = await uploadProjectImages(files, upload);
      set("additionalImages", [...(form.additionalImages ?? []), ...paths]);
      setFeedback("Images uploaded and ready to save.");
    } catch {
      setFeedback("The image upload failed. Nothing was saved.");
    } finally {
      setUploading(false);
    }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.shortDescription.trim()) {
      setFeedback("Add a project name and short description.");
      return;
    }
    if (create.isPending || update.isPending || uploading) return;
    setFeedback("");
    const payload: ProjectInput = {
      ...form,
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription?.trim() ?? "",
      imagePath: form.imagePath || null,
      additionalImages: form.additionalImages ?? [],
      videoUrl: form.videoUrl?.trim() ?? "",
      displayOrder: Number(form.displayOrder ?? 0),
    };
    try {
      if (record) await update.mutateAsync({ id: record.id, data: payload });
      else await create.mutateAsync({ data: payload });
      await queryClient.invalidateQueries({ queryKey: getGetAdminProjectsQueryKey() });
      onSaved(record ? "Project updated." : "Project added.");
    } catch {
      setFeedback("We could not save this project. Please try again.");
    }
  };

  const busy = create.isPending || update.isPending || uploading;
  const images = form.additionalImages ?? [];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102941]/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="project-form-title">
    <div className="admin-scrollbar max-h-[95dvh] w-full max-w-[820px] overflow-y-auto rounded-t-[22px] border border-[#d7e4e9] bg-[#fffefa] shadow-[0_24px_80px_rgba(20,45,64,.2)] sm:rounded-[22px]">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e4ecef] bg-[#fffefa]/95 px-6 py-5 backdrop-blur sm:px-8"><div><p className="eyebrow">Selected work</p><h2 id="project-form-title" className="display mt-1 text-[25px] font-extrabold tracking-[-.065em] text-[#203954]">{record ? "Edit project" : "Add a project"}</h2></div><button type="button" onClick={onClose} aria-label="Close project form" className="rounded-lg p-2 text-[#738893] hover:bg-[#edf5f7]"><X size={19} /></button></div>
      <form onSubmit={save} className="space-y-5 px-6 py-6 sm:px-8">
        {feedback && <div role="status" className="rounded-xl border border-[#e7d6b0] bg-[#fff9ea] px-4 py-3 text-[12px] text-[#856a20]">{feedback}</div>}
        <label className="block"><span className="admin-label">Project name</span><input required maxLength={180} value={form.name} onChange={(event) => set("name", event.target.value)} className="admin-input" placeholder="Storefront signage installation" /></label>
        <label className="block"><span className="admin-label">Short description</span><textarea required maxLength={500} rows={2} value={form.shortDescription} onChange={(event) => set("shortDescription", event.target.value)} className="admin-input min-h-0 resize-y py-3" placeholder="A concise summary for the selected work grid." /></label>
        <label className="block"><span className="admin-label">Full description</span><textarea maxLength={10000} rows={5} value={form.fullDescription} onChange={(event) => set("fullDescription", event.target.value)} className="admin-input min-h-[120px] resize-y py-3" placeholder="What was created and what should visitors know?" /></label>
        <label className="block"><span className="admin-label">Video URL <span className="normal-case tracking-normal text-[#9aa8b0]">optional</span></span><input type="url" maxLength={500} value={form.videoUrl ?? ""} onChange={(event) => set("videoUrl", event.target.value)} className="admin-input" placeholder="https://..." /></label>
        <div><span className="admin-label">Main image</span><div className="mt-2 grid gap-3 sm:grid-cols-[180px_1fr]"><div className="flex aspect-[1.4/1] items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#bcd1da] bg-[#f5f9fa]">{form.imagePath ? <img src={imageUrl(form.imagePath)} alt={form.name || "Project preview"} className="h-full w-full object-cover" /> : <ImagePlus className="text-[#7db6c2]" size={25} />}</div><div><input type="text" value={form.imagePath ?? ""} onChange={(event) => set("imagePath", event.target.value || null)} className="admin-input" placeholder="Upload a main image or paste an existing path" /><p className="mt-2 text-[10px] leading-4 text-[#84939b]">Additional images can be uploaded below. Existing image paths remain unchanged.</p></div></div></div>
        <div><span className="admin-label">Additional images <span className="normal-case tracking-normal text-[#9aa8b0]">optional</span></span><div className="mt-2 grid gap-3 sm:grid-cols-3">{images.map((path, index) => <div key={`${path}-${index}`} className="group relative aspect-[1.4/1] overflow-hidden rounded-xl border border-[#d7e4e9] bg-[#f5f9fa]"><img src={imageUrl(path)} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => set("additionalImages", images.filter((_, item) => item !== index))} className="absolute right-2 top-2 rounded-lg bg-[#14213d]/80 p-1.5 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove image"><X size={13} /></button></div>)}<label className="flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#bcd1da] bg-[#f8fbfb] text-center text-[#718792]"><UploadCloud size={20} className="text-[#7db6c2]" /><span className="mt-2 text-[11px] font-bold">{uploading ? "Uploading…" : "Choose images"}</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { if (event.target.files?.length) void addImages(Array.from(event.target.files)); }} className="sr-only" /></label></div></div>
        <div className="grid gap-4 sm:grid-cols-3"><label className="flex items-center gap-2 text-[12px] font-semibold text-[#425d70]"><input type="checkbox" checked={form.published === true} onChange={(event) => set("published", event.target.checked)} /> Published</label><label className="flex items-center gap-2 text-[12px] font-semibold text-[#425d70]"><input type="checkbox" checked={form.featured === true} onChange={(event) => set("featured", event.target.checked)} /> Featured</label><label className="block"><span className="admin-label">Display order</span><input type="number" min="0" step="1" value={String(form.displayOrder ?? 0)} onChange={(event) => set("displayOrder", Number(event.target.value))} className="admin-input" /></label></div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#e4ecef] pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : record ? "Save changes" : "Add project"} <Check size={14} /></Button></div>
      </form>
    </div>
  </div>;
}

export default function ProjectsManager() {
  const queryClient = useQueryClient();
  const query = useGetAdminProjects();
  const remove = useDeleteProject();
  const [editor, setEditor] = useState<Project | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const rows = useMemo(() => (query.data ?? []).filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  const deleteProject = async () => {
    if (!deleteTarget || remove.isPending) return;
    try {
      await remove.mutateAsync({ id: deleteTarget.id });
      await queryClient.invalidateQueries({ queryKey: getGetAdminProjectsQueryKey() });
      setNotice("Project removed from the catalogue.");
      setDeleteTarget(null);
    } catch {
      setError("We could not remove this project. Please try again.");
    }
  };
  return <div className="space-y-6" data-testid="admin-projects-content">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Selected work</p><h1 className="display mt-1 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-.075em] text-[#14213d]">Projects</h1><p className="mt-3 max-w-[570px] text-[13px] leading-6 text-[#6b7d89]">Manage the work shown on the public website. Only published projects are visible to visitors.</p></div><Button onClick={() => { setError(""); setEditor(null); }}><Plus size={15} /> Add project</Button></section>
    {(notice || error) && <div role={error ? "alert" : "status"} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[12px] ${error ? "border-[#edcbc7] bg-[#fff5f3] text-[#a3443c]" : "border-[#c8e2d2] bg-[#f0faf4] text-[#31734f]"}`}><span className="flex items-center gap-2">{error ? <CircleAlert size={15} /> : <Check size={15} />}{error || notice}</span><button type="button" onClick={() => { setError(""); setNotice(""); }} aria-label="Dismiss message"><X size={14} /></button></div>}
    <div className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-4"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" className="admin-input" /></div>
    {query.isLoading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="admin-skeleton h-[92px] rounded-xl border border-[#e5ecef]" />)}</div> : query.isError ? <div className="rounded-[16px] border border-[#edcbc7] bg-[#fff5f3] p-8 text-center"><CircleAlert className="mx-auto text-[#b04b43]" size={26} /><p className="mt-3 text-[12px] text-[#9a625c]">Projects could not be loaded.</p><Button variant="secondary" className="mt-5" onClick={() => void query.refetch()}><RefreshCw size={14} /> Try again</Button></div> : rows.length ? <div className="grid gap-3">{rows.map((project) => <article key={project.id} className="flex flex-col gap-4 rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-4 shadow-[0_7px_20px_rgba(31,65,91,.045)] sm:flex-row sm:items-center"><div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#eaf2f4]">{project.imagePath ? <img src={imageUrl(project.imagePath)} alt={project.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#8db1bc]"><ImagePlus size={18} /></div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[13px] font-bold text-[#203954]">{project.name}</h2><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${project.published ? "bg-[#eaf7f0] text-[#277c57]" : "bg-[#f0f3f4] text-[#6c7b83]"}`}>{project.published ? "Published" : "Draft"}</span>{project.featured && <span className="rounded-full bg-[#fff7df] px-2 py-1 text-[9px] font-bold uppercase text-[#9b7514]">Featured</span>}</div><p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#697d88]">{project.shortDescription}</p></div><div className="flex gap-1 self-end sm:self-center"><button type="button" onClick={() => setEditor(project)} className="rounded-lg p-2 text-[#637b89] hover:bg-[#edf5f7] hover:text-[#1769aa]" aria-label={`Edit ${project.name}`}><PenLine size={15} /></button><button type="button" onClick={() => setDeleteTarget(project)} className="rounded-lg p-2 text-[#9a7772] hover:bg-[#fff0ee]" aria-label={`Delete ${project.name}`}><Trash2 size={15} /></button></div></article>)}</div> : <div className="rounded-[16px] border border-dashed border-[#b9d0d9] bg-[#f9fbfb] px-6 py-14 text-center"><ImagePlus className="mx-auto text-[#7db6c2]" size={28} /><h2 className="display mt-4 text-2xl font-extrabold text-[#203954]">No projects yet</h2><p className="mt-2 text-[12px] text-[#758792]">Add published work when it is ready. No fake projects are shown publicly.</p><Button className="mt-5" onClick={() => setEditor(null)}><Plus size={15} /> Add first project</Button></div>}
    {editor !== undefined && <ProjectForm record={editor} onClose={() => setEditor(undefined)} onSaved={(message) => { setEditor(undefined); setNotice(message); }} />}
    {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102941]/30 p-5 backdrop-blur-[2px]" role="dialog" aria-modal="true"><div className="w-full max-w-[430px] rounded-[20px] border border-[#e2d3d0] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(20,45,64,.2)]"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0ee] text-[#b04b43]"><Trash2 size={20} /></span><h2 className="display mt-5 text-2xl font-extrabold tracking-[-.065em] text-[#203954]">Remove this project?</h2><p className="mt-3 text-[13px] leading-5 text-[#6e7f89]">“{deleteTarget.name}” will be hidden from the catalogue. Its Firestore record is retained.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => setDeleteTarget(null)}>Keep project</Button><Button variant="danger" onClick={() => void deleteProject()} disabled={remove.isPending}>{remove.isPending ? "Removing…" : "Remove project"} <Trash2 size={14} /></Button></div></div></div>}
  </div>;
}