
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms governing the use of the CleanCSV CSV cleaning tool.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-xl font-bold">
            <span className="text-emerald-600">C</span> CleanCSV
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            Back to the tool
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <p className="text-sm font-semibold text-emerald-700">
          SERVICE TERMS
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: October 26, 2026
        </p>

        <div className="mt-10 space-y-8 leading-7 text-slate-600">
          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Accepting these terms
            </h2>
            <p className="mt-3">
              By accessing or using CleanCSV, you agree to these terms. If you
              do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              2. What the service does
            </h2>
            <p className="mt-3">
              CleanCSV provides a browser-based tool to identify duplicate
              rows in CSV files and export results. You choose the matching
              columns and whether to keep the first or last matching record.
            </p>
            <p className="mt-3">
              You are responsible for reviewing the settings and exported
              files to ensure they meet your needs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              3. Your files and responsibilities
            </h2>
            <p className="mt-3">
              You must have the rights and permissions necessary to access,
              process, and use any file you select. You are responsible for
              complying with applicable privacy, confidentiality, and data
              protection requirements.
            </p>
            <p className="mt-3">
              Keep your own backup of important data. Verify exported results
              before using them in a CRM, business workflow, or other
              important system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              4. Acceptable use
            </h2>
            <p className="mt-3">
              Do not use CleanCSV for unlawful activity, to violate another
              person&apos;s rights, to interfere with the service, or to attempt
              unauthorized access to systems or data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Availability and changes
            </h2>
            <p className="mt-3">
              The service is provided as available. Features, file-size
              limits, and supported behavior may change as the product
              develops. We may suspend or discontinue features when reasonably
              necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              6. No guarantee of error-free results
            </h2>
            <p className="mt-3">
              CSV files can contain formatting issues, unexpected headers, or
              data that requires human judgment. CleanCSV does not guarantee
              that every duplicate will be identified or that every exported
              file will be suitable for a particular purpose. Check your
              results before relying on them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              7. Liability
            </h2>
            <p className="mt-3">
              To the extent permitted by applicable law, CleanCSV is provided
              without warranties that cannot lawfully be excluded. Nothing in
              these terms excludes liability that cannot legally be excluded
              or limited. Any other limitations must be interpreted subject
              to applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Changes to these terms
            </h2>
            <p className="mt-3">
              Updated terms will be published on this page with a revised
              update date. Continued use after changes take effect may be
              subject to the updated terms, where permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              9. Contact
            </h2>
            <p className="mt-3">
              The service operator should publish a working contact method
              here before launch for questions about these terms.
            </p>
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Launch checklist: identify the service operator and obtain
              appropriate legal review for your business and target markets.
              These general terms are a starting point, not legal advice.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm">
          <Link href="/privacy" className="font-medium text-emerald-700">
            Read the Privacy Policy →
          </Link>
        </div>
      </article>
    </main>
  );
}
