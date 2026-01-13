import { describe, expect, it } from "vitest";
import { getRecentCommits } from "./gitlab";

describe("Gitlb", () => {
  it("return commit history for specfic projects", async () => {
    const commits = await getRecentCommits();

    expect(Array.isArray(commits)).toBe(true);

    commits.forEach((commit: any) => {
      expect(commit).toHaveProperty("id");
      expect(commit).toHaveProperty("message");
      expect(commit).toHaveProperty("author");
      expect(commit).toHaveProperty("authorEmail");
      expect(commit).toHaveProperty("authoredDate");
      expect(commit).toHaveProperty("committerName");
      expect(commit).toHaveProperty("committerEmail");
      expect(commit).toHaveProperty("committedDate");
    });
  });
});
