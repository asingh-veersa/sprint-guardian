import axios from "axios";
import env from "../config/env";
import projectIdParser from "../helper/project-id-parser";
import { CommitSchemaWithProjectId, CommitT } from "./types";
import {
  CommitSchema,
  Gitlab,
  MergeRequestSchemaWithBasicLabels,
} from "@gitbeaker/rest";

/**
 * @deprecated Use gitlabClient instead.
 */
const gitlab = axios.create({
  baseURL: env.gitlab.baseUrl,
  headers: {
    Authorization: `Bearer ${env.gitlab.token}`,
  },
});

export const gitlabClient = new Gitlab({
  host: env.gitlab.baseUrl!,
  token: env.gitlab.token!,
});

/**
 * @deprecated Use getCommitHistory instead.
 */
export async function getRecentCommits(): Promise<CommitT[]> {
  const projectIds = projectIdParser();

  if (!projectIds?.length) return [];

  const commitArrays: CommitT[] = await Promise.all(
    projectIds.map(async (projectId) => {
      const res = await gitlab.get(
        `/api/v4/projects/${projectId}/repository/commits`,
      );

      return res.data.map((commit: any) => ({
        id: commit.id,
        projectId: projectId,
        message: commit.message,
        author: commit.author_name,
        authorEmail: commit.author_email,
        authoredDate: commit.authored_date,
        committerName: commit.committer_name,
        committerEmail: commit.committer_email,
        committedDate: commit.committed_date,
      }));
    }),
  );

  return commitArrays.flat();
}

export const getCommitsFromMaster = async (
  projectId: number,
  limit: number = 20,
): Promise<CommitSchema[]> => {
  return gitlabClient.Commits.all(projectId, {
    perPage: limit,
  });
};

export const getMergeRequests = async (
  projectId: number,
  limit: number = 20,
): Promise<MergeRequestSchemaWithBasicLabels[]> => {
  return gitlabClient.MergeRequests.all({
    projectId,
    state: "opened",
    perPage: limit,
  });
};

export const getMergeRequestCommits = async (
  projectId: number,
  mrId: number,
  limit: number = 10,
): Promise<CommitSchema[]> => {
  return gitlabClient.MergeRequests.allCommits(projectId, mrId, {
    perPage: limit,
  });
};

export const getCommitHistory = async (): Promise<
  {
    master: CommitSchemaWithProjectId[];
    mr: CommitSchemaWithProjectId[];
    projectId: number;
  }[]
> => {
  const projectIds = projectIdParser();

  if (!projectIds?.length) {
    return [];
  }

  return Promise.all(
    projectIds.map(async (projectId) => {
      const masterCommits = await getCommitsFromMaster(projectId);
      const masterCommitsWithProjectId = masterCommits.map((commit) => ({
        ...commit,
        projectId,
      }));
      const mergeRequests = await getMergeRequests(projectId);

      const mrCommitsArrays = await Promise.all(
        mergeRequests.map(async (mergeRequest) => {
          const commits = await getMergeRequestCommits(
            projectId,
            mergeRequest.iid,
          );
          return commits.map((commit) => ({
            ...commit,
            projectId,
            mergeRequestTitle: mergeRequest.title,
          }));
        }),
      );
      // Flatten the arrays of commits
      const mrCommits = mrCommitsArrays.flat();

      return {
        master: masterCommitsWithProjectId,
        mr: mrCommits,
        projectId,
      };
    }),
  );
};
