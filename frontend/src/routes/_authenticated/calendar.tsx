import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, StudioButton, formatDate, formatGold } from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";
import { downloadPDF } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/calendar")({ component: CalendarPage });

function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const { data: orders = [], isLoading, error } = useQuery({ queryKey: ["orders"], queryFn: async () => (await apiFetch<any>("/orders")).orders || [], staleTime: 15_000 });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const first = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: first + days }, (_, i) => i < first ? null : i - first + 1);
  const monthOrders = useMemo(() => (orders as any[]).filter((o) => { const d = new Date(o.delivery_date || o.created_at); return d.getFullYear() === year && d.getMonth() === month; }), [orders, year, month]);
  const byDay = useMemo(() => { const map = new Map<number, any[]>(); for (const o of monthOrders) { const d = new Date(o.delivery_date || o.created_at).getDate(); map.set(d, [...(map.get(d) || []), o]); } return map; }, [monthOrders]);
  const title = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const changeMonth = (n: number) => { setCursor(new Date(year, month + n, 1)); setSelected(null); };
  const dayKey = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const selectedOrders = selected ? (byDay.get(Number(selected.slice(-2))) || []) : [];

  return <AppShell title="Calendar">
    <PageHeader eyebrow="Schedule" title="Business Calendar" description="A compact delivery calendar for CAD orders. Click a day to see the work due that day." action={<StudioButton variant="outline" onClick={() => downloadPDF("das-and-co-calendar.pdf", `DAS & CO - Calendar (${title})`, monthOrders.map((o: any) => ({ Date: formatDate(o.delivery_date), Client: o.client_name || "—", Project: o.project_name || o.ornament_name || "—", Gold: formatGold(o.gold_weight ?? o.gross_weight), Earned: formatGold(o.earning_gold ?? o.gold_earned), Status: o.status === "Delivered" ? "Completed" : o.status })))}><Download size={15} /> Download</StudioButton>} />
    <section className="studio-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#2d251c] px-4 py-4 sm:px-6"><button className="rounded-full border border-[#3b3024] p-2" onClick={() => changeMonth(-1)}><ChevronLeft size={17} /></button><div className="text-center"><h3 className="font-serif text-xl">{title}</h3><p className="mt-1 text-xs text-[#7e766e]">{monthOrders.length} order{monthOrders.length === 1 ? "" : "s"} scheduled</p></div><button className="rounded-full border border-[#3b3024] p-2" onClick={() => changeMonth(1)}><ChevronRight size={17} /></button></div>
      {isLoading ? <div className="p-12 text-center text-[#756e66]">Loading calendar…</div> : error ? <div className="p-12 text-center text-red-300">Unable to load calendar data.</div> : <div className="p-3 sm:p-5"><div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-[#2b241d] bg-[#2b241d]"><div className="contents">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="bg-[#17130f] px-2 py-2 text-center text-[10px] uppercase tracking-[.18em] text-[#777067] sm:text-xs">{d}</div>)}</div>{cells.map((day, i) => { const key = day ? dayKey(day) : null; const isSelected = key !== null && key === selected; return <button type="button" key={i} disabled={!day} onClick={() => day && setSelected(key === selected ? null : key)} className={`min-h-[96px] bg-[#100e0c] p-2 text-left transition sm:min-h-[120px] ${day ? "cursor-pointer hover:bg-[#18130e]" : "cursor-default"} ${isSelected ? "ring-1 ring-inset ring-[#c7a34c]" : ""}`}>{day && <><div className={`text-xs ${isSelected ? "text-[#e3b84e]" : "text-[#8c847b]"}`}>{day}</div><div className="mt-2 space-y-1">{(byDay.get(day) || []).slice(0, 3).map((o: any) => <div key={o.id} className="rounded-lg border border-[#3a3024] bg-[#18130e] px-2 py-1.5"><p className="truncate text-[10px] font-medium text-[#e3d8c8]">{o.project_name || o.ornament_name || "CAD project"}</p><p className="truncate text-[9px] text-[#b7984d]">{o.client_name || "Client"} · {formatGold(o.earning_gold ?? o.gold_earned)}</p></div>)}{(byDay.get(day)?.length || 0) > 3 && <p className="text-[9px] text-[#777067]">+{(byDay.get(day)?.length || 0) - 3} more</p>}</div></>}</button>; })}</div></div>}
    </section>

    {selected && (
      <section className="studio-card mt-6 overflow-hidden">
        <div className="border-b border-[#2d251c] px-6 py-5">
          <h3 className="font-serif text-xl">Orders on {formatDate(selected)}</h3>
          <p className="mt-1 text-xs text-[#7e766e]">{selectedOrders.length} order{selectedOrders.length === 1 ? "" : "s"} due this day</p>
        </div>
        <div className="overflow-x-auto">
          <table className="studio-table min-w-[700px]">
            <thead><tr><th>Client</th><th>Project</th><th>Gold</th><th>Earned</th><th>Status</th></tr></thead>
            <tbody>
              {selectedOrders.map((o: any) => <tr key={o.id}><td>{o.client_name || "—"}</td><td>{o.project_name || o.ornament_name || "—"}</td><td>{formatGold(o.gold_weight ?? o.gross_weight)}</td><td className="text-[#d0ac4f]">{formatGold(o.earning_gold ?? o.gold_earned)}</td><td><span className="rounded-full bg-white/5 px-3 py-1 text-[11px]">{o.status === "Delivered" ? "Completed" : o.status}</span></td></tr>)}
              {!selectedOrders.length && <tr><td colSpan={5} className="py-10 text-center text-[#756e66]">No orders due on this date.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    )}
  </AppShell>;
}
