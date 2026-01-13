export type CommitT = {
  id: string;
  projectId: number;
  message: string;
  author: string;
  authorEmail: string;
  authoredDate: string;
  committer: string;
  committerEmail: string;
  committerDate: string;
};

export type JiraFieldT = {
  id: string;
  key: string;
  name: string;
  untranslateName: string;
  custom: boolean;
  scope?: {
    type: string;
    project: {
      id: string;
    };
  };
  clauseNames?: string[];
  schema?: {
    type: string;
    items: string;
    custom: string;
    customId: number;
  };
};

export type SprintIssueT = {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: SprintIssueFieldsT;
};

/**
 * Sub types used for Sprint Issue
 */
type SprintIssueFieldsT = {
  flagged: boolean;
  sprint?: SprintDetailT;
  project: SprintProjectT;
  summary: string;
  description: string;
  comment: SprintIssueCommentT;
  epic?: SprintEpicT;
  worklog: SprintWorklogT;
  updated: string;
  created: string;
  timetracking: any;
  parent?: {
    id: string;
    key: string;
    self: string;
    fields: any;
  };
  assignee?: IssueCreatorT;
  reporter?: IssueCreatorT;
  creator?: IssueCreatorT;
  aggregateprogress?: { progress: number; total: number };
  progress?: { progress: number; total: number };
  priority?: {
    name: string;
    id: string;
  };
  status?: {
    description: string;
    name: string;
    id: string;
  };
  statuscategorychangedate?: string;
  timeestimate?: string;
  timeoriginalestimate?: string;
  timespent?: string;
  resolution?: {
    id: string;
    description: string;
    name: string;
  };
  resolutiondate?: string;
  /**
   * custom fields
   */
  story_point_estimate?: string;
  /**
   * consists the attached links and PRs
   */
  development: string;
};

type IssueCreatorT = {
  accountId: string;
  emailAddress: string;
  displayName: string;
};

export type SprintDetailT = {
  id: number;
  self: string;
  state: string;
  name: string;
  startDate?: string;
  endDate?: string;
  originBoardId?: number;
  goal?: string;
};

type SprintProjectT = {
  self: string;
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: any;
  projectCategory: {
    self: string;
    id: string;
    description: string;
    name: string;
  };
};

type CommentAuthorT = {
  self: string;
  name: string;
  displayName: string;
  active: string;
};

type SprintIssueCommentT = {
  comments: {
    self: string;
    id: string;
    author: CommentAuthorT;
    body: string;
    updateAutor: CommentAuthorT;
    created: string;
    updated: string;
  }[];
  self: string;
  maxResults: number;
  total: number;
  startAt: number;
};

type SprintEpicT = {
  id: number;
  key: string;
  self: string;
  name: string;
  summary: string;
  color: { key: string };
  issueColor: { key: string };
  done: boolean;
};

type SprintWorklogT = {
  startAt: number;
  maxResults: number;
  total: number;
  worklogs: {
    self: string;
    author: CommentAuthorT;
    updateAuthor: CommentAuthorT;
    comment: string;
    updated: string;
    started: string;
    timeSpent: string;
    timeSpentSeconds: number;
    id: string;
    issueId: string;
  }[];
};

/**
 * Sub types for Sprint Issue Ends here
 */
