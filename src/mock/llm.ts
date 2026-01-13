const mockLLMresponseJson = [
  {
    issueKey: "AUTH-123",
    severity: "HIGH",
    reason:
      "The Login API is a critical path dependency; the 'In Progress' status without commits suggests a silent blocker or lack of actual progress.",
    suggestedAction:
      "Contact the assignee to confirm current status and verify that code is being pushed to the remote repository.",
  },
];

export const mockLLMresponse = JSON.stringify(mockLLMresponseJson);
