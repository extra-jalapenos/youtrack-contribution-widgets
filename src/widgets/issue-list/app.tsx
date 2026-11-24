import {memo, useEffect, useMemo, useState} from "react";
import {sub} from "date-fns";
import {descending, max, rollup, sort, sum} from "d3-array";
import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";

import "../../style/base.css";
import "../../style/svg.css";

import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import ButtonToolbar from "@jetbrains/ring-ui-built/components/button-toolbar/button-toolbar";
import DatePicker from "@jetbrains/ring-ui-built/components/date-picker/date-picker.js";

import {ContributionDistribution, type DistributionMode} from "./ContributionDistribution.tsx";
import {loadExampleIssues} from "./dummyData.ts";
import type {AuthorContribution, IssueContribution} from "./types.ts";
import type {HostAPI} from "../../../@types/globals";
import {createPortraitColorScale} from "./colors.ts";

const totalMinutes = (issue: IssueContribution) => sum(issue.contributions, (c) => c.minutes);

// Hardcoded: only worklogs on subtasks of this issue are shown
const ISSUE_QUERY = "Subtask of: TODO-380";

interface FetchedWorkItem {
    id: string;
    author: { id: string; name: string };
    duration: { minutes: number };
    issue: { id: string; idReadable: string; summary: string };
}

const formatDate = (date: Date) => date.toISOString().split("T")[0];

/** Sums worklogs per issue and author. Issues without worklogs never show up. */
const toIssueContributions = (workItems: FetchedWorkItem[]): IssueContribution[] => {
    const byIssue = new Map<string, IssueContribution & { byAuthor: Map<string, AuthorContribution> }>();
    for (const w of workItems) {
        const issue = byIssue.get(w.issue.id) ?? {
            key: w.issue.idReadable,
            summary: w.issue.summary,
            contributions: [],
            byAuthor: new Map(),
        };
        const entry = issue.byAuthor.get(w.author.id) ?? { id: w.author.id, name: w.author.name, minutes: 0 };
        entry.minutes += w.duration.minutes;
        issue.byAuthor.set(w.author.id, entry);
        byIssue.set(w.issue.id, issue);
    }
    return [...byIssue.values()].map(({ byAuthor, ...issue }) => ({
        ...issue,
        contributions: [...byAuthor.values()].sort((a, b) => b.minutes - a.minutes),
    }));
};

const isLocalhost = window.location.hostname === "localhost";

const fetchIssues = async (from: Date, to: Date): Promise<IssueContribution[]> => {
    if (isLocalhost) {
        // running outside of YouTrack (vite dev server): no Host API available, use example data
        return loadExampleIssues();
    }
    const host: HostAPI = await YTApp.register();
    const fields = "id,author(id,name,login),duration(minutes),date,issue(id,idReadable,summary)";
    const workItems = await host.fetchYouTrack<FetchedWorkItem[]>(
        `workItems?startDate=${formatDate(from)}&endDate=${formatDate(to)}` +
        `&fields=${encodeURIComponent(fields)}&query=${encodeURIComponent(ISSUE_QUERY)}&$top=-1`,
    );
    return toIssueContributions(workItems);
};

const AppComponent = () => {
    const [mode, setMode] = useState<DistributionMode>("absolute");
    const [timeframe, setTimeframe] = useState<{ from: Date; to: Date }>({
        from: sub(new Date(), { months: 3 }),
        to: new Date(),
    });
    const [allIssues, setAllIssues] = useState<IssueContribution[]>([]);
    const [loadedTimeframe, setLoadedTimeframe] = useState<typeof timeframe>();
    const loading = loadedTimeframe !== timeframe;
    const [activeAuthors, setActiveAuthors] = useState<ReadonlySet<string>>(new Set());

    useEffect(() => {
        let cancelled = false;
        fetchIssues(timeframe.from, timeframe.to)
            .then((issues) => {
                if (cancelled) {return;}
                setAllIssues(issues);
                setLoadedTimeframe(timeframe);
                // new data: show everyone again
                setActiveAuthors(new Set(issues.flatMap((i) => i.contributions.map((c) => c.id))));
            })
            .catch((e) => {
                console.error("Could not load worklogs", e);
                if (cancelled) {return;}
                setAllIssues([]);
                setLoadedTimeframe(timeframe);
            });
        return () => {
            cancelled = true;
        };
    }, [timeframe]);

    // One color per author across all issues, assigned by overall contribution so top contributors get the most distinct colors.
    // Authors are ordered like the color scale (most contribution first).
    const { authors, colorScale, maxTotalMinutes } = useMemo(() => {
        const authorMinutes = rollup(
            allIssues.flatMap((i) => i.contributions),
            (contributions) => sum(contributions, (c) => c.minutes),
            (c) => c.id,
        );
        const authorNames = new Map(allIssues.flatMap((i) => i.contributions).map((c) => [c.id, c.name]));
        const sortedIds = sort(authorMinutes, ([, a], [, b]) => descending(a, b)).map(([id]) => id);
        return {
            authors: sortedIds.map((id) => ({ id, name: authorNames.get(id) ?? id })),
            colorScale: createPortraitColorScale(sortedIds),
            // In absolute mode all bars are scaled against the issue with the most time across all authors,
            // so bar widths stay stable when authors are toggled
            maxTotalMinutes: max(allIssues, totalMinutes) ?? 0,
        };
    }, [allIssues]);

    const toggleAuthor = (id: string) =>
        setActiveAuthors((prev) => {
            const next = new Set(prev);
            if (!next.delete(id)) {next.add(id);}
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
        [allIssues, activeAuthors],
    );

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
                <Button
                  key={author.id}
                  active={activeAuthors.has(author.id)}
                  onClick={() => toggleAuthor(author.id)}
                >
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
            <DatePicker
              clear
              from={timeframe.from}
              maxDate={new Date().toDateString()}
              onChange={({from, to}: { from?: Date | null; to?: Date | null }) => {
                            if (from && to) {setTimeframe({from, to});}
                        }}
              range
              to={timeframe.to}
            />
          </ButtonToolbar>
        </section>
        {loading && <section className="component">Loading worklogs…</section>}
        {!loading && issues.length === 0 && <section className="component">No worklogs in this timeframe.</section>}
        {issues.length > 0 && (
        <section id="summary" className="component summary-bar">
          {/* No maxTotalMinutes: the summary bar always spans the full width */}
          <ContributionDistribution issue={summary} colorScale={colorScale} mode={mode}/>
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
