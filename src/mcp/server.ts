import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import * as postsDB from '../database/posts';
import { CreatePostSchema, UpdatePostSchema } from '../validation/postSchema';

dotenv.config();

const server = new Server({
  name: 'posts-crud-mcp',
  version: '1.17.4',
});

// Middleware interceptor for error handling
function withMcpInterceptor(operationName: string, handler: (input: any) => Promise<any>) {
  return async (input: any) => {
    try {
      console.error(`[MCP] Executing ${operationName}...`);
      const result = await handler(input);
      console.error(`[MCP] ${operationName} completed successfully`);
      return result;
    } catch (error: any) {
      console.error(`[MCP] ${operationName} failed:`, error.message);
      throw error;
    }
  };
}

// ============ TOOL HANDLERS ============

async function handleCreatePost(input: any) {
  return await withMcpInterceptor('tool:createPost', async (data) => {
    const validated = CreatePostSchema.parse(data);
    const post = await postsDB.createPost(validated);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(post) }],
    };
  })(input);
}

async function handleGetPost(input: any) {
  return await withMcpInterceptor('tool:getPost', async (data) => {
    const post = await postsDB.getPostById(data.id);
    if (!post) {
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Post not found' }) }],
        isError: true,
      };
    }
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(post) }],
    };
  })(input);
}

async function handleListPosts() {
  return await withMcpInterceptor('tool:listPosts', async () => {
    const posts = await postsDB.getAllPosts();
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(posts) }],
    };
  })({});
}

async function handleGetPostsByAuthor(input: any) {
  return await withMcpInterceptor('tool:getPostsByAuthor', async (data) => {
    const posts = await postsDB.getPostsByAuthor(data.author);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(posts) }],
    };
  })(input);
}

async function handleUpdatePost(input: any) {
  return await withMcpInterceptor('tool:updatePost', async (data) => {
    const { id, ...updateData } = data;
    const validated = UpdatePostSchema.parse(updateData);
    const post = await postsDB.updatePost(id, validated);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(post) }],
    };
  })(input);
}

async function handleDeletePost(input: any) {
  return await withMcpInterceptor('tool:deletePost', async (data) => {
    const deleted = await postsDB.deletePost(data.id);
    if (!deleted) {
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Post not found' }) }],
        isError: true,
      };
    }
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify({ success: true, message: 'Post deleted' }) },
      ],
    };
  })(input);
}

async function handleCountPosts() {
  return await withMcpInterceptor('tool:countPosts', async () => {
    const count = await postsDB.countPosts();
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ count }) }],
    };
  })({});
}

// ============ TOOL REGISTRATION WITH REQUEST HANDLER ============

server.setRequestHandler('tools/list' as any, async () => {
  return {
    tools: [
      {
        name: 'createPost',
        description: 'Create a new blog post in the database',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Post title' },
            content: { type: 'string', description: 'Post content' },
            author: { type: 'string', description: 'Post author' },
          },
          required: ['title', 'content', 'author'],
        },
      },
      {
        name: 'getPost',
        description: 'Retrieve a specific post by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Post ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'listPosts',
        description: 'Retrieve all posts from the database',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'getPostsByAuthor',
        description: 'Retrieve all posts written by a specific author',
        inputSchema: {
          type: 'object',
          properties: {
            author: { type: 'string', description: 'Author name' },
          },
          required: ['author'],
        },
      },
      {
        name: 'updatePost',
        description: 'Update an existing post',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Post ID' },
            title: { type: 'string', description: 'Updated title' },
            content: { type: 'string', description: 'Updated content' },
            author: { type: 'string', description: 'Updated author' },
          },
          required: ['id'],
        },
      },
      {
        name: 'deletePost',
        description: 'Delete a post by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Post ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'countPosts',
        description: 'Get the total number of posts in the database',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call' as any, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'createPost':
        return await handleCreatePost(args);
      case 'getPost':
        return await handleGetPost(args);
      case 'listPosts':
        return await handleListPosts();
      case 'getPostsByAuthor':
        return await handleGetPostsByAuthor(args);
      case 'updatePost':
        return await handleUpdatePost(args);
      case 'deletePost':
        return await handleDeletePost(args);
      case 'countPosts':
        return await handleCountPosts();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// ============ RESOURCE HANDLERS ============

async function handleReadPostsAll(uri: string) {
  return await withMcpInterceptor('resource:allPosts', async () => {
    const posts = await postsDB.getAllPosts();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json' as const,
          text: JSON.stringify({
            uri,
            title: 'All Posts',
            posts,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  })({});
}

async function handleReadPostsStatistics(uri: string) {
  return await withMcpInterceptor('resource:postsStatistics', async () => {
    const allPosts = await postsDB.getAllPosts();
    const count = allPosts.length;
    const authors = [...new Set(allPosts.map((p) => p.author))];

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json' as const,
          text: JSON.stringify({
            uri,
            title: 'Posts Statistics',
            statistics: {
              total_posts: count,
              total_authors: authors.length,
              authors_list: authors,
              oldest_post: allPosts.length > 0 ? allPosts[allPosts.length - 1].created_at : null,
              newest_post: allPosts.length > 0 ? allPosts[0].created_at : null,
            },
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  })({});
}

// ============ RESOURCE REGISTRATION ============

server.setRequestHandler('resources/list' as any, async () => {
  return {
    resources: [
      {
        uri: 'posts://all',
        name: 'allPosts',
        description: 'Access the complete list of all posts in the database',
        mimeType: 'application/json',
      },
      {
        uri: 'posts://statistics',
        name: 'postsStatistics',
        description: 'Get statistics about the posts collection',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler('resources/read' as any, async (request: any) => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case 'posts://all':
        return await handleReadPostsAll(uri);
      case 'posts://statistics':
        return await handleReadPostsStatistics(uri);
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error: any) {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json' as const,
          text: JSON.stringify({ error: error.message }),
        },
      ],
    };
  }
});

// ============ PROMPT HANDLERS ============

async function handlePromptOutline(input: any) {
  const { topic, audience = 'general developers', tone = 'practical' } = input;
  return {
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Create a comprehensive blog post outline for:\n\nTopic: ${topic}\nTarget Audience: ${audience}\nTone: ${tone}\n\nProvide a structured outline with main sections and key points.`,
        },
      },
    ],
  };
}

async function handlePromptCreateBlogPost(input: any) {
  const { title, topic, style = 'technical' } = input;
  return {
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Write a professional blog post with the following details:\n\nTitle: ${title}\nTopic: ${topic}\nStyle: ${style}\n\nGuidelines:\n- Write an engaging introduction\n- Structure content into clear sections\n- Include practical examples where relevant\n- Add a compelling conclusion\n- After writing, use the createPost tool to save it`,
        },
      },
    ],
  };
}

async function handlePromptAnalyzePosts(input: any) {
  const { focusArea = 'overall trends' } = input;
  return {
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Analyze the posts collection and provide insights focusing on: ${focusArea}\n\nSteps:\n1. Use listPosts tool to fetch all posts\n2. Analyze patterns, themes, and author contributions\n3. Provide actionable recommendations\n4. Highlight trends and opportunities\n\nFormat the analysis with clear sections and bullet points.`,
        },
      },
    ],
  };
}

// ============ PROMPT REGISTRATION ============

server.setRequestHandler('prompts/list' as any, async () => {
  return {
    prompts: [
      {
        name: 'postOutline',
        description: 'Generate a structured outline prompt for writing a blog post',
        arguments: [
          { name: 'topic', description: 'The blog post topic', required: true },
          { name: 'audience', description: 'Target audience (default: general developers)' },
          { name: 'tone', description: 'Writing tone (default: practical)' },
        ],
      },
      {
        name: 'createBlogPost',
        description: 'Helper prompt for writing well-structured blog posts',
        arguments: [
          { name: 'title', description: 'Post title', required: true },
          { name: 'topic', description: 'Main topic to cover', required: true },
          { name: 'style', description: 'Writing style (default: technical)' },
        ],
      },
      {
        name: 'analyzePosts',
        description: 'Analyze the posts collection and generate insights',
        arguments: [
          { name: 'focusArea', description: 'Area to focus analysis on (default: overall trends)' },
        ],
      },
    ],
  };
});

server.setRequestHandler('prompts/get' as any, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'postOutline':
        return await handlePromptOutline(args);
      case 'createBlogPost':
        return await handlePromptCreateBlogPost(args);
      case 'analyzePosts':
        return await handlePromptAnalyzePosts(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  } catch (error: any) {
    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Error: ${error.message}`,
          },
        },
      ],
    };
  }
});

// ============ SAMPLING (Optional - for streaming responses) ============

export async function generatePostContent(prompt: string, maxTokens = 500): Promise<string> {
  try {
    console.error(`[MCP] Generating content with maxTokens: ${maxTokens}`);
    return prompt;
  } catch (error: any) {
    console.error('[MCP] Sampling error:', error.message);
    throw error;
  }
}

// ============ START SERVER ============

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Posts CRUD MCP Server running on stdio');
  console.error('✓ 7 Tools registered');
  console.error('✓ 2 Resources registered');
  console.error('✓ 3 Prompts registered');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
