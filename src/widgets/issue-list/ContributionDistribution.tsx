import { memo, useLayoutEffect, useRef, useState } from "react";
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

/** Horizontal space kept free around a segment's label. */
const LABEL_PADDING_PX = 8;

interface SegmentProps {
  share: number;
  background: string;
  title: string;
  label: string;
}

/** One bar segment; its label is only shown when it fits inside the segment. */
const Segment = ({ share, background, title, label }: SegmentProps) => {
  const segmentRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(false);

  useLayoutEffect(() => {
    const segment = segmentRef.current;
    const labelEl = labelRef.current;
    if (!segment || !labelEl) {return;}
    const update = () =>
      setFits(labelEl.offsetWidth + LABEL_PADDING_PX <= segment.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(segment);
    return () => observer.disconnect();
  }, [label]);

  return (
    <div
      ref={segmentRef}
      className="cd-segment"
      style={{
        flexBasis: `${share}%`,
        background,
        color: foregroundFor(background),
      }}
      title={title}
    >
      {/* Always rendered so it can be measured; hidden while it doesn't fit */}
      <span
        ref={labelRef}
        className="cd-segment-label"
        style={{ visibility: fits ? "visible" : "hidden" }}
      >
        <Text size={Text.Size.S}>{label}</Text>
      </span>
    </div>
  );
};

const ContributionDistributionComponent = ({
  issue,
  colorScale,
  mode,
  maxTotalMinutes,
}: Props) => {
  const total = sum(issue.contributions, (c) => c.minutes);
  const scaleBase =
    mode === "percent"
      ? total
      : (max([maxTotalMinutes ?? total, total]) ?? total);
  const barWidthPct = scaleBase > 0 ? (total / scaleBase) * 100 : 0;

  return (
    <div className="entry">
      <div className="container">
        <div className="issue">
          <Link className="issue id">{issue.key}</Link>
          <Link className="issue summary">{issue.summary}</Link>
        </div>
      </div>

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
            <Segment
              key={c.id}
              share={share}
              background={background}
              title={`${c.name}: ${formatMinutes(c.minutes)} (${share.toFixed(1)}%)`}
              label={
                mode === "percent"
                  ? `${Math.round(share)}%`
                  : formatMinutes(c.minutes)
              }
            />
          );
        })}
      </div>
      <div className="legend">
        {issue.contributions.map((c) => (
          <div key={c.id}>
            <span
              className="color-swatch"
              style={{ background: colorScale(c.id) }}
            />
            <Text info size={Text.Size.S}>
              {c.name} · {formatMinutes(c.minutes)}
            </Text>
          </div>
        ))}
        <div>
          <Text size={Text.Size.S}>Total · {formatMinutes(total)}</Text>
        </div>
      </div>
    </div>
  );
};

export const ContributionDistribution = memo(ContributionDistributionComponent);
