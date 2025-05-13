import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Checkbox,
  Button,
  Tooltip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface FileTableViewProps {
  files: Array<{
    file: File;
    preview: string;
    name: string;
    size: number;
  }>;
  onFileRemove: (indexes: number[]) => void;
}

export const FileTableView: React.FC<FileTableViewProps> = ({
  files,
  onFileRemove
}) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set([]));
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return "lucide:file-type-pdf";
      case 'doc':
      case 'docx':
        return "lucide:file-type-doc";
      case 'xls':
      case 'xlsx':
        return "lucide:file-type-xls";
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return "lucide:image";
      case 'txt':
        return "lucide:file-text";
      case 'html':
      case 'htm':
        return "lucide:file-code";
      default:
        return "lucide:file";
    }
  };

  const handleDeleteSelected = () => {
    const indexesToRemove = Array.from(selectedKeys).map(key => parseInt(key));
    onFileRemove(indexesToRemove);
    setSelectedKeys(new Set([]));
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          업로드된 파일 <span className="text-default-500">({files.length} 개)</span>
        </h3>
        
        {selectedKeys.size > 0 && (
          <Button 
            color="danger" 
            variant="light" 
            startContent={<Icon icon="lucide:trash-2" />}
            onPress={handleDeleteSelected}
            aria-label={`선택한 ${selectedKeys.size}개 파일 삭제`}
          >
            선택 삭제 ({selectedKeys.size})
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table
          aria-label="업로드된 파일 목록"
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys as any}
          removeWrapper
        >
          <TableHeader>
            <TableColumn>파일명</TableColumn>
            <TableColumn>크기</TableColumn>
            <TableColumn>업로드 날짜</TableColumn>
            <TableColumn>작업</TableColumn>
          </TableHeader>
          <TableBody emptyContent="업로드된 파일이 없습니다.">
            {files.map((file, index) => (
              <TableRow key={index.toString()} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {isImageFile(file.file) ? (
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-default-100 rounded flex items-center justify-center flex-shrink-0">
                        <Icon 
                          icon={getFileIcon(file.name)} 
                          className="w-5 h-5 text-default-600" 
                        />
                      </div>
                    )}
                    <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                  </div>
                </TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>{formatDate(new Date())}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Tooltip content="파일 삭제">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => onFileRemove([index])}
                        aria-label={`${file.name} 파일 삭제`}
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};