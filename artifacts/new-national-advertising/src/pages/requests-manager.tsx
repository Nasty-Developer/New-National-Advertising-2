import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CircleAlert, FileText, Mail, Phone, RefreshCw } from "lucide-react";
import {
  getGetAdminContactRequestsQueryKey,
  getGetAdminQuoteRequestsQueryKey,
  useGetAdminContactRequests,
  useGetAdminQuoteRequests,
  useUpdateRequestStatus,
  type ContactRequest,
  type QuoteRequest,
} from "@workspace/api-client-react";

type RequestKind = "quotes" | "contacts";
const quoteStatuses = ["new", "contacted", "quoted", "approved", "completed", "cancelled"] as const;
const contactStatuses = ["new", "contacted", "completed", "cancelled"] as const;

function friendlyError(error: unknown) {
  if (error && typeof error === "object" && "status" in error && (error.status === 401 || error.status === 403)) {
    return "Your admin session has expired. Sign in again and try again.";
  }
  return "We could not update this request. Please try again.";
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function statusTone(status: string) {
  if (status === "completed" || status === "approved") return "bg-[#eaf7f0] text-[#277c57]";
  if (status === "cancelled") return "bg-[#fff0ee] text-[#a3443c]";
  if (status === "contacted" || status === "quoted") return "bg-[#eaf3fa] text-[#1769aa]";
  return "bg-[#fff7df] text-[#9b7514]";
}

function statusOptions(kind: RequestKind) {
  return kind === "quotes" ? quoteStatuses : contactStatuses;
}

function RequestCard({ item, kind, onStatusSaved }: { item: QuoteRequest | ContactRequest; kind: RequestKind; onStatusSaved: () => void }) {
  const update = useUpdateRequestStatus();
  const [error, setError] = useState("");
  const isQuote = kind === "quotes";
  const request = item as QuoteRequest;
  const saveStatus = async (status: string) => {
    setError("");
    try {
      await update.mutateAsync({ collection: kind, id: item.id, data: { status: status as never } });
      onStatusSaved();
    } catch (saveError) {
      setError(friendlyError(saveError));
    }
  };
  return <article className="rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-5 shadow-[0_7px_20px_rgba(31,65,91,.045)]" data-testid={`card-request-${item.id}`}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-[13px] font-bold text-[#203954]">{item.name}</h2><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${statusTone(item.status)}`}>{item.status}</span></div><p className="mt-1 text-[10px] text-[#8a9aa3]">{formatDate(item.createdAt)}</p></div><label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#718792]">Status<select value={item.status} onChange={(event) => void saveStatus(event.target.value)} disabled={update.isPending} className="admin-input min-w-[125px] py-2 text-[11px] normal-case tracking-normal"><option value={item.status}>{item.status}</option>{statusOptions(kind).filter((status) => status !== item.status).map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>
    <div className="mt-4 grid gap-3 text-[11px] text-[#607483] sm:grid-cols-2"><a href={`tel:${item.phone}`} className="flex items-center gap-2 hover:text-[#1769aa]"><Phone size={14} className="text-[#1769aa]" />{item.phone}</a>{item.email && <a href={`mailto:${item.email}`} className="flex items-center gap-2 break-all hover:text-[#1769aa]"><Mail size={14} className="shrink-0 text-[#1769aa]" />{item.email}</a>}</div>
    {isQuote && <><p className="mt-4 text-[10px] font-bold uppercase tracking-[.13em] text-[#8a9aa3]">Service: <span className="normal-case tracking-normal text-[#506b7d]">{request.service}</span></p><p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-[#526a79]">{request.requirementDetails}</p>{(request.quantity || request.preferredDate || request.attachmentName) && <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-[#718792]">{request.quantity && <span className="rounded-lg bg-[#f2f7f8] px-2.5 py-1.5">Qty: {request.quantity}</span>}{request.preferredDate && <span className="rounded-lg bg-[#f2f7f8] px-2.5 py-1.5">Preferred: {request.preferredDate}</span>}{request.attachmentUrl && <a href={request.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg bg-[#f2f7f8] px-2.5 py-1.5 text-[#1769aa]"><FileText size={12} />{request.attachmentName || "View attachment"}</a>}</div>}</>}
    {!isQuote && <p className="mt-4 whitespace-pre-wrap text-[12px] leading-5 text-[#526a79]">{(item as ContactRequest).message}</p>}
    {error && <p role="alert" className="mt-3 text-[10px] font-semibold text-[#a3443c]">{error}</p>}
  </article>;
}

export default function RequestsManager() {
  const [kind, setKind] = useState<RequestKind>("quotes");
  const quotes = useGetAdminQuoteRequests();
  const contacts = useGetAdminContactRequests();
  const queryClient = useQueryClient();
  const active = kind === "quotes" ? quotes : contacts;
  const rows = useMemo(() => active.data ?? [], [active.data]);
  const refresh = () => {
    void quotes.refetch();
    void contacts.refetch();
    void queryClient.invalidateQueries({ queryKey: kind === "quotes" ? getGetAdminQuoteRequestsQueryKey() : getGetAdminContactRequestsQueryKey() });
  };
  return <div className="space-y-6" data-testid="admin-requests-content">
    <section><p className="eyebrow">Customer follow-up</p><h1 className="display mt-1 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-.075em] text-[#14213d]">Requests</h1><p className="mt-3 max-w-[650px] text-[13px] leading-6 text-[#6b7d89]">Keep customer quote and contact requests visible until the team has followed up. Nothing is deleted automatically.</p></section>
    <div className="flex flex-wrap gap-2 rounded-[16px] border border-[#dce7ec] bg-[#fffefa] p-2"><button type="button" onClick={() => setKind("quotes")} className={`rounded-xl px-4 py-2.5 text-[11px] font-bold ${kind === "quotes" ? "bg-[#eaf5f7] text-[#1769aa]" : "text-[#718792] hover:bg-[#f3f7f8]"}`}>Quote requests {quotes.data ? `(${quotes.data.length})` : ""}</button><button type="button" onClick={() => setKind("contacts")} className={`rounded-xl px-4 py-2.5 text-[11px] font-bold ${kind === "contacts" ? "bg-[#eaf5f7] text-[#1769aa]" : "text-[#718792] hover:bg-[#f3f7f8]"}`}>Contact requests {contacts.data ? `(${contacts.data.length})` : ""}</button><button type="button" onClick={refresh} className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold text-[#718792] hover:bg-[#f3f7f8] hover:text-[#1769aa]" aria-label="Refresh requests"><RefreshCw size={14} /> Refresh</button></div>
    {active.isLoading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="admin-skeleton h-[180px] rounded-[16px] border border-[#e5ecef]" />)}</div> : active.isError ? <div className="rounded-[16px] border border-[#edcbc7] bg-[#fff5f3] p-8 text-center"><CircleAlert className="mx-auto text-[#b04b43]" size={26} /><h2 className="display mt-4 text-xl font-extrabold text-[#703a36]">Requests unavailable</h2><p className="mt-2 text-[12px] text-[#9a625c]">We could not load customer requests right now.</p><button type="button" onClick={() => void active.refetch()} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#b7cdd8] bg-[#fffefa] px-3.5 py-2.5 text-[11px] font-bold text-[#294861]"><RefreshCw size={14} /> Try again</button></div> : rows.length ? <div className="grid gap-3">{rows.map((item) => <RequestCard key={item.id} item={item} kind={kind} onStatusSaved={() => { void queryClient.invalidateQueries({ queryKey: kind === "quotes" ? getGetAdminQuoteRequestsQueryKey() : getGetAdminContactRequestsQueryKey() }); }} />)}</div> : <div className="rounded-[16px] border border-dashed border-[#b9d0d9] bg-[#f9fbfb] px-6 py-14 text-center"><Check className="mx-auto text-[#7db6c2]" size={28} /><h2 className="display mt-4 text-2xl font-extrabold text-[#203954]">No {kind === "quotes" ? "quote" : "contact"} requests</h2><p className="mt-2 text-[12px] text-[#758792]">New customer messages will appear here.</p></div>}
  </div>;
}