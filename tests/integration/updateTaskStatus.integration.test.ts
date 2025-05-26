import { updateTaskStatus } from "../../src/tools/updateTaskStatus";
import { addTask } from "../../src/tools/addTask";
import { getGroups } from "../../src/tools/getGroups";

describe("updateTaskStatus integration", () => {
  const boardId = process.env.MONDAY_TASKS_BOARD_ID;

  it("should update task status on the board", async () => {
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

    // Create a task to update
    const addResult = await addTask({
      boardId,
      groupId,
      itemName: "Task Status Update Test",
    });
    const itemMatch = addResult.content[0].text.match(/ID: (\d+)/);
    if (!itemMatch) {
      console.warn(
        "Skipping test: Could not extract item ID from created task"
      );
      return;
    }
    const itemId = itemMatch[1];

    // Update the task status to "done"
    const result = await updateTaskStatus({
      boardId,
      itemId,
      newStatus: "done",
    });

    expect(result.content[0].text).toMatch(/Updated item/);
    expect(result.content[0].text).toMatch(/status to/);
    expect(result.content[0].text).toMatch(/ID: \d+/);
  });

  it("should handle invalid status gracefully", async () => {
    if (!boardId) {
      console.warn("Skipping test: MONDAY_TASKS_BOARD_ID not set");
      return;
    }

    // Try to update with a non-existent status
    const result = await updateTaskStatus({
      boardId,
      itemId: "12345",
      newStatus: "invalid-status-that-does-not-exist",
    });

    // Should either fail to find the status or fail to find the item
    expect(result.content[0].text).toMatch(
      /Could not find status|Error updating/
    );
  });
});
