import { z } from 'zod';

// 디버깅을 위한 태그 검증 스키마
const tagSchema = z
  .string({
    required_error: '태그는 문자열이어야 합니다.',
    invalid_type_error: '태그는 문자열이어야 합니다.',
  })
  .trim()
  .min(1, { message: '태그는 최소 1자 이상이어야 합니다.' })
  .max(20, { message: '태그는 20자를 초과할 수 없습니다.' })
  // ====디버깅 코드 추가====
  .refine(
    (value) => {
      // 실제 값과 테스트 결과를 콘솔에 출력
      const regex = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s_-]+$/; // 한글 자음/모음도 허용; // 수정된 정규식
      const result = regex.test(value);

      console.log('🔍 [TAG DEBUG] 태그 검증:', {
        원본값: value,
        JSON표현: JSON.stringify(value),
        길이: value.length,
        문자코드배열: value.split('').map((c) => `${c}(${c.charCodeAt(0)})`),
        정규식결과: result,
        타입: typeof value,
      });

      // 각 문자가 허용되는지 개별 확인
      const invalidChars = value.split('').filter((char) => {
        const charCode = char.charCodeAt(0);
        const isValid =
          (charCode >= 48 && charCode <= 57) || // 0-9
          (charCode >= 65 && charCode <= 90) || // A-Z
          (charCode >= 97 && charCode <= 122) || // a-z
          (charCode >= 44032 && charCode <= 55203) || // 한글
          charCode === 32 || // 공백
          charCode === 95 || // _
          charCode === 45; // -

        if (!isValid) {
          console.log(`❌ 유효하지 않은 문자: '${char}' (코드: ${charCode})`);
        }

        return !isValid;
      });

      if (invalidChars.length > 0) {
        console.log('❌ 유효하지 않은 문자들:', invalidChars);
      }

      return result;
    },
    {
      message:
        '태그는 영문, 숫자, 한글, 공백, 하이픈, 언더스코어만 사용할 수 있습니다.',
    }
  )
  // ====디버깅 코드 끝====
  .refine((value) => !value.startsWith('#'), {
    message: '태그에 # 기호는 자동으로 추가되므로 입력하지 마세요.',
  });

export const blogContentPathSchema = z.object({
  markdown: z
    .string()
    .max(100000, { message: '마크다운 내용은 100,000자를 초과할 수 없습니다.' })
    .optional()
    .or(z.literal('')),

  richTextContent: z
    .string()
    .max(100000, {
      message: '리치텍스트 내용은 100,000자를 초과할 수 없습니다.',
    })
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value) return true;
        const dangerousTags =
          /<(script|iframe|object|embed|form|input|textarea|button|select|option|link|meta|base|style|title|head|html|body)[^>]*>/gi;
        return !dangerousTags.test(value);
      },
      { message: '리치텍스트에 위험한 HTML 태그가 포함되어 있습니다.' }
    ),

  searchTerm: z
    .string()
    .trim()
    .max(100, { message: '검색어는 100자를 초과할 수 없습니다.' })
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value) return true;
        return /^[a-zA-Z0-9가-힣\s_-]+$/.test(value);
      },
      {
        message:
          '검색어는 영문, 숫자, 한글, 공백, 하이픈, 언더스코어만 사용할 수 있습니다.',
      }
    ),

  // ====tags 배열도 디버깅====
  tags: z
    .array(tagSchema, {
      required_error: '태그는 배열이어야 합니다.',
      invalid_type_error: '태그는 배열이어야 합니다.',
    })
    .min(1, { message: '최소 1개의 태그를 추가해주세요.' })
    .max(5, { message: '태그는 최대 5개까지 추가할 수 있습니다.' })
    .refine(
      (tags) => {
        // 배열 전체 디버깅
        console.log('🔍 [TAGS ARRAY DEBUG]:', {
          전체배열: tags,
          배열길이: tags.length,
          각태그타입: tags.map((tag) => typeof tag),
          JSON표현: JSON.stringify(tags),
        });

        const trimmedTags = tags.map((tag) => tag.trim());
        const uniqueTags = new Set(trimmedTags);
        return trimmedTags.length === uniqueTags.size;
      },
      { message: '중복된 태그가 있습니다. 각 태그는 고유해야 합니다.' }
    )
    .refine(
      (tags) => {
        const totalLength = tags.join('').length;
        return totalLength <= 100;
      },
      { message: '모든 태그의 총 길이는 100자를 초과할 수 없습니다.' }
    ),
});

export type blogContentPathSchemaType = z.infer<typeof blogContentPathSchema>;
