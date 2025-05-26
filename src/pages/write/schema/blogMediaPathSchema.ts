import { z } from 'zod';

export const blogMediaPathSchema = z.object({
  // 대표 이미지
  // - 의미: 포스트 이미지 파일
  // - 사용 이유: 시각적 콘텐츠 제공
  coverImage: z
    .array(z.any())
    .min(1, { message: '최소 1개의 이미지를 업로드해주세요.' })
    .max(10, { message: '이미지는 최대 10개까지 업로드할 수 있습니다.' }),
});

export type blogMediaPathSchemaType = z.infer<typeof blogMediaPathSchema>;
