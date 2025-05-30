//====여기부터 수정됨====
// MediaSection.tsx: 블로그 포스트의 미디어 업로드 섹션
// - 의미: 파일 업로드 관리
// - 사용 이유: 미디어 입력 기능 분리, Zustand로 상태 지속성 보장
// - 비유: 사진 앨범 관리
// - 작동 메커니즘:
//   1. FileUpload로 파일 선택
//   2. FileTableView로 파일 목록 표시
//   3. PostGuidelines로 가이드 제공
//   4. Zustand로 파일 동기화
// - 관련 키워드: react-hook-form, zustand, shadcn/ui, tailwindcss, flexbox

import { useFormContext } from 'react-hook-form';
import FileUpload from './FileUpload';
import FileTableView from './FileTableView';
import PostGuidelines from '../common/PostGuidelines';
import { FormMessage } from '../../../components/ui/form';
import { useStepFieldsStateStore } from '../../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';

// 타입: 파일 아이템
// - 의미: 업로드된 파일 정보 구조
// - 사용 이유: 타입 안전성 보장
type FileItem = {
  file: File;
  preview: string;
  name: string;
  size: number;
};

// MediaSection: 미디어 업로드 UI
// - 의미: 파일 업로드 및 관리 UI 렌더링
// - 사용 이유: 포스트 미디어 관리, Zustand 동기화
function MediaSection() {
  // FormProvider로부터 폼 메서드들을 가져옴
  // - 의미: 상위 컴포넌트에서 전달된 폼 컨텍스트 사용
  // - 사용 이유: props drilling 없이 폼 상태에 접근
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  // Zustand setter - 안전한 함수 처리
  // - 의미: 파일 목록 상태 동기화
  // - 사용 이유: Zustand로 지속성 보장
  const store = useStepFieldsStateStore();
  const setCoverImage = store.setCoverImage || (() => {}); // fallback 함수 제공

  // 상수: 랜덤 색상
  // - 의미: UI 요소 색상 다양성
  const randomColors = ['blue', 'green', 'yellow', 'red', 'purple'];

  // 핸들러: 파일 선택
  // - 의미: 선택된 파일을 폼 상태에 추가
  // - 사용 이유: 업로드된 파일 관리
  // - 작동 매커니즘: 새 파일 추가 후 폼과 Zustand 동기화
  const handleFileSelect = (files: File[]) => {
    const existingFiles = watch('coverImage') || [];
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    const updatedFiles = [...existingFiles, ...newFiles];
    setValue('coverImage', updatedFiles, { shouldValidate: true });
    setCoverImage(updatedFiles); // Zustand 동기화
  };

  // 핸들러: 파일 제거
  // - 의미: 특정 파일 제거
  // - 사용 이유: 사용자 선택 반영
  // - 작동 매커니즘: 파일 제거 후 폼과 Zustand 동기화
  const handleFileRemove = (index: number) => {
    const files = watch('coverImage') || [];
    // 타입 안전한 filter 처리
    // - 의미: 배열 인덱스와 요소에 명시적 타입 지정
    // - 사용 이유: TypeScript 에러 방지
    const newFiles = files.filter((_: unknown, i: number) => i !== index);
    setValue('coverImage', newFiles, { shouldValidate: true });
    setCoverImage(newFiles); // Zustand 동기화
  };

  // 핸들러: 일괄 파일 제거
  // - 의미: 여러 파일 제거
  // - 사용 이유: 다중 선택 삭제 지원
  // - 작동 매커니즘: 선택된 파일 제거 후 폼과 Zustand 동기화
  const handleBulkFileRemove = (indexes: number[]) => {
    const files = watch('coverImage') || [];
    // 타입 안전한 filter 처리
    // - 의미: 배열 인덱스와 요소에 명시적 타입 지정
    // - 사용 이유: TypeScript 에러 방지
    const newFiles = files.filter(
      (_: unknown, i: number) => !indexes.includes(i)
    );
    setValue('coverImage', newFiles, { shouldValidate: true });
    setCoverImage(newFiles); // Zustand 동기화
  };

  // 파일 목록 - 타입 안전한 처리
  // - 의미: FileTableView에 전달할 파일 목록
  // - 사용 이유: 테이블 뷰 렌더링 및 타입 안전성
  const fileList: FileItem[] = (watch('coverImage') || []).map((f: any) => ({
    file: f.file || new File([], 'empty'),
    preview: f.preview || '',
    name: f.name || '이름 없음',
    size: f.size || 0,
  }));

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 작성 가이드 및 자동저장 불러오기 표시 */}
      <PostGuidelines tab="media" setValue={setValue} />
      <div className="flex flex-col gap-6">
        {/* 파일 업로드 */}
        {/* - 의미: 파일 업로드 UI */}
        <FileUpload
          files={fileList.map((f: FileItem) => f.file)}
          previews={fileList.map((f: FileItem) => f.preview)}
          onFilesSelected={handleFileSelect}
          onFileRemove={handleFileRemove}
          randomColors={randomColors}
        />
        {/* 에러 메시지 - 타입 안전한 처리 */}
        {errors.coverImage && (
          <FormMessage>
            {typeof errors.coverImage.message === 'string'
              ? errors.coverImage.message
              : '파일 업로드에 오류가 있습니다.'}
          </FormMessage>
        )}
        {/* 파일 테이블 뷰 */}
        {/* - 의미: 업로드된 파일 목록 표시 */}
        {fileList.length > 0 && (
          <FileTableView files={fileList} onFileRemove={handleBulkFileRemove} />
        )}
      </div>
    </div>
  );
}

export default MediaSection;
//====여기까지 수정됨====
