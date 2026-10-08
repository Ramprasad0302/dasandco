export function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) {
    const csv = "No data\n";
    downloadBlob(filename, csv, "text/csv;charset=utf-8");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");

  downloadBlob(filename, csv, "text/csv;charset=utf-8");
}

export function downloadJSON(filename: string, data: unknown) {
  downloadBlob(filename, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadBlob(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
