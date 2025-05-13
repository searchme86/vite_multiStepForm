import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Card,
  Input,
  Textarea,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Chip,
  Switch,
  CardBody,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { blogPostSchema, type BlogPostFormData } from '../../types/blog-post';
import { FileUpload } from './file-upload';
import { StepProgress } from './step-progress';
import { Notification } from './notifications';
import { FileTableView } from './file-table-view';

const CATEGORIES = [
  'Technology',
  'Travel',
  'Food',
  'Lifestyle',
  'Business',
  'Health',
  'Education',
  'Entertainment',
];

export const BlogPostForm = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [notification, setNotification] = React.useState({
    message: '',
    isVisible: false,
    type: 'success' as 'success' | 'error' | 'info',
  });
  const [autosaveEnabled, setAutosaveEnabled] = React.useState(false);
  const [randomColors] = React.useState<string[]>([
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
  ]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      tags: [],
      coverImage: [],
      isDraft: false,
      isPublic: true,
    },
  });

  const onSubmit = async (data: BlogPostFormData) => {
    console.log('Form submitted:', data);
    // Simulate file upload
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  };

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

  const handleFileRemove = (index: number) => {
    const files = watch('coverImage');
    const newFiles = files.filter((_, i) => i !== index);
    setValue('coverImage', newFiles);
  };

  const handleAddTag = (tag: string) => {
    const currentTags = watch('tags');
    if (tag && !currentTags.includes(tag) && currentTags.length < 5) {
      setValue('tags', [...currentTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = watch('tags');
    setValue(
      'tags',
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleBulkFileRemove = (indexes: number[]) => {
    const files = watch('coverImage');
    const newFiles = files.filter((_, i) => !indexes.includes(i));
    setValue('coverImage', newFiles);
    showNotification(`${indexes.length}개의 파일이 삭제되었습니다.`);
  };

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setNotification({
      message,
      isVisible: true,
      type,
    });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleTemporarySave = () => {
    showNotification('포스트가 임시 저장되었습니다.');
  };

  const handleAutosaveToggle = (enabled: boolean) => {
    setAutosaveEnabled(enabled);
    showNotification(
      enabled
        ? '포스트 자동저장 설정을 시작합니다.'
        : '포스트 자동저장 설정이 종료됐습니다.',
      'info'
    );
  };

  const stepTitles = ['기본 정보', '콘텐츠', '미디어', '발행'];

  const steps = [
    {
      title: '기본 정보',
      icon: 'lucide:info',
      content: (
        <div className="space-y-8">
          {/* 첫번째 섹션 - 알림 영역은 Notification 컴포넌트로 대체 */}

          {/* 두번째 섹션 - 유의사항 및 설정 */}
          <div className="p-6 space-y-6 rounded-lg bg-default-50">
            <div>
              <h3 className="mb-4 text-lg font-medium">포스트 작성 유의사항</h3>
              <ul className="pl-5 space-y-2 list-disc text-default-600">
                <li>포스트 제목은 5자 이상 100자 이하로 작성해주세요.</li>
                <li>포스트 설명은 20자 이상 500자 이하로 작성해주세요.</li>
                <li>최소 1개 이상의 태그를 추가해주세요. (최대 5개)</li>
                <li>포스트 내용은 100자 이상 작성해주세요.</li>
                <li>대표 이미지는 최소 1개 이상 업로드해주세요. (최대 10개)</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-default-200">
              <h3 className="mb-4 text-lg font-medium">포스트 설정</h3>
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="lucide:save" />}
                  onPress={handleTemporarySave}
                  aria-label="포스트 임시 저장"
                >
                  포스트 임시저장
                </Button>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-medium">포스트 자동저장</h4>
                    <p className="text-small text-default-500">
                      5분마다 작성 중인 포스트를 자동으로 저장합니다.
                    </p>
                  </div>
                  <Switch
                    isSelected={autosaveEnabled}
                    onValueChange={handleAutosaveToggle}
                    aria-label="포스트 자동저장 설정"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 세번째 섹션 - 포스트 기본 정보 */}
          <div className="space-y-6">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  label="포스트 제목"
                  placeholder="제목을 입력하세요"
                  errorMessage={errors.title?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="포스트 설명"
                  placeholder="포스트에 대한 간략한 설명을 입력하세요"
                  errorMessage={errors.description?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  label="카테고리"
                  placeholder="카테고리를 선택하세요"
                  errorMessage={errors.category?.message}
                  {...field}
                >
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </div>
      ),
    },
    {
      title: '콘텐츠',
      icon: 'lucide:file-text',
      content: (
        <div className="space-y-6">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <Textarea
                label="포스트 내용"
                placeholder="포스트 내용을 작성하세요..."
                minRows={10}
                errorMessage={errors.content?.message}
                {...field}
              />
            )}
          />
          <div className="space-y-2">
            <Input
              label="태그"
              placeholder="태그를 입력하고 Enter 키를 누르세요"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  handleAddTag(input.value);
                  input.value = '';
                }
              }}
              aria-label="태그 입력"
            />
            <div className="flex flex-wrap gap-2">
              {watch('tags').map((tag) => (
                <Chip
                  key={tag}
                  onClose={() => handleRemoveTag(tag)}
                  variant="flat"
                >
                  {tag}
                </Chip>
              ))}
            </div>
            {errors.tags && (
              <p className="text-tiny text-danger">{errors.tags.message}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '미디어',
      icon: 'lucide:image',
      content: (
        <div className="space-y-8">
          <FileUpload
            files={watch('coverImage').map((f) => f.file)}
            previews={watch('coverImage').map((f) => f.preview)}
            onFilesSelected={handleFileSelect}
            onFileRemove={handleFileRemove}
            uploadProgress={uploadProgress}
            randomColors={randomColors}
          />
          {errors.coverImage && (
            <p className="text-tiny text-danger">{errors.coverImage.message}</p>
          )}

          {/* Add table view for uploaded files */}
          {watch('coverImage').length > 0 && (
            <FileTableView
              files={watch('coverImage')}
              onFileRemove={handleBulkFileRemove}
            />
          )}
        </div>
      ),
    },
    {
      title: '발행',
      icon: 'lucide:send',
      content: (
        <div className="space-y-6">
          <Controller
            name="isDraft"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-medium">Save as Draft</h3>
                  <p className="text-small text-default-500">
                    Save this post as a draft to edit later
                  </p>
                </div>
                <Switch checked={field.value} onChange={field.onChange} />
              </div>
            )}
          />
          <Controller
            name="isPublic"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-medium">Public Post</h3>
                  <p className="text-small text-default-500">
                    Make this post visible to everyone
                  </p>
                </div>
                <Switch checked={field.value} onChange={field.onChange} />
              </div>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl p-4 mx-auto">
      {/* Add notification component */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        type={notification.type}
      />

      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Create New Blog Post</h1>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="flat"
                color="default"
                isDisabled={activeStep === 0}
                onPress={() => setActiveStep((prev) => prev - 1)}
              >
                Previous
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button type="submit" color="primary" isLoading={isSubmitting}>
                  Publish Post
                </Button>
              ) : (
                <Button
                  type="button"
                  color="primary"
                  onPress={() => setActiveStep((prev) => prev + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </div>

          {/* Add StepProgress component */}
          <StepProgress
            steps={stepTitles}
            currentStep={activeStep}
            onStepClick={(step) => setActiveStep(step)}
          />

          <Tabs
            aria-label="Blog post creation steps"
            selectedKey={String(activeStep)}
            onSelectionChange={(key) => setActiveStep(Number(key))}
            className="w-full"
          >
            {steps.map((step, index) => (
              <Tab
                key={index}
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon={step.icon} className="w-4 h-4" />
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                }
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="py-4"
                  >
                    {step.content}
                  </motion.div>
                </AnimatePresence>
              </Tab>
            ))}
          </Tabs>
        </CardBody>
      </Card>
    </form>
  );
};
