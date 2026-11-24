import { memo, useState } from "react";
import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";

import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import ButtonToolbar from "@jetbrains/ring-ui-built/components/button-toolbar/button-toolbar";

import { ContributionDistribution, type DistributionMode } from "./ContributionDistribution.tsx";
import { loadExampleIssues } from "./dummyData.ts";

const issues = loadExampleIssues();
// In absolute mode all bars are scaled against the issue with the most time
const maxTotalMinutes = Math.max(
  ...issues.map((i) => i.contributions.reduce((sum, c) => sum + c.minutes, 0)),
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
            mode={mode}
            maxTotalMinutes={maxTotalMinutes}
          />
        ))}
      </section>
    </div>
  );
};

export const App = memo(AppComponent);
