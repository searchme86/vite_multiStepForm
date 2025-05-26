import { z } from 'zod';

// 코드의 의미: 기존에 등록된 이메일 목록 (테스트용 더미 데이터)
// 왜 사용했는지: 중복 이메일 검사 시 비교를 위해 필요
const existingEmails = ['test@naver.com', 'user@daum.net'];

// 코드의 의미: 분리 이메일 입력 유효성 검사 스키마
// 왜 사용했는지: 분리 입력 이메일 필드 유효성 검사
export const SplitEmailValidationSchema = z
  .object({
    // 코드의 의미: 이메일 로컬 파트 스키마
    // 왜 사용했는지: 로컬 파트 입력 필드 유효성 검사
    userLocalPart: z
      .string()
      .min(1, '로컬 파트는 필수입니다')
      .max(64, '로컬 파트는 64자를 초과할 수 없습니다'),

    // 코드의 의미: 이메일 도메인 파트 스키마
    // 왜 사용했는지: 도메인 파트 입력 필드 유효성 검사
    emailRest: z
      .string()
      .min(1, '도메인 파트는 필수입니다')
      .max(255, '도메인 파트는 255자를 초과할 수 없습니다')
      //====여기부터 수정됨====
      .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, '유효한 도메인 형식이 아닙니다'), // 도메인 형식 검사 추가
    //====여기까지 수정됨====
  })
  //====여기부터 수정됨====
  // 코드의 의미: 전체 이메일 형식 및 중복 검사
  // 왜 사용했는지: 로컬 파트와 도메인 파트를 조합하여 최종 이메일 형식 및 중복 여부를 확인
  .refine(
    (data) => {
      const email = `${data.userLocalPart}@${data.emailRest}`;
      return !existingEmails.includes(email); // 중복 이메일 검사 추가
    },
    {
      message: '이미 사용 중인 이메일입니다',
      path: ['userLocalPart'],
    }
  );
//====여기까지 수정됨====
