import { getGroups } from "../../src/tools/getGroups";

describe("getGroups integration", () => {
  const boardId = process.env.MONDAY_TASKS_BOARD_ID;

  it("should get all groups from the board", async () => {
    if (!boardId) {
      console.warn("Skipping test: MONDAY_TASKS_BOARD_ID not set");
      return;
    }
    const result = await getGroups({ boardId });
    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("text");
    expect(result.content[0].text).toContain("Groups on board");
    expect(result.content[0].text).toMatch(/ID: [a-zA-Z0-9_]+/);
  });
});
