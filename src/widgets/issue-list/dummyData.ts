import type { IssueContribution } from "./types";
import issuesJson from "../../dev/issues.json";
import workItemsJson from "../../../workItems.json";
import { rollup, sum } from "d3";

interface RawIssue {
  id: string;
  idReadable: string;
  summary: string;
}

interface RawWorkItem {
  issue: { id: string };
  author: { id: string; name: string };
  duration: { minutes: number };
}

/**
 * Builds issues from the example data (src/dev/issues.json + workItems.json):
 * worklogs are summed per author and issue. Issues without worklogs are skipped.
 */
export const loadExampleIssues = (): IssueContribution[] => {
  const workItems = workItemsJson as unknown as RawWorkItem[];
  const issues = issuesJson as unknown as RawIssue[];

  // author id -> author name (one entry per unique author)
  const authorNames = rollup(
    workItems,
    (v) => v[0].author.name,
    (d) => d.author.id
  );

  // issue id -> issue (summary + readable key)
  const issuesById = rollup(
    issues,
    (v) => v[0],
    (d) => d.id
  );

  // issue id -> author id -> total minutes
  const minutesByIssueAuthor = rollup(
    workItems,
    (v) => sum(v, (d) => d.duration.minutes),
    (d) => d.issue.id,
    (d) => d.author.id
  );

  return [...minutesByIssueAuthor]
    .filter(([issueId]) => issuesById.has(issueId))
    .map(([issueId, authorMinutes]) => {
      const issue = issuesById.get(issueId)!;
      return {
        key: issue.idReadable,
        summary: issue.summary,
        contributions: [...authorMinutes]
          .map(([id, minutes]) => ({ id, name: authorNames.get(id)!, minutes }))
          .sort((a, b) => b.minutes - a.minutes),
      };
    });
};

export const formatMinutes= (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};
