import { z } from 'zod';

export const blogCommonPathSchema = z.object({
  // 게시 날짜
  // - 의미: 포스트 게시 날짜
  // - 사용 이유: 게시 일정 관리
  publishDate: z.date().optional(),
  // 초안 여부
  // - 의미: 초안 저장 여부
  // - 사용 이유: 임시 저장 관리
  isDraft: z.boolean(),
  // 공개 여부
  // - 의미: 포스트 공개 설정
  // - 사용 이유: 공개/비공개 관리
  isPublic: z.boolean(),
});

export type blogCommonPathSchema = z.infer<typeof blogCommonPathSchema>;
