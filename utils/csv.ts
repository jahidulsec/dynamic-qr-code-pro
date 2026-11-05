// quotes every cell and neutralises leading =, +, -, @ so spreadsheets don't run them as formulas
const cell = (value: unknown) => {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const toCsv = (header: string[], rows: unknown[][]) =>
  // BOM so Excel reads UTF-8 (Bangla names) correctly
  "﻿" + [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";

// browser only: saves a CSV string returned by a server action
export const downloadCsv = (fileName: string, csv: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
