import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileDown, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, StatCard, StudioButton, StudioInput, StudioSelect, formatDate, formatGold, formatINR } from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";
import { downloadPDF, downloadPDFReport } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/reports")({
  component: Reports,
});

function toDate(value: string) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function Reports() {
  const [period, setPeriod] = useState("month");
  const [client, setClient] = useState("all");
  const [status, setStatus] = useState("all");
  const [expenseType, setExpenseType] = useState("all");
  const [search, setSearch] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await apiFetch<any>("/orders")).orders || [],
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => (await apiFetch<any>("/clients")).clients || [],
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => (await apiFetch<any>("/expenses")).expenses || [],
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const range = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "yesterday") {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
    } else if (period === "7") start.setDate(start.getDate() - 6);
    else if (period === "30") start.setDate(start.getDate() - 29);
    else if (period === "quarter") start.setMonth(start.getMonth() - 2);
    else if (period === "half") start.setMonth(start.getMonth() - 5);
    else if (period === "year") start.setMonth(0, 1);
    else start.setDate(1);
    return { start, end };
  }, [period]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o: any) => {
      const d = toDate(o.created_at || o.delivery_date);
      const inRange = d >= toDate(range.start.toISOString()) && d <= range.end;
      const clientOk = client === "all" || String(o.client_id) === client;
      const normalized = o.status === "Delivered" ? "Completed" : o.status;
      const statusOk = status === "all" || normalized === status;
      const searchOk = !term || `${o.order_number || ""} ${o.client_name || ""} ${o.ornament_name || ""}`.toLowerCase().includes(term);
      return inRange && clientOk && statusOk && searchOk;
    });
  }, [orders, range, client, status, search]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e: any) => {
      const d = toDate(e.expense_date);
      const inRange = d >= toDate(range.start.toISOString()) && d <= range.end;
      return inRange && (expenseType === "all" || e.category === expenseType);
    });
  }, [expenses, range, expenseType]);

  // Only orders actually marked Completed count toward the performance
  // totals below (Gold Designed, Earnings, Net Profit) — a Pending/In
  // Progress order hasn't been delivered yet. The Orders table further
  // down still shows every order matching the status filter above, so you
  // can still review pending work; it's just excluded from these totals
  // until it's completed.
  const completedOrders = useMemo(
    () => filteredOrders.filter((o: any) => o.status === "Completed" || o.status === "Delivered"),
    [filteredOrders]
  );
  const gold = completedOrders.reduce((s: number, o: any) => s + Number(o.gross_weight || 0), 0);
  const earnings = completedOrders.reduce((s: number, o: any) => s + Number(o.gold_earned || 0), 0);
  const loss = filteredExpenses.reduce((s: number, e: any) => s + Number(e.gold_loss || 0), 0);
  const printing = filteredExpenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);

  function exportPDF() {
    downloadPDF("das-and-co-report.pdf", "DAS & CO - Report", filteredOrders.map((o: any) => ({
      Date: formatDate(o.delivery_date || o.created_at),
      Client: o.client_name || "—",
      Project: o.ornament_name || "—",
      Gold: `${Number(o.gross_weight || 0).toFixed(3)} g`,
      Earnings: `${Number(o.gold_earned || 0).toFixed(3)} g`,
      Status: o.status === "Delivered" ? "Completed" : o.status,
    })), {
      subtitle: `${formatDate(range.start)} — ${formatDate(range.end)}`,
      summary: [`Orders: ${filteredOrders.length}`, `Gold designed: ${formatGold(gold)}`, `Earnings: ${formatGold(earnings)}`, `Casting loss: ${formatGold(loss)}`, `3D printing: ${formatINR(printing)}`],
    });
  }

  function exportFullPDF() {
    downloadPDFReport("das-and-co-report-all.pdf", "DAS & CO - Full Report", [
      { heading: "Orders", rows: filteredOrders.map((o: any) => ({ Date: formatDate(o.delivery_date || o.created_at), Client: o.client_name || "—", Project: o.ornament_name || "—", Gold: `${Number(o.gross_weight || 0).toFixed(3)} g`, Earnings: `${Number(o.gold_earned || 0).toFixed(3)} g`, Status: o.status === "Delivered" ? "Completed" : o.status })) },
      { heading: "Expenses", rows: filteredExpenses.map((e: any) => ({ Date: formatDate(e.expense_date), Category: e.category, Amount: e.amount ? formatINR(e.amount) : "—", "Gold Loss": e.gold_loss ? `${Number(e.gold_loss).toFixed(3)} g` : "—" })) },
      { heading: "Clients", rows: clients.map((c: any) => ({ Client: c.client_name, "Earning %": `${Number(c.default_percentage ?? 2).toFixed(2)}%` })) },
    ], `${formatDate(range.start)} — ${formatDate(range.end)}`);
  }

  return (
    <AppShell title="Reports">
      <PageHeader
        eyebrow="Statements"
        title="Reports"
        description="Filter any period, then export or print a clean statement."
        action={
          <div className="flex flex-wrap gap-2">
            <StudioButton variant="outline" onClick={exportPDF}><FileDown size={15} /> Orders (PDF)</StudioButton>
            <StudioButton variant="outline" onClick={exportFullPDF}><FileDown size={15} /> Download all (PDF)</StudioButton>
            <StudioButton onClick={() => window.print()}><Printer size={15} /> Print / PDF</StudioButton>
          </div>
        }
      />

      <section className="studio-card p-5">
        <div className="flex flex-wrap gap-2">
          {[
            ["today", "Today"], ["yesterday", "Yesterday"], ["7", "Last 7 days"], ["30", "Last 30 days"],
            ["month", "This month"], ["quarter", "Quarterly"], ["half", "Half-yearly"], ["year", "Yearly"],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-full border px-4 py-2 text-xs ${period === value ? "border-[#d2aa4a] bg-[#e0b84f] text-[#1b150c]" : "border-[#3a3024] text-[#a49c94]"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <StudioSelect value={client} onChange={(e) => setClient(e.target.value)}>
            <option value="all">All clients</option>
            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.client_name}</option>)}
          </StudioSelect>
          <StudioSelect value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </StudioSelect>
          <StudioSelect value={expenseType} onChange={(e) => setExpenseType(e.target.value)}>
            <option value="all">All expenses</option>
            <option>3D Printing</option>
            <option>Casting</option>
          </StudioSelect>
          <StudioInput placeholder="Project, client, vendor…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>

      <p className="mt-6 text-sm text-[#9a9188]">
        {formatDate(range.start)} — {formatDate(range.end)}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders" value={String(filteredOrders.length)} />
        <StatCard label="Gold Designed" value={formatGold(gold)} />
        <StatCard label="Earnings" value={formatGold(earnings)} accent />
        <StatCard label="Casting Loss" value={formatGold(loss)} />
        <StatCard label="3D Printing" value={formatINR(printing)} />
        <StatCard label="Net Profit (Grams)" value={formatGold(earnings - loss)} accent />
        <StatCard label="Active Clients" value={String(new Set(filteredOrders.map((o: any) => o.client_id)).size)} />
        <StatCard label="Records" value={String(filteredOrders.length + filteredExpenses.length)} />
      </div>

      <section className="studio-card mt-6 overflow-hidden">
        <div className="px-6 py-5">
          <h3 className="font-serif text-[1.35rem]">Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="studio-table min-w-[900px]">
            <thead><tr><th>Date</th><th>Client</th><th>Project</th><th>Gold</th><th>Earnings</th><th>Status</th></tr></thead>
            <tbody>
              {filteredOrders.map((o: any) => (
                <tr key={o.id}>
                  <td>{formatDate(o.delivery_date || o.created_at)}</td>
                  <td>{o.client_name || "—"}</td>
                  <td>{o.ornament_name || "—"}</td>
                  <td>{formatGold(o.gross_weight)}</td>
                  <td className="text-[#d0ac4f]">{formatGold(o.gold_earned)}</td>
                  <td>{o.status === "Delivered" ? "Completed" : o.status}</td>
                </tr>
              ))}
              {!filteredOrders.length && <tr><td colSpan={6} className="py-10 text-center text-[#756e66]">No records for this period.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
