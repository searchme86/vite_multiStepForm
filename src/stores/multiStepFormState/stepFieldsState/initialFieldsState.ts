import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

export const initialFieldsState: blogPostSchemaType = {
  title: '',
  summary: '',
  content: undefined,
  markdown: undefined,
  searchTerm: undefined,
  category: '',
  tags: [],
  coverImage: [],
  publishDate: undefined,
  tocItems: [],
  isDraft: false,
  isPublic: true,
};
