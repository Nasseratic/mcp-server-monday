# Monday.com MCP Server

A Monday.com Model Context Protocol (MCP) server implementation in TypeScript for handling Monday.com task-related operations.

## Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Nasseratic/mcp-server-monday.git
   cd mcp-server-monday
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configuration Setup**

   Configure your environment variables in your `~/.cursor/mcp.json` file instead of using a `.env` file:

   ```json
   {
     "mcpServers": {
       "monday": {
         "command": "pnpm",
         "args": ["dlx", "tsx", "/path/to/your/mcp-server-monday/src/mcp.ts"],
         "env": {
           "MONDAY_API_TOKEN": "your_monday_api_token",
           "MONDAY_TASKS_BOARD_ID": "your_monday_board_id"
         }
       }
     }
   }
   ```

   - Replace `/path/to/your/mcp-server-monday` in the configuration with the actual path where you cloned the repository.
   - `MONDAY_API_TOKEN`: Your Monday.com API token (v2 Token)
   - `MONDAY_TASKS_BOARD_ID`: The ID of the Monday.com board containing your tasks

   To get your Monday.com API token:

   1. Go to your Monday.com account
   2. Click on your avatar > Developers > My API tokens
   3. Generate a new API token with appropriate permissions

   To get your Monday.com board ID:

   1. Open the board in Monday.com
   2. The board ID is the number in the URL after "boards/"
