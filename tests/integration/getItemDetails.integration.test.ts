import { getItemDetails } from "../../src/tools/getItemDetails";
import { getMyItems } from "../../src/tools/getMyItems";

describe("getItemDetails integration", () => {
  const boardId = process.env.MONDAY_TASKS_BOARD_ID;

  it("should get detailed information for an existing item including all columns and values", async () => {
    if (!boardId) {
      console.warn("Skipping test: MONDAY_TASKS_BOARD_ID not set");
      return;
    }

    // First get an existing item from the user's items
    const myItemsResult = await getMyItems({ boardId, limit: 1 });

    if (
      !myItemsResult.content[0].text ||
      myItemsResult.content[0].text.includes("No items assigned")
    ) {
      console.warn("Skipping test: No items assigned to user found on board");
      return;
    }

    // Extract item ID from the response (format: "ID: 123456" or "ID: 123456, Item ID: ABC-123")
    const itemMatch = myItemsResult.content[0].text.match(/ID: (\d+)/);
    if (!itemMatch) {
      console.warn(
        "Skipping test: Could not extract item ID from user's items"
      );
      return;
    }
    const itemId = itemMatch[1];

    // Get detailed information for the item
    const result = await getItemDetails({ boardId, itemId });

    // Verify the response structure
    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("text");

    const resultText = result.content[0].text;

    // Verify that the response contains the expected sections
    expect(resultText).toContain("Item Details:");
    expect(resultText).toContain("================");
    expect(resultText).toContain("Columns and Values:");

    // Verify basic item information is included
    expect(resultText).toContain("Name:");
    expect(resultText).toContain(`ID: ${itemId}`);
    expect(resultText).toContain("Board:");
    expect(resultText).toContain("Group:");
    expect(resultText).toContain("Created:");
    expect(resultText).toContain("Updated:");
    expect(resultText).toContain("Creator:");

    // Verify that columns are displayed with their types
    expect(resultText).toMatch(/•\s+.+\s+\(.+\):/);

    // Check that at least some common column types are shown
    // The exact columns will vary by board, but we can check for the general format
    const columnLines = resultText
      .split("\n")
      .filter((line) => line.trim().startsWith("•"));
    expect(columnLines.length).toBeGreaterThan(0);

    // Each column line should have the format: • Column Name (type):
    columnLines.forEach((line) => {
      expect(line).toMatch(/•\s+.+\s+\(.+\):\s*$/);
    });

    // Verify that raw values and text values are shown
    expect(resultText).toContain("Raw Value:");
    expect(resultText).toContain("Text Value:");

    console.log("✓ Successfully retrieved item details with all columns");
  });

  it("should handle non-existent item gracefully", async () => {
    if (!boardId) {
      console.warn("Skipping test: MONDAY_TASKS_BOARD_ID not set");
      return;
    }

    // Try to get details for a non-existent item
    const result = await getItemDetails({
      boardId,
      itemId: "999999999", // Unlikely to exist
    });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("text");
    expect(result.content[0].text).toContain("No item found with ID");
  });
});
