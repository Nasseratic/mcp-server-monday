# Monday.com MCP Server

A Monday.com Model Context Protocol (MCP) server implementation in TypeScript for handling Monday.com task-related operations.

## Getting Started

### Option 1: Direct Usage (Recommended)

Use the package directly with pnpm dlx without cloning:

1. **Configure MCP Server**

   Configure your environment variables in your `~/.cursor/mcp.json` file:

   ```json
   {
     "mcpServers": {
       "monday": {
         "command": "pnpm",
         "args": ["dlx", "@nasseratic/monday-mcp-server@latest"],
         "env": {
           "MONDAY_API_TOKEN": "your_monday_api_token",
           "MONDAY_TASKS_BOARD_ID": "your_monday_board_id"
         }
       }
     }
   }
   ```

   - `MONDAY_API_TOKEN`: Your Monday.com API token (v2 Token)
   - `MONDAY_TASKS_BOARD_ID`: The ID of the Monday.com board containing your tasks

### Option 2: Development Setup

If you want to modify the source code or contribute:

1. **Clone the repository**

   ```bash
   git clone https://github.com/Nasseratic/mcp-server-monday.git
   cd mcp-server-monday
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Development Configuration**

   Configure your environment variables in your `~/.cursor/mcp.json` file to use the local development version:

   ```json
   {
     "mcpServers": {
       "monday": {
         "command": "pnpm",
         "args": ["start"],
         "cwd": "/path/to/your/mcp-server-monday",
         "env": {
           "MONDAY_API_TOKEN": "your_monday_api_token",
           "MONDAY_TASKS_BOARD_ID": "your_monday_board_id"
         }
       }
     }
   }
   ```

   - Replace `/path/to/your/mcp-server-monday` with the actual path where you cloned the repository.

## Monday.com API Setup

To get your Monday.com API token:

1. Go to your Monday.com account
2. Click on your avatar > Developers > My API tokens
3. Generate a new API token with appropriate permissions

To get your Monday.com board ID:

1. Open the board in Monday.com
2. The board ID is the number in the URL after "boards/"
