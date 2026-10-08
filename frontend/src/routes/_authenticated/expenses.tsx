import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Modal, PageHeader, StatCard, StudioButton, StudioInput, StudioSelect, StudioTextarea, formatDate, formatGold, formatINR } from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";
import { downloadPDF } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/expenses")({
  component: Expenses,
});

function Expenses() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"3D Printing" | "Casting">("Casting");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyForm = {
    category: "Casting",
    expense_name: "",
    amount: "",
    gold_given: "",
    gold_returned: "",
    remarks: "",
    expense_date: new Date().toISOString().split("T")[0],
    client_id: "",
  };
  const [form, setForm] = useState(emptyForm);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => (await apiFetch<any>("/clients")).clients || [],
    staleTime: 30_000,
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => (await apiFetch<any>("/expenses")).expenses || [],
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => expenses.filter((x: any) => x.category === tab), [expenses, tab]);
  const printingTotal = expenses.filter((x: any) => x.category === "3D Printing").reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
  const castingLoss = expenses.filter((x: any) => x.category === "Casting").reduce((s: number, x: any) => s + Number(x.gold_loss || 0), 0);

  const add = useMutation({
    mutationFn: () =>
      apiFetch(editingId ? `/expenses/${editingId}` : "/expenses", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          category: tab,
          client_id: tab === "Casting" ? (form.client_id || null) : null,
          amount: tab === "3D Printing" ? Number(form.amount || 0) : 0,
          gold_given: tab === "Casting" ? Number(form.gold_given || 0) : 0,
          // null (not 0) when left blank — means "not returned yet",
          // so it isn't counted as a loss until the caster actually
          // returns gold and this is filled in.
          gold_returned: tab === "Casting" ? (form.gold_returned === "" ? null : Number(form.gold_returned)) : 0,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      setOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm, category: tab, expense_date: new Date().toISOString().split("T")[0] });
    },
  });

  const startEdit = (expense: any) => {
    setEditingId(Number(expense.id));
    setForm({
      category: expense.category,
      expense_name: expense.expense_name || expense.vendor || "",
      amount: String(expense.amount ?? ""),
      gold_given: String(expense.gold_given ?? ""),
      gold_returned: expense.gold_returned === null || expense.gold_returned === undefined ? "" : String(expense.gold_returned),
      remarks: expense.remarks || "",
      expense_date: (expense.expense_date || "").slice(0, 10) || new Date().toISOString().split("T")[0],
      client_id: expense.client_id ? String(expense.client_id) : "",
    });
    setOpen(true);
  };

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const setCategory = (next: "3D Printing" | "Casting") => {
    setTab(next);
    setForm((f) => ({ ...f, category: next }));
  };

  return (
    <AppShell title="Expenses">
      <PageHeader
        eyebrow="Studio Costs"
        title="Expenses"
        description="3D printing bills in rupees, casting loss in grams."
        action={<div className="flex flex-wrap gap-2">
          <StudioButton variant="outline" onClick={() => downloadPDF(`das-and-co-${tab === "Casting" ? "casting" : "expenses"}.pdf`, `DAS & CO - ${tab === "Casting" ? "Casting Entries" : "3D Printing Bills"}`, (filtered as any[]).map((e) => tab === "Casting" ? { Date: formatDate(e.expense_date), Client: e.client_name || "—", Given: `${Number(e.gold_given || 0).toFixed(3)} g`, Returned: `${Number(e.gold_returned || 0).toFixed(3)} g`, Loss: `${Number(e.gold_loss || 0).toFixed(3)} g`, Notes: e.remarks || "" } : { Date: formatDate(e.expense_date), Vendor: e.vendor || e.expense_name || "—", Invoice: e.invoice_number || "—", Amount: formatINR(e.amount || 0), Notes: e.remarks || "" }), { summary: tab === "Casting" ? [`Total casting loss: ${formatGold(castingLoss)}`] : [`Total printing spend: ${formatINR(printingTotal)}`] })}><Download size={15} /> Download {tab === "Casting" ? "casting" : "expenses"}</StudioButton>
          <StudioButton onClick={() => { setEditingId(null); setForm({ ...emptyForm, category: tab, expense_date: new Date().toISOString().split("T")[0] }); setOpen(true); }}><Plus size={16} /> Add {tab === "3D Printing" ? "printing bill" : "casting entry"}</StudioButton>
        </div>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Casting Loss · This Month" value={formatGold(castingLoss)} accent />
        <StatCard label="Casting Loss · Total" value={formatGold(castingLoss)} />
        <StatCard label="Printing · This Month" value={formatINR(printingTotal)} />
        <StatCard label="Printing · Total" value={formatINR(printingTotal)} accent />
      </div>

      <div className="mt-6 flex gap-2">
        {(["Casting", "3D Printing"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-4 py-2 text-sm ${tab === item ? "bg-[#e3b84e] text-[#1b150c]" : "border border-[#3a3023] text-[#8f877e]"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="studio-card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="studio-table min-w-[780px]">
            <thead>
              <tr>
                <th>Date</th>
                <th>{tab === "3D Printing" ? "Vendor" : "Client"}</th>
                <th>{tab === "3D Printing" ? "Invoice" : "Given"}</th>
                <th>{tab === "3D Printing" ? "Amount" : "Returned"}</th>
                <th>{tab === "3D Printing" ? "Notes" : "Loss"}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center text-[#756e66]">Loading expenses…</td></tr>
              ) : filtered.map((expense: any) => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.expense_date)}</td>
                  <td>{tab === "3D Printing" ? (expense.vendor || expense.expense_name || "—") : (expense.client_name || "—")}</td>
                  <td>{tab === "3D Printing" ? (expense.invoice_number || "—") : formatGold(expense.gold_given)}</td>
                  <td>{tab === "3D Printing" ? <span className="text-[#d0ac4f]">{formatINR(expense.amount)}</span> : <span className="text-emerald-400">{formatGold(expense.gold_returned)}</span>}</td>
                  <td>{tab === "3D Printing" ? (expense.remarks || "—") : <span className="text-red-300">{formatGold(expense.gold_loss)}</span>}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button type="button" className="rounded-full p-2 text-[#827970] hover:bg-white/5 hover:text-[#e9dfd2]" onClick={() => startEdit(expense)}>
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="rounded-full p-2 text-[#827970] hover:bg-red-500/10 hover:text-red-300" onClick={() => { if (window.confirm("Delete this entry?")) remove.mutate(Number(expense.id)); }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !filtered.length && (
                <tr><td colSpan={6} className="py-12 text-center text-[#756e66]">No {tab.toLowerCase()} entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <Modal title={editingId ? "Edit " + (tab === "3D Printing" ? "printing bill" : "casting entry") : (tab === "3D Printing" ? "3D printing bill" : "Casting entry")} onClose={() => { setOpen(false); setEditingId(null); }}>
          <div className="space-y-4">
            <StudioInput type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
            {tab === "3D Printing" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <StudioInput placeholder="Vendor" value={form.expense_name} onChange={(e) => setForm({ ...form, expense_name: e.target.value })} />
                <StudioInput type="number" min="0" step="0.01" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            ) : (
              <>
                <StudioSelect value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">Select client…</option>
                  {(clients as any[]).map((c) => <option key={c.id} value={c.id}>{c.client_name}</option>)}
                </StudioSelect>
                <div className="grid gap-4 sm:grid-cols-2">
                  <StudioInput type="number" min="0" step="0.001" placeholder="Gold given (g)" value={form.gold_given} onChange={(e) => setForm({ ...form, gold_given: e.target.value })} />
                  <StudioInput type="number" min="0" step="0.001" placeholder="Gold returned (g)" value={form.gold_returned} onChange={(e) => setForm({ ...form, gold_returned: e.target.value })} />
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="studio-label">Calculated casting loss</p>
                  {form.gold_returned === "" ? (
                    <p className="mt-2 font-serif text-xl text-[#8f877e]">Awaiting return</p>
                  ) : (
                    <p className="mt-2 font-serif text-xl text-red-300">{Math.max(0, Number(form.gold_given || 0) - Number(form.gold_returned || 0)).toFixed(3)} g</p>
                  )}
                </div>
              </>
            )}
            <StudioTextarea placeholder="Notes" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            <div className="flex justify-end gap-3">
              <StudioButton variant="outline" onClick={() => { setOpen(false); setEditingId(null); }}>Cancel</StudioButton>
              <StudioButton disabled={add.isPending || (tab === "Casting" && (!form.client_id || !form.gold_given))} onClick={() => add.mutate()}>{add.isPending ? "Saving…" : editingId ? "Save changes" : "Save entry"}</StudioButton>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
