import { addTask } from "../../src/tools/addTask";
import { getGroups } from "../../src/tools/getGroups";

describe("addTask integration", () => {
  const boardId = process.env.MONDAY_TASKS_BOARD_ID;
  const itemName = "Integration Test Task";

  it("should add a new task to the board", async () => {
    if (!boardId) {
      console.warn("Skipping test: MONDAY_TASKS_BOARD_ID not set");
      return;
    }

    // First get available groups
    const groupsResult = await getGroups({ boardId });
    if (!groupsResult.content[0].text.includes("ID:")) {
      console.warn("Skipping test: No groups found on board");
      return;
    }

    // Extract first group ID from the response
    const groupMatch =
      groupsResult.content[0].text.match(/ID: ([a-zA-Z0-9_]+)/);
    if (!groupMatch) {
      console.warn("Skipping test: Could not extract group ID from response");
      return;
    }
    const groupId = groupMatch[1];

    const result = await addTask({ boardId, groupId, itemName });
    expect(result.content[0].text).toMatch(/Created item/);
    expect(result.content[0].text).toMatch(/ID: \d+/);
  });
});
