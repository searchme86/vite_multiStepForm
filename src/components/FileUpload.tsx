//====수정됨====
// FileUpload.tsx: 파일 업로드 및 미리보기 UI
// - 의미: 파일 드래그 앤 드롭, 선택, 업로드 상태 표시
// - 사용 이유: 사용자 친화적인 파일 업로드 경험 제공
// - 비유: 사진을 앨범에 정리하고 미리보는 작업
// - 작동 메커니즘:
//   1. 드래그 앤 드롭 또는 파일 입력으로 파일 선택
//   2. 업로드 진행률과 상태 표시
//   3. 이미지 미리보기를 그리드 또는 캐러셀로 렌더링
// - 관련 키워드: shadcn/ui, Radix UI, File API, Tailwind CSS
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Icon } from '@iconify/react';

// 인터페이스: FileUpload 컴포넌트의 props
// - 타입: { files, previews, onFilesSelected, onFileRemove, uploadProgress, randomColors }
// - 의미: 업로드된 파일, 미리보기 URL, 콜백 함수, 진행률, 색상 전달
interface FileUploadProps {
  files: File[];
  previews: string[];
  onFilesSelected: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  uploadProgress?: number;
  randomColors?: string[];
}

function FileUpload({
  files,
  previews,
  onFilesSelected,
  onFileRemove,
  uploadProgress = 0,
  randomColors = ['blue', 'green', 'yellow', 'red', 'purple'],
}: FileUploadProps) {
  // 참조: 파일 입력 요소
  // - 타입: React.RefObject<HTMLInputElement>
  // - 의미: 파일 선택 다이얼로그 제어
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // 참조: 드롭 존 요소
  // - 타입: React.RefObject<HTMLDivElement>
  // - 의미: 드래그 앤 드롭 영역 제어
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  // 상태: 드래그 중 여부
  // - 타입: boolean
  // - 의미: 드래그 상태에 따라 UI 변경
  const [isDragging, setIsDragging] = React.useState(false);
  // 상태: 현재 캐러셀 슬라이드
  // - 타입: number
  // - 의미: 캐러셀 이미지 그룹 인덱스
  const [currentSlide, setCurrentSlide] = React.useState(0);
  // 상태: 업로드 상태
  // - 타입: Record<string, "uploading" | "success" | "error">
  // - 의미: 각 파일의 업로드 상태 관리
  const [uploadStatus, setUploadStatus] = React.useState<
    Record<string, 'uploading' | 'success' | 'error'>
  >({});
  // 상태: 캐러셀 표시 여부
  // - 타입: boolean
  // - 의미: 이미지 수가 5개 초과 시 캐러셀 표시
  const [showCarousel, setShowCarousel] = React.useState(false);
  // 상태: 업로드 취소 중 여부
  // - 타입: boolean
  // - 의미: 취소 버튼 클릭 시 로딩 UI 표시
  const [isCancelling, setIsCancelling] = React.useState(false);
  // 상태: 파일별 색상
  // - 타입: Record<string, string>
  // - 의미: 각 파일에 랜덤 색상 지정
  const [fileColors, setFileColors] = React.useState<Record<string, string>>(
    {}
  );

  // 효과: 캐러셀 표시 여부 결정
  // - 의미: 이미지 수가 5개 초과 시 캐러셀 활성화
  React.useEffect(() => {
    setShowCarousel(previews.length > 5);
  }, [previews.length]);

  // 효과: 파일별 업로드 상태 시뮬레이션
  // - 의미: 데모용으로 파일마다 랜덤 상태 부여
  React.useEffect(() => {
    if (files.length > 0) {
      const newStatus: Record<string, 'uploading' | 'success' | 'error'> = {};
      files.forEach((file, index) => {
        newStatus[file.name] =
          index % 3 === 0 ? 'uploading' : index % 3 === 1 ? 'success' : 'error';
      });
      setUploadStatus(newStatus);
    }
  }, [files]);

  // 효과: 파일별 랜덤 색상 지정
  // - 의미: 진행 바와 아이콘에 색상 다양성 부여
  React.useEffect(() => {
    if (files.length > 0) {
      const newColors: Record<string, string> = {};
      files.forEach((file) => {
        if (!fileColors[file.name]) {
          const randomIndex = Math.floor(Math.random() * randomColors.length);
          newColors[file.name] = randomColors[randomIndex];
        } else {
          newColors[file.name] = fileColors[file.name];
        }
      });
      setFileColors({ ...fileColors, ...newColors });
    }
  }, [files, randomColors]);

  // 함수: 드래그 오버 핸들러
  // - 의미: 드래그 시 UI 변경
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 함수: 드래그 리브 핸들러
  // - 의미: 드래그 종료 시 UI 복원
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 함수: 드롭 핸들러
  // - 의미: 드롭된 파일 처리
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // 함수: 파일 처리
  // - 의미: 유효한 이미지 파일만 필터링
  const handleFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/')
    );
    onFilesSelected(validFiles);
  };

  // 함수: 파일 입력 핸들러
  // - 의미: 파일 선택 다이얼로그에서 파일 처리
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // 함수: 다음 슬라이드 이동
  // - 의미: 캐러셀에서 다음 이미지 그룹 표시
  const nextSlide = () => {
    setCurrentSlide((current) =>
      current === Math.ceil(previews.length / 5) - 1 ? 0 : current + 1
    );
  };

  // 함수: 이전 슬라이드 이동
  // - 의미: 캐러셀에서 이전 이미지 그룹 표시
  const prevSlide = () => {
    setCurrentSlide((current) =>
      current === 0 ? Math.ceil(previews.length / 5) - 1 : current - 1
    );
  };

  // 함수: 파일 크기 포맷팅
  // - 의미: 바이트 단위를 읽기 쉬운 단위로 변환
  const formatFileSize = (bytes: number = 0): string => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    else if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    else return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  // 함수: 파일 아이콘 선택
  // - 의미: 파일 확장자에 따라 아이콘 반환
  const getFileIcon = (fileName: string = ''): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'pdf':
        return 'lucide:file-type-pdf';
      case 'doc':
      case 'docx':
        return 'lucide:file-type-doc';
      case 'xls':
      case 'xlsx':
        return 'lucide:file-type-xls';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'lucide:image';
      case 'txt':
        return 'lucide:file-text';
      case 'html':
      case 'htm':
        return 'lucide:file-code';
      default:
        return 'lucide:file';
    }
  };

  // 함수: 업로드 취소
  // - 의미: 실패 또는 진행 중인 업로드 제거
  const handleCancelUpload = () => {
    setIsCancelling(true);
    setTimeout(() => {
      setIsCancelling(false);
      const successfulFiles = files.filter(
        (file) => uploadStatus[file.name] === 'success'
      );
      const successfulIndexes = successfulFiles.map((file) =>
        files.findIndex((f) => f.name === file.name)
      );
      const indexesToRemove = files
        .map((_, index) => index)
        .filter((index) => !successfulIndexes.includes(index));
      indexesToRemove.forEach((index) => onFileRemove(index));
    }, 500);
  };

  return (
    // 컨테이너: 파일 업로드 UI 전체
    // - 의미: 드롭 존, 업로드 상태, 이미지 미리보기 포함
    <div className="w-full space-y-6">
      {/* 드롭 존 */}
      <Card>
        <CardContent
          ref={dropZoneRef}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 transition-colors cursor-pointer ${
            isDragging ? 'bg-blue-100' : 'bg-gray-50'
          }`}
          aria-label="파일 업로드 영역"
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            aria-label="파일 선택"
          />
          <div className="p-4 mb-4 bg-blue-100 rounded-full">
            <Icon
              icon="lucide:upload-cloud"
              className="w-8 h-8 text-blue-600"
            />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">
            클릭하여 파일을 업로드하거나 드래그 앤 드롭하세요
          </h3>
          <p className="max-w-md text-center text-gray-500">
            지원 형식: SVG, JPG, PNG (각 10mb)
          </p>
          <div className="flex mt-4">
            <Icon icon="lucide:hand-metal" className="w-5 h-5 mr-1" />
            <Icon icon="lucide:file-type-pdf" className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
      {/* 업로드 상태 */}
      {files.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-medium">업로드 중인 파일</h3>
            {Object.values(uploadStatus).some(
              (status) => status === 'uploading'
            ) && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isCancelling}
                onClick={handleCancelUpload}
                aria-label="업로드 취소"
              >
                {isCancelling ? (
                  <span className="mr-2 animate-spin">⏳</span>
                ) : (
                  <Icon icon="lucide:x" className="w-4 h-4 mr-2" />
                )}
                업로드 취소
              </Button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="mb-3">
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          uploadStatus[file.name] === 'error'
                            ? 'bg-red-100'
                            : uploadStatus[file.name] === 'success'
                            ? 'bg-green-100'
                            : `bg-${fileColors[file.name] || 'blue'}-100`
                        }`}
                      >
                        <Icon
                          icon={getFileIcon(file.name)}
                          className={`h-6 w-6 ${
                            uploadStatus[file.name] === 'error'
                              ? 'text-red-600'
                              : uploadStatus[file.name] === 'success'
                              ? 'text-green-600'
                              : `text-${fileColors[file.name] || 'blue'}-600`
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {uploadStatus[file.name] === 'uploading' && (
                        <div className="w-48">
                          <Progress
                            value={uploadProgress}
                            className="max-w-full"
                            aria-label={`${file.name} 업로드 진행률`}
                          />
                        </div>
                      )}
                      {uploadStatus[file.name] === 'success' && (
                        <Badge variant="outline">
                          <Icon icon="lucide:check" className="w-4 h-4 mr-1" />
                          업로드 성공!
                        </Badge>
                      )}
                      {uploadStatus[file.name] === 'error' && (
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-red-600">
                            업로드 실패! 다시 시도해주세요.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="업로드 재시도"
                          >
                            <Icon
                              icon="lucide:refresh-cw"
                              className="w-4 h-4 mr-1"
                            />
                            다시 시도
                          </Button>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onFileRemove(index)}
                        aria-label={`${file.name} 파일 삭제`}
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 이미지 미리보기 */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              첨부된 이미지{' '}
              <span className="text-gray-500">({previews.length}개)</span>
            </h3>
            {showCarousel && (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  aria-label="이전 이미지"
                >
                  <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  aria-label="다음 이미지"
                >
                  <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${
              showCarousel ? 'overflow-x-auto pb-2' : ''
            }`}
            style={showCarousel ? { scrollBehavior: 'smooth' } : {}}
          >
            {showCarousel
              ? previews
                  .slice(currentSlide * 5, currentSlide * 5 + 5)
                  .map((preview, index) => (
                    <div key={`${preview}-${index}`}>
                      <Card className="relative overflow-hidden group">
                        <img
                          src={preview}
                          alt={`미리보기 ${currentSlide * 5 + index + 1}`}
                          className="object-cover w-full aspect-square"
                        />
                        <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              onFileRemove(currentSlide * 5 + index)
                            }
                            aria-label={`이미지 ${
                              currentSlide * 5 + index + 1
                            } 삭제`}
                          >
                            <Icon icon="lucide:trash-2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ))
              : previews.map((preview, index) => (
                  <div key={`${preview}-${index}`}>
                    <Card className="relative overflow-hidden group">
                      <img
                        src={preview}
                        alt={`미리보기 ${index + 1}`}
                        className="object-cover w-full aspect-square"
                      />
                      <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => onFileRemove(index)}
                          aria-label={`이미지 ${index + 1} 삭제`}
                        >
                          <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
//====수정됨====
