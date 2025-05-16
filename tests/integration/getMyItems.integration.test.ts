import { getMyItems } from "../../src/tools/getMyItems";

describe("getMyItems integration", () => {
  const boardId = process.env.MONDAY_TASKS_BOARD_ID;

  it("should get items assigned to the user for the board", async () => {
    if (!boardId) {
      console.warn("Skipping test: MONDAY_TASKS_BOARD_ID not set");
      return;
    }
    const result = await getMyItems({ boardId });
    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("text");
  });
});
