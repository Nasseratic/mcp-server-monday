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
 * Updates the status of a task (item) on a Monday.com board.
 * @param boardId - The board ID containing the item.
 * @param itemId - The ID of the item to update.
 * @param newStatus - The new status value (e.g., "in progress", "in review", "done").
 * @returns An object with a 'content' array containing a text result.
 */
export async function updateTaskStatus({
  boardId,
  itemId,
  newStatus,
}: {
  boardId: string;
  itemId: string;
  newStatus: string;
}): Promise<ToolReturn> {
  try {
    // First, get the board columns to find the status column
    const columnsQuery = `
      query ($boardId: [ID!]) {
        boards(ids: $boardId) {
          columns {
            id
            title
            type
            settings_str
          }
        }
      }
    `;

    const { boards } = await mondayGraphQL(columnsQuery, {
      boardId: [Number(boardId)],
    });

    if (!boards || !boards[0] || !boards[0].columns) {
      return {
        content: [
          {
            type: "text",
            text: `Could not fetch columns for board ${boardId}.`,
          },
        ],
      };
    }

    // Find status-type columns
    const statusColumns = boards[0].columns.filter(
      (col: any) => col.type === "color" || col.type === "status"
    );

    if (statusColumns.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No status columns found on board ${boardId}.`,
          },
        ],
      };
    }

    // Try to find the most likely status column (prefer one with "status" in the title)
    let statusColumn =
      statusColumns.find((col: any) =>
        col.title.toLowerCase().includes("status")
      ) || statusColumns[0];

    // Parse the column settings to get available status options
    let availableStatuses: any[] = [];
    let matchedStatus: any = null;

    if (statusColumn.settings_str) {
      try {
        const settings = JSON.parse(statusColumn.settings_str);

        // Handle Monday.com status column structure where labels is an object
        if (settings.labels && typeof settings.labels === "object") {
          // Convert the labels object to an array of {id, name} objects
          availableStatuses = Object.entries(settings.labels).map(
            ([id, name]) => ({
              id,
              name: name as string,
            })
          );
        } else if (settings.labels && Array.isArray(settings.labels)) {
          availableStatuses = settings.labels;
        } else if (
          settings.labels_colors &&
          Array.isArray(settings.labels_colors)
        ) {
          availableStatuses = settings.labels_colors;
        } else if (Array.isArray(settings)) {
          availableStatuses = settings;
        } else {
          availableStatuses = [];
        }

        // Find the best matching status
        const normalizedNewStatus = newStatus.toLowerCase().trim();

        // First try exact match
        matchedStatus = availableStatuses.find(
          (status: any) =>
            status.name?.toLowerCase() === normalizedNewStatus ||
            status.label?.toLowerCase() === normalizedNewStatus ||
            (typeof status === "string" &&
              status.toLowerCase() === normalizedNewStatus)
        );

        // If no exact match, try partial match
        if (!matchedStatus) {
          matchedStatus = availableStatuses.find((status: any) => {
            const statusName = status.name || status.label || status;
            if (typeof statusName === "string") {
              return (
                statusName.toLowerCase().includes(normalizedNewStatus) ||
                normalizedNewStatus.includes(statusName.toLowerCase())
              );
            }
            return false;
          });
        }

        // If still no match, try some common mappings
        if (!matchedStatus) {
          const statusMappings: Record<string, string[]> = {
            "in progress": ["working", "in-progress", "progress", "doing"],
            "in review": ["review", "reviewing", "pending review"],
            done: ["complete", "completed", "finished"],
            todo: ["to do", "pending", "not started"],
            stuck: ["blocked", "blocker"],
          };

          for (const [key, aliases] of Object.entries(statusMappings)) {
            if (
              normalizedNewStatus === key ||
              aliases.includes(normalizedNewStatus)
            ) {
              matchedStatus = availableStatuses.find((status: any) => {
                const statusName = status.name || status.label || status;
                if (typeof statusName === "string") {
                  return (
                    statusName.toLowerCase() === key ||
                    aliases.some((alias) =>
                      statusName.toLowerCase().includes(alias)
                    )
                  );
                }
                return false;
              });
              if (matchedStatus) break;
            }
          }
        }
      } catch (error) {
        console.error("Error parsing status column settings:", error);
      }
    }

    if (!matchedStatus) {
      const availableStatusNames = availableStatuses
        .map((s) => s.name || s.label || s)
        .join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Could not find status "${newStatus}" in column "${
              statusColumn.title
            }". Available statuses: ${availableStatusNames || "None found"}`,
          },
        ],
      };
    }

    // Update the item with the matched status
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

    const statusValue =
      matchedStatus.name || matchedStatus.label || matchedStatus;
    // For Monday.com status columns, use the ID-based format if available
    const columnValues = {
      [statusColumn.id]: matchedStatus.id
        ? { index: parseInt(matchedStatus.id) }
        : { label: statusValue },
    };

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
          { type: "text", text: "Failed to update item status on the board." },
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
          text: `Updated item '${item.name}' (${idInfo}) status to "${statusValue}" on board ${boardId}.`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating item status: ${error.message || error}`,
        },
      ],
    };
  }
}
