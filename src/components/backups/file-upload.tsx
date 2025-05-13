import React from "react";
import { Card, Progress, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  files: File[];
  previews: string[];
  onFilesSelected: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  uploadProgress?: number;
  randomColors?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  previews,
  onFilesSelected,
  onFileRemove,
  uploadProgress,
  randomColors = ["primary", "success", "warning", "danger", "secondary"]
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [uploadStatus, setUploadStatus] = React.useState<Record<string, 'uploading' | 'success' | 'error'>>({});
  const [showCarousel, setShowCarousel] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [fileColors, setFileColors] = React.useState<Record<string, string>>({});

  // Check if we need to show carousel (more than 5 images)
  React.useEffect(() => {
    setShowCarousel(previews.length > 5);
  }, [previews.length]);

  // Simulate different upload statuses for demonstration
  React.useEffect(() => {
    if (files.length > 0) {
      const newStatus: Record<string, 'uploading' | 'success' | 'error'> = {};
      
      files.forEach((file, index) => {
        // Randomly assign status for demo purposes
        if (index % 3 === 0) {
          newStatus[file.name] = 'uploading';
        } else if (index % 3 === 1) {
          newStatus[file.name] = 'success';
        } else {
          newStatus[file.name] = 'error';
        }
      });
      
      setUploadStatus(newStatus);
    }
  }, [files]);

  // Assign random colors to files for progress bars
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
      
      setFileColors({...fileColors, ...newColors});
    }
  }, [files, randomColors]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => 
      file.type.startsWith("image/")
    );
    onFilesSelected(validFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const nextSlide = () => {
    setCurrentSlide(current => 
      current === Math.ceil(previews.length / 5) - 1 ? 0 : current + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide(current => 
      current === 0 ? Math.ceil(previews.length / 5) - 1 : current - 1
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
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

  const handleCancelUpload = () => {
    setIsCancelling(true);
    // Simulate cancellation
    setTimeout(() => {
      setIsCancelling(false);
      // Show only successful uploads
      const successfulFiles = files.filter((file) => uploadStatus[file.name] === 'success');
      const successfulIndexes = successfulFiles.map(file => 
        files.findIndex(f => f.name === file.name)
      );
      
      // Remove failed and uploading files
      const indexesToRemove = files
        .map((_, index) => index)
        .filter(index => !successfulIndexes.includes(index));
      
      indexesToRemove.forEach(index => onFileRemove(index));
    }, 500);
  };

  return (
    <div className="w-full space-y-6">
      <Card className="border border-dashed border-default-300 bg-transparent shadow-none overflow-hidden">
        <div
          ref={dropZoneRef}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 transition-colors cursor-pointer
            ${isDragging ? "bg-primary/10" : "bg-default-50"}`}
          style={{ cursor: isDragging ? "grab" : "pointer" }}
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
          
          <div className="mb-4 p-4 rounded-full bg-primary-100">
            <Icon 
              icon="lucide:upload-cloud" 
              className="h-8 w-8 text-primary" 
            />
          </div>
          
          <h3 className="text-lg font-medium text-foreground mb-2">
            클릭하여 파일을 업로드하거나 드래그 앤 드롭하세요
          </h3>
          <p className="text-default-500 text-center max-w-md">
            지원 형식: SVG, JPG, PNG (각 10mb)
          </p>
          
          <div className="flex mt-4">
            <Icon icon="lucide:hand-metal" className="h-5 w-5 mr-1" />
            <Icon icon="lucide:file-type-pdf" className="h-5 w-5" />
          </div>
        </div>
      </Card>

      {/* File Upload Status Cards with Cancel Button */}
      {files.length > 0 && (
        <div className="relative">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-medium font-medium">업로드 중인 파일</h3>
            {Object.values(uploadStatus).some(status => status === 'uploading') && (
              <Button
                size="sm"
                color="danger"
                variant="flat"
                isLoading={isCancelling}
                startContent={!isCancelling && <Icon icon="lucide:x" />}
                onPress={handleCancelUpload}
                aria-label="업로드 취소"
              >
                업로드 취소
              </Button>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-3"
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 1
                  }}
                >
                  <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        uploadStatus[file.name] === 'error' ? 'bg-danger-100' : 
                        uploadStatus[file.name] === 'success' ? 'bg-success-100' : 
                        `bg-${fileColors[file.name] || 'primary'}-100`
                      }`}>
                        <Icon 
                          icon={getFileIcon(file.name)} 
                          className={`h-6 w-6 ${
                            uploadStatus[file.name] === 'error' ? 'text-danger' : 
                            uploadStatus[file.name] === 'success' ? 'text-success' : 
                            `text-${fileColors[file.name] || 'primary'}`
                          }`} 
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-small text-default-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {uploadStatus[file.name] === 'uploading' && (
                        <div className="w-48">
                          <Progress 
                            aria-label={`${file.name} 업로드 중`} 
                            value={52} 
                            color={fileColors[file.name] as any || "primary"}
                            className="max-w-full"
                          />
                        </div>
                      )}
                      
                      {uploadStatus[file.name] === 'success' && (
                        <Chip color="success" variant="flat" startContent={<Icon icon="lucide:check" />}>
                          업로드 성공!
                        </Chip>
                      )}
                      
                      {uploadStatus[file.name] === 'error' && (
                        <div className="flex items-center space-x-2">
                          <p className="text-danger text-small">업로드 실패! 다시 시도해주세요.</p>
                          <Button size="sm" color="primary" variant="light" startContent={<Icon icon="lucide:refresh-cw" />}>
                            다시 시도
                          </Button>
                        </div>
                      )}
                      
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color={uploadStatus[file.name] === 'error' ? "danger" : "default"}
                        onPress={() => onFileRemove(index)}
                        aria-label={`${file.name} 파일 삭제`}
                      >
                        <Icon icon="lucide:trash-2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Image Preview Section - Enhanced */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              첨부된 이미지 <span className="text-default-500">({previews.length}개)</span>
            </h3>
            {showCarousel && (
              <div className="flex space-x-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={prevSlide}
                  aria-label="이전 이미지"
                >
                  <Icon icon="lucide:chevron-left" className="h-4 w-4" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={nextSlide}
                  aria-label="다음 이미지"
                >
                  <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 
            ${showCarousel ? 'overflow-x-auto pb-2' : ''}`}
            style={showCarousel ? { scrollBehavior: 'smooth' } : {}}
          >
            <AnimatePresence>
              {showCarousel ? (
                // Carousel view for more than 5 images
                previews
                  .slice(currentSlide * 5, (currentSlide * 5) + 5)
                  .map((preview, index) => (
                    <motion.div
                      key={`${preview}-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="relative group overflow-hidden">
                        <img
                          src={preview}
                          alt={`미리보기 ${currentSlide * 5 + index + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="solid"
                            className="absolute top-2 right-2"
                            onPress={() => onFileRemove(currentSlide * 5 + index)}
                            aria-label={`이미지 ${currentSlide * 5 + index + 1} 삭제`}
                          >
                            <Icon icon="lucide:trash-2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
              ) : (
                // Regular grid view for 5 or fewer images
                previews.map((preview, index) => (
                  <motion.div
                    key={`${preview}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="relative group overflow-hidden">
                      <img
                        src={preview}
                        alt={`미리보기 ${index + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="solid"
                          className="absolute top-2 right-2"
                          onPress={() => onFileRemove(index)}
                          aria-label={`이미지 ${index + 1} 삭제`}
                        >
                          <Icon icon="lucide:trash-2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};