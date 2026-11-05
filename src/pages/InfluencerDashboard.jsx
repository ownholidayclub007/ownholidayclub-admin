import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  LogOut,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { logout } from "../utils/auth";

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/api/influencers/dashboard")
      .then(({ data }) => {
        if (active) setDashboard(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your referral dashboard.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch (copyError) {
      console.error("Copy referral code failed:", copyError);
      setError("Could not copy the referral code. Please try again.");
    }
  };

  const handleShareCode = async (code) => {
    try {
      if (navigator.share) {
        await navigator.share({ text: `Use my Own Holiday Club referral code: ${code}` });
        return;
      }
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `Use my Own Holiday Club referral code: ${code}`,
        )}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (shareError) {
      if (shareError.name === "AbortError") return;
      console.error("Share referral code failed:", shareError);
      setError("Could not share the referral code. Please try again.");
    }
  };

  const codes = dashboard?.referralCodes || [];
  const referralContactName = codes.find(
    (code) => typeof code.referrerName === "string" && code.referrerName.trim(),
  )?.referrerName.trim();
  const displayName =
    referralContactName || dashboard?.influencer?.name || "Influencer";

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <a href="/influencer-dashboard" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Own Holiday Club"
              className="h-10 w-auto object-contain sm:h-12"
            />
            <span className="hidden h-8 border-l border-slate-200 sm:block" />
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">
              Partner Portal
            </span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:px-4"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-9">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <section className="relative isolate overflow-hidden rounded-xl border border-rose-100 bg-gradient-to-r from-[#fff8f8] via-[#fffafa] to-[#fff4f4] px-5 py-6 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-14 -top-24 -z-10 h-64 w-64 rounded-full border-[32px] border-rose-100/60" />
            <div className="pointer-events-none absolute -bottom-32 right-36 -z-10 h-56 w-56 rounded-full border-[24px] border-rose-100/50" />
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9f2639]">
                  <Sparkles size={14} />
                  Influencer portal
                </span>
                <p className="mt-5 text-sm font-medium text-slate-500">
                  Welcome back{dashboard?.influencer?.name ? "," : ""}
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {dashboard ? displayName : "Your referral dashboard"}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  Your referral performance and codes, all in one place.
                </p>
              </div>
              {dashboard?.influencer?.username && (
                <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 sm:min-w-48">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Account
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    @{dashboard.influencer.username}
                  </p>
                </div>
              )}
            </div>
          </section>

        <section
          aria-label="Referral performance summary"
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <article className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#bd1733]">
              <Users size={23} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Memberships attributed to your codes
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {dashboard?.totalMemberships ?? "—"}
              </p>
            </div>
          </article>
          <article className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Share2 size={22} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Your referral codes</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {dashboard ? codes.length : "—"}
              </p>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm text-slate-500">
              Share your code and keep track of your referrals.
            </p>
          </div>

          {!dashboard ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Loading your referral dashboard...
            </div>
          ) : codes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Share2 size={22} />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">No codes assigned yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Please contact your administrator to get a referral code assigned.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {codes.map((code) => (
                <article
                  key={code._id}
                  className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Referral code
                      </p>
                      <p className="mt-2 text-3xl font-extrabold tracking-[0.08em] text-[#bd1733]">
                        {code.code}
                      </p>
                      <span
                        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          code.isActive === false
                            ? "bg-slate-100 text-slate-600"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            code.isActive === false ? "bg-slate-400" : "bg-emerald-500"
                          }`}
                        />
                        {code.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                    <div className="min-w-24 rounded-xl bg-slate-50 px-4 py-3 text-right">
                      <p className="text-xs font-medium text-slate-500">Memberships</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {Number(code.membershipCount || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-6">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(code.code)}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-100"
                    >
                      {copiedCode === code.code ? <Check size={16} /> : <Copy size={16} />}
                      {copiedCode === code.code ? "Copied" : "Copy code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareCode(code.code)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#bd1733] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#a3132b]"
                    >
                      <Share2 size={16} />
                      Share code
                      <ArrowUpRight size={15} className="opacity-75" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Own Holiday Club. All rights reserved.
        </footer>
      </div>
      </div>
    </main>
  );
}
