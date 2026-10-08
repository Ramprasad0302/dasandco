import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight, Coins, Download } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  Modal,
  PageHeader,
  StatCard,
  StudioButton,
  StudioInput,
  StudioSelect,
  StudioTextarea,
  formatDate,
  formatGold,
  formatINR,
} from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";
import { downloadPDF } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/gold-vault")({
  component: GoldVault,
});

function GoldVault() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    transaction_type: "ADD",
    gold_added: "",
    gold_deducted: "",
    remarks: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["gold-vault"],
    queryFn: () => apiFetch<any>("/gold-vault"),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const addTransaction = useMutation({
    mutationFn: () =>
      apiFetch("/gold-vault", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          gold_added: form.transaction_type === "ADD" ? Number(form.gold_added || 0) : 0,
          gold_deducted: form.transaction_type === "DEDUCT" ? Number(form.gold_deducted || 0) : 0,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gold-vault"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setForm({
        transaction_type: "ADD",
        gold_added: "",
        gold_deducted: "",
        remarks: "",
        transaction_date: new Date().toISOString().split("T")[0],
      });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/gold-vault/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gold-vault"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (isLoading) {
    return <AppShell title="Gold Vault"><div className="studio-card p-8 text-center text-[#9a9188]">Loading Gold Vault…</div></AppShell>;
  }

  // Current balance is always opening + total added − total deducted.
  // Totals and per-row running balances are computed here from the
  // ledger itself rather than trusting stored balance_after values,
  // which go stale when the opening balance changes or rows are deleted.
  const rawTransactions: any[] = data?.transactions || [];
  const opening = Number(data?.opening || 0);
  const added = rawTransactions.reduce((sum, t) => sum + (Number(t.gold_added) || 0), 0);
  const deducted = rawTransactions.reduce((sum, t) => sum + (Number(t.gold_deducted) || 0), 0);
  const balance = opening + added - deducted;
  const rate = Number(data?.rate || 0);

  const runningById = new Map<number, number>();
  let running = opening;
  for (const t of [...rawTransactions].sort((a, b) => Number(a.id) - Number(b.id))) {
    running += (Number(t.gold_added) || 0) - (Number(t.gold_deducted) || 0);
    runningById.set(Number(t.id), running);
  }
  const transactions = rawTransactions.map((t) => ({ ...t, balance_after: runningById.get(Number(t.id)) ?? t.balance_after }));

  return (
    <AppShell title="Gold Vault">
      <PageHeader
        eyebrow="Inventory"
        title="Gold Vault"
        description="Track every gram entering and leaving the studio. CAD earnings, casting losses and manual adjustments remain visible in one ledger."
        action={
          <div className="flex flex-wrap gap-2">
            <StudioButton variant="outline" onClick={() => downloadPDF("das-and-co-gold-vault.pdf", "DAS & CO - Gold Vault Ledger", transactions.map((t: any) => ({ Date: formatDate(t.transaction_date), Type: t.transaction_type, Added: `${Number(t.gold_added || 0).toFixed(3)} g`, Deducted: `${Number(t.gold_deducted || 0).toFixed(3)} g`, Balance: `${Number(t.balance_after || 0).toFixed(3)} g`, Remarks: t.remarks || t.notes || "" })), { subtitle: `Opening ${formatGold(opening)} · Current balance ${formatGold(balance)}`, summary: [`Total added: ${formatGold(added)}`, `Total deducted: ${formatGold(deducted)}`, `Current balance: ${formatGold(balance)}`] })}><Download size={15} /> Download vault</StudioButton>
            <StudioButton onClick={() => setOpen(true)}><Plus size={16} /> Add transaction</StudioButton>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Opening Balance" value={formatGold(opening)} icon={<Coins size={17} />} />
        <StatCard label="Total Added" value={formatGold(added)} icon={<ArrowUpRight size={17} />} />
        <StatCard label="Total Deducted" value={formatGold(deducted)} icon={<ArrowDownLeft size={17} />} />
        <StatCard label="Current Balance" value={formatGold(balance)} accent icon={<Coins size={17} />} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#8f877e]">
        <span>Current gold value</span>
        <strong className="font-serif text-lg text-[#d3ae50]">{formatINR(balance * rate)}</strong>
        <span>· 22K rate ₹{rate.toLocaleString("en-IN")}/g</span>
      </div>

      <section className="studio-card mt-6 overflow-hidden">
        <div className="border-b border-[#2d251c] px-6 py-5">
          <h3 className="font-serif text-[1.35rem]">Gold Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="studio-table min-w-[900px]">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Added</th>
                <th>Deducted</th>
                <th>Balance</th>
                <th>Remarks</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => (
                <tr key={t.id}>
                  <td className="font-medium text-[#e6ddd0]">{formatDate(t.transaction_date)}</td>
                  <td>
                    <span className={`rounded-full px-3 py-1 text-[11px] ${t.transaction_type === "DEDUCT" ? "bg-red-500/10 text-red-300" : "bg-[#c7a34c]/10 text-[#d3ae50]"}`}>
                      {t.transaction_type}
                    </span>
                  </td>
                  <td className="text-emerald-400">{Number(t.gold_added || 0).toFixed(3)} g</td>
                  <td className="text-red-300">{Number(t.gold_deducted || 0).toFixed(3)} g</td>
                  <td className="text-[#d3ae50]">{Number(t.balance_after || 0).toFixed(3)} g</td>
                  <td>{t.remarks || "—"}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="rounded-full p-2 text-[#827970] hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => {
                        if (window.confirm("Delete this transaction?")) remove.mutate(Number(t.id));
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!transactions.length && (
                <tr><td colSpan={7} className="py-12 text-center text-[#756e66]">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <Modal title="Add gold transaction" onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <StudioSelect value={form.transaction_type} onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}>
              <option value="ADD">Add gold</option>
              <option value="DEDUCT">Deduct gold</option>
            </StudioSelect>

            {form.transaction_type === "ADD" ? (
              <StudioInput
                type="number"
                step="0.001"
                placeholder="Gold added (g)"
                value={form.gold_added}
                onChange={(e) => setForm({ ...form, gold_added: e.target.value })}
              />
            ) : (
              <StudioInput
                type="number"
                step="0.001"
                placeholder="Gold deducted (g)"
                value={form.gold_deducted}
                onChange={(e) => setForm({ ...form, gold_deducted: e.target.value })}
              />
            )}

            <StudioInput
              type="date"
              value={form.transaction_date}
              onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
            />
            <StudioTextarea
              placeholder="Reason / remarks"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-2">
              <StudioButton variant="outline" onClick={() => setOpen(false)}>Cancel</StudioButton>
              <StudioButton disabled={addTransaction.isPending} onClick={() => addTransaction.mutate()}>
                {addTransaction.isPending ? "Saving…" : "Save transaction"}
              </StudioButton>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
