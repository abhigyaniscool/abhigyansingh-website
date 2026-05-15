// Server component: renders site impression stats in a terminal-styled card.

import Link from "next/link";
import { getSiteStats } from "@/lib/stats";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function rel(iso: string | null): string {
  if (!iso) return "never";
  const t = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return `${Math.round(diffSec / 86400)}d ago`;
}

export default async function Stats() {
  const stats = await getSiteStats();

  // Hide the widget completely if no impressions have been recorded yet.
  if (stats.total === 0) return null;

  const maxTop = stats.top[0]?.views ?? 0;

  return (
    <section className="stats">
      <div className="stats-header">
        <span className="stats-prompt">$</span>
        <span className="stats-cmd">stat ./visits</span>
        <span className="stats-tail">— last: {rel(stats.lastViewedAt)}</span>
      </div>
      <div className="stats-grid">
        <div className="stats-cell">
          <div className="stats-cell-label">total_impressions</div>
          <div className="stats-cell-value">{fmt(stats.total)}</div>
        </div>
        <div className="stats-cell">
          <div className="stats-cell-label">home_views</div>
          <div className="stats-cell-value">{fmt(stats.homeViews)}</div>
        </div>
        <div className="stats-cell">
          <div className="stats-cell-label">pages_published</div>
          <div className="stats-cell-value">{fmt(stats.pageCount)}</div>
        </div>
      </div>

      {stats.top.length > 0 && (
        <div className="stats-top">
          <div className="stats-top-title">$ ./most_visited</div>
          <ol className="stats-top-list">
            {stats.top.map((row) => {
              const pct = maxTop > 0 ? Math.round((row.views / maxTop) * 100) : 0;
              return (
                <li key={row.slug} className="stats-top-row">
                  <Link href={`/p/${row.slug}`} className="stats-top-link">
                    {row.title}
                  </Link>
                  <span className="stats-top-bar" aria-hidden="true">
                    <span className="stats-top-bar-fill" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="stats-top-count">{fmt(row.views)}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
