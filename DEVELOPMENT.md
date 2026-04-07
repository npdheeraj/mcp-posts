# Development Guide

## Extending & Customizing the Posts CRUD API

This guide helps developers understand how to extend and customize the project.

**Author:** Dheeraj Kumar

---

## 🎯 Common Development Tasks

### 1. Adding a New API Endpoint

#### Example: Search posts by title

**Step 1:** Add the function to `src/database/posts.ts`

```typescript
export async function searchPostsByTitle(query: string): Promise<Post[]> {
  const [rows] = await pool.query<any[]>(
    'SELECT * FROM posts WHERE title LIKE ? ORDER BY created_at DESC',
    [`%${query}%`]
  );
  return rows;
}
```

**Step 2:** Add the route to `src/api/routes.ts`

```typescript
// GET posts by title search
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
    }

    const posts = await postsDB.searchPostsByTitle(q);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});
```

**Step 3:** Test with cURL

```bash
curl "http://localhost:3000/api/search?q=typescript"
```

---

### 2. Adding a New MCP Tool

#### Example: Adding a tool to the MCP server

**Note:** All MCP tools are now registered directly in `src/mcp/server.ts` using the modern `registerTool()` pattern.

**Steps:**

1. Open `src/mcp/server.ts`
2. Add your tool registration in the `main()` function:

```typescript
server.registerTool(
  'your_tool_name',
  {
    title: 'Your Tool Title',
    description: 'What your tool does',
  },
  withMcpInterceptor('tool:your_tool_name', async (input) => {
    // Your tool logic here
    return { result: 'output' };
  }),
  {
    inputSchema: /* Zod schema for validation */
  }
);
```

3. Restart MCP server:

```bash
npm run mcp
```

Claude will now have access to the search_posts tool!

---

### 3. Adding a New Database Field

#### Example: Add "tags" field to posts

**Step 1:** Create migration script `src/database/migrations/001_add_tags.ts`

```typescript
import pool from '../config';

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE posts ADD COLUMN tags VARCHAR(255) DEFAULT NULL
    `);
    console.log('✓ Added tags column to posts table');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrate();
```

**Step 2:** Update Zod schema in `src/validation/postSchema.ts`

```typescript
export const CreatePostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  author: z.string().min(1).max(100),
  tags: z.string().max(255).optional(), // NEW
});
```

**Step 3:** Update database functions in `src/database/posts.ts`

```typescript
export async function createPost(data: CreatePost): Promise<Post> {
  const [result] = await pool.query<any>(
    'INSERT INTO posts (title, content, author, tags) VALUES (?, ?, ?, ?)',
    [data.title, data.content, data.author, data.tags || null]
  );
  // ... rest of function
}
```

**Step 4:** Update API routes in `src/api/routes.ts` (if needed for tags filtering)

---

### 4. Adding Input Validation

#### Example: Add email validation for author field

**In `src/validation/postSchema.ts`:**

```typescript
import { z } from 'zod';

// Create custom refinement
const validEmail = z.string().email('Invalid email format');

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title required').max(255),
  content: z.string().min(1, 'Content required'),
  author: z.string().min(1, 'Author required').max(100),
  authorEmail: validEmail.optional(), // NEW
});
```

---

### 5. Adding Error Handling

#### Example: Add custom error handler

**In `src/server.ts`:**

```typescript
// Custom error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors,
    });
  }

  // Handle database errors
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(404).json({
      success: false,
      error: 'Referenced record not found',
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});
```

---

### 6. Adding Logging

#### Example: Add request logging

**In `src/server.ts`:**

```typescript
// Simple logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

For production, add a logging library:

```bash
npm install winston
```

---

### 7. Adding Authentication

#### Example: Add API key authentication

**Create `src/middleware/auth.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API key',
    });
  }

  next();
}
```

**Use in routes:**

```typescript
router.post('/posts', requireApiKey, async (req, res) => {
  // ... handler
});
```

---

### 8. Adding Pagination

#### Example: Add pagination to list_posts

**Update `src/database/posts.ts`:**

```typescript
export async function getAllPosts(
  page = 1,
  limit = 10
): Promise<{
  data: Post[];
  total: number;
  page: number;
  limit: number;
}> {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query<any[]>(
    'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  const [countResult] = await pool.query<any>('SELECT COUNT(*) as count FROM posts');

  return {
    data: rows,
    total: countResult[0].count,
    page,
    limit,
  };
}
```

---

### 9. Adding Caching

#### Example: Add Redis caching

**Install Redis:**

```bash
npm install redis
```

**Create `src/cache/redis.ts`:**

```typescript
import { createClient } from 'redis';

const client = createClient();
client.connect();

export async function getCachedPosts() {
  return await client.get('posts:all');
}

export async function setCachedPosts(posts: any[]) {
  await client.setEx('posts:all', 3600, JSON.stringify(posts)); // 1 hour
}
```

**Use in database functions:**

```typescript
export async function getAllPosts() {
  const cached = await getCachedPosts();
  if (cached) return JSON.parse(cached);

  const posts = await pool.query(...);
  await setCachedPosts(posts);
  return posts;
}
```

---

### 10. Adding Unit Tests

#### Example: Test the posts service

**Install Jest:**

```bash
npm install --save-dev jest @types/jest ts-jest
```

**Create `src/database/posts.test.ts`:**

```typescript
import * as postsDB from './posts';

describe('Posts Database', () => {
  test('should create a post', async () => {
    const post = await postsDB.createPost({
      title: 'Test Post',
      content: 'Test content',
      author: 'Test Author',
    });

    expect(post.id).toBeDefined();
    expect(post.title).toBe('Test Post');
  });

  test('should retrieve a post by ID', async () => {
    const post = await postsDB.getPostById(1);
    expect(post).toBeDefined();
  });
});
```

---

## 🏗️ Project Structure Best Practices

### Keep Similar Code Together

```
src/api/      - HTTP handlers
src/mcp/      - MCP handlers
src/database/ - Database operations
```

### Separate Concerns

- **Validation:** `src/validation/`
- **Database:** `src/database/`
- **API:** `src/api/`
- **MCP:** `src/mcp/`

### File Naming

- Files: `camelCase.ts`
- Exports: `PascalCase` for classes/types, `camelCase` for functions
- Functions: `verbNoun()` (e.g., `createPost`, `getPostById`)

---

## 📝 Code Standards

### TypeScript Strict Mode

Always enable in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### Use Zod for Runtime Validation

```typescript
// ✅ Good
const result = UserSchema.parse(data);

// ❌ Avoid
if (typeof data.name === 'string') { ... }
```

### Use Parameterized Queries

```typescript
// ✅ Good
pool.query('SELECT * FROM posts WHERE id = ?', [id]);

// ❌ Avoid (SQL Injection Risk)
pool.query(`SELECT * FROM posts WHERE id = ${id}`);
```

### Error Handling

```typescript
// ✅ Good
try {
  const post = await postsDB.getPostById(id);
  if (!post) throw new Error('Post not found');
} catch (error) {
  res.status(500).json({ error: error.message });
}

// ❌ Avoid
const post = await postsDB.getPostById(id);
```

---

## 🧪 Testing Workflow

### Local Testing

```bash
# With cURL
curl -X GET http://localhost:3000/api/posts

# With Postman collection
# Import: postman/posts-api-collection.json
# Send requests

# With VS Code REST Client
# Create: test.http
# Click: "Send Request"
```

### MCP Testing

```bash
# Start MCP server
npm run mcp

# Test in Claude extension
# Commands will be available to Claude

# Or use MCP Inspector tool
```

---

## 🔄 Development Workflow

1. **Make Changes**

   ```bash
   # Edit files in src/
   ```

2. **Test Locally**

   ```bash
   npm run dev
   # Restart server (auto-reload helps)
   ```

3. **Validate**

   ```bash
   # Test with cURL or Postman
   curl http://localhost:3000/api/posts
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add feature: ..."
   git push
   ```

---

## 📦 Adding Dependencies

### Install a Package

```bash
npm install package-name
```

### Update package.json Version Requirement

Edit `package.json` to specify versions:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5"
  }
}
```

### Version Scheme

- `^4.18.2` - Changes from 4.18.2 to <5.0.0
- `~4.18.2` - Changes from 4.18.2 to <4.19.0
- `4.18.2` - Exact version

---

## 🚀 Performance Optimization

### Database Optimization

```typescript
// Add indexes for frequently searched columns
await pool.query(`CREATE INDEX idx_author ON posts(author)`);
await pool.query(`CREATE INDEX idx_created ON posts(created_at)`);
```

### Connection Pooling

Already configured in `src/database/config.ts`:

```typescript
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
```

### Caching

Add Redis for frequently accessed data:

```bash
npm install redis
```

### Query Optimization

```typescript
// ✅ Good - Select only needed columns
pool.query('SELECT id, title, author FROM posts');

// ❌ Bad - Select all columns
pool.query('SELECT * FROM posts');
```

---

## 🐛 Debugging

### Enable Verbose Logging

```typescript
// In src/server.ts
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### VS Code Debugger

```bash
# Press F5 or click Debug button
# Select "Launch REST API Server"
# Set breakpoints and step through code
```

### MCP Debugging

```bash
# Start MCP with debugging
npm run mcp 2>&1 | tee mcp.log
```

---

## 📚 Additional Resources

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Advanced Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html)

### Express.js

- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [Error Handling](https://expressjs.com/en/guide/error-handling.html)

### MySQL

- [MySQL Connection Guide](https://github.com/sidorares/node-mysql2)
- [Query Documentation](https://dev.mysql.com/doc/refman/8.0/en/query.html)

### MCP Protocol

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)

---

## 🆘 Common Issues & Solutions

### "Module not found"

```bash
npm install
```

### "Port already in use"

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Database connection failed"

- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

### "TypeScript compilation error"

```bash
npm run build
# Check error message and fix code
```

---

## ✅ Development Checklist

- [ ] Code changes complete
- [ ] Validation added (Zod)
- [ ] Error handling added
- [ ] Tested locally (`npm run dev`)
- [ ] API tests pass (Postman)
- [ ] MCP tools work (if added)
- [ ] Code follows standards
- [ ] Comments added where needed
- [ ] No console errors
- [ ] Ready to commit

---

**Author:** Dheeraj Kumar  
**Created:** 2026-04-07

Happy coding! 🚀
