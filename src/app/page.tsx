
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";

type CsvRow = Record<string, string>;
type KeepMode = "first" | "last";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const PREVIEW_LIMIT = 8;

function normalizeValue(value: unknown): string {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadCsv(rows: CsvRow[], filename: string) {
  if (rows.length === 0) return;

  const csv = Papa.unparse(rows, {
    columns: Object.keys(rows[0]),
    newline: "\r\n",
  });

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [keepMode, setKeepMode] = useState<KeepMode>("first");
  const [cleanedRows, setCleanedRows] = useState<CsvRow[] | null>(null);
  const [duplicateRows, setDuplicateRows] = useState<CsvRow[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  function resetResults() {
    setCleanedRows(null);
    setDuplicateRows([]);
    setNotice("");
  }

  function handleFile(selectedFile?: File) {
    if (!selectedFile) return;

    setError("");
    setNotice("");
    resetResults();

    const isCsv =
      selectedFile.name.toLowerCase().endsWith(".csv") ||
      selectedFile.type === "text/csv" ||
      selectedFile.type === "application/vnd.ms-excel";

    if (!isCsv) {
      setError("Please choose a CSV file (.csv).");
      return;
    }

    if (selectedFile.size === 0) {
      setError("This file is empty. Choose a CSV containing data.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("This file exceeds the 50 MB limit for this version.");
      return;
    }

    setBusy(true);
    setFile(selectedFile);
    setRows([]);
    setHeaders([]);
    setSelectedColumns([]);

    Papa.parse<CsvRow>(selectedFile, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        setBusy(false);

        const parsedHeaders = result.meta.fields ?? [];
        const validHeaders = parsedHeaders.filter(
          (header) => header.trim().length > 0
        );

        if (validHeaders.length === 0) {
          setError(
            "No usable column headers were found. Check that the first row contains column names."
          );
          setFile(null);
          return;
        }

        if (result.errors.length > 0) {
          const firstError = result.errors[0];
          setError(
            `We couldn't safely read this CSV: ${firstError.message}. Check the file formatting and try again.`
          );
          setFile(null);
          return;
        }

        const parsedRows = result.data.filter((row) =>
          validHeaders.some((header) => String(row[header] ?? "").length > 0)
        );

        if (parsedRows.length === 0) {
          setError("No data rows were found beneath the column headers.");
          setFile(null);
          return;
        }

        setHeaders(validHeaders);
        setRows(parsedRows);
        setSelectedColumns(validHeaders);
        setNotice(
          `Loaded ${parsedRows.length.toLocaleString()} rows and ${validHeaders.length} columns.`
        );
      },
      error: () => {
        setBusy(false);
        setFile(null);
        setError("We couldn't read this file. Please try another CSV.");
      },
    });
  }

  function toggleColumn(column: string) {
    resetResults();
    setSelectedColumns((current) =>
      current.includes(column)
        ? current.filter((item) => item !== column)
        : [...current, column]
    );
  }


  function cleanData() {
    setError("");
    setNotice("");

    if (rows.length === 0 || selectedColumns.length === 0) {
      setError("Select at least one column to identify duplicate records.");
      return;
    }

    const columns = headers.filter((header) =>
      selectedColumns.includes(header)
    );

    // Rows with no values in any selected matching column
    // are preserved rather than incorrectly merged together.
    function keyFor(row: CsvRow): string | null {
      const values = columns.map((column) =>
        normalizeValue(row[column])
      );

      if (values.every((value) => value === "")) {
        return null;
      }

      return JSON.stringify(values);
    }

    const lastIndex = new Map<string, number>();

    if (keepMode === "last") {
      rows.forEach((row, index) => {
        const key = keyFor(row);
        if (key !== null) {
          lastIndex.set(key, index);
        }
      });
    }

    const seen = new Set<string>();
    const unique: CsvRow[] = [];
    const duplicates: CsvRow[] = [];

    rows.forEach((row, index) => {
      const key = keyFor(row);

      // Missing matching values should not cause records to disappear.
      if (key === null) {
        unique.push(row);
        return;
      }

      if (keepMode === "first") {
        if (seen.has(key)) {
          duplicates.push(row);
        } else {
          seen.add(key);
          unique.push(row);
        }
      } else {
        if (lastIndex.get(key) === index) {
          unique.push(row);
        } else {
          duplicates.push(row);
        }
      }
    });

    setCleanedRows(unique);
    setDuplicateRows(duplicates);

    setNotice(
      duplicates.length === 0
        ? "No duplicate records found under the selected matching rules."
        : `Finished! Found ${duplicates.length.toLocaleString()} duplicate rows.`
    );
  }


  function resetAll() {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setSelectedColumns([]);
    setCleanedRows(null);
    setDuplicateRows([]);
    setError("");
    setNotice("");
    setKeepMode("first");
    if (inputRef.current) inputRef.current.value = "";
  }

  const duplicateCount = duplicateRows.length;
  const uniqueCount = cleanedRows?.length ?? 0;
  const reduction =
    cleanedRows !== null && rows.length > 0
      ? ((duplicateCount / rows.length) * 100).toFixed(1)
      : "0.0";

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="CleanCSV home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white">
              C
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">
                CleanCSV
              </span>
              <span className="block text-xs text-slate-500">
                Data cleaning, made simple
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Files stay on your device
          </div>
          <span className="text-xs font-medium text-slate-500 sm:hidden">
            Private by design
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
            <span aria-hidden="true">✦</span>
            Your spreadsheet cleanup workspace
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Good data starts with
            <span className="mt-2 block text-emerald-600">
              no duplicates.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Find duplicate records, keep the rows you want, and export clean
            CSV files in seconds. No account required. Your file stays in your
            browser.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: "⌁",
              title: "Match your way",
              text: "Choose email, ID, phone, or multiple columns.",
            },
            {
              icon: "◈",
              title: "Private processing",
              text: "Your CSV contents aren't uploaded to our server.",
            },
            {
              icon: "↓",
              title: "Export with confidence",
              text: "Download your clean data and removed rows.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl font-semibold text-emerald-700">
                {item.icon}
              </span>
              <div>
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="text-lg font-bold">CSV de-duplicator</h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload a file to begin cleaning your data.
              </p>
            </div>
            {file && (
              <button
                type="button"
                onClick={resetAll}
                className="self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:self-auto"
              >
                Start over
              </button>
            )}
          </div>

          <div className="space-y-7 p-5 sm:p-7">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                handleFile(event.dataTransfer.files[0]);
              }}
              className={`rounded-2xl border-2 border-dashed px-5 py-10 text-center transition sm:py-14 ${dragging
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-300 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/40"
                }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                aria-label="Choose a CSV file"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl text-emerald-700">
                ↑
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {file ? file.name : "Drop your CSV file here"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {file
                  ? `${formatBytes(file.size)} · ${rows.length.toLocaleString()} rows loaded`
                  : "Or choose a file from your computer"}
              </p>

              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? "Reading your file..." : file ? "Choose another file" : "Choose CSV file"}
              </button>
              <p className="mt-4 text-xs text-slate-400">
                CSV format · Up to 50 MB · Processed locally
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <strong className="font-semibold">Something needs attention: </strong>
                {error}
              </div>
            )}

            {notice && !error && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              >
                {notice}
              </div>
            )}

            {headers.length > 0 && (
              <>
                <div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold">
                        1. Choose matching columns
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Rows are duplicates when all selected column values
                        match, ignoring capitalization and surrounding spaces.
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedColumns(headers);
                          resetResults();
                        }}
                        className="font-medium text-emerald-700 hover:text-emerald-900"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedColumns([]);
                          resetResults();
                        }}
                        className="font-medium text-slate-500 hover:text-slate-800"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {headers.map((header) => {
                      const checked = selectedColumns.includes(header);
                      return (
                        <label
                          key={header}
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${checked
                            ? "border-emerald-300 bg-emerald-50/70"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleColumn(header)}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <span className="break-all font-medium">{header}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedColumns.length} of {headers.length} columns selected
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold">2. Choose which record to keep</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      aria-pressed={keepMode === "first"}
                      onClick={() => {
                        setKeepMode("first");
                        resetResults();
                      }}
                      className={`rounded-xl border p-4 text-left transition ${keepMode === "first"
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <span className="block text-sm font-semibold">
                        Keep first occurrence
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        Preserve the first matching row and remove later copies.
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={keepMode === "last"}
                      onClick={() => {
                        setKeepMode("last");
                        resetResults();
                      }}
                      className={`rounded-xl border p-4 text-left transition ${keepMode === "last"
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <span className="block text-sm font-semibold">
                        Keep last occurrence
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        Preserve the last matching row and remove earlier copies.
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busy || selectedColumns.length === 0}
                  onClick={cleanData}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <span aria-hidden="true">✦</span>
                  Find and remove duplicates
                </button>
              </>
            )}

            {cleanedRows !== null && (
              <div className="space-y-6 border-t border-slate-200 pt-7">
                <div>
                  <h3 className="text-lg font-bold">Your cleaning results</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Review the summary before downloading your files.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Original rows</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums">
                      {rows.length.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-800">Unique rows kept</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-800">
                      {uniqueCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">Duplicates removed</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums text-amber-800">
                      {duplicateCount.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-amber-800">
                      {reduction}% of original rows
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      downloadCsv(cleanedRows, "cleancsv-cleaned.csv")
                    }
                    className="min-h-11 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    ↓ Download cleaned CSV
                  </button>
                  <button
                    type="button"
                    disabled={duplicateRows.length === 0}
                    onClick={() =>
                      downloadCsv(duplicateRows, "cleancsv-duplicates.csv")
                    }
                    className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓ Download duplicates
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold">Cleaned data preview</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Showing up to {PREVIEW_LIMIT} of {cleanedRows.length.toLocaleString()} kept rows.
                  </p>

                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-max border-collapse text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {headers.map((header) => (
                            <th
                              key={header}
                              className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-700"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cleanedRows.slice(0, PREVIEW_LIMIT).map((row, index) => (
                          <tr key={index} className="odd:bg-white even:bg-slate-50/70">
                            {headers.map((header) => (
                              <td
                                key={header}
                                className="max-w-64 truncate border-b border-slate-100 px-4 py-3 text-slate-600"
                                title={row[header] ?? ""}
                              >
                                {row[header] ?? ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {cleanedRows.length === 0 && (
                    <p className="mt-3 text-sm text-slate-500">
                      No rows remain after cleaning.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        <footer className="mx-auto mt-8 max-w-5xl text-center text-xs leading-6 text-slate-500">
          <p>
            CleanCSV processes your selected file in your browser. This
            application does not upload CSV contents to a backend.
          </p>
          <p className="mt-1">
            Always review exported data before using it for important business
            operations.
          </p>
          <nav
            aria-label="Legal"
            className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2"
          >
            <Link
              href="/privacy"
              className="font-medium text-emerald-700 hover:text-emerald-900"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-medium text-emerald-700 hover:text-emerald-900"
            >
              Terms of Service
            </Link>
          </nav>
          <p className="mt-4">© 2026 CleanCSV</p>
        </footer>

      </section>
    </main>
  );
}
