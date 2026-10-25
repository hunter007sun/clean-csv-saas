
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how CleanCSV handles files, personal information, and website data.",
};

export default function PrivacyPage() {
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
          PRIVACY & DATA
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: October 26, 2026
        </p>

        <div className="mt-10 space-y-8 leading-7 text-slate-600">
          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Overview
            </h2>
            <p className="mt-3">
              CleanCSV is a browser-based tool for identifying duplicate
              records in CSV files. This policy explains how the current
              version handles files and information when you use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              2. Your CSV files
            </h2>
            <p className="mt-3">
              CSV parsing, duplicate detection, and CSV export are performed
              in your browser. The application code is designed to process
              the selected file locally and does not intentionally upload CSV
              contents to a CleanCSV backend.
            </p>
            <p className="mt-3">
              Your browser temporarily holds file data in memory while you use
              the tool. Reset the tool and close the page when you finish.
              Downloaded files are saved wherever your browser normally saves
              downloads.
            </p>
            <p className="mt-3">
              This statement describes the current application design. Hosting
              providers, browser extensions, device software, or future
              third-party integrations may have their own data practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              3. Information collected by the website
            </h2>
            <p className="mt-3">
              The current tool does not require an account. The application
              code provided for this version does not include a CleanCSV
              database or analytics integration for storing CSV contents.
              Hosting infrastructure may process technical information such
              as IP addresses, request logs, and security events according to
              its own policies.
            </p>
            <p className="mt-3">
              If analytics, accounts, payments, support forms, or other
              third-party services are introduced, this policy must be updated
              to accurately describe what they collect and why.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              4. Data security
            </h2>
            <p className="mt-3">
              Processing files in your browser reduces the need to send their
              contents to a server. However, no website or device can guarantee
              absolute security. Use a trusted, up-to-date browser and avoid
              using shared devices for sensitive files.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Your choices
            </h2>
            <p className="mt-3">
              You can choose which CSV file to process, download the results,
              and stop using the tool at any time. Do not upload files you are
              not authorized to access or process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              6. Children
            </h2>
            <p className="mt-3">
              CleanCSV is a general-purpose productivity tool and is not
              intended to be directed at children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              7. Changes to this policy
            </h2>
            <p className="mt-3">
              This policy may be updated as the service changes. The latest
              version will be published on this page with a revised update
              date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Contact
            </h2>
            <p className="mt-3">
              Before launch, the operator of CleanCSV should publish a
              monitored contact method here for privacy questions and
              requests.
            </p>
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Launch checklist: add your real business or operator details
              and a working contact address before publishing this policy.
              Do not leave placeholder contact information on the live site.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm">
          <Link href="/terms" className="font-medium text-emerald-700">
            Read the Terms of Service →
          </Link>
        </div>
      </article>
    </main>
  );
}
