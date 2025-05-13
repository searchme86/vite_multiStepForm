//====여기부터 수정됨====
// FileTableView.tsx: 업로드된 파일을 테이블 형태로 표시
// - 의미: 파일 목록을 테이블로 보여주고, 선택 및 삭제 기능 제공
// - 사용 이유: 대량 파일 관리 시 가독성과 상호작용성 향상
// - 비유: 도서관 책 목록표처럼 파일을 정리하고 관리
// - 작동 메커니즘:
//   1. 파일 목록을 테이블로 렌더링
//   2. 체크박스로 파일 선택
//   3. 선택된 파일 일괄 삭제 또는 개별 삭제
// - 관련 키워드: shadcn/ui, Radix UI, Table, Tooltip
import React from 'react';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Icon } from '@iconify/react';

// 인터페이스: FileTableView 컴포넌트의 props
// - 타입: { files: Array, onFileRemove: Function }
// - 의미: 파일 목록과 삭제 콜백 함수 전달
interface FileTableViewProps {
  files: Array<{
    file?: File; // 선택적: 타입 안정성을 위해
    preview?: string;
    name?: string;
    size?: number;
  }>;
  onFileRemove: (indexes: number[]) => void;
}

function FileTableView({ files, onFileRemove }: FileTableViewProps) {
  // 상태: 선택된 파일 인덱스
  // - 타입: Set<string>
  // - 의미: 체크박스로 선택된 파일 인덱스를 저장
  // - 사용 이유: 다중 선택 기능 구현
  // - Fallback: 빈 Set으로 초기화하여 오류 방지
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(
    new Set([])
  );

  // 함수: 파일 크기 포맷팅
  // - 타입: (bytes: number) => string
  // - 의미: 바이트 단위를 읽기 쉬운 단위로 변환
  // - 사용 이유: 사용자 친화적인 파일 크기 표시
  const formatFileSize = (bytes: number = 0): string => {
    // Fallback: bytes가 유효하지 않을 경우 0 처리
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    else if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    else return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  // 함수: 날짜 포맷팅
  // - 타입: (date: Date) => string
  // - 의미: 날짜를 한국식 포맷으로 변환
  // - 사용 이유: 일관된 날짜 표시
  const formatDate = (date: Date = new Date()): string => {
    // Fallback: 유효하지 않은 날짜일 경우 현재 날짜 사용
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  // 함수: 파일 확장자에 따른 아이콘 반환
  // - 타입: (fileName: string) => string
  // - 의미: 파일 유형에 맞는 아이콘 선택
  // - 사용 이유: 시각적 구분 용이
  const getFileIcon = (fileName: string = ''): string => {
    // Fallback: 파일 이름이 없을 경우 기본 아이콘
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

  // 함수: 선택된 파일 삭제
  // - 의미: 선택된 파일 인덱스를 부모 컴포넌트로 전달하여 삭제
  // - 사용 이유: 일괄 삭제 기능 구현
  const handleDeleteSelected = () => {
    const indexesToRemove = Array.from(selectedKeys).map((key) =>
      parseInt(key)
    );
    onFileRemove(indexesToRemove);
    setSelectedKeys(new Set([])); // 선택 초기화
  };

  // 함수: 이미지 파일 여부 확인
  // - 타입: (file: File | undefined) => boolean
  // - 의미: 파일이 이미지인지 확인
  // - 사용 이유: 이미지 미리보기 렌더링 결정
  const isImageFile = (file?: File): boolean => {
    // Fallback: file이 undefined일 경우 false 반환
    return file?.type.startsWith('image/') || false;
  };

  return (
    // 컨테이너: 테이블과 제목 영역
    // - 의미: 파일 목록과 삭제 버튼을 포함
    <div className="space-y-4">
      {/* 제목과 선택 삭제 버튼 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          업로드된 파일{' '}
          <span className="text-gray-500">({files.length} 개)</span>
        </h3>
        {selectedKeys.size > 0 && (
          <Button
            type="button" // 버튼 타입 명시
            variant="destructive"
            onClick={handleDeleteSelected}
            aria-label={`선택한 ${selectedKeys.size}개 파일 삭제`}
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4 mr-2" />
            선택 삭제 ({selectedKeys.size})
          </Button>
        )}
      </div>
      {/* 테이블 컨테이너 */}
      <div className="overflow-hidden border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={
                    selectedKeys.size === files.length && files.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedKeys(
                        new Set(files.map((_, i) => i.toString()))
                      );
                    } else {
                      setSelectedKeys(new Set([]));
                    }
                  }}
                  aria-label="모두 선택"
                />
              </TableHead>
              <TableHead>파일명</TableHead>
              <TableHead>크기</TableHead>
              <TableHead>업로드 날짜</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>업로드된 파일이 없습니다.</TableCell>
              </TableRow>
            ) : (
              files.map((file, index) => (
                <TableRow key={index.toString()}>
                  <TableCell>
                    <Checkbox
                      checked={selectedKeys.has(index.toString())}
                      onCheckedChange={(checked) => {
                        const newKeys = new Set(selectedKeys);
                        if (checked) {
                          newKeys.add(index.toString());
                        } else {
                          newKeys.delete(index.toString());
                        }
                        setSelectedKeys(newKeys);
                      }}
                      aria-label={`${file.name || '파일'} 선택`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {isImageFile(file.file) && file.preview ? (
                        <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded">
                          <img
                            src={file.preview}
                            alt={file.name || '이미지'}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gray-100 rounded">
                          <Icon
                            icon={getFileIcon(file.name)}
                            className="w-5 h-5 text-gray-600"
                          />
                        </div>
                      )}
                      <span className="font-medium truncate max-w-[200px]">
                        {file.name || '이름 없음'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{formatDate(new Date())}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => onFileRemove([index])}
                              aria-label={`${file.name || '파일'} 삭제`}
                            >
                              <Icon icon="lucide:trash-2" className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>파일 삭제</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default FileTableView;
//====여기까지 수정됨====
