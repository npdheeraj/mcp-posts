import pool from "./config";
import { CreatePost, UpdatePost } from "../validation/postSchema";

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export async function getAllPosts(): Promise<Post[]> {
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM posts ORDER BY created_at DESC",
  );
  return rows;
}

export async function getPostById(id: number): Promise<Post | null> {
  const [rows] = await pool.query<any[]>("SELECT * FROM posts WHERE id = ?", [
    id,
  ]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getPostsByAuthor(author: string): Promise<Post[]> {
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM posts WHERE author = ? ORDER BY created_at DESC",
    [author],
  );
  return rows;
}

export async function createPost(data: CreatePost): Promise<Post> {
  const [result] = await pool.query<any>(
    "INSERT INTO posts (title, content, author) VALUES (?, ?, ?)",
    [data.title, data.content, data.author],
  );

  const createdPost = await getPostById(result.insertId);
  if (!createdPost) throw new Error("Failed to retrieve created post");
  return createdPost;
}

export async function updatePost(id: number, data: UpdatePost): Promise<Post> {
  const post = await getPostById(id);
  if (!post) throw new Error("Post not found");

  const updateData = {
    title: data.title ?? post.title,
    content: data.content ?? post.content,
    author: data.author ?? post.author,
  };

  await pool.query(
    "UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?",
    [updateData.title, updateData.content, updateData.author, id],
  );

  const updatedPost = await getPostById(id);
  if (!updatedPost) throw new Error("Failed to retrieve updated post");
  return updatedPost;
}

export async function deletePost(id: number): Promise<boolean> {
  const [result] = await pool.query<any>("DELETE FROM posts WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}

export async function countPosts(): Promise<number> {
  const [rows] = await pool.query<any>("SELECT COUNT(*) as count FROM posts");
  return rows[0].count;
}
