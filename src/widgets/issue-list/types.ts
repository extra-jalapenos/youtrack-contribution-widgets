export interface AuthorContribution {
  id: string;
  name: string;
  minutes: number;
}

export interface IssueContribution {
  key: string;
  summary: string;
  contributions: AuthorContribution[];
}
