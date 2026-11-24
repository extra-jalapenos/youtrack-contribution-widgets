import { memo } from "react";
import { max, sum } from "d3-array";
import Text from "@jetbrains/ring-ui-built/components/text/text.js";
import Link from "@jetbrains/ring-ui-built/components/link/link.js";
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
    <div className="entry">
      <div className="container">
        <div className="issue">
          <Link className="issue id">{issue.key}</Link>
          <Link className="issue summary">{issue.summary}</Link>
        </div>
      </div>

      <div className="user-activity">
        <div className="user-activity data">
          <div className="user-activity data content">
            <div>
              <div
                className="distribution-bar"
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
                        <Text size={Text.Size.S} className="cd-segment-label">
                          {mode === "percent" ? `${Math.round(share)}%` : formatMinutes(c.minutes)}
                        </Text>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <ul className="cd-legend">
              {issue.contributions.map((c) => (
                <li key={c.id}>
                  <span className="color-swatch" style={{ background: colorScale(c.id) }} />
                  <Text info size={Text.Size.S}>
                    {c.name} · {formatMinutes(c.minutes)}
                  </Text>
                </li>
              ))}
              <li className="cd-legend-total">
                <Text size={Text.Size.S}>Total · {formatMinutes(total)}</Text>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContributionDistribution = memo(ContributionDistributionComponent);
