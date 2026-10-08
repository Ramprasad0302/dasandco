import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronDown, Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Modal, PageHeader, StudioButton, StudioInput, StudioSelect, StudioTextarea, formatDate, formatGold } from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";
import { downloadPDF } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/orders")({ component: Orders });

const statuses = ["Pending", "In Progress", "Completed"] as const;
const tabs = ["Pending", "In Progress", "Completed"] as const;

const emptyForm = {
  client_id: "", project_name: "", category: "Custom", gold_weight: "", percentage: "2",
  delivery_date: new Date().toISOString().split("T")[0], status: "Pending", notes: "",
};

// Backend stores "Completed" as "Delivered" for compatibility with the
// older Hostinger schema — this just maps the two directions everywhere
// this file needs to compare or display status.
const displayStatus = (raw: string) => (raw === "Delivered" ? "Completed" : raw);
const isCompleted = (raw: string) => raw === "Delivered" || raw === "Completed";

function Orders() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Pending");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [statusMenuId, setStatusMenuId] = useState<number | null>(null);

  const { data: orders = [], isLoading } = useQuery({ queryKey: ["orders"], queryFn: async () => (await apiFetch<any>("/orders")).orders || [], staleTime: 15_000, refetchOnWindowFocus: false });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: async () => (await apiFetch<any>("/clients")).clients || [], staleTime: 30_000, refetchOnWindowFocus: false });

  const byTab = useMemo(() => (orders as any[]).filter((o) => (tab === "Completed" ? isCompleted(o.status) : displayStatus(o.status) === tab)), [orders, tab]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return byTab;
    return byTab.filter((o: any) => `${o.order_number || ""} ${o.client_name || ""} ${o.ornament_name || o.project_name || ""} ${o.delivery_date || ""}`.toLowerCase().includes(term));
  }, [byTab, search]);

  const pendingCount = (orders as any[]).filter((o) => displayStatus(o.status) === "Pending").length;
  const inProgressCount = (orders as any[]).filter((o) => displayStatus(o.status) === "In Progress").length;
  const completedCount = (orders as any[]).filter((o) => isCompleted(o.status)).length;
  const tabCount = (item: (typeof tabs)[number]) => (item === "Completed" ? completedCount : item === "In Progress" ? inProgressCount : pendingCount);

  const save = useMutation({
    mutationFn: () => {
      const weight = Number(form.gold_weight || 0);
      const percentage = Number(form.percentage || 0);
      const earning = Number(((weight * percentage) / 100).toFixed(3));
      const backendStatus = form.status === "Completed" ? "Delivered" : form.status;
      const body = {
        client_id: form.client_id,
        project_name: form.project_name,
        category: form.category,
        gold_weight: weight,
        percentage,
        earning_gold: earning,
        delivery_date: form.delivery_date,
        status: backendStatus,
        notes: form.notes,
        // compatibility with the older Hostinger API shape
        order_number: editing?.order_number,
        ornament_name: form.project_name,
        gross_weight: weight,
        net_gold_weight: weight,
        wastage_percent: percentage,
        gold_earned: earning,
      };
      return editing ? apiFetch(`/orders/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }) : apiFetch("/orders", { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); qc.invalidateQueries({ queryKey: ["clients"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["gold-vault"] }); closeModal(); },
  });

  // Quick status change — used when clicking the status pill directly in
  // the table, without opening the full edit modal. Sends only the status
  // field; the backend fills in every other field from the existing order.
  const quickStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiFetch(`/orders/${id}`, { method: "PUT", body: JSON.stringify({ status: status === "Completed" ? "Delivered" : status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["gold-vault"] });
      setStatusMenuId(null);
    },
  });

  const remove = useMutation({ mutationFn: (id: number) => apiFetch(`/orders/${id}`, { method: "DELETE" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); qc.invalidateQueries({ queryKey: ["clients"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); } });

  function closeModal() { setOpen(false); setEditing(null); setForm(emptyForm); }
  function startNew() { setEditing(null); setForm(emptyForm); setOpen(true); }
  function startEdit(order: any) {
    setEditing(order);
    setForm({
      client_id: String(order.client_id || ""), project_name: order.project_name || order.ornament_name || "", category: order.category || "Custom",
      gold_weight: String(order.gold_weight ?? order.gross_weight ?? ""), percentage: String(order.percentage ?? order.wastage_percent ?? 2),
      delivery_date: String(order.delivery_date || new Date().toISOString().split("T")[0]).slice(0, 10), status: displayStatus(order.status) || "Pending", notes: order.notes || "",
    });
    setOpen(true);
  }
  function chooseClient(value: string) {
    const client = (clients as any[]).find((c) => String(c.id) === value);
    setForm((f) => ({ ...f, client_id: value, percentage: String(client?.default_percentage ?? 2) }));
  }

  const earning = (Number(form.gold_weight || 0) * Number(form.percentage || 0)) / 100;

  return <AppShell title="Orders">
    <PageHeader eyebrow="Projects" title="Orders" description="Create CAD projects without unnecessary production fields. Gold earned is calculated automatically from the client's default percentage."
      action={<div className="flex flex-wrap gap-2">
        <StudioButton variant="outline" onClick={() => downloadPDF("das-and-co-orders.pdf", "DAS & CO - Orders", (orders as any[]).map((o) => ({ Date: formatDate(o.delivery_date || o.created_at), Client: o.client_name || "—", Project: o.project_name || o.ornament_name || "—", Gold: `${Number(o.gold_weight ?? o.gross_weight ?? 0).toFixed(3)} g`, Earned: formatGold(o.earning_gold ?? o.gold_earned), Status: displayStatus(o.status) })))}><Download size={15} /> Download orders</StudioButton>
        <StudioButton onClick={startNew}><Plus size={16} /> New order</StudioButton>
      </div>} />

    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm ${tab === item ? "bg-[#e3b84e] text-[#1b150c]" : "border border-[#3a3023] text-[#8f877e]"}`}
          >
            {item} <span className="ml-1 opacity-70">{tabCount(item)}</span>
          </button>
        ))}
      </div>
      <div className="relative max-w-[400px] flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#746d65]" /><input className="studio-input pl-11" placeholder="Search project, client, date, weight…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
    </div>

    <section className="studio-card overflow-hidden"><div className="overflow-x-auto"><table className="studio-table min-w-[900px]"><thead><tr><th>Delivery</th><th>Client</th><th>Project</th><th>Gold</th><th>Earnings</th><th>Status</th><th /></tr></thead><tbody>
      {isLoading ? <tr><td colSpan={7} className="py-12 text-center text-[#756e66]">Loading orders…</td></tr> : filtered.map((order: any) => { const status = displayStatus(order.status); return <tr key={order.id}><td>{formatDate(order.delivery_date)}</td><td>{order.client_name || "—"}</td><td>{order.project_name || order.ornament_name || "—"}</td><td>{Number(order.gold_weight ?? order.gross_weight ?? 0).toFixed(3)} g</td><td className="text-[#d0ac4f]">{formatGold(order.earning_gold ?? order.gold_earned)}</td><td className="relative">
        <button
          type="button"
          onClick={() => setStatusMenuId(statusMenuId === order.id ? null : order.id)}
          className="flex items-center gap-1.5"
        >
          <span className={`rounded-full px-3 py-1 text-[11px] ${status === "Completed" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-[#d9d1c6]"}`}>
            {status}
          </span>
          <ChevronDown size={14} className="text-[#8f877e]" />
        </button>
        {statusMenuId === order.id && (
          <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-xl border border-[#3a3023] bg-[#1c160f] p-1 shadow-xl">
            {statuses.filter((s) => s !== status).map((s) => (
              <button
                key={s}
                type="button"
                disabled={quickStatus.isPending}
                onClick={() => quickStatus.mutate({ id: order.id, status: s })}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs text-[#d9d1c6] hover:bg-white/5"
              >
                Mark as {s}
              </button>
            ))}
          </div>
        )}
      </td><td><div className="flex justify-end gap-1"><button type="button" className="rounded-full p-2 text-[#827970] hover:bg-white/5 hover:text-white" onClick={() => startEdit(order)}><Pencil size={15} /></button><button type="button" className="rounded-full p-2 text-[#827970] hover:bg-red-500/10 hover:text-red-300" onClick={() => { if (window.confirm("Delete this order?")) remove.mutate(Number(order.id)); }}><Trash2 size={15} /></button></div></td></tr>; })}
      {!isLoading && !filtered.length && <tr><td colSpan={7} className="py-12 text-center text-[#756e66]">No {tab.toLowerCase()} orders found.</td></tr>}
    </tbody></table></div></section>

    {open && <Modal title={editing ? "Edit CAD project" : "New CAD project"} onClose={closeModal}>
      <div className="grid gap-4 sm:grid-cols-2">
        <StudioSelect value={form.client_id} onChange={(e) => chooseClient(e.target.value)}><option value="">Select client…</option>{(clients as any[]).map((c) => <option key={c.id} value={c.id}>{c.client_name}</option>)}</StudioSelect>
        <StudioInput placeholder="Project name" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} />
        <StudioInput type="number" min="0" step="0.001" placeholder="Gold weight (g)" value={form.gold_weight} onChange={(e) => setForm({ ...form, gold_weight: e.target.value })} />
        <StudioInput type="number" min="0" step="0.01" placeholder="Earning %" suffix="%" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} />
        <StudioSelect value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((s) => <option key={s}>{s}</option>)}</StudioSelect>
        <label className="relative"><CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7f766d]" /><StudioInput type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} /></label>
        <div className="rounded-xl border border-[#4b3c24] bg-[#17120d] px-4 py-3 sm:col-span-2"><p className="studio-label">Gold earned</p><p className="mt-2 font-serif text-xl text-[#d4b052]">{earning.toFixed(3)} g</p><p className="mt-1 text-xs text-[#7f766d]">{Number(form.gold_weight || 0).toFixed(3)} g × {Number(form.percentage || 0).toFixed(2)}%</p></div>
        <StudioTextarea className="sm:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div className="mt-5 flex justify-end gap-3"><StudioButton variant="outline" onClick={closeModal}>Cancel</StudioButton><StudioButton disabled={save.isPending || !form.client_id || !form.project_name || !form.gold_weight} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Save order"}</StudioButton></div>
      {save.isError && <p className="mt-3 text-sm text-red-300">{(save.error as Error).message}</p>}
    </Modal>}
  </AppShell>;
}
