# Posts CRUD REST API with MCP Server

A minimal TypeScript REST API for posts CRUD operations with integrated Model Context Protocol (MCP) server support.

**Author:** Dheeraj Kumar

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [MCP Server](#mcp-server)
- [Testing](#testing)
- [Project Structure](#project-structure)

## ✨ Features

- **TypeScript** - Fully typed codebase for better development experience
- **REST API** - Standard CRUD operations for posts
- **MySQL Database** - Persistent data storage
- **Zod Validation** - Runtime type validation
- **MCP Integration** - Model Context Protocol server for AI integration
- **VS Code Integration** - MCP configuration in `.vscode/mcp.json`
- **Postman Collection** - Ready-to-use API testing collection
- **Comprehensive Documentation** - Setup and usage guides

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** >= 22.22.0 ([Download](https://nodejs.org/))
- **npm** >= 8.0.0 (comes with Node.js)
- **MySQL** >= 5.7 ([Download](https://www.mysql.com/downloads/))
- **Git** (optional, for version control)

### Verify Prerequisites

```bash
node --version      # Should be v22.22.0 or higher
npm --version       # Should be 8.0.0 or higher
mysql --version     # Should be 5.7 or higher
```

## 🚀 Project Setup

Follow these steps to set up and run the project:

### 1. Clone/Download the Project

```bash
cd f:\1-Dheeraj\Projects\MCP
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:

- `express` - Web framework
- `mysql2` - MySQL client
- `zod` - Validation library
- `@modelcontextprotocol/sdk` - MCP SDK

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env` and update with your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=posts_crud_db
API_PORT=3000
NODE_ENV=development
```

### 4. Initialize the Database

Run the database initialization script to create the database and tables:

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

## ⚙️ Configuration

### Database Configuration (`src/database/config.ts`)

The database connects using the environment variables defined in `.env`. No additional configuration is needed if you follow the setup steps above.

### Environment Variables

| Variable      | Default       | Description         |
| ------------- | ------------- | ------------------- |
| `DB_HOST`     | localhost     | MySQL server host   |
| `DB_PORT`     | 3306          | MySQL server port   |
| `DB_USER`     | root          | MySQL username      |
| `DB_PASSWORD` | (empty)       | MySQL password      |
| `DB_NAME`     | posts_crud_db | Database name       |
| `API_PORT`    | 3000          | Express server port |
| `NODE_ENV`    | development   | Environment mode    |

## ▶️ Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically restart when you make code changes.

### Production Mode

```bash
npm run build
npm start
```

This compiles TypeScript to JavaScript and runs the compiled code.

## 📡 API Endpoints

All POST requests should include `Content-Type: application/json` header.

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-07T10:30:00.000Z"
}
```

### Get All Posts

```http
GET /api/posts
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My First Post",
      "content": "This is my first blog post...",
      "author": "Dheeraj Kumar",
      "created_at": "2026-04-07 10:00:00",
      "updated_at": "2026-04-07 10:00:00"
    }
  ]
}
```

### Get Post by ID

```http
GET /api/posts/{id}
```

**Parameters:**

- `id` (required): Post ID

**Example:**

```http
GET /api/posts/1
```

### Get Posts by Author

```http
GET /api/author/{author}
```

**Parameters:**

- `author` (required): Author name

**Example:**

```http
GET /api/author/Dheeraj%20Kumar
```

### Create Post

```http
POST /api/posts
Content-Type: application/json

{
  "title": "My New Post",
  "content": "This is the content of my post...",
  "author": "Dheeraj Kumar"
}
```

**Validation:**

- `title`: Required, max 255 characters
- `content`: Required
- `author`: Required, max 100 characters

### Update Post

```http
PUT /api/posts/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "author": "New Author Name"
}
```

All fields are optional. Only provide fields you want to update.

### Delete Post

```http
DELETE /api/posts/{id}
```

**Parameters:**

- `id` (required): Post ID to delete

## 🗄️ Database Setup

### Database Schema

The `posts` table has the following structure:

```sql
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Columns

| Column       | Type         | Description               |
| ------------ | ------------ | ------------------------- |
| `id`         | INT (PK)     | Auto-incrementing post ID |
| `title`      | VARCHAR(255) | Post title                |
| `content`    | LONGTEXT     | Post content              |
| `author`     | VARCHAR(100) | Author name               |
| `created_at` | TIMESTAMP    | Creation timestamp        |
| `updated_at` | TIMESTAMP    | Last update timestamp     |

### MySQL Connection

Ensure MySQL is running:

```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

## 🤖 MCP Server

The project includes an MCP (Model Context Protocol) server that exposes posts CRUD operations as tools for AI integration.

### MCP Components

1. **Tools** - CRUD operations callable by AI
2. **Resources** - Data resources (all posts, statistics)
3. **Prompts** - Helper prompts for common tasks
4. **Sampling** - Response streaming support

For detailed MCP documentation, see [MCP_SERVER.md](./MCP_SERVER.md)

### Running the MCP Server

```bash
npm run mcp
```

The MCP server will start and be available via stdio transport.

### VS Code MCP Integration

The MCP server is configured in `.vscode/mcp.json` for automatic discovery by VS Code and Claude extension.

## 🧪 Testing

### Using Postman/TinyPostman

1. Open Postman or TinyPostman
2. Import the collection: `postman/posts-api-collection.json`
3. Select the environment (configure `localhost` and port 3000)
4. Run the requests

### Using cURL

```bash
# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Post",
    "content": "Post content",
    "author": "Dheeraj Kumar"
  }'

# Get all posts
curl http://localhost:3000/api/posts

# Get specific post
curl http://localhost:3000/api/posts/1

# Update post
curl -X PUT http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Delete post
curl -X DELETE http://localhost:3000/api/posts/1
```

## 📁 Project Structure

```
posts-crud-mcp/
├── src/
│   ├── api/
│   │   └── routes.ts           # Express route handlers
│   ├── database/
│   │   ├── config.ts           # MySQL connection pool
│   │   ├── init.ts             # Database initialization
│   │   └── posts.ts            # Post CRUD operations
│   ├── mcp/
│   │   └── server.ts           # MCP server (self-contained)
│   ├── validation/
│   │   └── postSchema.ts       # Zod validation schemas
│   └── server.ts               # Express server entry point
├── .vscode/
│   └── mcp.json               # MCP configuration for VS Code
├── postman/
│   └── posts-api-collection.json  # TinyPostman collection
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── README.md                  # This file
└── MCP_SERVER.md              # MCP server documentation
```

## 🔧 Troubleshooting

### Database Connection Error

**Problem:** `Error: connect ECONNREFUSED`

**Solution:**

1. Verify MySQL is running
2. Check DB_HOST and DB_PORT in `.env`
3. Verify DB_USER and DB_PASSWORD credentials

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::3000`

**Solution:**
Change `API_PORT` in `.env` or:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Module Not Found

**Problem:** `Error: Cannot find module`

**Solution:**

```bash
npm install
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Model Context Protocol](./MCP_SERVER.md)

## 📝 License

MIT

## 👤 Author

**Dheeraj Kumar**

---

For questions or support, refer to the MCP server documentation in [MCP_SERVER.md](./MCP_SERVER.md)
