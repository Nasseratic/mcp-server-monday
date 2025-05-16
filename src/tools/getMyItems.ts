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
 * Gets items assigned to a user for a specific Monday.com board.
 * @param boardId - The board ID to fetch items from.
 * @param limit - Maximum number of items to return (default 25)
 * @param userIdOverride - Optionally override the user ID (for testing)
 * @returns An object with a 'content' array containing a text result.
 */
export async function getMyItems({
  boardId,
  limit = 25,
  userIdOverride,
}: {
  boardId: string;
  limit?: number;
  userIdOverride?: string;
}): Promise<ToolReturn> {
  // 1. Get current user ID (unless overridden)
  let userId = userIdOverride;
  if (!userId) {
    const meQuery = `query { me { id } }`;
    const { me } = await mondayGraphQL(meQuery, {});
    if (!me || !me.id) {
      return {
        content: [
          { type: "text", text: "Could not determine current user ID." },
        ],
      };
    }
    userId = me.id;
  }

  // 2. Get people/person column ID
  const columnsQuery = `query ($boardId: [ID!]) { boards(ids: $boardId) { columns { id title type } } }`;
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
  const peopleColumn = boards[0].columns.find(
    (col: any) => col.type === "people" || col.type === "person"
  );
  if (!peopleColumn) {
    return {
      content: [
        {
          type: "text",
          text: `No people/person column found on board ${boardId}.`,
        },
      ],
    };
  }
  const peopleColumnId = peopleColumn.id;

  // 3. Query items assigned to the user using items_page_by_column_values
  const itemsQuery = `
    query ($boardId: ID!, $columnId: String!, $userId: String!, $limit: Int) {
      items_page_by_column_values(
        board_id: $boardId,
        columns: [
          { column_id: $columnId, column_values: [$userId] }
        ],
        limit: $limit
      ) {
        items {
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
    }
  `;
  const data = await mondayGraphQL(itemsQuery, {
    boardId: String(boardId),
    columnId: peopleColumnId,
    userId: String(userId),
    limit,
  });
  const items = data.items_page_by_column_values?.items || [];

  // For each item, fetch description if needed
  const results = await Promise.all(
    items.map(async (i: any) => {
      const status =
        i.column_values.find((c: any) => c.id === "task_status")?.text || "";
      let aiDescription = "";
      const aiDescCol = i.column_values.find(
        (c: any) => c.id === "long_text_mkqr330y"
      );
      if (aiDescCol && aiDescCol.text && aiDescCol.text.trim()) {
        aiDescription = aiDescCol.text.trim();
      }
      return `- ${i.name} (ID: ${i.id})\n  Status: ${status}${
        aiDescription ? `\n  AI Description: ${aiDescription}` : ""
      }`;
    })
  );

  return {
    content: [
      {
        type: "text",
        text: results.length
          ? results.join("\n\n")
          : `No items assigned to you found on board ${boardId}.`,
      },
    ],
  };
}
