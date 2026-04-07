import express, { Router, Request, Response } from "express";
import {
  CreatePostSchema,
  UpdatePostSchema,
  PostIdSchema,
} from "../validation/postSchema";
import * as postsDB from "../database/posts";

const router = Router();

// Middleware to parse JSON
router.use(express.json());

// GET all posts
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const posts = await postsDB.getAllPosts();
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch posts" });
  }
});

// GET post by ID
router.get("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = PostIdSchema.parse(req.params);
    const post = await postsDB.getPostById(id);

    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    res.json({ success: true, data: post });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET posts by author
router.get("/author/:author", async (req: Request, res: Response) => {
  try {
    const { author } = req.params;
    const posts = await postsDB.getPostsByAuthor(author);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch posts" });
  }
});

// POST create new post
router.post("/posts", async (req: Request, res: Response) => {
  try {
    const data = CreatePostSchema.parse(req.body);
    const post = await postsDB.createPost(data);
    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update post
router.put("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = PostIdSchema.parse(req.params);
    const data = UpdatePostSchema.parse(req.body);
    const post = await postsDB.updatePost(id, data);
    res.json({ success: true, data: post });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE post
router.delete("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = PostIdSchema.parse(req.params);
    const deleted = await postsDB.deletePost(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
