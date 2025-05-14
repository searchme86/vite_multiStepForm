//====여기부터 수정됨====
// MediaSection.tsx: 블로그 포스트의 미디어 업로드 섹션
// - 의미: 파일 업로드와 테이블 뷰 관리
// - 사용 이유: 미디어 관련 기능 분리
// - 비유: 사진 앨범 관리
// - 작동 메커니즘:
//   1. FileUpload로 파일 선택
//   2. FileTableView로 파일 목록 표시
//   3. PostGuidelines로 가이드 제공
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FileUpload from './FileUpload';
import FileTableView from './FileTableView';
import PostGuidelines from './PostGuidelines';
import { FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';

function MediaSection() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 및 오류 관리
  // - 사용 이유: 중앙화된 폼 상태 관리
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BlogPostFormData>();

  // 상수: 랜덤 색상
  // - 의미: UI 요소 색상 다양성
  const randomColors = ['blue', 'green', 'yellow', 'red', 'purple'];

  // 상태: 업로드 진행률
  // - 의미: 업로드 진행 상황 표시
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // 핸들러: 파일 선택
  // - 의미: 선택된 파일을 폼 상태에 추가
  const handleFileSelect = (files: File[]) => {
    const existingFiles = watch('coverImage') || [];
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    setValue('coverImage', [...existingFiles, ...newFiles], {
      shouldValidate: true,
    });
  };

  // 핸들러: 파일 제거
  // - 의미: 특정 파일 제거
  const handleFileRemove = (index: number) => {
    const files = watch('coverImage') || [];
    const newFiles = files.filter((_, i) => i !== index);
    setValue('coverImage', newFiles, { shouldValidate: true });
  };

  // 핸들러: 일괄 파일 제거
  // - 의미: 여러 파일 제거
  const handleBulkFileRemove = (indexes: number[]) => {
    const files = watch('coverImage') || [];
    const newFiles = files.filter((_, i) => !indexes.includes(i));
    setValue('coverImage', newFiles, { shouldValidate: true });
  };

  // 파일 목록
  // - 의미: FileTableView에 전달할 파일 목록
  const fileList = (watch('coverImage') || []).map((f) => ({
    file: f.file || new File([], 'empty'),
    preview: f.preview || '',
    name: f.name || '이름 없음',
    size: f.size || 0,
  }));

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      <PostGuidelines tab="media" />
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
      {fileList.length > 0 && (
        <FileTableView files={fileList} onFileRemove={handleBulkFileRemove} />
      )}
    </div>
  );
}

export default MediaSection;
//====여기까지 수정됨====
