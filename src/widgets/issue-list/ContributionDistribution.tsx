import { memo } from "react";
import type { IssueContribution } from "./types";
import { formatMinutes } from "./dummyData";

export type DistributionMode = "percent" | "absolute";

// Categorical palette, readable on light and dark backgrounds
const COLORS = ["#4C78A8", "#F58518", "#54A24B", "#B279A2", "#E45756", "#72B7B2"];

interface Props {
  issue: IssueContribution;
  mode: DistributionMode;
  /** Largest total across all displayed issues; the absolute-mode bar scales against it. */
  maxTotalMinutes?: number;
}

const ContributionDistributionComponent = ({ issue, mode, maxTotalMinutes }: Props) => {
  const total = issue.contributions.reduce((sum, c) => sum + c.minutes, 0);
  const scaleBase = mode === "percent" ? total : Math.max(maxTotalMinutes ?? total, total);
  const barWidthPct = scaleBase > 0 ? (total / scaleBase) * 100 : 0;

  return (
    <article className="contribution-distribution">
      <header className="cd-header">
        <span className="cd-key">{issue.key}</span>
        <span className="cd-summary">{issue.summary}</span>
        <span className="cd-total">{formatMinutes(total)} total</span>
      </header>

      <div className="cd-track">
        <div
          className="cd-bar"
          role="img"
          aria-label={issue.contributions
            .map((c) => `${c.name}: ${formatMinutes(c.minutes)}`)
            .join(", ")}
          style={{ width: `${barWidthPct}%` }}
        >
          {issue.contributions.map((c, i) => {
            const share = total > 0 ? (c.minutes / total) * 100 : 0;
            return (
              <div
                key={c.id}
                className="cd-segment"
                style={{ flexBasis: `${share}%`, background: COLORS[i % COLORS.length] }}
                title={`${c.name}: ${formatMinutes(c.minutes)} (${share.toFixed(1)}%)`}
              >
                {share >= 12 && (
                  <span className="cd-segment-label">
                    {mode === "percent" ? `${Math.round(share)}%` : formatMinutes(c.minutes)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ul className="cd-legend">
        {issue.contributions.map((c, i) => (
          <li key={c.id}>
            <span className="cd-swatch" style={{ background: COLORS[i % COLORS.length] }} />
            {c.name} · {formatMinutes(c.minutes)}
          </li>
        ))}
      </ul>
    </article>
  );
};

export const ContributionDistribution = memo(ContributionDistributionComponent);
