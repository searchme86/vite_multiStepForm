import { z } from 'zod';
import { blogBasePathSchema } from './blogBasePathSchema';
import { blogContentPathSchema } from './blogContentPathSchema';
import { blogCommonPathSchema } from './blogCommonPathSchema';
import { blogMediaPathSchema } from './blogMediaPathSchema';

export const blogPostSchema = blogBasePathSchema
  .merge(blogContentPathSchema)
  .merge(blogCommonPathSchema)
  .merge(blogMediaPathSchema);

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
