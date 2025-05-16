import { updateTask } from "../../src/tools/updateTask";
import { addTask } from "../../src/tools/addTask";
import { getGroups } from "../../src/tools/getGroups";

describe("updateTask integration", () => {
  const boardId = process.env.MONDAY_TASKS_BOARD_ID;
  const columnValues = { status: { label: "Done" } };

  it("should update a task on the board", async () => {
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
      itemName: "Task to Update",
    });
    const itemMatch = addResult.content[0].text.match(/ID: (\d+)/);
    if (!itemMatch) {
      console.warn(
        "Skipping test: Could not extract item ID from created task"
      );
      return;
    }
    const itemId = itemMatch[1];

    // Update the created task
    const result = await updateTask({ boardId, itemId, columnValues });
    expect(result.content[0].text).toMatch(/Updated item/);
    expect(result.content[0].text).toMatch(/ID: \d+/);
  });
});
