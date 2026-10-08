import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Modal, PageHeader, StudioButton, StudioInput, StudioSelect, StudioTextarea, formatDate, formatGold } from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";
import { downloadPDF, downloadPDFReport } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/clients")({
  component: Clients,
});

const emptyForm = {
  client_name: "",
  phone: "",
  email: "",
  company: "",
  notes: "",
  default_percentage: "2",
};

function Clients() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const data = await apiFetch<any>("/clients");
      return data.clients || [];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await apiFetch<any>("/orders")).orders || [],
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  // Fallback stats (used only if the backend's own per-client totals are
  // missing) — orders count includes everything, but gold/earnings only
  // count orders actually marked Completed, matching the backend.
  const clientStats = useMemo(() => {
    const stats = new Map<string, { orders: number; gold: number; earnings: number; last: string | null }>();
    for (const order of orders as any[]) {
      const key = String(order.client_id ?? order.client_name ?? "");
      if (!key) continue;
      const current = stats.get(key) || { orders: 0, gold: 0, earnings: 0, last: null };
      current.orders += 1;
      if (order.status === "Completed" || order.status === "Delivered") {
        current.gold += Number(order.gold_weight ?? order.gross_weight ?? 0);
        current.earnings += Number(order.earning_gold ?? order.gold_earned ?? order.earning_gold ?? 0);
      }
      const date = String(order.delivery_date || order.created_at || "");
      if (date && (!current.last || date > current.last)) current.last = date;
      stats.set(key, current);
    }
    return stats;
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client: any) =>
      `${client.client_name} ${client.phone || ""} ${client.email || ""} ${client.company || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [clients, search]);

  const save = useMutation({
    mutationFn: () =>
      editing
        ? apiFetch(`/clients/${editing.id}`, {
            method: "PUT",
            body: JSON.stringify({ ...form, default_percentage: Number(form.default_percentage || 2) }),
          })
        : apiFetch("/clients", {
            method: "POST",
            body: JSON.stringify({ ...form, default_percentage: Number(form.default_percentage || 2) }),
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      closeModal();
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`/clients/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function closeModal() {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function startEdit(client: any) {
    setEditing(client);
    setForm({
      client_name: client.client_name || "",
      phone: client.phone || "",
      email: client.email || "",
      company: client.company || "",
      notes: client.notes || "",
      default_percentage: String(client.default_percentage ?? 2),
    });
    setOpen(true);
  }

  return (
    <AppShell title="Clients">
      <PageHeader
        eyebrow="Relationships"
        title="Clients"
        description="Each client carries their own default earning percentage and project history."
        action={
          <div className="flex flex-wrap gap-2">
            <StudioButton variant="outline" onClick={() => downloadPDF("das-and-co-clients.pdf", "DAS & CO - Clients", (clients as any[]).map((c) => ({
              Client: c.client_name, Phone: c.phone || "—", Email: c.email || "—",
              "Earning %": `${Number(c.default_percentage ?? 2).toFixed(2)}%`, Orders: c.orders_count ?? clientStats.get(String(c.id))?.orders ?? 0,
              Gold: formatGold(c.gold_designed ?? clientStats.get(String(c.id))?.gold ?? 0), Earnings: formatGold(c.earnings ?? clientStats.get(String(c.id))?.earnings ?? 0),
              "Last Order": formatDate(c.last_order ?? clientStats.get(String(c.id))?.last),
            })))}><Download size={15} /> Download clients</StudioButton>
            <StudioButton variant="outline" onClick={() => downloadPDFReport("das-and-co-all-data.pdf", "DAS & CO - Clients & Orders", [
              { heading: "Clients", rows: (clients as any[]).map((c) => ({ Client: c.client_name, Phone: c.phone || "—", "Earning %": `${Number(c.default_percentage ?? 2).toFixed(2)}%`, Orders: c.orders_count ?? clientStats.get(String(c.id))?.orders ?? 0, Gold: formatGold(c.gold_designed ?? clientStats.get(String(c.id))?.gold ?? 0), Earnings: formatGold(c.earnings ?? clientStats.get(String(c.id))?.earnings ?? 0) })) },
              { heading: "Orders", rows: (orders as any[]).map((o) => ({ Date: formatDate(o.delivery_date || o.created_at), Client: o.client_name || "—", Project: o.project_name || o.ornament_name || "—", Gold: `${Number(o.gold_weight ?? o.gross_weight ?? 0).toFixed(3)} g`, Earned: formatGold(o.earning_gold ?? o.gold_earned), Status: o.status === "Delivered" ? "Completed" : o.status })) },
            ])}><Download size={15} /> Download all</StudioButton>
            <StudioButton onClick={() => setOpen(true)}><Plus size={16} /> Add client</StudioButton>
          </div>
        }
      />

      <div className="relative mb-6 max-w-[400px]">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#746d65]" />
        <input
          className="studio-input pl-11"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="studio-card h-64 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client: any) => (
            <article key={client.id} className="studio-card p-5 transition hover:-translate-y-0.5 hover:border-[#b99542]/45">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-[1.45rem]">{client.client_name}</h3>
                  <p className="mt-1 text-xs text-[#756e66]">
                    {client.phone || "No phone"} · {client.email || "No email"}
                  </p>
                </div>
                <span className="rounded-full bg-[#e4b94f] px-3 py-1 text-xs font-semibold text-[#1b150c]">
                  {Number(client.default_percentage || 2).toFixed(2)}%
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-y-5 text-sm">
                <div>
                  <p className="studio-label">Orders</p>
                  <p className="mt-2 text-[#eee7dc]">{client.orders_count ?? clientStats.get(String(client.id))?.orders ?? "—"}</p>
                </div>
                <div>
                  <p className="studio-label">Gold Designed</p>
                  <p className="mt-2 text-[#eee7dc]">{formatGold(client.gold_designed ?? clientStats.get(String(client.id))?.gold ?? 0)}</p>
                </div>
                <div>
                  <p className="studio-label">Earnings</p>
                  <p className="mt-2 text-[#d0ac4f]">{formatGold(client.earnings ?? clientStats.get(String(client.id))?.earnings ?? 0)}</p>
                </div>
                <div>
                  <p className="studio-label">Last Order</p>
                  <p className="mt-2 text-[#eee7dc]">{formatDate(client.last_order ?? clientStats.get(String(client.id))?.last)}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-[#2d251c] pt-4">
                <StudioButton variant="outline" className="px-4 py-2" onClick={() => startEdit(client)}>
                  <Pencil size={14} /> Edit
                </StudioButton>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                  onClick={() => {
                    if (window.confirm(`Delete ${client.client_name}?`)) remove.mutate(Number(client.id));
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}

          {!filtered.length && (
            <div className="studio-card col-span-full p-12 text-center text-[#776f67]">
              <Users className="mx-auto mb-3" size={22} />
              No clients found.
            </div>
          )}
        </div>
      )}

      {open && (
        <Modal title={editing ? "Edit client" : "Add client"} onClose={closeModal}>
          <div className="space-y-4">
            <StudioInput autoFocus placeholder="Client name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <StudioInput placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <StudioInput type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StudioInput placeholder="Company / address" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              <StudioInput type="number" min="0" step="0.01" placeholder="Default earning %" suffix="%" value={form.default_percentage} onChange={(e) => setForm({ ...form, default_percentage: e.target.value })} />
            </div>
            <StudioTextarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex justify-end gap-3 pt-2">
              <StudioButton variant="outline" onClick={closeModal}>Cancel</StudioButton>
              <StudioButton disabled={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? "Saving…" : editing ? "Save changes" : "Save client"}
              </StudioButton>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
