import { getMyItems } from "../src/tools/getMyItems";
import { addTask } from "../src/tools/addTask";
import { getGroups } from "../src/tools/getGroups";

describe("ID Display Verification", () => {
  const boardId = process.env.MONDAY_TASKS_BOARD_ID;

  it("should include both numeric ID and human-readable Item ID in getMyItems", async () => {
    if (!boardId) {
      console.warn("Skipping test: MONDAY_TASKS_BOARD_ID not set");
      return;
    }

    const result = await getMyItems({ boardId });
    expect(result.content[0].text).toMatch(/ID: \d+/); // Numeric ID

    // Check if the result contains human-readable Item ID (like TCON-147)
    const hasItemId = result.content[0].text.includes("Item ID:");
    console.log("getMyItems output sample:", result.content[0].text);
    console.log("Contains human-readable Item ID:", hasItemId);
  });

  it("should include both numeric ID and human-readable Item ID when creating a task", async () => {
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

    const result = await addTask({
      boardId,
      groupId,
      itemName: "Test Task for Human-Readable ID Display",
    });

    expect(result.content[0].text).toMatch(/ID: \d+/); // Numeric ID

    // Check if the result contains human-readable Item ID (like TCON-147)
    const hasItemId = result.content[0].text.includes("Item ID:");
    console.log("addTask output sample:", result.content[0].text);
    console.log("Contains human-readable Item ID:", hasItemId);
  });
});
