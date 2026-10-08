import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, StatCard, StudioButton, formatDate, formatGold, formatINR } from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";
import { downloadPDF } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/analytics/")({ component: Analytics });

function Analytics() {
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: async () => (await apiFetch<any>("/orders")).orders || [], staleTime: 15_000 });
  const clientsQ = useQuery({ queryKey: ["clients"], queryFn: async () => (await apiFetch<any>("/clients")).clients || [], staleTime: 30_000 });
  const expensesQ = useQuery({ queryKey: ["expenses"], queryFn: async () => (await apiFetch<any>("/expenses")).expenses || [], staleTime: 15_000 });
  const orders = ordersQ.data || [];
  const clients = clientsQ.data || [];
  const expenses = expensesQ.data || [];
  // Only Completed orders count toward Gold Designed / Gold Earned — a
  // Pending/In Progress order hasn't been delivered yet.
  const completedOrders = useMemo(() => orders.filter((o: any) => ["Completed", "Delivered"].includes(o.status)), [orders]);
  const gold = useMemo(() => completedOrders.reduce((s: number, o: any) => s + Number(o.gold_weight ?? o.gross_weight ?? 0), 0), [completedOrders]);
  const earnings = useMemo(() => completedOrders.reduce((s: number, o: any) => s + Number(o.earning_gold ?? o.gold_earned ?? 0), 0), [completedOrders]);
  const castingLoss = useMemo(() => expenses.filter((e: any) => e.category === "Casting").reduce((s: number, e: any) => s + Number(e.gold_loss ?? Math.max(0, Number(e.gold_given || 0) - Number(e.gold_returned || 0))), 0), [expenses]);
  const printing = useMemo(() => expenses.filter((e: any) => e.category === "3D Printing").reduce((s: number, e: any) => s + Number(e.amount || 0), 0), [expenses]);
  const completed = completedOrders.length;
  const pending = orders.length - completed;
  const recent = [...orders].sort((a: any, b: any) => String(b.delivery_date || b.created_at).localeCompare(String(a.delivery_date || a.created_at))).slice(0, 8);

  return <AppShell title="Analytics">
    <PageHeader eyebrow="Business Intelligence" title="Analytics" description="Reliable business insights calculated directly from your orders, clients and expenses." action={<StudioButton variant="outline" onClick={() => downloadPDF("das-and-co-analytics.pdf", "DAS & CO - Analytics", recent.map((o: any) => ({ Date: formatDate(o.delivery_date), Client: o.client_name || "—", Project: o.project_name || o.ornament_name || "—", Gold: formatGold(o.gold_weight ?? o.gross_weight), Earned: formatGold(o.earning_gold ?? o.gold_earned), Status: o.status === "Delivered" ? "Completed" : o.status })), { summary: [`Orders: ${orders.length}`, `Gold designed: ${formatGold(gold)}`, `Gold earned: ${formatGold(earnings)}`, `Casting loss: ${formatGold(castingLoss)}`, `3D printing: ${formatINR(printing)}`] })}><Download size={15} /> Download</StudioButton>} />
    {(ordersQ.error || clientsQ.error || expensesQ.error) && <div className="mb-5 rounded-xl border border-[#4a3924] bg-[#17120d] p-4 text-sm text-[#b8afa5]">Some advanced analytics endpoints are unavailable. Core analytics are being calculated from the records that are available.</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Orders" value={String(orders.length)} accent /><StatCard label="Gold Designed" value={formatGold(gold)} /><StatCard label="Gold Earned" value={formatGold(earnings)} accent icon={<TrendingUp size={17} />} /><StatCard label="Casting Loss" value={formatGold(castingLoss)} icon={<TrendingDown size={17} />} /><StatCard label="3D Printing" value={formatINR(printing)} /><StatCard label="Completed" value={String(completed)} /><StatCard label="In Progress / Pending" value={String(pending)} /><StatCard label="Active Clients" value={String(clients.length)} /></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <section className="studio-card p-6"><h3 className="font-serif text-xl">Order status</h3><div className="mt-6 space-y-4"><Bar label="Completed" value={completed} total={Math.max(orders.length,1)} /><Bar label="Pending / In progress" value={pending} total={Math.max(orders.length,1)} /></div></section>
      <section className="studio-card p-6"><h3 className="font-serif text-xl">Gold movement</h3><div className="mt-6 space-y-4"><Metric label="Designed" value={formatGold(gold)} /><Metric label="Earned" value={formatGold(earnings)} /><Metric label="Casting loss" value={formatGold(castingLoss)} /></div></section>
    </div>
    <section className="studio-card mt-6 overflow-hidden"><div className="border-b border-[#2d251c] px-6 py-5"><h3 className="font-serif text-xl">Recent orders</h3></div><div className="overflow-x-auto"><table className="studio-table min-w-[800px]"><thead><tr><th>Date</th><th>Client</th><th>Project</th><th>Gold</th><th>Earned</th><th>Status</th></tr></thead><tbody>{recent.map((o: any) => <tr key={o.id}><td>{formatDate(o.delivery_date)}</td><td>{o.client_name || "—"}</td><td>{o.project_name || o.ornament_name || "—"}</td><td>{formatGold(o.gold_weight ?? o.gross_weight)}</td><td className="text-[#d0ac4f]">{formatGold(o.earning_gold ?? o.gold_earned)}</td><td>{o.status === "Delivered" ? "Completed" : o.status}</td></tr>)}{!recent.length && <tr><td colSpan={6} className="py-10 text-center text-[#756e66]">No order data yet.</td></tr>}</tbody></table></div></section>
  </AppShell>;
}
function Bar({ label, value, total }: { label: string; value: number; total: number }) { const pct = Math.round((value / total) * 100); return <div><div className="mb-2 flex justify-between text-sm"><span>{label}</span><span className="text-[#d0ac4f]">{value} · {pct}%</span></div><div className="h-2 rounded-full bg-[#252018]"><div className="h-2 rounded-full bg-[#dfb64d]" style={{ width: `${Math.max(value ? 4 : 0, pct)}%` }} /></div></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b border-[#2d251c] pb-3"><span className="text-[#8f877e]">{label}</span><strong className="font-serif text-lg text-[#d0ac4f]">{value}</strong></div>; }
