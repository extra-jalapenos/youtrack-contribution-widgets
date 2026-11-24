import { memo } from "react";
import { max, sum } from "d3-array";
import type { IssueContribution } from "./types";
import { formatMinutes } from "./dummyData";
import { foregroundFor } from "./colors";

export type DistributionMode = "percent" | "absolute";

interface Props {
  issue: IssueContribution;
  /** Maps author id to a background color; shared across issues so authors keep their color. */
  colorScale: (authorId: string) => string;
  mode: DistributionMode;
  /** Largest total across all displayed issues; the absolute-mode bar scales against it. */
  maxTotalMinutes?: number;
}

const ContributionDistributionComponent = ({ issue, colorScale, mode, maxTotalMinutes }: Props) => {
  const total = sum(issue.contributions, (c) => c.minutes);
  const scaleBase = mode === "percent" ? total : (max([maxTotalMinutes ?? total, total]) ?? total);
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
          {issue.contributions.map((c) => {
            const share = total > 0 ? (c.minutes / total) * 100 : 0;
            const background = colorScale(c.id);
            return (
              <div
                key={c.id}
                className="cd-segment"
                style={{ flexBasis: `${share}%`, background, color: foregroundFor(background) }}
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
        {issue.contributions.map((c) => (
          <li key={c.id}>
            <span className="cd-swatch" style={{ background: colorScale(c.id) }} />
            {c.name} · {formatMinutes(c.minutes)}
          </li>
        ))}
      </ul>
    </article>
  );
};

export const ContributionDistribution = memo(ContributionDistributionComponent);
