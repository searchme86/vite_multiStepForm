import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';
//aaadsdfee
export const initialFieldsState: blogPostSchemaType = {
  title: '',
  summary: '',
  content: undefined,
  richTextContent: undefined,
  markdown: undefined,
  searchTerm: undefined,
  category: 'tech',
  tags: [],
  coverImage: [],
  publishDate: undefined,
  tocItems: [],
  isDraft: false,
  isPublic: true,
  status: 'draft',
  isScheduled: false,
  lastModified: new Date(),
  authorId: undefined,
  viewCount: 0,
};
