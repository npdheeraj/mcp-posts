import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  content: z.string().min(1, 'Content is required'),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(100, 'Author must be less than 100 characters'),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export const PostIdSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive('ID must be a positive number')),
});

export const PostSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  author: z.string().min(1).max(100),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
export type PostId = z.infer<typeof PostIdSchema>;
export type Post = z.infer<typeof PostSchema>;
