# MCP Server Documentation

## Overview

The Posts CRUD API includes a fully functional **Model Context Protocol (MCP)** server that exposes all post operations as tools, resources, and prompts for integration with AI models and Claude extensions.

**Author:** Dheeraj Kumar

## What is the Model Context Protocol (MCP)?

MCP is a standard protocol that enables AI models and applications to interact with external systems, databases, and tools in a structured way. It provides:

- **Tools** - Functions the AI can call (e.g., create_post, get_post)
- **Resources** - Data sources the AI can read (e.g., all posts, statistics)
- **Prompts** - Pre-written instructions for specific tasks
- **Sampling** - Streaming responses for complex operations

## MCP Server Location

The MCP server is implemented in the `src/mcp/` directory:

```
src/mcp/
└── server.ts       # Main MCP server implementation (self-contained)
```

All tools, resources, and prompts are registered directly in `server.ts` using the modern `registerTool()`, `registerResource()`, and `registerPrompt()` API patterns.

## Starting the MCP Server

### From Command Line

```bash
npm run mcp
```

This starts the MCP server on stdio (standard input/output) for communication with Claude extensions.

### Via VS Code

The MCP server is automatically configured in `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "posts-crud": {
      "command": "npx",
      "args": ["ts-node", "src/mcp/server.ts"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "",
        "DB_NAME": "posts_crud_db"
      },
      "disabled": false,
      "autostart": true
    }
  }
}
```

VS Code will automatically discover and load this configuration.

## 🧰 Tools

Tools are functions that the AI can call to perform CRUD operations on posts. All tools return JSON responses.

### 1. list_posts

**Description:** Retrieve all posts from the database

**Input:** None required

**Example:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "First Post",
      "content": "Content here...",
      "author": "Dheeraj Kumar",
      "created_at": "2026-04-07 10:00:00",
      "updated_at": "2026-04-07 10:00:00"
    }
  ]
}
```

### 2. get_post

**Description:** Retrieve a specific post by ID

**Input:**

- `id` (number, required): The post ID

**Example Call:**

```json
{
  "id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "First Post",
    "content": "Content here...",
    "author": "Dheeraj Kumar",
    "created_at": "2026-04-07 10:00:00",
    "updated_at": "2026-04-07 10:00:00"
  }
}
```

### 3. get_posts_by_author

**Description:** Retrieve all posts by a specific author

**Input:**

- `author` (string, required): The author name

**Example Call:**

```json
{
  "author": "Dheeraj Kumar"
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "First Post",
      "content": "Content here...",
      "author": "Dheeraj Kumar",
      "created_at": "2026-04-07 10:00:00",
      "updated_at": "2026-04-07 10:00:00"
    }
  ]
}
```

### 4. create_post

**Description:** Create a new post

**Input:**

- `title` (string, required): Post title (max 255 characters)
- `content` (string, required): Post content
- `author` (string, required): Author name (max 100 characters)

**Example Call:**

```json
{
  "title": "My New Post",
  "content": "This is the content of my post...",
  "author": "Dheeraj Kumar"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "My New Post",
    "content": "This is the content of my post...",
    "author": "Dheeraj Kumar",
    "created_at": "2026-04-07 11:00:00",
    "updated_at": "2026-04-07 11:00:00"
  }
}
```

### 5. update_post

**Description:** Update an existing post

**Input:**

- `id` (number, required): Post ID
- `title` (string, optional): New title
- `content` (string, optional): New content
- `author` (string, optional): New author name

**Example Call:**

```json
{
  "id": 1,
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content...",
    "author": "Dheeraj Kumar",
    "created_at": "2026-04-07 10:00:00",
    "updated_at": "2026-04-07 11:30:00"
  }
}
```

### 6. delete_post

**Description:** Delete a post by ID

**Input:**

- `id` (number, required): Post ID

**Example Call:**

```json
{
  "id": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### 7. count_posts

**Description:** Get the total number of posts

**Input:** None required

**Response:**

```json
{
  "success": true,
  "count": 5
}
```

## 📚 Resources

Resources provide structured data that AI models can read. They're useful for context and reference information.

### 1. posts://all

**Name:** All Posts  
**URI:** `posts://all`  
**Type:** `application/json`

Returns a complete list of all posts in the database.

**Response:**

```json
{
  "uri": "posts://all",
  "name": "All Posts",
  "content": [
    {
      "id": 1,
      "title": "First Post",
      "content": "...",
      "author": "Dheeraj Kumar",
      "created_at": "2026-04-07 10:00:00",
      "updated_at": "2026-04-07 10:00:00"
    }
  ],
  "timestamp": "2026-04-07T11:00:00.000Z"
}
```

### 2. posts://statistics

**Name:** Posts Statistics  
**URI:** `posts://statistics`  
**Type:** `application/json`

Returns aggregated statistics about the posts collection.

**Response:**

```json
{
  "uri": "posts://statistics",
  "name": "Posts Statistics",
  "content": {
    "total_posts": 5,
    "total_authors": 2,
    "authors_list": ["Dheeraj Kumar", "Jane Doe"],
    "oldest_post": "2026-04-07 09:00:00",
    "newest_post": "2026-04-07 11:30:00"
  },
  "timestamp": "2026-04-07T11:00:00.000Z"
}
```

## 💬 Prompts

Prompts are pre-written instructions that guide the AI when performing common tasks. They provide context-specific guidance.

### 1. create_blog_post

**Name:** create_blog_post  
**Arguments:**

- `topic` (required): The topic/subject of the blog post
- `author` (required): Author name

**Usage:**
Used when the AI needs to create a new blog post. Provides guidance on structure, tone, and best practices.

### 2. analyze_posts

**Name:** analyze_posts  
**Arguments:**

- `focus_area` (optional): What aspect to focus on (e.g., most_active_authors, content_themes)

**Usage:**
Used when analyzing the posts collection. Provides a structured approach to content analysis.

### 3. manage_posts

**Name:** manage_posts  
**Arguments:**

- `operation` (required): The operation to perform (create, update, delete, list)

**Usage:**
General-purpose prompt for post management tasks. Lists available tools and best practices.

## 🔄 Request/Response Cycle

Here's how the MCP protocol works:

1. **Claude Extension** makes a request to list tools/resources/prompts
2. **MCP Server** responds with available capabilities
3. **Claude** selects appropriate tool or resource
4. **Claude** sends a tool call request with parameters
5. **MCP Server** executes the tool/resource and returns result
6. **Claude** processes the result and responds to the user

### Example Flow

```
User: "Create a new blog post about TypeScript basics"
  ↓
[Claude requests list_tools]
  ↓
[Server responds with available tools]
  ↓
[Claude selects create_post tool and sampling context]
  ↓
[Claude calls get_prompt('create_blog_post', {topic: 'TypeScript basics', author: 'Dheeraj Kumar'})]
  ↓
[Server returns detailed prompt instructions]
  ↓
[Claude generates blog content]
  ↓
[Claude calls create_post tool with generated content]
  ↓
[Server creates post and returns new post object]
  ↓
Claude: "✓ Blog post created successfully! [shows post details]"
```

## 🔧 Configuration

### Modify MCP Server Settings

Edit `.vscode/mcp.json` to customize:

```json
{
  "mcpServers": {
    "posts-crud": {
      "command": "npx",
      "args": ["ts-node", "src/mcp/server.ts"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "",
        "DB_NAME": "posts_crud_db",
        "NODE_ENV": "development"
      },
      "disabled": false,
      "autostart": true
    }
  }
}
```

### Environment Variables

The MCP server reads the same environment variables as the REST API:

| Variable      | Purpose                              |
| ------------- | ------------------------------------ |
| `DB_HOST`     | MySQL server hostname                |
| `DB_PORT`     | MySQL server port                    |
| `DB_USER`     | MySQL username                       |
| `DB_PASSWORD` | MySQL password                       |
| `DB_NAME`     | Database name                        |
| `NODE_ENV`    | Environment (development/production) |

## 🛠️ Adding Custom Tools

To add a new tool, edit `src/mcp/server.ts` and add a registration in the `main()` function:

```typescript
server.registerTool(
  'search_posts',
  {
    title: 'Search Posts',
    description: 'Search posts by keyword',
  },
  withMcpInterceptor('tool:search_posts', async (input) => {
    // Validate input with Zod
    const validated = z
      .object({
        query: z.string().min(1),
      })
      .parse(input);

    // Implementation
    const results = await db.query('SELECT * FROM posts WHERE title LIKE ?', [
      `%${validated.query}%`,
    ]);

    return { success: true, data: results };
  }),
  {
    inputSchema: z.object({
      query: z.string().min(1).describe('Search query'),
    }),
  }
);
```

The `withMcpInterceptor()` middleware automatically handles:

- Error logging to stderr
- Exception catching and formatting
- Structured error responses

## 🛡️ Error Handling

All tools return structured error responses:

```json
{
  "success": false,
  "error": "Post not found"
}
```

Common error scenarios:

- **Validation errors** - Invalid input parameters
- **Not found** - Resource doesn't exist
- **Database errors** - Connection or query failures

## 📊 Sampling

The MCP server supports streaming responses via sampling. This is useful for:

- Long-running operations
- Large datasets
- Progressive content generation

Configure sampling in your MCP client to receive responses incrementally.

## 🔐 Security Considerations

1. **Environment Variables** - Keep credentials in `.env`, not in code
2. **Input Validation** - All inputs are validated using Zod schemas
3. **SQL Injection** - Using parameterized queries via mysql2
4. **CORS** - Configure as needed for your deployment

## 📈 Performance Tips

1. **Database Indexing** - Index is created on the `author` column for faster queries
2. **Connection Pooling** - Uses connection pool for better resource management
3. **Caching** - Consider adding Redis for frequently accessed data
4. **Pagination** - For large datasets, add pagination to list_posts

## 🧪 Testing the MCP Server

### Using MCP Inspector (if available)

```bash
npm run mcp 2>&1 | tail -20
```

### Manual Testing with Node.js

```javascript
const { spawn } = require('child_process');

const server = spawn('npx', ['ts-node', 'src/mcp/server.ts'], {
  env: process.env,
});

server.stdin.write(
  JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  })
);

server.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});
```

## 📚 Further Reading

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude API Documentation](https://claude.ai/docs)
- [Express.js Guide](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [Zod Validation](https://zod.dev/)

## 🐛 Troubleshooting

### MCP Server Won't Start

```bash
# Check Node.js version
node --version

# Try running directly
npx ts-node src/mcp/server.ts
```

### Connection to Database Fails

1. Verify MySQL is running
2. Check `.env` variables match MySQL credentials
3. Run `npm run db:init` to create database

### Tools Not Appearing in Claude

1. Restart VS Code
2. Check `.vscode/mcp.json` syntax
3. Verify MCP server is running (`npm run mcp`)

## 📞 Support

For issues or questions:

1. Check the main [README.md](./README.md)
2. Review error messages in terminal
3. Verify database connectivity
4. Check MCP server logs

---

**Author:** Dheeraj Kumar  
**Last Updated:** 2026-04-07
