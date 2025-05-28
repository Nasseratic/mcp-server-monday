import { mondayGraphQL } from "../utils/mondayClient";

export interface ToolTextContent {
  type: "text";
  text: string;
  [key: string]: unknown;
}

export interface ToolReturn {
  content: ToolTextContent[];
  [key: string]: unknown;
}

/**
 * Updates a task (item) on a Monday.com board.
 * @param boardId - The board ID containing the item.
 * @param itemId - The ID of the item to update.
 * @param columnValues - Object mapping column IDs to new values.
 * @returns An object with a 'content' array containing a text result.
 */
export async function updateTask({
  boardId,
  itemId,
  columnValues,
}: {
  boardId: string;
  itemId: string;
  columnValues: Record<string, any>;
}): Promise<ToolReturn> {
  const mutation = `
    mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
      change_multiple_column_values(
        board_id: $boardId,
        item_id: $itemId,
        column_values: $columnValues
      ) {
        id
        name
        column_values {
          id
          type
          value
          text
        }
      }
    }
  `;
  try {
    const variables = {
      boardId: Number(boardId),
      itemId: Number(itemId),
      columnValues: JSON.stringify(columnValues),
    };
    const data = await mondayGraphQL(mutation, variables);
    const item = data.change_multiple_column_values;
    if (!item || !item.id) {
      return {
        content: [
          { type: "text", text: "Failed to update item on the board." },
        ],
      };
    }

    // Build ID information with both numeric and human-friendly identifiers
    const humanReadableId = item.column_values?.find(
      (c: any) => c.type === "item_id"
    )?.text;
    const idInfo = `ID: ${item.id}${
      humanReadableId ? `, Item ID: ${humanReadableId}` : ""
    }`;

    return {
      content: [
        {
          type: "text",
          text: `Updated item '${item.name}' (${idInfo}) on board ${boardId}.`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating item: ${error.message || error}`,
        },
      ],
    };
  }
}
