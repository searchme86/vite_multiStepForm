import { useCallback } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import type { FormSchemaType } from '@/schema/FormSchema';
import {
  VALID_RESUME_FILE_EXTENSIONS,
  MAX_RESUME_SIZE_IN_BYTES,
} from '@/schema/FormSchema';

// 코드의 의미: 파일 크기 변환 유틸리티 함수
// 왜 사용했는지: 파일 크기를 사람이 읽기 쉬운 형식(예: KB, MB)으로 변환하여 에러 메시지에 활용
const formatFileSize = (bytes: number): string => {
  // 코드의 의미: 파일 크기가 0일 경우 '0 Bytes' 반환
  // 왜 사용했는지: 빈 파일에 대해 명확한 표시 제공
  if (bytes === 0) return '0 Bytes';
  // 코드의 의미: 1024 단위로 크기 계산
  // 왜 사용했는지: 바이트를 KB, MB 단위로 변환
  const k = 1024;
  // 코드의 의미: 크기 단위 배열 정의
  // 왜 사용했는지: 변환된 크기에 적절한 단위 부여
  const sizes = ['Bytes', 'KB', 'MB'];
  // 코드의 의미: 로그를 사용하여 적절한 단위 인덱스 계산
  // 왜 사용했는지: 파일 크기를 적절한 단위로 변환
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // 코드의 의미: 소수점 둘째 자리까지 포맷팅하여 크기 반환
  // 왜 사용했는지: 읽기 쉬운 형식으로 사용자에게 표시
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 코드의 의미: 이력서 업로드 상태와 로직을 관리하는 커스텀 훅
// 왜 사용했는지: 파일 업로드 상태와 유효성 검사를 캡슐화하여 재사용 가능
export const useResumeUploader = (
  // 코드의 의미: react-hook-form의 Control 객체
  // 왜 사용했는지: 폼 상태를 관리하고 값 참조
  control: Control<FormSchemaType>,
  // 코드의 의미: react-hook-form의 setValue 함수
  // 왜 사용했는지: 폼 필드 값을 업데이트
  setValue: UseFormSetValue<FormSchemaType>
) => {
  // 코드의 의미: 폼 필드 값 가져오기
  // 왜 사용했는지: 현재 업로드된 파일 목록 참조
  const value = control._formValues.resume as File[];

  // 코드의 의미: 파일 목록 변경 핸들러
  // 왜 사용했는지: 파일 업로드/삭제 시 상태 업데이트 및 유효성 검사
  const handleValueChange = useCallback(
    (files: File[]) => {
      // 코드의 의미: 에러 메시지 배열 초기화
      // 왜 사용했는지: 유효하지 않은 파일에 대한 에러 메시지 저장
      const errors: string[] = [];
      // 코드의 의미: 파일 형식 및 크기 유효성 검사
      // 왜 사용했는지: 허용되지 않은 파일 형식 및 크기 초과 파일 제외
      const validFiles = files.filter((file) => {
        // 코드의 의미: 허용된 파일 형식 목록 생성
        // 왜 사용했는지: PDF, DOC, DOCX 등 허용된 형식만 필터링
        const allowedTypes = VALID_RESUME_FILE_EXTENSIONS.map(
          (ext) => `application/${ext.toLowerCase()}`
        );
        // 코드의 의미: 파일 형식 검사
        // 왜 사용했는지: 허용되지 않은 형식의 파일 제외
        if (!allowedTypes.includes(file.type)) {
          // 코드의 의미: 파일 형식 오류 메시지 추가
          // 왜 사용했는지: 사용자에게 어떤 파일이 잘못되었는지 피드백
          errors.push(`허용되지 않은 파일 형식: ${file.name}`);
          return false;
        }
        // 코드의 의미: 파일 크기 검사
        // 왜 사용했는지: 최대 크기(10MB)를 초과하는 파일 제외
        if (file.size > MAX_RESUME_SIZE_IN_BYTES) {
          // 코드의 의미: 파일 크기 초과 오류 메시지 추가
          // 왜 사용했는지: formatFileSize를 사용하여 읽기 쉬운 에러 메시지 제공
          errors.push(
            `파일 크기 초과: ${file.name} (${formatFileSize(file.size)})`
          );
          return false;
        }
        return true;
      });

      // 코드의 의미: 유효한 파일만 상태에 저장
      // 왜 사용했는지: 폼 상태를 유효한 파일로만 업데이트
      setValue('resume', validFiles, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // 코드의 의미: 에러 메시지가 있을 경우 커스텀 에러 설정
      // 왜 사용했는지: react-hook-form의 errors 객체를 통해 에러 표시
      if (errors.length > 0) {
        setValue('resume', validFiles, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    },
    [setValue]
  );

  // 코드의 의미: 파일 목록과 변경 핸들러 반환
  // 왜 사용했는지: 상위 컴포넌트에서 파일 상태와 로직 사용 가능
  return { value, handleValueChange };
};
