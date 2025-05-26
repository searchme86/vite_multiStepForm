import { z } from 'zod';
import { TocItemSchema } from '../basicFormSection/parts/tocEditor/schema/TocSchema';

export const blogBasePathSchema = z.object({
  // 제목
  title: z
    .string()
    .min(5, { message: '제목은 최소 5자 이상이어야 합니다.' })
    .max(100, { message: '제목은 100자를 초과할 수 없습니다.' }),
  // 요약
  summary: z
    .string()
    .min(10, { message: '요약은 최소 10자 이상이어야 합니다.' })
    .max(500, { message: '요약은 500자를 초과할 수 없습니다.' }),
  // 내용
  content: z.string().optional(),

  // 목차
  tocItems: z.array(TocItemSchema).optional(),
  // 카테고리
  category: z
    .string()
    .min(1, { message: '카테고리를 선택해주세요.' })
    .refine(
      (value) => ['tech', 'lifestyle', 'travel', 'food'].includes(value),
      { message: '유효한 카테고리를 선택해주세요.' }
    ),
});

export type blogBasePathSchemaType = z.infer<typeof blogBasePathSchema>;
