import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

// ====여기부터 수정됨====
export const initialFieldsState: blogPostSchemaType = {
  title: '',
  summary: '',
  content: '', // undefined 대신 빈 문자열로 변경
  richTextContent: '', // undefined 대신 빈 문자열로 변경
  markdown: '', // undefined 대신 빈 문자열로 변경
  searchTerm: '', // undefined 대신 빈 문자열로 변경
  category: 'tech',
  tags: [],
  coverImage: [],
  publishDate: undefined, // Date 타입은 undefined 유지
  tocItems: [],
  isDraft: false,
  isPublic: true,
  status: 'draft',
  isScheduled: false,
  lastModified: new Date(),
  authorId: '', // undefined 대신 빈 문자열로 변경
  viewCount: 0,
};
// ====여기까지 수정됨====
