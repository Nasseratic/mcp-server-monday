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
 * Gets all groups from a Monday.com board.
 * @param boardId - The board ID to fetch groups from.
 * @returns An object with a 'content' array containing a text result with group information.
 */
export async function getGroups({
  boardId,
}: {
  boardId: string;
}): Promise<ToolReturn> {
  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        groups {
          id
          title
          color
          position
        }
      }
    }
  `;

  try {
    const data = await mondayGraphQL(query, {
      boardId: [Number(boardId)],
    });

    if (!data.boards?.[0]?.groups) {
      return {
        content: [
          {
            type: "text",
            text: `Could not fetch groups for board ${boardId}.`,
          },
        ],
      };
    }

    const groups = data.boards[0].groups;
    if (groups.length === 0) {
      return {
        content: [
          { type: "text", text: `No groups found on board ${boardId}.` },
        ],
      };
    }

    const groupsList = groups
      .sort((a: any, b: any) => a.position - b.position)
      .map((g: any) => `- ${g.title} (ID: ${g.id}, Color: ${g.color})`);

    return {
      content: [
        {
          type: "text",
          text: `Groups on board ${boardId}:\n\n${groupsList.join("\n")}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching groups: ${error.message || error}`,
        },
      ],
    };
  }
}
