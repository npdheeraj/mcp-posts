# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Clients & Users                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Postman    │  │    Claude    │      │
│  │   (REST)     │  │   (REST)     │  │   (MCP)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
              ↓                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Application                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │        Express REST API Server (Port 3000)          │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Routes Handler (src/api/routes.ts)          │   │    │
│  │  │  • GET /api/posts                            │   │    │
│  │  │  • GET /api/posts/:id                        │   │    │
│  │  │  • POST /api/posts                           │   │    │
│  │  │  • PUT /api/posts/:id                        │   │    │
│  │  │  • DELETE /api/posts/:id                     │   │    │
│  │  │  • GET /api/author/:author                   │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                      ↓                               │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Data Validation (src/validation/*)          │   │    │
│  │  │  Zod Schemas for:                            │   │    │
│  │  │  • CreatePost                                │   │    │
│  │  │  • UpdatePost                                │   │    │
│  │  │  • PostId validation                         │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                      ↓                               │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Database Layer (src/database/*)             │   │    │
│  │  │  CRUD Operations:                            │   │    │
│  │  │  • getAllPosts()                             │   │    │
│  │  │  • getPostById()                             │   │    │
│  │  │  • createPost()                              │   │    │
│  │  │  • updatePost()                              │   │    │
│  │  │  • deletePost()                              │   │    │
│  │  │  • countPosts()                              │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │        MCP Server (stdio transport)                  │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Tools (src/mcp/tools.ts)                    │   │    │
│  │  │  • list_posts                                │   │    │
│  │  │  • get_post                                  │   │    │
│  │  │  • create_post                               │   │    │
│  │  │  • update_post                               │   │    │
│  │  │  • delete_post                               │   │    │
│  │  │  • get_posts_by_author                       │   │    │
│  │  │  • count_posts                               │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                       │    │
│  │  All MCP operations (tools, resources, prompts)      │    │
│  │  are registered directly in src/mcp/server.ts        │    │
│  │  using the modern registration-based pattern with    │    │
│  │  withMcpInterceptor() middleware for error handling. │    │
│  │                                                       │    │
│  │  7 Tools:                                            │    │
│  │  • createPost, getPost, listPosts                    │    │
│  │  • getPostsByAuthor, updatePost                      │    │
│  │  • deletePost, countPosts                            │    │
│  │                                                       │    │
│  │  2 Resources: posts://all, posts://statistics        │    │
│  │                                                       │    │
│  │  3 Prompts: postOutline, createBlogPost, analyzePosts│    │
│  │                      ↓                               │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Database Layer (shared with REST API)       │   │    │
│  │  │  (same CRUD operations)                      │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│                     MySQL Database                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  posts table                         │    │
│  │  ┌────┬────────┬──────────┬────────┬────┬────┐     │    │
│  │  │ id │ title  │ content  │ author │ created │       │    │
│  │  ├────┼────────┼──────────┼────────┼────┼────┤     │    │
│  │  │ 1  │ Post 1 │ Content1 │ Author │... │... │     │    │
│  │  │ 2  │ Post 2 │ Content2 │ Author │... │... │     │    │
│  │  │ 3  │ Post 3 │ Content3 │ Author │... │... │     │    │
│  │  └────┴────────┴──────────┴────────┴────┴────┘     │    │
│  │                                                       │    │
│  │  Indexes: author column for fast lookups             │    │
│  │  Pool: 10 concurrent connections                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow Diagrams

### REST API Request Flow

```
HTTP Request
    ↓
Express Router
    ↓
Input Validation (Zod)
    ↓
Database Layer Function
    ↓
MySQL Query
    ↓
Response JSON
    ↓
HTTP Response
```

### MCP Server Request Flow

```
Claude Extension
    ↓
MCP Protocol Request
    ↓
Tool/Resource Handler
    ↓
Input Validation (Zod)
    ↓
Database Layer Function
    ↓
MySQL Query
    ↓
JSON Response
    ↓
MCP Protocol Response
    ↓
Claude Extension
```

## Component Responsibilities

### API Routes (`src/api/routes.ts`)

- Handle HTTP requests
- Route to appropriate handlers
- Validate input using Zod
- Format responses

### Database Layer (`src/database/`)

- Manage database connections
- Execute CRUD operations
- Handle parameterized queries (SQL injection prevention)
- Return typed results

### Validation (`src/validation/`)

- Define schemas using Zod
- Validate input data
- Provide type safety

### MCP Layer (`src/mcp/`)

- **Tools**: Callable functions for CRUD operations
- **Resources**: Read-only data sources
- **Prompts**: AI-friendly instructions
- **Server**: Manages MCP protocol communication

### Configuration (`src/database/config.ts`)

- Create MySQL connection pool
- Read environment variables
- Manage connections

## Data Flow Example: Creating a Post

### Via REST API

```
POST /api/posts
{
  "title": "My Post",
  "content": "Content here",
  "author": "Dheeraj Kumar"
}
↓
routes.ts validates with CreatePostSchema
↓
postsDB.createPost() executes INSERT
↓
INSERT INTO posts (title, content, author) VALUES (?, ?, ?)
↓
MySQL returns new post with ID
↓
Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Post",
    "content": "Content here",
    "author": "Dheeraj Kumar",
    "created_at": "2026-04-07 10:00:00",
    "updated_at": "2026-04-07 10:00:00"
  }
}
```

### Via MCP Server

```
Claude: "Create a blog post about TypeScript"
↓
Claude calls get_prompt('create_blog_post', {...})
↓
MCP returns prompt template
↓
Claude generates content and calls create_post tool
↓
{
  "title": "TypeScript Basics",
  "content": "...",
  "author": "Dheeraj Kumar"
}
↓
handleTool('create_post', toolInput)
↓
Validates with CreatePostSchema
↓
postsDB.createPost() executes INSERT
↓
Returns new post object to Claude
↓
Claude displays result to user
```

## Technology Stack

| Layer          | Technology                | Purpose            |
| -------------- | ------------------------- | ------------------ |
| **Runtime**    | Node.js 22.22+            | JavaScript runtime |
| **Language**   | TypeScript                | Type-safe code     |
| **Framework**  | Express.js                | REST API routing   |
| **Database**   | MySQL                     | Data persistence   |
| **Validation** | Zod                       | Schema validation  |
| **MCP**        | @modelcontextprotocol/sdk | AI integration     |

## File Structure

```
src/
├── api/
│   └── routes.ts              # HTTP endpoint handlers
├── database/
│   ├── config.ts              # Connection pool setup
│   ├── init.ts                # Database initialization
│   └── posts.ts               # CRUD operations
├── mcp/
│   └── server.ts              # MCP server (self-contained)
├── validation/
│   └── postSchema.ts          # Zod schemas
└── server.ts                  # Express app entry point
```

## Database Schema

```sql
posts
├── id (INT, PK, AUTO_INCREMENT)
├── title (VARCHAR 255, NOT NULL)
├── content (LONGTEXT, NOT NULL)
├── author (VARCHAR 100, NOT NULL)
├── created_at (TIMESTAMP, DEFAULT NOW)
├── updated_at (TIMESTAMP, DEFAULT NOW, ON UPDATE)
└── INDEX: author
```

## Environment Configuration

```
.env
├── DB_HOST (localhost)
├── DB_PORT (3306)
├── DB_USER (root)
├── DB_PASSWORD (empty)
├── DB_NAME (posts_crud_db)
├── API_PORT (3000)
└── NODE_ENV (development)
```

## Integration Points

### VS Code / Claude Extension

- **Configuration**: `.vscode/mcp.json`
- **Communication**: stdio (standard input/output)
- **Protocol**: Model Context Protocol (MCP)

### External Clients

- **REST**: HTTP/HTTPS
- **Format**: JSON
- **Port**: 3000 (configurable)

### MCP Server

- **Transport**: stdio
- **Command**: `npx ts-node src/mcp/server.ts`
- **Config**: `.vscode/mcp.json`

## Performance Considerations

1. **Connection Pooling**
   - Pool size: 10 connections
   - Reuses connections across requests

2. **Database Indexing**
   - Index on `author` column for faster searches

3. **Parameterized Queries**
   - Prevents SQL injection
   - Improves query caching

4. **Type Safety**
   - TypeScript prevents runtime errors
   - Zod validates at runtime

## Security Measures

1. **Input Validation**
   - Zod schemas validate all inputs
   - Type checking at compile time

2. **SQL Injection Prevention**
   - Parameterized queries with placeholders
   - Never concatenate user input into SQL

3. **Environment Variables**
   - Sensitive config stored in .env
   - Not committed to version control

4. **Error Handling**
   - Generic error messages to clients
   - Detailed logs in server

## Scaling Considerations

To scale this application:

1. **Database**
   - Use connection pooling (already implemented)
   - Add read replicas for heavy reads
   - Implement caching layer (Redis)

2. **API**
   - Add pagination to list_posts
   - Implement rate limiting
   - Use reverse proxy (Nginx)

3. **MCP**
   - Run multiple MCP server instances
   - Load balance between instances

4. **Monitoring**
   - Add logging (Winston, Bunyan)
   - Monitor database health
   - Track API response times

---

**Author**: Dheeraj Kumar  
**Last Updated**: 2026-04-07
