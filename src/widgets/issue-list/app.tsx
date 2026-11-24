import { memo, useMemo, useState } from "react";
import { descending, max, rollup, sort, sum } from "d3-array";
import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";

import "../../style/base.css";
import "../../style/svg.css";

import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import ButtonSet from "@jetbrains/ring-ui-built/components/button-set/button-set";
import ButtonToolbar from "@jetbrains/ring-ui-built/components/button-toolbar/button-toolbar";

import { ContributionDistribution, type DistributionMode } from "./ContributionDistribution.tsx";
import { loadExampleIssues } from "./dummyData.ts";
import type { IssueContribution } from "./types.ts";
import { createCategoricalColorScale } from "./colors.ts";

const totalMinutes = (issue: IssueContribution) => sum(issue.contributions, (c) => c.minutes);

const allIssues = loadExampleIssues();

// One color per author across all issues, assigned by overall contribution so top contributors get the most distinct colors
const authorMinutes = rollup(
  allIssues.flatMap((i) => i.contributions),
  (contributions) => sum(contributions, (c) => c.minutes),
  (c) => c.id,
);
const colorScale = createCategoricalColorScale(
  sort(authorMinutes, ([, a], [, b]) => descending(a, b)).map(([id]) => id),
);

// All distinct authors, ordered like the color scale (most contribution first)
const authorNames = new Map(allIssues.flatMap((i) => i.contributions).map((c) => [c.id, c.name]));
const authors = sort(authorMinutes, ([, a], [, b]) => descending(a, b)).map(([id]) => ({
  id,
  name: authorNames.get(id) ?? id,
}));

const AppComponent = () => {
  const [mode, setMode] = useState<DistributionMode>("absolute");
  const [activeAuthors, setActiveAuthors] = useState<ReadonlySet<string>>(
    () => new Set(authors.map((a) => a.id)),
  );

  const toggleAuthor = (id: string) =>
    setActiveAuthors((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  // Only active authors' work is counted; issues without any remaining work are hidden.
  // Most total worklog time first, ties broken alphabetically by summary.
  const issues = useMemo(
    () =>
      sort(
        allIssues
          .map((issue) => ({
            ...issue,
            contributions: issue.contributions.filter((c) => activeAuthors.has(c.id)),
          }))
          .filter((issue) => issue.contributions.length > 0),
        (a, b) => descending(totalMinutes(a), totalMinutes(b)) || a.summary.localeCompare(b.summary),
      ),
    [activeAuthors],
  );
  // In absolute mode all bars are scaled against the issue with the most time
  const maxTotalMinutes = max(issues, totalMinutes) ?? 0;

  // Distribution across all displayed issues, one segment per author (most time first)
  const summary = useMemo<IssueContribution>(() => {
    const byAuthor = rollup(
      issues.flatMap((i) => i.contributions),
      (contributions) => ({
        id: contributions[0].id,
        name: contributions[0].name,
        minutes: sum(contributions, (c) => c.minutes),
      }),
      (c) => c.id,
    );
    return {
      key: "Summary",
      summary: `${issues.length} ${issues.length === 1 ? "issue" : "issues"}`,
      contributions: sort([...byAuthor.values()], (a, b) => descending(a.minutes, b.minutes)),
    };
  }, [issues]);

  return (
    <div className="widget">
      <section id="header" className="component">
        
        <ButtonToolbar>

            <ButtonGroup>
                {authors.map((author) => (
                    <Button key={author.id} active={activeAuthors.has(author.id)} onClick={() => toggleAuthor(author.id)}>
                        {author.name}
                    </Button>
                ))}
            </ButtonGroup>
            <ButtonGroup>
                <Button active={mode === "percent"} onClick={() => setMode("percent")}>
                100%
                </Button>
                <Button active={mode === "absolute"} onClick={() => setMode("absolute")}>
                Absolute
                </Button>
            </ButtonGroup>

        </ButtonToolbar>
      </section>
      {issues.length > 0 && (
        <section id="summary" className="component summary-bar">
          {/* No maxTotalMinutes: the summary bar always spans the full width */}
          <ContributionDistribution issue={summary} colorScale={colorScale} mode={mode} />
        </section>
      )}
      <section id="list" className="component">
        {issues.map((issue) => (
          <ContributionDistribution
            key={issue.key}
            issue={issue}
            colorScale={colorScale}
            mode={mode}
            maxTotalMinutes={maxTotalMinutes}
          />
        ))}
      </section>
    </div>
  );
};

export const App = memo(AppComponent);
