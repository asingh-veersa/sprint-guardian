import axios from "axios";
import env from "../config/env";
import projectIdParser from "../helper/project-id-parser";
import { CommitT } from "./types";

const gitlab = axios.create({
  baseURL: env.gitlab.baseUrl,
  headers: {
    Authorization: `Bearer ${env.gitlab.token}`,
  },
});

export async function getRecentCommits(): Promise<CommitT[]> {
  const projectIds = projectIdParser()

  if (!projectIds?.length) return [];

  const commitArrays: CommitT[] = await Promise.all(
    projectIds.map(async (projectId) => {
      const res = await gitlab.get(
        `/api/v4/projects/${projectId}/repository/commits`
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
    })
  );

  return commitArrays.flat();
}
