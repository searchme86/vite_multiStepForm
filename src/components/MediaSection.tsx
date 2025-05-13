//====여기부터 수정됨====
// MediaSection.tsx: 블로그 포스트의 미디어 업로드 섹션
// - 의미: 파일 업로드와 테이블 뷰를 관리
// - 사용 이유: 미디어 관련 기능 단일 책임 분리
// - 비유: 사진 앨범과 목록표를 관리하는 사서
// - 작동 메커니즘:
//   1. FileUpload로 파일 선택 및 미리보기
//   2. FileTableView로 업로드된 파일 목록 표시
//   3. react-hook-form으로 파일 데이터 관리
// - 관련 키워드: react-hook-form, shadcn/ui, File API
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FileUpload from './FileUpload';
import FileTableView from './FileTableView';
import { type BlogPostFormData } from '../types/blog-post';

// 함수: 미디어 섹션 컴포넌트
// - 의미: 미디어 업로드 UI와 로직 통합
function MediaSection() {
  // react-hook-form 컨텍스트: 폼 상태 접근
  // - 타입: UseFormReturn<BlogPostFormData>
  // - 의미: 폼 데이터 및 오류 관리
  // - 사용 이유: 중앙화된 폼 상태 관리
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BlogPostFormData>();

  // 상수: 랜덤 색상 배열
  // - 타입: string[]
  // - 의미: UI 요소에 색상 다양성 부여
  const randomColors = ['blue', 'green', 'yellow', 'red', 'purple'];

  // 상태: 업로드 진행률
  // - 타입: number
  // - 의미: 업로드 진행 상황 표시
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // 함수: 파일 선택 핸들러
  // - 의미: 선택된 파일을 폼 상태에 추가
  const handleFileSelect = (files: File[]) => {
    const existingFiles = watch('coverImage') || [];
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    setValue('coverImage', [...existingFiles, ...newFiles]);
  };

  // 함수: 파일 제거 핸들러
  // - 의미: 특정 파일 제거
  const handleFileRemove = (index: number) => {
    const files = watch('coverImage') || [];
    const newFiles = files.filter((_, i) => i !== index);
    setValue('coverImage', newFiles);
  };

  // 함수: 일괄 파일 제거 핸들러
  // - 의미: 여러 파일 제거
  const handleBulkFileRemove = (indexes: number[]) => {
    const files = watch('coverImage') || [];
    const newFiles = files.filter((_, i) => !indexes.includes(i));
    setValue('coverImage', newFiles);
  };

  // 파일 목록: 타입 안정성을 위해 필수 속성 보장
  // - 의미: FileTableView에 전달할 파일 목록 준비
  const fileList = (watch('coverImage') || []).map((f) => ({
    file: f.file || new File([], 'empty'),
    preview: f.preview || '',
    name: f.name || '이름 없음',
    size: f.size || 0,
  }));

  return (
    // 컨테이너: 미디어 섹션 UI
    // - 의미: 업로드와 테이블 뷰 통합
    <div className="space-y-8">
      <FileUpload
        files={fileList.map((f) => f.file)}
        previews={fileList.map((f) => f.preview)}
        onFilesSelected={handleFileSelect}
        onFileRemove={handleFileRemove}
        uploadProgress={uploadProgress}
        randomColors={randomColors}
      />
      {errors.coverImage && (
        <p className="text-sm text-red-500">{errors.coverImage.message}</p>
      )}
      {fileList.length > 0 && (
        <FileTableView files={fileList} onFileRemove={handleBulkFileRemove} />
      )}
    </div>
  );
}

export default MediaSection;
//====여기까지 수정됨====
