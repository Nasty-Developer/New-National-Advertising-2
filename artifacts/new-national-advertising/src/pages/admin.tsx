import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type FormEvent, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { signOut as signOutFirebase } from 'firebase/auth';
import {
  Archive,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  FileText,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PenLine,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  getGetAdminProductQueryKey,
  getGetAdminProductsQueryKey,
  getGetAdminSessionQueryKey,
  getGetAdminSummaryQueryKey,
  getGetPublicProductsQueryKey,
  ProductStatus,
  StockStatus,
  useAdminLogout,
  useCreateProduct,
  useDeleteProduct,
  useGetAdminProduct,
  useGetAdminProducts,
  useGetAdminSummary,
  useGetPublicProducts,
  useRequestProductImageUploadUrl,
  useUpdateProduct,
  type Product,
  type ProductInput,
  type UploadRequestContentType,
} from '@workspace/api-client-react';
import CmsManager from '@/pages/cms-manager';
import { firebaseAuth } from '@/lib/firebase-client';

type AdminPage = 'Dashboard' | 'Products' | 'Services' | 'Orders' | 'Website Content' | 'Machines' | 'Settings';
type AdminProps = { authenticated: boolean };
type ProductFilters = { search: string; category: string; status: string; stockStatus: string; sort: 'updated' | 'name' | 'displayOrder' };
type ProductFormState = {
  name: string;
  shortDescription: string;
  fullDescription: string;
  imagePath: string;
  imageAlt: string;
  category: string;
  price: string;
  status: Product['status'];
  stockStatus: Product['stockStatus'];
  displayOrder: string;
};

const navigation: Array<{ label: AdminPage; description: string; icon: typeof LayoutDashboard }> = [
  { label: 'Dashboard', description: 'Overview', icon: LayoutDashboard },
  { label: 'Products', description: 'Print catalogue', icon: Package },
  { label: 'Services', description: 'Capabilities', icon: Printer },
  { label: 'Orders', description: 'Production queue', icon: ClipboardList },
  { label: 'Website Content', description: 'Public pages', icon: FileText },
  { label: 'Machines', description: 'Studio equipment', icon: SlidersHorizontal },
  { label: 'Settings', description: 'Workspace setup', icon: Settings },
];

const foundationCopy: Record<Exclude<AdminPage, 'Dashboard' | 'Products'>, { eyebrow: string; title: string; copy: string; icon: typeof Package; detail: string }> = {
  Services: { eyebrow: 'Capabilities workspace', title: 'A home for the work you do.', copy: 'Services will become the operating layer behind the public catalogue, from large-format print to graphic design.', icon: Printer, detail: 'No service records are connected yet.' },
  Orders: { eyebrow: 'Production workspace', title: 'A calmer production queue.', copy: 'Orders will give the team one place for enquiries, production stages, delivery notes, and the work moving through the studio.', icon: ClipboardList, detail: 'Order workflows are not connected yet.' },
  'Website Content': { eyebrow: 'Publishing workspace', title: 'Keep the public site current.', copy: 'Manage the words, service pages, work, and contact details that appear across the public experience.', icon: FileText, detail: 'Content records are not connected yet.' },
  Machines: { eyebrow: 'Studio equipment', title: 'Know what is on the floor.', copy: 'A future equipment register for production machines, finishing tools, capabilities, and maintenance notes.', icon: SlidersHorizontal, detail: 'Machine records are not connected yet.' },
  Settings: { eyebrow: 'Workspace controls', title: 'The details behind the desk.', copy: 'Configure workspace preferences, access, and publishing defaults once those administration foundations are connected.', icon: Settings, detail: 'Settings controls are not connected yet.' },
};

const blankForm: ProductFormState = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  imagePath: '',
  imageAlt: '',
  category: '',
  price: '',
  status: ProductStatus.draft,
  stockStatus: StockStatus.in_stock,
  displayOrder: '0',
};

function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function slug(value: string) {
  return value.toLowerCase().replaceAll(' ', '-');
}

function imageUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/api/')) return path;
  return `/api/storage${path.startsWith('/') ? path : `/${path}`}`;
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`flex items-center ${compact ? 'justify-center' : 'gap-3'}`} data-testid="link-admin-brand"><img src="/new-national-advertising-logo.png" alt="New National Advertising" className={`object-contain ${compact ? 'h-9 w-14' : 'h-12 w-[112px]'}`} /></Link>;
}

function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' | 'danger' }) {
  const styles = {
    primary: 'bg-[#1769aa] text-white shadow-[0_8px_18px_rgba(23,105,170,.16)] hover:bg-[#125b94]',
    secondary: 'border border-[#b7cdd8] bg-[#fffefa] text-[#294861] hover:border-[#1769aa] hover:bg-[#f4fafb]',
    quiet: 'text-[#557184] hover:bg-[#edf5f7] hover:text-[#1769aa]',
    danger: 'border border-[#e7bdb8] bg-[#fff5f3] text-[#a3443c] hover:bg-[#feeae7]',
  }[variant];
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa] focus-visible:ring-offset-2 ${styles} ${className}`}>{children}</button>;
}

function LoadingRows() {
  return <div className="space-y-3" aria-label="Loading products" data-testid="state-products-loading">{[1, 2, 3, 4].map((row) => <div key={row} className="admin-skeleton h-[76px] rounded-xl border border-[#e5ecef]" />)}</div>;
}

function StatusPill({ children, tone }: { children: string; tone: 'blue' | 'green' | 'yellow' | 'grey' | 'red' }) {
  const colors = { blue: 'bg-[#eaf3fa] text-[#1769aa]', green: 'bg-[#eaf7f0] text-[#277c57]', yellow: 'bg-[#fff7df] text-[#9b7514]', grey: 'bg-[#f0f3f4] text-[#6c7b83]', red: 'bg-[#fff0ee] text-[#a3443c]' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${colors[tone]}`}>{children}</span>;
}

function LockedState() {
  return <main className="site-noise flex min-h-[100dvh] items-center justify-center bg-[#f2f6f8] px-5 text-[#14213d]" data-testid="state-admin-locked"><div className="rounded-[20px] border border-[#d8e4eb] bg-[#fffefa] p-8 text-center shadow-[0_18px_60px_rgba(31,65,91,.1)]"><ShieldCheck className="mx-auto text-[#1769aa]" size={28} /><p className="eyebrow mt-5">Private workspace</p><h1 className="display mt-2 text-3xl font-extrabold tracking-[-.07em]">Redirecting to sign in</h1><p className="mt-3 text-[13px] text-[#6d7e89]">Checking your secure admin session.</p></div></main>;
}

function DashboardHome({ onNavigate }: { onNavigate: (page: AdminPage) => void }) {
  const summary = useGetAdminSummary();
  const publicProducts = useGetPublicProducts();
  const data = summary.data;
  return <div className="space-y-7" data-testid="admin-dashboard-content">
    <section className="relative overflow-hidden rounded-[20px] border border-[#c9e0e7] bg-[#eaf5f7] px-6 py-7 sm:px-9 sm:py-9">
      <div className="pointer-events-none absolute right-[-2%] top-[-50%] h-[360px] w-[360px] rounded-full border border-[#8fc8d2]/45" /><div className="pointer-events-none absolute right-[12%] top-[-35%] h-[270px] w-[270px] rounded-full border border-[#8fc8d2]/35" />
      <div className="relative max-w-[670px]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.19em] text-[#2274ad]"><BarChart3 size={14} /> Desk overview</div><h1 className="display mt-4 text-[clamp(2.1rem,4vw,3.8rem)] font-extrabold leading-[.95] tracking-[-.08em] text-[#14213d]" data-testid="heading-admin-dashboard">The work, at a glance.</h1><p className="mt-4 max-w-[555px] text-[14px] leading-6 text-[#536b79]">A live read on the product catalogue. Keep the public-facing range intentional, current, and easy to find.</p></div>
      <div className="relative mt-7 flex flex-wrap gap-3"><Button onClick={() => onNavigate('Products')} data-testid="button-open-products">Open catalogue <ArrowUpRight size={14} /></Button><button type="button" onClick={() => onNavigate('Website Content')} className="inline-flex items-center gap-2 rounded-xl border border-[#a8c7d3] bg-white/65 px-3.5 py-2.5 text-[11px] font-bold text-[#23425b] transition hover:-translate-y-0.5 hover:border-[#1769aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa]" data-testid="button-open-content">Website content <FileText size={14} /></button></div>
    </section>
    <section aria-labelledby="summary-heading"><div className="mb-3 flex items-end justify-between gap-4"><div><p className="eyebrow">Catalogue pulse</p><h2 id="summary-heading" className="display mt-1 text-[22px] font-extrabold tracking-[-.06em] text-[#203954]">Today’s numbers</h2></div><span className="hidden items-center gap-1.5 text-[10px] font-semibold text-[#84939b] sm:flex" data-testid="status-dashboard-data"><span className={`h-1.5 w-1.5 rounded-full ${summary.isError ? 'bg-[#d45b52]' : 'bg-[#3ba776]'}`} />{summary.isError ? 'Summary unavailable' : 'Live catalogue data'}</span></div>
      {summary.isLoading ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="admin-skeleton h-[136px] rounded-[16px] border border-[#e0e8ec]" />)}</div> : summary.isError ? <div className="rounded-[16px] border border-[#edcbc7] bg-[#fff5f3] p-5 text-[13px] text-[#a3443c]" data-testid="state-summary-error">We couldn’t load the catalogue summary. Refresh the page to retry.</div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[
        ['Total products', data?.totalProducts ?? 0, 'bg-[#edf7f8] text-[#00a8c6]'],
        ['Published', data?.publishedProducts ?? 0, 'bg-[#edf3fb] text-[#1769aa]'],
        ['Drafts', data?.draftProducts ?? 0, 'bg-[#fff7df] text-[#9b7514]'],
        ['Archived', data?.archivedProducts ?? 0, 'bg-[#fff0f5] text-[#c34d80]'],
        ['Categories', data?.categories ?? 0, 'bg-[#eef7f1] text-[#3b8b63]'],
      ].map(([label, value, tone]) => <div key={label as string} className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-5 shadow-[0_7px_20px_rgba(31,65,91,.045)]" data-testid={`card-metric-${slug(label as string)}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Package size={17} strokeWidth={1.8} /></span><p className="mt-7 text-[10px] font-semibold uppercase tracking-[.16em] text-[#75858f]">{label}</p><p className="display mt-1 text-[29px] font-extrabold tracking-[-.07em] text-[#203954]" data-testid={`text-metric-${slug(label as string)}`}>{value}</p></div>)}</div>}
    </section>
    <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
      <div className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-6 shadow-[0_7px_20px_rgba(31,65,91,.045)]"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Next move</p><h2 className="display mt-1 text-[22px] font-extrabold tracking-[-.06em] text-[#203954]">Keep the desk moving</h2></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5f8] text-[#1769aa]"><PenLine size={16} /></span></div><p className="mt-4 max-w-[570px] text-[12px] leading-5 text-[#71818d]">The catalogue is the first connected workflow. The other areas stay deliberately quiet until their records are ready.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{[['Add a product', 'Products', Package], ['Review services', 'Services', Printer], ['Plan content', 'Website Content', FileText], ['Studio equipment', 'Machines', SlidersHorizontal]].map(([label, target, Icon]) => <button type="button" key={target as string} onClick={() => onNavigate(target as AdminPage)} className="group flex items-center justify-between rounded-xl border border-[#e4ecef] bg-[#fbfcfb] px-3.5 py-3 text-left transition hover:border-[#9dc7d3] hover:bg-[#f2f9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa]" data-testid={`button-setup-${slug(label as string)}`}><span className="flex items-center gap-2.5 text-[11px] font-bold text-[#3d5669]">{<Icon size={15} className="text-[#1769aa]" />}{label as string}</span><ChevronRight size={14} className="text-[#94a5ae] transition-transform group-hover:translate-x-0.5" /></button>)}</div></div>
      <div className="rounded-[16px] border border-[#dce7ec] bg-[#14213d] p-6 text-white shadow-[0_7px_20px_rgba(31,65,91,.09)]"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#f2c94c]"><ShieldCheck size={17} /></span><span className="ink-strip w-[74px] opacity-80"><span /><span /><span /><span /></span></div><p className="eyebrow mt-8 !text-[#9bc8d8]">Public catalogue</p><h2 className="display mt-2 text-[25px] font-extrabold leading-[1.02] tracking-[-.065em]">{publicProducts.isLoading ? 'Checking visibility…' : `${publicProducts.data?.length ?? 0} published pieces`}</h2><p className="mt-4 text-[12px] leading-5 text-[#b9cbd4]">This count comes from the public products feed, so you can see what customers can actually browse.</p><Link href="/products" className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold text-[#9bd4df] hover:text-white" data-testid="link-view-public-products">View public catalogue <ArrowUpRight size={14} /></Link></div>
    </section>
  </div>;
}

function ProductForm({ editingId, onClose, onSaved }: { editingId: string | null; onClose: () => void; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient();
  const isEditing = editingId !== null;
  const productQuery = useGetAdminProduct(editingId ?? '', { query: { enabled: isEditing, queryKey: getGetAdminProductQueryKey(editingId ?? '') } });
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const uploadUrl = useRequestProductImageUploadUrl();
  const [form, setForm] = useState<ProductFormState>(blankForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState('');
  const objectUrl = useRef('');

  useEffect(() => {
    if (productQuery.data && isEditing) {
      const product = productQuery.data;
      setForm({ name: product.name, shortDescription: product.shortDescription, fullDescription: product.fullDescription, imagePath: product.imagePath ?? '', imageAlt: product.imageAlt ?? '', category: product.category, price: product.price === null || product.price === undefined ? '' : String(product.price), status: product.status, stockStatus: product.stockStatus, displayOrder: String(product.displayOrder ?? 0) });
      setPreview(imageUrl(product.imagePath));
    }
  }, [productQuery.data, isEditing]);

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  const setField = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => setForm((current) => ({ ...current, [field]: value }));

  const uploadImage = async (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setFeedback('Use a JPG, PNG, or WebP image.'); return; }
    if (file.size > 10 * 1024 * 1024) { setFeedback('Images must be 10 MB or smaller.'); return; }
    setFeedback('');
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setPreview(objectUrl.current);
    setUploadProgress(1);
    try {
      const response = await uploadUrl.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type as UploadRequestContentType } });
      await new Promise<void>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PUT', response.uploadURL);
        request.setRequestHeader('Content-Type', file.type);
        request.upload.onprogress = (event) => { if (event.lengthComputable) setUploadProgress(Math.max(1, Math.round((event.loaded / event.total) * 100))); };
        request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error('The image upload was not accepted.'));
        request.onerror = () => reject(new Error('The image upload failed. Please try again.'));
        request.send(file);
      });
      setField('imagePath', response.objectPath);
      setUploadProgress(100);
      setFeedback('Image uploaded and ready to save.');
    } catch (error) {
      setUploadProgress(0);
      setFeedback(getErrorMessage(error, 'We could not upload that image.'));
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.shortDescription.trim()) next.shortDescription = 'Short description is required.';
    if (!form.category.trim()) next.category = 'Category is required.';
    if (form.price && (Number.isNaN(Number(form.price)) || Number(form.price) < 0)) next.price = 'Enter a valid positive price.';
    if (!Number.isInteger(Number(form.displayOrder)) || Number(form.displayOrder) < 0) next.displayOrder = 'Use a whole number of 0 or more.';
    if (form.fullDescription.length > 5000) next.fullDescription = 'Keep the description under 5,000 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (create.isPending || update.isPending || uploadUrl.isPending || !validate()) return;
    const payload: ProductInput = { name: form.name.trim(), shortDescription: form.shortDescription.trim(), fullDescription: form.fullDescription.trim(), imagePath: form.imagePath || null, imageAlt: form.imageAlt.trim() || null, category: form.category.trim(), price: form.price ? Number(form.price) : null, status: form.status, stockStatus: form.stockStatus, displayOrder: Number(form.displayOrder) };
    try {
      if (isEditing) await update.mutateAsync({ id: editingId, data: payload });
      else await create.mutateAsync({ data: payload });
      await Promise.all([queryClient.invalidateQueries({ queryKey: getGetAdminProductsQueryKey() }), queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }), queryClient.invalidateQueries({ queryKey: getGetPublicProductsQueryKey() }), isEditing ? queryClient.invalidateQueries({ queryKey: getGetAdminProductQueryKey(editingId) }) : Promise.resolve()]);
      onSaved(isEditing ? 'Product updated.' : 'Product added to the catalogue.');
    } catch (error) {
      setFeedback(getErrorMessage(error, 'We could not save this product.'));
    }
  };

  const busy = create.isPending || update.isPending || uploadUrl.isPending;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102941]/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="product-form-title" data-testid="dialog-product-form">
    <div className="admin-scrollbar max-h-[95dvh] w-full max-w-[850px] overflow-y-auto rounded-t-[22px] border border-[#d7e4e9] bg-[#fffefa] shadow-[0_24px_80px_rgba(20,45,64,.2)] sm:rounded-[22px]">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e4ecef] bg-[#fffefa]/95 px-6 py-5 backdrop-blur sm:px-8"><div><p className="eyebrow">{isEditing ? 'Catalogue edit' : 'New catalogue item'}</p><h2 id="product-form-title" className="display mt-1 text-[25px] font-extrabold tracking-[-.065em] text-[#203954]">{isEditing ? 'Edit product' : 'Add a product'}</h2></div><button type="button" onClick={onClose} aria-label="Close product form" className="rounded-lg p-2 text-[#738893] transition hover:bg-[#edf5f7] hover:text-[#1769aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa]" data-testid="button-close-product-form"><X size={19} /></button></div>
      {productQuery.isLoading && isEditing ? <div className="p-8"><div className="admin-skeleton h-60 rounded-xl" /></div> : <form onSubmit={submit} className="space-y-6 px-6 py-6 sm:px-8" noValidate>
        {feedback && <div role="status" className={`rounded-xl border px-4 py-3 text-[12px] ${feedback.includes('ready') ? 'border-[#c8e2d2] bg-[#f0faf4] text-[#31734f]' : 'border-[#e7d6b0] bg-[#fff9ea] text-[#856a20]'}`} data-testid="status-product-form">{feedback}</div>}
        <div className="grid gap-6 lg:grid-cols-[1fr_250px]">
          <div className="space-y-4">
            <Field label="Product name" required error={errors.name}><input value={form.name} onChange={(event) => setField('name', event.target.value)} maxLength={160} placeholder="For example, Matte visiting cards" className="admin-input" data-testid="input-product-name" /></Field>
            <Field label="Short description" required error={errors.shortDescription}><input value={form.shortDescription} onChange={(event) => setField('shortDescription', event.target.value)} maxLength={320} placeholder="A concise line for catalogue cards" className="admin-input" data-testid="input-product-short-description" /></Field>
            <Field label="Full description" error={errors.fullDescription}><textarea value={form.fullDescription} onChange={(event) => setField('fullDescription', event.target.value)} maxLength={5000} rows={5} placeholder="What should a customer know about this product?" className="admin-input min-h-[120px] resize-y py-3" data-testid="input-product-full-description" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Category" required error={errors.category}><input value={form.category} onChange={(event) => setField('category', event.target.value)} maxLength={100} placeholder="Commercial printing" className="admin-input" data-testid="input-product-category" /></Field><Field label="Price" hint="Optional, in INR" error={errors.price}><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setField('price', event.target.value)} placeholder="Leave blank for enquiry" className="admin-input" data-testid="input-product-price" /></Field></div>
            <div className="grid gap-4 sm:grid-cols-3"><Field label="Status"><select value={form.status} onChange={(event) => setField('status', event.target.value as Product['status'])} className="admin-input" data-testid="select-product-status"><option value={ProductStatus.draft}>Draft</option><option value={ProductStatus.published}>Published</option><option value={ProductStatus.archived}>Archived</option></select></Field><Field label="Stock status"><select value={form.stockStatus} onChange={(event) => setField('stockStatus', event.target.value as Product['stockStatus'])} className="admin-input" data-testid="select-product-stock"><option value={StockStatus.in_stock}>In stock</option><option value={StockStatus.low_stock}>Low stock</option><option value={StockStatus.out_of_stock}>Out of stock</option></select></Field><Field label="Display order" error={errors.displayOrder}><input type="number" min="0" step="1" value={form.displayOrder} onChange={(event) => setField('displayOrder', event.target.value)} className="admin-input" data-testid="input-product-order" /></Field></div>
          </div>
          <div className="space-y-4"><div><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em] text-[#667d8b]">Product image</span><div className="relative flex aspect-[1.25/1] items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#bcd1da] bg-[#f5f9fa]">{preview ? <img src={preview} alt={form.imageAlt || 'Product preview'} className="h-full w-full object-cover" /> : <div className="px-5 text-center text-[#8296a0]"><ImagePlus className="mx-auto text-[#7db6c2]" size={27} /><p className="mt-3 text-[11px] font-bold">No image selected</p><p className="mt-1 text-[10px] leading-4">JPG, PNG, or WebP up to 10 MB</p></div>}{uploadProgress > 0 && uploadProgress < 100 && <div className="absolute inset-x-3 bottom-3 rounded-lg bg-[#14213d]/90 px-3 py-2 text-[10px] font-bold text-white">Uploading {uploadProgress}%<div className="mt-1 h-1 overflow-hidden rounded-full bg-white/25"><div className="h-full bg-[#83d3af] transition-[width]" style={{ width: `${uploadProgress}%` }} /></div></div>}</div><label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#b7cdd8] bg-[#fffefa] px-3 py-2.5 text-[11px] font-bold text-[#294861] transition hover:border-[#1769aa] hover:bg-[#f4fafb]"><UploadCloud size={15} /> Choose image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} className="sr-only" data-testid="input-product-image" /></label></div><Field label="Image alt text" hint="Recommended"><input value={form.imageAlt} onChange={(event) => setField('imageAlt', event.target.value)} maxLength={180} placeholder="Describe the product image" className="admin-input" data-testid="input-product-image-alt" /></Field></div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#e4ecef] pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={onClose} data-testid="button-cancel-product">Cancel</Button><Button type="submit" disabled={busy} data-testid="button-save-product">{busy ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'} <Check size={14} /></Button></div>
      </form>}
    </div>
  </div>;
}

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#667d8b]">{label}{required && <span className="text-[#d45b52]">*</span>}{hint && <span className="normal-case tracking-normal text-[#9aa8b0]">{hint}</span>}</span>{children}{error && <span className="mt-1.5 block text-[10px] font-semibold text-[#b04b43]">{error}</span>}</label>;
}

function ProductManager() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductFilters>({ search: '', category: '', status: '', stockStatus: '', sort: 'updated' });
  const [editor, setEditor] = useState<string | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const deleteMutation = useDeleteProduct();
  const params = useMemo(() => ({ search: filters.search.trim() || undefined, category: filters.category || undefined, status: (filters.status || undefined) as ProductStatus | undefined, stockStatus: (filters.stockStatus || undefined) as StockStatus | undefined, sort: filters.sort }), [filters]);
  const products = useGetAdminProducts(params, { query: { queryKey: getGetAdminProductsQueryKey(params) } });
  const categories = useMemo(() => Array.from(new Set((products.data ?? []).map((product) => product.category))).sort(), [products.data]);
  const clearNotice = () => { setNotice(''); setError(''); };
  const deleteProduct = async () => {
    if (!deleteTarget || deleteMutation.isPending) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
      await Promise.all([queryClient.invalidateQueries({ queryKey: getGetAdminProductsQueryKey() }), queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }), queryClient.invalidateQueries({ queryKey: getGetPublicProductsQueryKey() })]);
      setNotice('Product deleted from the catalogue.');
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'We could not delete this product.'));
    }
  };
  return <div className="space-y-6" data-testid="admin-products-content">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Catalogue workspace</p><h1 className="display mt-1 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-.075em] text-[#14213d]">Products</h1><p className="mt-3 max-w-[570px] text-[13px] leading-6 text-[#6b7d89]">The pieces customers can browse, request, and buy. Keep names, images, and availability clear.</p></div><Button onClick={() => { clearNotice(); setEditor(null); }} data-testid="button-add-product"><Plus size={15} /> Add product</Button></section>
    {(notice || error) && <div role={error ? 'alert' : 'status'} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[12px] ${error ? 'border-[#edcbc7] bg-[#fff5f3] text-[#a3443c]' : 'border-[#c8e2d2] bg-[#f0faf4] text-[#31734f]'}`} data-testid={error ? 'alert-products-error' : 'status-products-success'}><span className="flex items-center gap-2">{error ? <CircleAlert size={15} /> : <Check size={15} />}{error || notice}</span><button type="button" onClick={clearNotice} aria-label="Dismiss message" className="rounded p-1 hover:bg-black/5" data-testid="button-dismiss-products-message"><X size={14} /></button></div>}
    <section className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-4 shadow-[0_7px_20px_rgba(31,65,91,.045)]"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8ba0aa]" /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search name, description, or category" className="admin-input pl-9" data-testid="input-product-search" /></label><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex"><select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} className="admin-input min-w-[130px]" data-testid="select-filter-category"><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="admin-input min-w-[125px]" data-testid="select-filter-status"><option value="">All status</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select><select value={filters.stockStatus} onChange={(event) => setFilters((current) => ({ ...current, stockStatus: event.target.value }))} className="admin-input min-w-[125px]" data-testid="select-filter-stock"><option value="">All stock</option><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select><select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value as ProductFilters['sort'] }))} className="admin-input min-w-[130px]" data-testid="select-product-sort"><option value="updated">Recently updated</option><option value="name">Name A–Z</option><option value="displayOrder">Display order</option></select></div></div></section>
    {products.isLoading ? <LoadingRows /> : products.isError ? <div className="rounded-[16px] border border-[#edcbc7] bg-[#fff5f3] p-8 text-center" data-testid="state-products-error"><CircleAlert className="mx-auto text-[#b04b43]" size={26} /><h2 className="display mt-4 text-xl font-extrabold text-[#703a36]">Catalogue unavailable</h2><p className="mt-2 text-[12px] text-[#9a625c]">We couldn’t load the products right now.</p><Button variant="secondary" className="mt-5" onClick={() => void products.refetch()} data-testid="button-retry-products"><RefreshCw size={14} /> Try again</Button></div> : products.data?.length ? <div className="overflow-hidden rounded-[16px] border border-[#dce7ec] bg-[#fffefa] shadow-[0_7px_20px_rgba(31,65,91,.045)]"><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-[#e6edef] bg-[#f8faf9]"><tr>{['Product', 'Category', 'Price', 'Status', 'Stock', ''].map((heading) => <th key={heading} className="px-5 py-3 text-[9px] font-bold uppercase tracking-[.15em] text-[#8a9aa3]">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1f3]">{products.data.map((product) => <ProductRow key={product.id} product={product} onEdit={() => setEditor(product.id)} onDelete={() => setDeleteTarget(product)} />)}</tbody></table></div><div className="divide-y divide-[#edf1f3] md:hidden">{products.data.map((product) => <ProductCard key={product.id} product={product} onEdit={() => setEditor(product.id)} onDelete={() => setDeleteTarget(product)} />)}</div><div className="border-t border-[#e6edef] px-5 py-3 text-[10px] font-semibold text-[#82929b]" data-testid="text-product-count">{products.data.length} {products.data.length === 1 ? 'product' : 'products'} shown</div></div> : <div className="rounded-[16px] border border-dashed border-[#b9d0d9] bg-[#f9fbfb] px-6 py-14 text-center" data-testid="state-products-empty"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5f7] text-[#1769aa]"><Package size={22} /></span><h2 className="display mt-5 text-2xl font-extrabold tracking-[-.06em] text-[#203954]">{filters.search || filters.category || filters.status || filters.stockStatus ? 'No products match these filters' : 'Your catalogue is empty'}</h2><p className="mx-auto mt-2 max-w-[380px] text-[12px] leading-5 text-[#758792]">{filters.search || filters.category || filters.status || filters.stockStatus ? 'Try clearing a filter or searching for another term.' : 'Add the first real product when you are ready. Nothing sample-like is added here.'}</p>{!(filters.search || filters.category || filters.status || filters.stockStatus) && <Button className="mt-5" onClick={() => setEditor(null)} data-testid="button-empty-add-product"><Plus size={15} /> Add first product</Button>}</div>}
    {editor !== undefined && <ProductForm editingId={editor} onClose={() => setEditor(undefined)} onSaved={(message) => { setEditor(undefined); setNotice(message); }} />}
    {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102941]/30 p-5 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="delete-title" data-testid="dialog-delete-product"><div className="w-full max-w-[430px] rounded-[20px] border border-[#e2d3d0] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(20,45,64,.2)]"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0ee] text-[#b04b43]"><Trash2 size={20} /></span><h2 id="delete-title" className="display mt-5 text-2xl font-extrabold tracking-[-.065em] text-[#203954]">Delete this product?</h2><p className="mt-3 text-[13px] leading-5 text-[#6e7f89]">“{deleteTarget.name}” will be removed from the catalogue. This cannot be undone.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => setDeleteTarget(null)} data-testid="button-cancel-delete">Keep product</Button><Button variant="danger" onClick={() => void deleteProduct()} disabled={deleteMutation.isPending} data-testid="button-confirm-delete">{deleteMutation.isPending ? 'Deleting…' : 'Delete product'} <Trash2 size={14} /></Button></div></div></div>}
  </div>;
}

function productStatusTone(status: Product['status']): 'blue' | 'green' | 'yellow' | 'grey' { return status === 'published' ? 'green' : status === 'draft' ? 'yellow' : 'grey'; }
function stockTone(stock: Product['stockStatus']): 'green' | 'yellow' | 'red' { return stock === 'in_stock' ? 'green' : stock === 'low_stock' ? 'yellow' : 'red'; }
function ProductRow({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  return <tr data-testid={`row-product-${product.id}`}><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-[#eaf2f4]">{product.imagePath ? <img src={imageUrl(product.imagePath)} alt={product.imageAlt || product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#8db1bc]"><Package size={16} /></div>}</div><div className="min-w-0"><p className="truncate text-[12px] font-bold text-[#203954]">{product.name}</p><p className="mt-1 max-w-[260px] truncate text-[10px] text-[#87969e]">{product.shortDescription}</p></div></div></td><td className="px-5 py-4 text-[11px] text-[#647884]">{product.category}</td><td className="px-5 py-4 text-[11px] font-bold text-[#304a60]">{product.price === null || product.price === undefined ? 'Enquiry' : `₹${product.price.toLocaleString('en-IN')}`}</td><td className="px-5 py-4"><StatusPill tone={productStatusTone(product.status)}>{product.status}</StatusPill></td><td className="px-5 py-4"><StatusPill tone={stockTone(product.stockStatus)}>{product.stockStatus.replaceAll('_', ' ')}</StatusPill></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={onEdit} className="rounded-lg p-2 text-[#637b89] hover:bg-[#edf5f7] hover:text-[#1769aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa]" aria-label={`Edit ${product.name}`} data-testid={`button-edit-product-${product.id}`}><PenLine size={15} /></button><button type="button" onClick={onDelete} className="rounded-lg p-2 text-[#9a7772] hover:bg-[#fff0ee] hover:text-[#a3443c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3443c]" aria-label={`Delete ${product.name}`} data-testid={`button-delete-product-${product.id}`}><Trash2 size={15} /></button></div></td></tr>;
}
function ProductCard({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  return <article className="p-4" data-testid={`card-product-${product.id}`}><div className="flex gap-3"><div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-[#eaf2f4]">{product.imagePath ? <img src={imageUrl(product.imagePath)} alt={product.imageAlt || product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#8db1bc]"><Package size={18} /></div>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="text-[13px] font-bold text-[#203954]">{product.name}</h3><span className="shrink-0 text-[11px] font-bold text-[#304a60]">{product.price === null || product.price === undefined ? 'Enquiry' : `₹${product.price.toLocaleString('en-IN')}`}</span></div><p className="mt-1 text-[10px] text-[#87969e]">{product.category}</p><p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[#697d88]">{product.shortDescription}</p></div></div><div className="mt-4 flex items-center justify-between"><div className="flex gap-2"><StatusPill tone={productStatusTone(product.status)}>{product.status}</StatusPill><StatusPill tone={stockTone(product.stockStatus)}>{product.stockStatus.replaceAll('_', ' ')}</StatusPill></div><div className="flex gap-1"><button type="button" onClick={onEdit} className="rounded-lg p-2 text-[#637b89] hover:bg-[#edf5f7] hover:text-[#1769aa]" aria-label={`Edit ${product.name}`} data-testid={`button-mobile-edit-product-${product.id}`}><PenLine size={15} /></button><button type="button" onClick={onDelete} className="rounded-lg p-2 text-[#9a7772] hover:bg-[#fff0ee] hover:text-[#a3443c]" aria-label={`Delete ${product.name}`} data-testid={`button-mobile-delete-product-${product.id}`}><Trash2 size={15} /></button></div></div></article>;
}

function FoundationView({ page }: { page: Exclude<AdminPage, 'Dashboard' | 'Products'> }) {
  const section = foundationCopy[page];
  const Icon = section.icon;
  return <section className="relative overflow-hidden rounded-[20px] border border-[#d4e4eb] bg-[#fffefa] px-6 py-9 shadow-[0_9px_28px_rgba(31,65,91,.05)] sm:px-12 sm:py-14" data-testid={`state-admin-${slug(page)}`}><div className="pointer-events-none absolute right-[-5%] top-[-35%] h-[390px] w-[390px] rounded-full border border-[#d4e4eb] opacity-75" /><div className="relative max-w-[680px]"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5f7] text-[#1769aa]"><Icon size={22} strokeWidth={1.8} /></span><p className="eyebrow mt-8">{section.eyebrow}</p><h1 className="display mt-3 text-[clamp(2.1rem,5vw,4.4rem)] font-extrabold leading-[.96] tracking-[-.08em] text-[#14213d]" data-testid={`heading-admin-${slug(page)}`}>{section.title}</h1><p className="mt-5 max-w-[570px] text-[14px] leading-6 text-[#5d7180]" data-testid={`text-admin-${slug(page)}-copy`}>{section.copy}</p><div className="mt-9 flex items-center gap-2 border-t border-[#e6edef] pt-5 text-[11px] font-semibold text-[#84939b]" data-testid="status-admin-foundation"><Archive size={15} className="text-[#1769aa]" />{section.detail}</div></div></section>;
}

export default function AdminPage({ authenticated }: AdminProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logout = useAdminLogout();
  const [activePage, setActivePage] = useState<AdminPage>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { if (!authenticated) setLocation('/admin/login'); }, [authenticated, setLocation]);
  if (!authenticated) return <LockedState />;
  const navigate = (page: AdminPage) => { setActivePage(page); setSidebarOpen(false); };
  const signOut = async () => {
    if (logout.isPending) return;
    try {
      await logout.mutateAsync();
    } finally {
      if (firebaseAuth) await signOutFirebase(firebaseAuth);
    }
    queryClient.removeQueries({ queryKey: getGetAdminSessionQueryKey() });
    await queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
    if (import.meta.env.DEV) {
      console.debug('[admin-auth] Firebase sign-out completed; navigating to /admin/login');
    }
    setLocation('/admin/login');
  };
  return <div className="site-noise min-h-[100dvh] bg-[#f3f6f7] text-[#14213d]" data-testid="admin-shell"><div className="flex min-h-[100dvh]">
    {sidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#14213d]/25 backdrop-blur-[2px] lg:hidden" data-testid="button-close-navigation-overlay" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[274px] flex-col border-r border-[#dce7ec] bg-[#fffefa] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:w-[78px]' : ''}`} data-testid="admin-sidebar"><div className={`flex h-[79px] shrink-0 items-center border-b border-[#e8eef1] px-5 ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}`}><BrandMark compact={sidebarCollapsed} /><button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-[#79909e] hover:bg-[#edf4f7] lg:hidden" data-testid="button-close-navigation"><X size={17} /></button></div><div className={`px-3 py-6 ${sidebarCollapsed ? 'lg:px-2' : ''}`}><p className={`${sidebarCollapsed ? 'lg:hidden' : ''} px-3 text-[9px] font-bold uppercase tracking-[.2em] text-[#9aa8b0]`}>Workspace</p><nav className="mt-3 space-y-1" aria-label="Admin navigation">{navigation.map(({ label, description, icon: Icon }) => { const selected = activePage === label; return <button type="button" key={label} onClick={() => navigate(label)} title={sidebarCollapsed ? label : undefined} aria-current={selected ? 'page' : undefined} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa] ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''} ${selected ? 'bg-[#eaf5f7] text-[#1769aa]' : 'text-[#5d7180] hover:bg-[#f2f7f8] hover:text-[#203954]'}`} data-testid={`nav-admin-${slug(label)}`}><Icon size={17} strokeWidth={selected ? 2.2 : 1.8} />{!sidebarCollapsed && <span className="min-w-0"><span className="block truncate text-[12px] font-bold">{label}</span><span className={`mt-0.5 block truncate text-[10px] ${selected ? 'text-[#5e91a4]' : 'text-[#95a4ac]'}`}>{description}</span></span>}{!sidebarCollapsed && selected && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00a8c6]" />}</button>; })}</nav></div><div className="mt-auto border-t border-[#e8eef1] p-4">{!sidebarCollapsed ? <div className="rounded-xl bg-[#f2f7f8] p-3" data-testid="status-admin-session"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3ba776]" /><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#527282]">Authenticated session</span></div><p className="mt-2 text-[10px] leading-4 text-[#7d8e97]">Private workspace access is active.</p></div> : <span className="mx-auto block h-2 w-2 rounded-full bg-[#3ba776]" title="Authenticated session" />}</div><div className="border-t border-[#e8eef1] p-3"><button type="button" onClick={() => void signOut()} disabled={logout.isPending} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#718792] hover:bg-[#fff0ee] hover:text-[#a3443c] ${sidebarCollapsed ? 'justify-center px-2' : ''}`} data-testid="button-admin-logout"><LogOut size={15} />{!sidebarCollapsed && (logout.isPending ? 'Signing out…' : 'Sign out')}</button></div><button type="button" onClick={() => setSidebarCollapsed((value) => !value)} className="hidden h-12 shrink-0 items-center justify-center gap-2 border-t border-[#e8eef1] text-[10px] font-bold uppercase tracking-[.14em] text-[#81929b] hover:bg-[#f4f8f9] hover:text-[#1769aa] lg:flex" data-testid="button-toggle-sidebar">{sidebarCollapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /> Collapse</>}</button></aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-[79px] items-center justify-between border-b border-[#dce7ec] bg-[#f3f6f7]/92 px-5 backdrop-blur-md sm:px-8" data-testid="admin-header"><div className="flex items-center gap-3"><button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation" className="rounded-lg p-2 text-[#536c7c] hover:bg-[#e7f0f3] lg:hidden" data-testid="button-open-navigation"><Menu size={20} /></button><div><p className="hidden text-[9px] font-bold uppercase tracking-[.2em] text-[#93a2aa] sm:block">New National Advertising / Admin</p><p className="display mt-0.5 text-[18px] font-extrabold tracking-[-.055em] text-[#203954]" data-testid="text-active-admin-page">{activePage}</p></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#d9e5ea] bg-[#fffefa] px-3 py-2 text-[10px] font-bold text-[#68808d] sm:flex" data-testid="status-workspace-ready"><span className="h-1.5 w-1.5 rounded-full bg-[#3ba776]" />Workspace ready</div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14213d] text-[11px] font-bold text-white" aria-label="Authenticated admin profile" data-testid="avatar-admin">NN</div></div></header><main className="mx-auto max-w-[1320px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10" data-testid="admin-main">{activePage === 'Dashboard' ? <DashboardHome onNavigate={navigate} /> : activePage === 'Products' ? <ProductManager /> : activePage === 'Machines' || activePage === 'Services' || activePage === 'Website Content' || activePage === 'Settings' ? <CmsManager page={activePage} /> : <FoundationView page={activePage} />}</main></div>
  </div></div>;
}