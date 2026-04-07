# MCP Server Modernization Guide

## Overview of Changes

The MCP server has been refactored to use the modern `registerTool()`, `registerResource()`, and `registerPrompt()` API pattern with `withMcpInterceptor()` middleware support.

**Author:** Dheeraj Kumar  
**Date:** 2026-04-08  
**Version:** 2.0.0

---

## What Changed?

### Old Pattern (Request Handlers)

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // handler logic
});
```

### New Pattern (Registration-Based)

```typescript
server.registerTool(
  'toolName',
  { title: '...', description: '...' },
  withMcpInterceptor('tool:toolName', async (input) => {
    // handler logic
  }),
  {
    /* zod schemas */
  }
);
```

---

## Key Features of New Implementation

### 1. **registerTool()** - Direct Tool Registration

```typescript
server.registerTool(
  'createPost',
  {
    title: 'Create Post',
    description: 'Create a new blog post in the database',
  },
  withMcpInterceptor('tool:createPost', async (input) => {
    const validated = CreatePostSchema.parse(input);
    const post = await postsDB.createPost(validated);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(post) }],
      structuredContent: post as Record<string, unknown>,
    };
  }),
  {
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    author: z.string().min(1).max(100),
  }
);
```

**Benefits:**

- Direct Zod schema validation in registration
- Cleaner, more declarative syntax
- Built-in error handling
- Better IDE hints and autocomplete

### 2. **registerResource()** - Direct Resource Registration

```typescript
server.registerResource(
  'allPosts',
  'posts://all',
  {
    title: 'All Posts',
    description: 'Access the complete list of all posts',
  },
  withMcpInterceptor('resource:allPosts', async (uri) => {
    const posts = await postsDB.getAllPosts();
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json' as const,
          text: JSON.stringify({ uri: uri.href, posts }),
        },
      ],
    };
  })
);
```

**Benefits:**

- URI-based resource identification
- Standalone resource definitions
- No separate list/read handlers needed

### 3. **registerPrompt()** - Direct Prompt Registration

```typescript
server.registerPrompt(
  'postOutline',
  {
    title: 'Post Outline Prompt',
    description: 'Generate a structured outline',
  },
  withMcpInterceptor(
    'prompt:postOutline',
    ({ topic, audience = 'developers', tone = 'practical' }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Create outline for: ${topic}...`,
          },
        },
      ],
    })
  ),
  {
    topic: z.string().describe('The blog post topic'),
    audience: z.string().optional(),
    tone: z.string().optional(),
  }
);
```

**Benefits:**

- Argument validation with Zod
- Cleaner prompt definition
- Type-safe argument passing

### 4. **withMcpInterceptor()** - Middleware Pattern

```typescript
withMcpInterceptor(
  'tool:createPost', // operation name for logging
  async (input) => {
    // Your logic here
  }
);
```

**Features:**

- Automatic error logging
- Operation tracking
- Consistent error handling
- Debug output via stderr

### 5. **Sampling Support** - Streaming Responses

```typescript
export async function generatePostContent(prompt: string, maxTokens = 500): Promise<string> {
  // Future enhancement for streaming responses
  return prompt;
}
```

---

## New File Structure

```
src/mcp/
├── server.ts              ⭐ Main refactored server (now self-contained)
├── tools.ts               (Utilities & helpers, not required by server)
├── resources.ts           (Utilities & helpers, not required by server)
├── prompts.ts             (Utilities & helpers, not required by server)
└── postStore.ts           ✨ NEW - Clean abstraction layer
```

### New postStore.ts Module

A clean abstraction layer for post operations:

```typescript
import { postStore } from './mcp/postStore';

// Usage in tools
const post = await postStore.create({
  title: 'My Post',
  content: '...',
  author: 'Dheeraj Kumar',
});

const posts = await postStore.list({ author: 'Dheeraj Kumar' });
const stats = await postStore.getStatistics();
```

---

## Tools (7 Total)

### 1. createPost

**Input:**

- `title` (string, 1-255 chars)
- `content` (string)
- `author` (string, 1-100 chars)

**Output:**

```json
{
  "content": [{ "type": "text", "text": "..." }],
  "structuredContent": {
    /* post object */
  }
}
```

### 2. getPost

**Input:**

- `id` (positive integer)

### 3. listPosts

**Input:** None

**Returns:** Array of all posts

### 4. getPostsByAuthor

**Input:**

- `author` (string)

### 5. updatePost

**Input:**

- `id` (positive integer)
- `title` (optional)
- `content` (optional)
- `author` (optional)

### 6. deletePost

**Input:**

- `id` (positive integer)

### 7. countPosts

**Input:** None

**Returns:** `{ count: number }`

---

## Resources (2 Total)

### 1. posts://all

**URI:** `posts://all`  
**Description:** All posts in the database

**Response:**

```json
{
  "uri": "posts://all",
  "title": "All Posts",
  "posts": [...]
}
```

### 2. posts://statistics

**URI:** `posts://statistics`  
**Description:** Statistics about posts

**Response:**

```json
{
  "uri": "posts://statistics",
  "title": "Posts Statistics",
  "statistics": {
    "total_posts": 5,
    "total_authors": 2,
    "authors_list": ["Dheeraj Kumar", ...],
    "oldest_post": "2026-04-07 10:00:00",
    "newest_post": "2026-04-08 11:00:00"
  }
}
```

---

## Prompts (3 Total)

### 1. postOutline

**Arguments:**

- `topic` (required): Blog post topic
- `audience` (optional): Target audience
- `tone` (optional): Writing tone

**Example:**

```
POST postOutline
topic: "TypeScript Advanced Patterns"
audience: "intermediate developers"
tone: "technical"
```

### 2. createBlogPost

**Arguments:**

- `title` (required): Post title
- `topic` (required): Main topic
- `style` (optional): Writing style

### 3. analyzePosts

**Arguments:**

- `focusArea` (optional): Focus area for analysis

---

## Error Handling

### Automatic Error Logging

The `withMcpInterceptor()` middleware automatically logs to stderr:

```
[MCP] Executing tool:createPost...
[MCP] tool:createPost completed successfully

// On error:
[MCP] tool:createPost failed: validation error
```

### Error Response Format

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"error\": \"error message\"}"
    }
  ],
  "isError": true
}
```

---

## Using PostStore

### Example 1: Create Post

```typescript
const post = await postStore.create({
  title: 'My Blog Post',
  content: 'This is a great post...',
  author: 'Dheeraj Kumar',
});
```

### Example 2: List Posts

```typescript
// All posts
const allPosts = await postStore.list();

// Posts by author
const myPosts = await postStore.list({ author: 'Dheeraj Kumar' });
```

### Example 3: Get Statistics

```typescript
const stats = await postStore.getStatistics();
// Returns: {
//   total_posts: 5,
//   total_authors: 2,
//   authors_list: [...],
//   ...
// }
```

### Example 4: Update Post

```typescript
const updated = await postStore.update({
  id: 1,
  title: 'Updated Title',
  content: 'Updated content...',
});
```

---

## Migration Guide

If you're updating from the old pattern:

### Old: Tool Definition

```typescript
export const postTools = [
  {
    name: "list_posts",
    description: "...",
    inputSchema: { type: "object", properties: {...} }
  }
];

export async function handleTool(name, input) {
  // switch case for each tool
}
```

### New: Tool Definition

```typescript
server.registerTool(
  "listPosts",
  { title: "...", description: "..." },
  withMcpInterceptor("tool:listPosts", async (_input) => {
    const posts = await postsDB.getAllPosts();
    return { content: [...], structuredContent: {...} };
  }),
  {},
);
```

### Key Differences

1. **Name Change:** `list_posts` → `listPosts` (camelCase)
2. **Direct Registration:** No separate array definitions
3. **Zod Schemas:** Use directly in registration
4. **Type Safety:** Better TypeScript support
5. **Error Handling:** Built-in via `withMcpInterceptor`

---

## Sampling (Future Enhancement)

The server includes a placeholder for sampling support:

```typescript
export async function generatePostContent(prompt: string, maxTokens = 500): Promise<string> {
  // Uncomment and implement when MCP client supports sampling
}
```

### When to Use Sampling

- Long-running operations
- Large data generation
- Streaming responses
- Progressive content generation

---

## Testing the New Server

### Start the Server

```bash
npm run mcp
```

### Test with Claude Extension

1. The MCP server will auto-discover
2. All tools, resources, and prompts will be available
3. Check VS Code output for registration:
   ```
   ✓ Posts CRUD MCP Server running on stdio
   ✓ 7 Tools registered
   ✓ 2 Resources registered
   ✓ 3 Prompts registered
   ```

### Test with cURL (indirect)

Since MCP uses stdio, you can't test directly with cURL, but you can test the REST API:

```bash
# Start REST API in one terminal
npm run dev

# Test in another terminal
curl http://localhost:3000/api/posts
```

---

## Performance Improvements

### 1. Reduced Overhead

- No request handler switching
- Direct registration reduces lookup time
- Fewer conditional checks

### 2. Better Type Safety

- Zod validation at registration
- TypeScript strict mode
- Compile-time error detection

### 3. Cleaner Code

- Middleware pattern is more maintainable
- Separation of concerns improved
- Easier to add new tools/resources/prompts

---

## Adding New Tools

To add a new tool after initialization:

```typescript
server.registerTool(
  'newTool',
  {
    title: 'New Tool',
    description: 'Does something useful',
  },
  withMcpInterceptor('tool:newTool', async (input) => {
    const result = await someOperation(input);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result) }],
      structuredContent: result,
    };
  }),
  {
    // Zod schemas for input validation
    parameterName: z.string().describe('Parameter description'),
  }
);
```

---

## Documentation Updates

- **Main Docs:** See [README.md](../README.md)
- **MCP Guide:** See [MCP_SERVER.md](../MCP_SERVER.md) (updated)
- **Development:** See [DEVELOPMENT.md](../DEVELOPMENT.md)
- **Architecture:** See [ARCHITECTURE.md](../ARCHITECTURE.md) (updated)

---

## Backward Compatibility

The old utility modules are still available for reference:

- `src/mcp/tools.ts` - Contains helper functions
- `src/mcp/resources.ts` - Contains helper functions
- `src/mcp/prompts.ts` - Contains helper functions

These can be removed if not needed, or used as utility libraries.

---

## Summary of Benefits

✅ **Cleaner Code:** Declarative tool/resource/prompt registration  
✅ **Better Error Handling:** Automatic logging and error formatting  
✅ **Type Safety:** Direct Zod schema validation  
✅ **Maintainability:** Single-file server implementation  
✅ **Extensibility:** Easy to add new tools/resources/prompts  
✅ **Performance:** Reduced overhead and lookup time  
✅ **IDE Support:** Better autocomplete and hints

---

## Troubleshooting

### Tools Not Appearing

1. Restart VS Code
2. Run: `npm run mcp`
3. Check stderr for registration messages
4. Verify `.vscode/mcp.json` configuration

### Tool Execution Fails

1. Check stderr for `[MCP]` log messages
2. Verify input matches Zod schema
3. Check database connectivity
4. Review error in response

### Module Not Found

```bash
npm install
# or
npm install --save-dev @modelcontextprotocol/sdk
```

---

**v2.0.0 Complete! 🎉**

All systems updated to modern MCP pattern. Enjoy cleaner, more maintainable code!
