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
  // Auto-assign task to current user
  try {
    // Get current user ID
    const meQuery = `query { me { id } }`;
    const { me } = await mondayGraphQL(meQuery, {});
    if (!me || !me.id) {
      return {
        content: [
          { type: "text", text: "Could not determine current user ID." },
        ],
      };
    }
    const userId = me.id;

    // For the people column, using the simple format with just the user ID as a string
    // This is the most reliable format according to Monday.com API documentation
    columnValues.task_owner = userId.toString();
  } catch (error: any) {
    console.error("Error setting up task owner assignment:", error);
    // Continue with item creation even if user assignment fails
  }

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

    // Build ID information with both numeric and human-friendly identifiers
    const itemId = item.column_values?.find(
      (c: any) => c.type === "item_id"
    )?.text;
    const idInfo = `ID: ${item.id}${itemId ? `, Item ID: ${itemId}` : ""}`;

    return {
      content: [
        {
          type: "text",
          text: `Created item '${item.name}' (${idInfo}) on board ${boardId}.`,
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
