import type { IssueContribution } from "./types";
import issuesJson from "../../dev/issues.json";
import workItemsJson from "../../../workItems.json";

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

// The example data only has two authors; show them under demo names
const RENAMED_AUTHORS: Record<string, string> = { Alexandria: "Roxy", Robert: "Connie" };

// Roughly this share of all worklogs is reassigned to the extra demo authors
const EXTRA_AUTHOR_SHARE = 0.25;
const EXTRA_AUTHORS = [
  { id: "demo-cinna", name: "Cinna" },
  { id: "demo-mickey", name: "Mickey" },
];

/**
 * Builds issues from the example data (src/dev/issues.json + workItems.json):
 * worklogs are summed per author and issue. Issues without worklogs are skipped.
 * Authors are renamed and ~25% of worklogs are reassigned to two extra authors (seeded, so stable).
 */
export const loadExampleIssues = (): IssueContribution[] => {
  const rand = createRng(7);
  const byIssue = new Map<string, Map<string, { id: string; name: string; minutes: number }>>();
  for (const raw of workItemsJson as unknown as RawWorkItem[]) {
    const w: RawWorkItem =
      rand() < EXTRA_AUTHOR_SHARE
        ? { ...raw, author: EXTRA_AUTHORS[Math.floor(rand() * EXTRA_AUTHORS.length)] }
        : { ...raw, author: { ...raw.author, name: RENAMED_AUTHORS[raw.author.name] ?? raw.author.name } };
    const authors = byIssue.get(w.issue.id) ?? new Map();
    const entry = authors.get(w.author.id) ?? { id: w.author.id, name: w.author.name, minutes: 0 };
    entry.minutes += w.duration.minutes;
    authors.set(w.author.id, entry);
    byIssue.set(w.issue.id, authors);
  }

  return (issuesJson as unknown as RawIssue[])
    .filter((i) => byIssue.has(i.id))
    .map((i) => ({
      key: i.idReadable,
      summary: i.summary,
      contributions: [...byIssue.get(i.id)!.values()].sort((a, b) => b.minutes - a.minutes),
    }));
};

export const dummyIssue: IssueContribution = {
  key: "DEMO-123",
  summary: "Implement worklog export for monthly reports",
  contributions: [
    { id: "1", name: "David", minutes: 14 * 60 },
    { id: "2", name: "Britta", minutes: 9 * 60 + 30 },
    { id: "3", name: "Cinna", minutes: 5 * 60 },
    { id: "4", name: "Annie", minutes: 2 * 60 + 15 },
  ],
};

const AUTHORS = [
  { id: "1", name: "David" },
  { id: "2", name: "Britta" },
  { id: "3", name: "Cinna" },
  { id: "4", name: "Annie" },
  { id: "5", name: "Troy" },
  { id: "6", name: "Abed" },
];

const SUMMARIES = [
  "Fix login redirect loop",
  "Add dark mode to settings page",
  "Refactor worklog aggregation",
  "Investigate slow dashboard loading",
  "Update dependencies to latest versions",
  "Write onboarding documentation",
  "Support CSV import for issues",
  "Handle timezone differences in reports",
];

// Small seeded PRNG (mulberry32) so generated data is stable between renders
const createRng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Generates `count` dummy issues with 1-6 contributing authors each.
 * The same `seed` always yields the same issues.
 */
export const generateDummyIssues = (count: number, seed = 42): IssueContribution[] => {
  const rand = createRng(seed);
  const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

  return Array.from({ length: count }, (_, i) => {
    const authorCount = randInt(1, AUTHORS.length);
    const picked = [...AUTHORS].sort(() => rand() - 0.5).slice(0, authorCount);
    const contributions = picked
      .map((a) => ({ ...a, minutes: randInt(1, 32) * 15 })) // 15 min .. 8h
      .sort((a, b) => b.minutes - a.minutes);

    return {
      key: `DEMO-${100 + i}`,
      summary: SUMMARIES[randInt(0, SUMMARIES.length - 1)],
      contributions,
    };
  });
};

export const formatMinutes= (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};
