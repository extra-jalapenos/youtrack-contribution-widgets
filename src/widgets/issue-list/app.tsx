import { memo, useState } from "react";
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

const totalMinutes = (issue: IssueContribution) =>
  issue.contributions.reduce((sum, c) => sum + c.minutes, 0);

// Most total worklog time first, ties broken alphabetically by summary
const issues = loadExampleIssues().sort(
  (a, b) => totalMinutes(b) - totalMinutes(a) || a.summary.localeCompare(b.summary),
);
// In absolute mode all bars are scaled against the issue with the most time
const maxTotalMinutes = issues.length ? totalMinutes(issues[0]) : 0;

// One color per author across all issues, assigned by overall contribution so top contributors get the most distinct colors
const authorMinutes = new Map<string, number>();
issues.forEach((i) =>
  i.contributions.forEach((c) => authorMinutes.set(c.id, (authorMinutes.get(c.id) ?? 0) + c.minutes)),
);
const colorScale = createCategoricalColorScale(
  [...authorMinutes.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id),
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
