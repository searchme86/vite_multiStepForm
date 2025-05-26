//====여기부터 수정됨====
// MediaSection.tsx: 블로그 포스트의 미디어 업로드 섹션
// - 의미: 파일 업로드와 테이블 뷰 관리
// - 사용 이유: 미디어 관련 기능 분리
// - 비유: 사진 앨범 관리
// - 작동 메커니즘:
//   1. FileUpload로 파일 선택
//   2. FileTableView로 파일 목록 표시
//   3. PostGuidelines로 가이드와 자동저장 불러오기 제공
//   4. 날짜 표시 추가
// - 관련 키워드: react-hook-form, shadcn/ui, File API, flexbox

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FileUpload from './FileUpload';
import FileTableView from './FileTableView';
import PostGuidelines from './PostGuidelines';
import { FormMessage } from './ui/form';
import type { BlogPostFormData } from '../types/blog-post';

// 함수: 미디어 업로드 섹션
// - 의미: 파일 업로드 및 관리 UI 렌더링
// - 사용 이유: 포스트 미디어 관리
function MediaSection() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 및 오류 관리
  // - 사용 이유: 중앙화된 폼 상태 관리
  // - Fallback: 컨텍스트 없으면 오류 메시지 표시
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const {
    watch,
    setValue,
    formState: { errors },
  } = formContext;

  // 상수: 랜덤 색상
  // - 의미: UI 요소 색상 다양성
  // - 사용 이유: 시각적 구분
  const randomColors = ['blue', 'green', 'yellow', 'red', 'purple'];

  // 상태: 업로드 진행률
  // - 의미: 업로드 진행 상황 표시
  // - 사용 이유: 사용자 피드백
  // - Fallback: 기본값 0
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // 핸들러: 파일 선택
  // - 의미: 선택된 파일을 폼 상태에 추가
  // - 사용 이유: 업로드된 파일 관리
  const handleFileSelect = (files: File[]) => {
    // 기존 파일
    // - 의미: 현재 폼의 파일 목록
    // - 사용 이유: 새 파일 추가
    const existingFiles = watch('coverImage') || [];
    // 새 파일 객체
    // - 의미: 파일과 미리보기 URL 생성
    // - 사용 이유: UI와 데이터 동기화
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    // 폼 업데이트
    // - 의미: 파일 목록 갱신
    // - 사용 이유: 데이터 저장 및 유효성 검사
    setValue('coverImage', [...existingFiles, ...newFiles], {
      shouldValidate: true,
    });
  };

  // 핸들러: 파일 제거
  // - 의미: 특정 파일 제거
  // - 사용 이유: 사용자 선택 반영
  const handleFileRemove = (index: number) => {
    // 파일 목록
    // - 의미: 현재 파일 목록
    // - 사용 이유: 특정 파일 필터링
    const files = watch('coverImage') || [];
    // 새 파일 목록
    // - 의미: 선택된 파일 제외
    // - 사용 이유: 파일 목록 업데이트
    const newFiles = files.filter((_, i) => i !== index);
    // 폼 업데이트
    // - 의미: 파일 목록 갱신
    // - 사용 이유: 데이터 저장 및 유효성 검사
    setValue('coverImage', newFiles, { shouldValidate: true });
  };

  // 핸들러: 일괄 파일 제거
  // - 의미: 여러 파일 제거
  // - 사용 이유: 다중 선택 삭제 지원
  const handleBulkFileRemove = (indexes: number[]) => {
    // 파일 목록
    // - 의미: 현재 파일 목록
    // - 사용 이유: 선택된 파일 필터링
    const files = watch('coverImage') || [];
    // 새 파일 목록
    // - 의미: 선택된 파일 제외
    // - 사용 이유: 파일 목록 업데이트
    const newFiles = files.filter((_, i) => !indexes.includes(i));
    // 폼 업데이트
    // - 의미: 파일 목록 갱신
    // - 사용 이유: 데이터 저장 및 유효성 검사
    setValue('coverImage', newFiles, { shouldValidate: true });
  };

  // 파일 목록
  // - 의미: FileTableView에 전달할 파일 목록
  // - 사용 이유: 테이블 뷰 렌더링
  // - Fallback: 빈 배열
  const fileList = (watch('coverImage') || []).map((f) => ({
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
      {/* - 사용 이유: 사용자에게 입력 지침 제공 */}
      <PostGuidelines tab="media" />
      {/* 날짜 및 폼 컨테이너 */}
      {/* - 의미: 날짜와 파일 업로드 UI 배치 */}
      {/* - 사용 이유: 날짜 우측 상단 고정 */}
      <div className="flex flex-col gap-6">
        {/* 파일 업로드 */}
        {/* - 의미: 파일 업로드 UI */}
        {/* - 사용 이유: 이미지 업로드 및 미리보기 */}
        <FileUpload
          files={fileList.map((f) => f.file)}
          previews={fileList.map((f) => f.preview)}
          onFilesSelected={handleFileSelect}
          onFileRemove={handleFileRemove}
          uploadProgress={uploadProgress}
          randomColors={randomColors}
        />
        {errors.coverImage && (
          <FormMessage>{errors.coverImage.message}</FormMessage>
        )}
        {/* 파일 테이블 뷰 */}
        {/* - 의미: 업로드된 파일 목록 표시 */}
        {/* - 사용 이유: 파일 관리 및 삭제 */}
        {fileList.length > 0 && (
          <FileTableView files={fileList} onFileRemove={handleBulkFileRemove} />
        )}
      </div>
    </div>
  );
}

export default MediaSection;
//====여기까지 수정됨====
