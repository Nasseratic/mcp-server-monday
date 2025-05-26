import { config } from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getMyItems } from "./tools/getMyItems";
import { addTask } from "./tools/addTask";
import { updateTask } from "./tools/updateTask";
import { updateTaskStatus } from "./tools/updateTaskStatus";
import { getGroups } from "./tools/getGroups";

// Load environment variables from .env file
config();

const server = new McpServer(
  { name: "minimal-my-items", version: "1.0.0" },
  { capabilities: {} }
);

const MONDAY_TASKS_BOARD_ID = process.env.MONDAY_TASKS_BOARD_ID;
server.tool(
  "my-items",
  "Get items assigned to the current user for a specific Monday.com board.",
  {
    limit: z
      .number()
      .optional()
      .describe("Maximum number of items to return (default 25)"),
  },
  async (args: any) => {
    const { limit } = args;
    if (!MONDAY_TASKS_BOARD_ID) {
      return {
        content: [{ type: "text", text: "MONDAY_TASKS_BOARD_ID is not set" }],
      };
    }
    return await getMyItems({
      boardId: MONDAY_TASKS_BOARD_ID,
      limit,
    });
  }
);

server.tool(
  "add-task",
  "Add a new task (item) to the Monday.com board.",
  {
    groupId: z.string().describe("The group ID to add the item to."),
    itemName: z.string().describe("The name of the new item."),
    columnValues: z
      .record(z.any())
      .optional()
      .describe("Optional object mapping column IDs to values."),
  },
  async (args: any) => {
    if (!MONDAY_TASKS_BOARD_ID) {
      return {
        content: [{ type: "text", text: "MONDAY_TASKS_BOARD_ID is not set" }],
      };
    }
    const { groupId, itemName, columnValues } = args;
    return await addTask({
      boardId: MONDAY_TASKS_BOARD_ID,
      groupId,
      itemName,
      columnValues,
    });
  }
);

server.tool(
  "update-task-status",
  "Update the status of a task (item) on the Monday.com board.",
  {
    itemId: z.string().describe("The ID of the item to update."),
    newStatus: z
      .string()
      .describe("The new status (e.g., 'in progress', 'in review', 'done')."),
  },
  async (args: any) => {
    if (!MONDAY_TASKS_BOARD_ID) {
      return {
        content: [{ type: "text", text: "MONDAY_TASKS_BOARD_ID is not set" }],
      };
    }
    const { itemId, newStatus } = args;
    return await updateTaskStatus({
      boardId: MONDAY_TASKS_BOARD_ID,
      itemId,
      newStatus,
    });
  }
);

server.tool(
  "update-task",
  "Update a task (item) on the Monday.com board with custom column values.",
  {
    itemId: z.string().describe("The ID of the item to update."),
    columnValues: z
      .record(z.any())
      .describe("Object mapping column IDs to new values."),
  },
  async (args: any) => {
    if (!MONDAY_TASKS_BOARD_ID) {
      return {
        content: [{ type: "text", text: "MONDAY_TASKS_BOARD_ID is not set" }],
      };
    }
    const { itemId, columnValues } = args;
    return await updateTask({
      boardId: MONDAY_TASKS_BOARD_ID,
      itemId,
      columnValues,
    });
  }
);

server.tool(
  "get-groups",
  "Get all groups from a Monday.com board.",
  {},
  async (args: any) => {
    if (!MONDAY_TASKS_BOARD_ID) {
      return {
        content: [{ type: "text", text: "MONDAY_TASKS_BOARD_ID is not set" }],
      };
    }
    return await getGroups({
      boardId: MONDAY_TASKS_BOARD_ID,
    });
  }
);

function startServer() {
  console.log("Starting Minimal MyItems MCP Server...");
  const transport = new StdioServerTransport();
  server.connect(transport);
}

startServer();
