import { describe, expect, it } from "vitest";
import { getActiveSprintIssues } from "./jira";

const BOARD_ID = 1913;

describe("Jira", () => {
  it("returns active sprint issues", async () => {
    const issues = await getActiveSprintIssues(BOARD_ID);

    // check it returns an array
    expect(Array.isArray(issues)).toBe(true);

    // each issue have required fields
    issues.forEach((issue) => {
      expect(issue).toHaveProperty("key");
      expect(issue.fields).toHaveProperty("status");
      expect(issue.fields.status).toHaveProperty("name");
      expect(issue.fields).toHaveProperty("summary");
    });
  });
});
