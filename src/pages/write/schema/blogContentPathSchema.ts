import { TocItemSchema } from '../basicFormSection/parts/tocEditor/schema/TocSchema';
import { z } from 'zod';

export const blogContentPathSchema = z.object({
  // 마크다운
  // - 의미: 마크다운 형식 본문
  // - 사용 이유: 포스트 콘텐츠 작성
  markdown: z.string().optional(),
  // 검색어
  // - 의미: 미리보기에서 강조할 검색어
  // - 사용 이유: 텍스트 검색 기능
  searchTerm: z.string().optional(),
  tags: z
    .array(z.string())
    .min(1, { message: '최소 1개의 태그를 추가해주세요.' })
    .max(5, { message: '태그는 최대 5개까지 추가할 수 있습니다.' }),
  // 목차
  tocItems: z.array(TocItemSchema).optional(),
});

export type blogContentPathSchemaType = z.infer<typeof blogContentPathSchema>;
