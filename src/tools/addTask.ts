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
 * Adds a new task (item) to a Monday.com board.
 * @param boardId - The board ID to add the item to.
 * @param groupId - The group ID to add the item to.
 * @param itemName - The name of the new item.
 * @param columnValues - Optional object mapping column IDs to values.
 * @returns An object with a 'content' array containing a text result.
 */
export async function addTask({
  boardId,
  groupId,
  itemName,
  columnValues = {},
}: {
  boardId: string;
  groupId: string;
  itemName: string;
  columnValues?: Record<string, any>;
}): Promise<ToolReturn> {
  const mutation = `
    mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON) {
      create_item(
        board_id: $boardId,
        group_id: $groupId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
        name
      }
    }
  `;
  try {
    const variables = {
      boardId: Number(boardId),
      groupId,
      itemName,
      columnValues: Object.keys(columnValues).length
        ? JSON.stringify(columnValues)
        : null,
    };
    const data = await mondayGraphQL(mutation, variables);
    const item = data.create_item;
    if (!item || !item.id) {
      return {
        content: [
          { type: "text", text: "Failed to create item on the board." },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `Created item '${item.name}' (ID: ${item.id}) on board ${boardId}.`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating item: ${error.message || error}`,
        },
      ],
    };
  }
}
