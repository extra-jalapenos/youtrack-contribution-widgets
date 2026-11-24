import { memo, useState } from "react";
import { descending, max, rollup, sort, sum } from "d3-array";
import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";

import "../../style/base.css";
import "../../style/svg.css";

import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import ButtonToolbar from "@jetbrains/ring-ui-built/components/button-toolbar/button-toolbar";

import { ContributionDistribution, type DistributionMode } from "./ContributionDistribution.tsx";
import { loadExampleIssues } from "./dummyData.ts";
import type { IssueContribution } from "./types.ts";
import { createCategoricalColorScale } from "./colors.ts";

const totalMinutes = (issue: IssueContribution) => sum(issue.contributions, (c) => c.minutes);

// Most total worklog time first, ties broken alphabetically by summary
const issues = sort(
  loadExampleIssues(),
  (a, b) => descending(totalMinutes(a), totalMinutes(b)) || a.summary.localeCompare(b.summary),
);
// In absolute mode all bars are scaled against the issue with the most time
const maxTotalMinutes = max(issues, totalMinutes) ?? 0;

// One color per author across all issues, assigned by overall contribution so top contributors get the most distinct colors
const authorMinutes = rollup(
  issues.flatMap((i) => i.contributions),
  (contributions) => sum(contributions, (c) => c.minutes),
  (c) => c.id,
);
const colorScale = createCategoricalColorScale(
  sort(authorMinutes, ([, a], [, b]) => descending(a, b)).map(([id]) => id),
);

const AppComponent = () => {
  const [mode, setMode] = useState<DistributionMode>("percent");

  return (
    <div className="widget">
      <section id="header" className="component">
        <ButtonToolbar>
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
