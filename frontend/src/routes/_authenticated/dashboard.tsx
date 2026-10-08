import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  ArrowUpRight,
  Crown,
  Gem,
  Sparkles,
  TriangleAlert,
  Coins,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StatCard, formatDate, formatGold, formatINR } from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";
import { downloadPDFReport } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function LineChart({
  values,
  labels,
  height = 190,
}: {
  values: number[];
  labels: string[];
  height?: number;
}) {
  const width = 720;
  const pad = 24;
  const max = Math.max(...values, 0.001);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 0.001);
  const points = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="studio-chart-grid rounded-xl px-2 pt-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[190px] w-full" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="#d5af4d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => {
          const [x, y] = points.split(" ")[i].split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#e4bc58" />;
        })}
      </svg>
      <div className="flex justify-between px-4 pb-3 text-[10px] text-[#736c64]">
        {labels.map((label, i) => <span key={i}>{label}</span>)}
      </div>
    </div>
  );
}

function BarChart({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  const max = Math.max(...items.map((x) => x.value), 0.001);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-[#b1aaa1]">{item.label}</span>
            <span className="text-[#c8a44c]">{item.value.toFixed(3)} g</span>
          </div>
          <div className="h-2 rounded-full bg-[#252018]">
            <div
              className="h-2 rounded-full bg-[#e2b94f] transition-all"
              style={{ width: `${Math.max(3, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<any>("/dashboard"),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const { data: clientsData = [] } = useQuery({ queryKey: ["clients"], queryFn: async () => (await apiFetch<any>("/clients")).clients || [], staleTime: 30_000 });
  const { data: ordersData = [] } = useQuery({ queryKey: ["orders"], queryFn: async () => (await apiFetch<any>("/orders")).orders || [], staleTime: 15_000 });
  const { data: expensesData = [] } = useQuery({ queryKey: ["expenses"], queryFn: async () => (await apiFetch<any>("/expenses")).expenses || [], staleTime: 15_000 });

  if (isLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="studio-card h-[126px] animate-pulse bg-[#17120e]" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell title="Dashboard">
        <div className="studio-card p-8 text-center text-[#b8afa5]">
          Unable to load dashboard data. Please refresh and try again.
        </div>
      </AppShell>
    );
  }

  const s = data?.summary || {};
  const daily = data?.daily || [];
  const weekly = data?.weekly || [];
  const monthly = data?.monthly || [];
  const monthlyLoss = data?.monthlyLoss || [];
  const topClients = data?.topClientsMonth || [];
  const notification = data?.notifications || {};

  const monthlyMap = new Map(monthlyLoss.map((x: any) => [x.monthKey, Number(x.castingLoss || 0)]));
  const monthlyLabels = monthly.map((x: any) => {
    const [year, month] = String(x.monthKey).split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", { month: "short" });
  });

  const notifications = [
    `${Number(notification.ordersToday || 0)} projects delivered today · ${formatGold(notification.earningsToday) } earned`,
    `Best client this month · ${notification.bestClientMonth || "—"}`,
    `Current gold vault balance · ${formatGold(s.openingGold)}`,
  ];

  return (
    <AppShell title="Dashboard">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
        <p className="eyebrow mb-2">Business Operating System</p>
        <h1 className="font-serif text-[2.5rem] leading-none text-[#f4efe7] sm:text-[3rem]">
          Studio Dashboard
        </h1>
        <p className="mt-3 text-sm text-[#8f877f]">
          Every order, expense and casting entry updates these figures instantly.
        </p>
        </div>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#4b3c24] px-5 py-2.5 text-sm text-[#eee8de] hover:border-[#c7a34c]/60 hover:bg-[#c7a34c]/5" onClick={() => downloadPDFReport("das-and-co-dashboard.pdf", "DAS & CO - Business Summary", [
          { heading: "Clients", rows: (clientsData as any[]).map((c: any) => ({ Client: c.client_name, "Earning %": `${Number(c.default_percentage ?? 2).toFixed(2)}%`, Orders: c.orders_count ?? 0, Gold: formatGold(c.gold_designed), Earnings: formatGold(c.earnings) })) },
          { heading: "Orders", rows: (ordersData as any[]).map((o: any) => ({ Date: formatDate(o.delivery_date || o.created_at), Client: o.client_name || "—", Project: o.project_name || o.ornament_name || "—", Gold: `${Number(o.gold_weight ?? o.gross_weight ?? 0).toFixed(3)} g`, Earned: formatGold(o.earning_gold ?? o.gold_earned), Status: o.status === "Delivered" ? "Completed" : o.status })) },
          { heading: "Expenses", rows: (expensesData as any[]).map((e: any) => ({ Date: formatDate(e.expense_date), Category: e.category, Amount: e.amount ? `Rs. ${Number(e.amount).toLocaleString("en-IN")}` : "—", "Gold Loss": e.gold_loss ? `${Number(e.gold_loss).toFixed(3)} g` : "—" })) },
        ], `Today ${formatGold(s.today)} · This month ${formatGold(s.month)} · Year ${formatGold(s.year)} · Total orders ${s.totalOrders || 0}`)}><Download size={15} /> Download all data</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today" value={formatGold(s.today)} accent icon={<Sparkles size={17} />} sub="CAD earnings today" />
        <StatCard label="This Week" value={formatGold(s.week)} icon={<ArrowUpRight size={17} />} />
        <StatCard label="This Month" value={formatGold(s.month)} icon={<Gem size={17} />} sub={`${formatGold(s.totalGoldDesigned)} gold designed`} />
        <StatCard label="Quarter" value={formatGold(s.quarter)} icon={<ArrowUpRight size={17} />} />

        <StatCard label="Half Year" value={formatGold(s.halfYear)} icon={<ArrowUpRight size={17} />} />
        <StatCard label="Year" value={formatGold(s.year)} accent icon={<Coins size={17} />} />
        <StatCard label="Total Orders" value={String(s.totalOrders || 0)} icon={<Gem size={17} />} sub={`${s.completedOrders || 0} completed`} />
        <StatCard label="Avg / Working Day" value={formatGold(s.avgWorkingDay)} icon={<ArrowUpRight size={17} />} />

        <StatCard label="Total Gold Designed" value={formatGold(s.totalGoldDesigned)} icon={<Gem size={17} />} />
        <StatCard label="Total Earnings" value={formatGold(s.totalEarnings)} accent icon={<Coins size={17} />} />
        <StatCard label="Casting Loss" value={formatGold(s.castingLoss)} icon={<TriangleAlert size={17} />} sub="casting loss total" />
        <StatCard label="3D Printing Expense" value={formatINR(s.printingExpense)} icon={<Coins size={17} />} sub="total printing expense" />

        <StatCard label="Net Profit (Grams)" value={formatGold(s.netProfitGrams)} accent sub="earnings − casting loss" />
        <StatCard label="Net Profit (Value)" value={s.rate22k ? formatINR(s.netProfitValue) : "—"} accent sub={s.rate22k ? "at 22K gold rate" : "Add gold rate in Settings"} />
        <StatCard label="Best Client · Month" value={s.bestClientMonth?.name || "—"} icon={<Crown size={17} />} sub={s.bestClientMonth ? formatGold(s.bestClientMonth.earnings) : "No earnings yet"} />
        <StatCard label="Best Client · Year" value={s.bestClientYear?.name || "—"} icon={<Crown size={17} />} sub={s.bestClientYear ? formatGold(s.bestClientYear.earnings) : "No earnings yet"} />
      </div>

      <section className="studio-card mt-6 p-6">
        <h2 className="font-serif text-[1.35rem]">Notifications</h2>
        <div className="mt-5 space-y-3 text-sm text-[#aaa29a]">
          {notifications.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[#c9a54c]"><Sparkles size={16} /></span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="studio-card p-6">
          <h2 className="font-serif text-[1.35rem]">Daily Earnings · Last 14 Days</h2>
          <div className="mt-5">
            <LineChart
              values={daily.map((x: any) => Number(x.earnings || 0))}
              labels={daily.map((x: any) => new Date(x.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }))}
            />
          </div>
        </section>

        <section className="studio-card p-6">
          <h2 className="font-serif text-[1.35rem]">Weekly Earnings · Last 8 Weeks</h2>
          <div className="mt-5">
            <BarChart items={weekly.map((x: any) => ({
              label: new Date(x.weekStart).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
              value: Number(x.earnings || 0),
            }))} />
          </div>
        </section>

        <section className="studio-card p-6">
          <h2 className="font-serif text-[1.35rem]">Monthly Earnings vs Casting Loss</h2>
          <div className="mt-6 space-y-3">
            {monthly.map((x: any) => {
              const earnings = Number(x.earnings || 0);
              const loss = Number(monthlyMap.get(x.monthKey) || 0);
              const max = Math.max(earnings, loss, 0.001);
              const [year, month] = String(x.monthKey).split("-");
              const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
              return (
                <div key={x.monthKey} className="grid grid-cols-[70px_1fr] items-center gap-3">
                  <span className="text-xs text-[#817970]">{label}</span>
                  <div className="space-y-1.5">
                    <div className="h-2 rounded-full bg-[#252018]">
                      <div className="h-2 rounded-full bg-[#e2b94f]" style={{ width: `${Math.max(2, earnings / max * 100)}%` }} />
                    </div>
                    <div className="h-2 rounded-full bg-[#252018]">
                      <div className="h-2 rounded-full bg-[#e45858]" style={{ width: `${Math.max(2, loss / max * 100)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex gap-5 text-xs text-[#8c837b]">
            <span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#e2b94f]" />Earnings</span>
            <span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#e45858]" />Casting loss</span>
          </div>
        </section>

        <section className="studio-card p-6">
          <h2 className="font-serif text-[1.35rem]">Monthly Net Profit Trend (grams)</h2>
          <div className="mt-5">
            <LineChart
              values={monthly.map((x: any) => Number(x.earnings || 0) - Number(monthlyMap.get(x.monthKey) || 0))}
              labels={monthlyLabels}
            />
          </div>
        </section>

        <section className="studio-card p-6">
          <h2 className="font-serif text-[1.35rem]">Top 10 Clients by Earnings</h2>
          <div className="mt-6">
            <BarChart items={topClients.map((x: any) => ({ label: x.name || "Unknown", value: Number(x.earnings || 0) }))} />
          </div>
        </section>

        <section className="studio-card p-6">
          <h2 className="font-serif text-[1.35rem]">Client-wise Earnings Share</h2>
          <div className="mt-7 flex items-center justify-center">
            <div
              className="relative flex h-48 w-48 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#e5b94f ${Math.min(100, topClients.reduce((a: number,b: any)=>a+Number(b.earnings||0),0) > 0 ? (Number(topClients[0]?.earnings||0) / topClients.reduce((a: number,b: any)=>a+Number(b.earnings||0),0))*100 : 0)}%, #332a1e 0)`,
              }}
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#15110d] text-center">
                <span className="text-xs text-[#968d84]">Top client<br /><b className="text-[#d5b052]">{topClients[0]?.name || "—"}</b></span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="studio-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="font-serif text-[1.35rem]">Client Leaderboard</h2>
          <a href="/clients" className="text-sm text-[#d1ae50] hover:text-[#f0ca62]">View all clients</a>
        </div>
        <div className="overflow-x-auto">
          <table className="studio-table min-w-[760px]">
            <thead>
              <tr>
                <th>Client</th>
                <th>Orders</th>
                <th>Gold</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentClients || []).map((client: any) => (
                <tr key={client.id}>
                  <td>{client.client_name}</td>
                  <td>{client.orders_count || 0}</td>
                  <td>{formatGold(client.gold_designed)}</td>
                  <td className="text-[#d0ad50]">{formatGold(client.earnings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
