import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Download, Save, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, StudioButton, StudioField, StudioInput } from "@/components/app/ManagementUI";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });
const defaults = { business_name: "DAS & CO", email: "", phone: "", address: "", opening_gold_balance: "0", default_percentage: "2", rate_24k: "0", rate_22k: "8500", rate_18k: "0" };

function SettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(defaults);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  const { data, isLoading, error } = useQuery({ queryKey: ["settings"], queryFn: async () => { const result = await apiFetch<any>("/settings"); return result?.settings || result || {}; }, staleTime: 60_000, retry: 0 });
  useEffect(() => { const local = localStorage.getItem("das-settings"); if (local) setForm({ ...defaults, ...JSON.parse(local) }); }, []);
  useEffect(() => { if (data && typeof data === "object") setForm((f) => ({ ...f, ...data })); }, [data]);
  const save = useMutation({ mutationFn: () => apiFetch("/settings", { method: "PUT", body: JSON.stringify({ ...form, opening_gold_balance: Number(form.opening_gold_balance || 0), default_percentage: Number(form.default_percentage || 2), rate_24k: Number(form.rate_24k || 0), rate_22k: Number(form.rate_22k || 0), rate_18k: Number(form.rate_18k || 0) }) }), onSuccess: () => localStorage.setItem("das-settings", JSON.stringify(form)) });
  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  // ---------------------------------------------------
  // Export — downloads every client, order, expense, gold
  // ledger entry and setting as one JSON file.
  // ---------------------------------------------------
  const exportData = useMutation({
    mutationFn: () => apiFetch<any>("/settings/export"),
    onSuccess: (result) => {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `das-and-co-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  // ---------------------------------------------------
  // Import — replaces all business data with a previously
  // exported JSON file.
  // ---------------------------------------------------
  const importData = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const parsed = JSON.parse(text);
      return apiFetch("/settings/import", { method: "POST", body: JSON.stringify({ data: parsed.data || parsed }) });
    },
    onSuccess: () => {
      qc.invalidateQueries();
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  // ---------------------------------------------------
  // Reset — permanently deletes all clients, orders,
  // expenses and gold ledger entries.
  // ---------------------------------------------------
  const resetData = useMutation({
    mutationFn: () => apiFetch("/settings/reset", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries();
      setResetOpen(false);
      setResetConfirm("");
    },
  });

  return <AppShell title="Settings"><PageHeader eyebrow="Configuration" title="Settings" description="Manage studio defaults and gold rates. Settings also remain available locally if the API is temporarily unavailable." action={<StudioButton onClick={() => save.mutate()} disabled={save.isPending}><Save size={15} /> {save.isPending ? "Saving…" : "Save settings"}</StudioButton>} />
    {error && <div className="mb-5 rounded-xl border border-[#4a3924] bg-[#17120d] p-4 text-sm text-[#b8afa5]">The settings API is unavailable, so this page is using local browser settings. You can still save and use the application.</div>}
    {isLoading && !data ? <div className="studio-card p-8 text-center text-[#756e66]">Loading settings…</div> : <div className="grid gap-5 lg:grid-cols-2">
      <section className="studio-card p-6"><h3 className="font-serif text-xl">Studio details</h3><div className="mt-5 space-y-4">
        <StudioField label="Business name"><StudioInput value={form.business_name} onChange={(e) => update("business_name", e.target.value)} /></StudioField>
        <StudioField label="Email"><StudioInput type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></StudioField>
        <StudioField label="Phone"><StudioInput value={form.phone} onChange={(e) => update("phone", e.target.value)} /></StudioField>
        <StudioField label="Address"><StudioInput value={form.address} onChange={(e) => update("address", e.target.value)} /></StudioField>
      </div></section>
      <section className="studio-card p-6"><h3 className="font-serif text-xl">Gold & earnings</h3><div className="mt-5 grid gap-4 sm:grid-cols-2">
        <StudioField label="Opening gold balance (g)"><StudioInput type="number" step="0.001" value={form.opening_gold_balance} onChange={(e) => update("opening_gold_balance", e.target.value)} /></StudioField>
        <StudioField label="Default earning %"><StudioInput type="number" step="0.01" suffix="%" value={form.default_percentage} onChange={(e) => update("default_percentage", e.target.value)} /></StudioField>
        <StudioField label="24K rate / g"><StudioInput type="number" value={form.rate_24k} onChange={(e) => update("rate_24k", e.target.value)} /></StudioField>
        <StudioField label="22K rate / g"><StudioInput type="number" value={form.rate_22k} onChange={(e) => update("rate_22k", e.target.value)} /></StudioField>
      </div></section>
    </div>}
    {save.isError && <p className="mt-4 text-sm text-red-300">{(save.error as Error).message}</p>}{save.isSuccess && <p className="mt-4 text-sm text-emerald-300">Settings saved.</p>}

    <section className="studio-card mt-5 p-6">
      <h3 className="font-serif text-xl">Data management</h3>
      <p className="mt-2 text-sm text-[#8f877f]">Back up every client, order, expense and gold entry, restore from a backup, or wipe all business data and start fresh.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StudioButton variant="outline" onClick={() => exportData.mutate()} disabled={exportData.isPending}>
          <Download size={15} /> {exportData.isPending ? "Exporting…" : "Export data"}
        </StudioButton>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) importData.mutate(file); }}
          />
          <StudioButton variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={importData.isPending}>
            <Upload size={15} /> {importData.isPending ? "Importing…" : "Import data"}
          </StudioButton>
        </div>

        <StudioButton variant="outline" className="!border-red-500/30 !text-red-300 hover:!bg-red-500/10" onClick={() => setResetOpen(true)}>
          <AlertTriangle size={15} /> Reset all data
        </StudioButton>
      </div>

      {exportData.isError && <p className="mt-3 text-sm text-red-300">{(exportData.error as Error).message}</p>}
      {importData.isError && <p className="mt-3 text-sm text-red-300">{(importData.error as Error).message}</p>}
      {importData.isSuccess && <p className="mt-3 text-sm text-emerald-300">Data imported successfully.</p>}
      {resetData.isError && <p className="mt-3 text-sm text-red-300">{(resetData.error as Error).message}</p>}

      {resetOpen && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-red-300"><AlertTriangle size={16} /> This permanently deletes every client, order, expense and gold entry. This cannot be undone.</p>
          <p className="mt-3 text-xs text-[#b8afa5]">Consider exporting a backup first. Type <b>RESET</b> below to confirm.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StudioInput className="max-w-[180px]" value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} placeholder="Type RESET" />
            <StudioButton
              variant="outline"
              className="!border-red-500/40 !text-red-300 hover:!bg-red-500/15"
              disabled={resetConfirm !== "RESET" || resetData.isPending}
              onClick={() => resetData.mutate()}
            >
              {resetData.isPending ? "Resetting…" : "Confirm reset"}
            </StudioButton>
            <StudioButton variant="ghost" onClick={() => { setResetOpen(false); setResetConfirm(""); }}>Cancel</StudioButton>
          </div>
        </div>
      )}
    </section>
  </AppShell>;
}
