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
 * Gets detailed information for a specific item including all its columns and values.
 * @param boardId - The board ID that contains the item.
 * @param itemId - The ID of the item to get details for.
 * @returns An object with a 'content' array containing detailed item information.
 */
export async function getItemDetails({
  boardId,
  itemId,
}: {
  boardId: string;
  itemId: string;
}): Promise<ToolReturn> {
  try {
    // Query to get item details with all columns and values
    const itemQuery = `
      query ($boardId: [ID!], $itemId: [ID!]) {
        boards(ids: $boardId) {
          name
          columns {
            id
            title
            type
            settings_str
          }
        }
        items(ids: $itemId) {
          id
          name
          group {
            id
            title
          }
          column_values {
            id
            type
            value
            text
          }
          created_at
          updated_at
          creator {
            id
            name
            email
          }
        }
      }
    `;

    const data = await mondayGraphQL(itemQuery, {
      boardId: [Number(boardId)],
      itemId: [Number(itemId)],
    });

    if (!data.items || data.items.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No item found with ID ${itemId} on board ${boardId}.`,
          },
        ],
      };
    }

    const item = data.items[0];
    const board = data.boards?.[0];
    const columns = board?.columns || [];

    // Create a map of column IDs to column info for better formatting
    const columnMap = new Map();
    columns.forEach((col: any) => {
      columnMap.set(col.id, { title: col.title, type: col.type });
    });

    // Format the item details
    let result = `Item Details:\n`;
    result += `================\n`;
    result += `Name: ${item.name}\n`;
    result += `ID: ${item.id}\n`;
    result += `Board: ${board?.name || "Unknown"}\n`;
    result += `Group: ${item.group?.title || "No Group"} (ID: ${
      item.group?.id || "N/A"
    })\n`;
    result += `Created: ${new Date(item.created_at).toLocaleString()}\n`;
    result += `Updated: ${new Date(item.updated_at).toLocaleString()}\n`;
    result += `Creator: ${item.creator?.name || "Unknown"} (${
      item.creator?.email || "N/A"
    })\n\n`;

    result += `Columns and Values:\n`;
    result += `==================\n`;

    // Sort column values by column title for better readability
    const sortedColumnValues = item.column_values.sort((a: any, b: any) => {
      const titleA = columnMap.get(a.id)?.title || a.id;
      const titleB = columnMap.get(b.id)?.title || b.id;
      return titleA.localeCompare(titleB);
    });

    sortedColumnValues.forEach((columnValue: any) => {
      const columnInfo = columnMap.get(columnValue.id);
      const columnTitle = columnInfo?.title || columnValue.id;
      const columnType = columnInfo?.type || columnValue.type;

      // Display both raw value and text, showing everything without special formatting
      const rawValue = columnValue.value || "(no value)";
      const textValue = columnValue.text || "(no text)";

      result += `• ${columnTitle} (${columnType}):\n`;
      result += `  - Raw Value: ${rawValue}\n`;
      result += `  - Text Value: ${textValue}\n`;
    });

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching item details:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error fetching item details: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
    };
  }
}
