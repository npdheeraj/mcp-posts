# Quick Start Guide

Get the Posts CRUD API running in 5 minutes!

## Prerequisites Check

```bash
node --version    # Must be >= 22.22.0
npm --version     # Must be >= 8.0.0
```

If you don't have these installed, download [Node.js](https://nodejs.org/) first.

## Step 1: Setup (30 seconds)

```bash
cd f:\1-Dheeraj\Projects\MCP
npm install
```

## Step 2: Configure Database (2 minutes)

1. Ensure MySQL is running:

```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Edit `.env` with your MySQL credentials:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=posts_crud_db
API_PORT=3000
```

## Step 3: Initialize Database (30 seconds)

```bash
npm run db:init
```

You should see:

```
✓ Database posts_crud_db created or already exists
✓ Posts table created or already exists
✓ Index on author column created
✓ Database initialization completed successfully!
```

## Step 4: Start the Server (10 seconds)

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

You should see:

```
🚀 REST API Server running on http://localhost:3000
📝 Posts CRUD API ready for requests
```

## Step 5: Test the API (1 minute)

### Option A: Using cURL

```bash
# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "content": "This is my first post",
    "author": "Your Name"
  }'

# Get all posts
curl http://localhost:3000/api/posts

# Get specific post
curl http://localhost:3000/api/posts/1
```

### Option B: Using Postman/TinyPostman

1. Open Postman
2. Import: `postman/posts-api-collection.json`
3. Send requests directly

### Option C: VS Code REST Client

Install extension: `REST Client` and create a file `test.http`:

```http
### Create Post
POST http://localhost:3000/api/posts
Content-Type: application/json

{
  "title": "My First Post",
  "content": "This is the content",
  "author": "Your Name"
}

### Get All Posts
GET http://localhost:3000/api/posts

### Get Post by ID
GET http://localhost:3000/api/posts/1

### Update Post
PUT http://localhost:3000/api/posts/1
Content-Type: application/json

{
  "title": "Updated Title"
}

### Delete Post
DELETE http://localhost:3000/api/posts/1
```

Then click "Send Request" above each request.

## Step 6: Run MCP Server (Optional)

In a new terminal:

```bash
npm run mcp
```

This starts the MCP server for Claude integration.

## Common Commands Reference

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm install`     | Install dependencies              |
| `npm run dev`     | Start dev server with auto-reload |
| `npm run build`   | Compile TypeScript                |
| `npm start`       | Run compiled server               |
| `npm run db:init` | Initialize database               |
| `npm run mcp`     | Start MCP server                  |

## Troubleshooting

### Port 3000 already in use?

```
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

Change API_PORT in `.env` to a different port.

### Database connection error?

```bash
# Make sure MySQL is running
mysql -u root

# Create user if needed
CREATE USER 'root'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
```

### Module not found error?

```bash
rm -rf node_modules package-lock.json
npm install
```

## Full Documentation

- [README.md](./README.md) - Complete project documentation
- [MCP_SERVER.md](./MCP_SERVER.md) - MCP server documentation
- [postman/posts-api-collection.json](./postman/posts-api-collection.json) - API endpoints collection

## Need More Help?

1. Check the [README.md](./README.md) for detailed documentation
2. Review error messages in the console
3. Verify your `.env` configuration
4. Ensure MySQL is running and accessible

---

**You're all set!** 🎉 Start developing!
