// BlogPostForm.tsx: 블로그 포스트 작성 폼
// - 의미: 기본 정보, 본문 작성, 미디어, 미리보기 입력 관리 및 저장
// - 사용 이유: 통합 폼으로 사용자 입력 처리 및 저장 기능 제공
// - 비유: 블로그 작성 노트북, 각 탭은 페이지, 저장 버튼은 책갈피
// - 작동 메커니즘:
//   1. useForm으로 폼 초기화
//   2. Tabs로 섹션 전환
//   3. 자동저장 주기적 실행, 임시저장 수동 실행
//   4. 로컬스토리지로 데이터 저장
// - 관련 키워드: react-hook-form, shadcn/ui, localStorage, flexbox

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Icon } from '@iconify/react';
import BasicInfoSection from './BasicInfoSection';
import ContentSection from './ContentSection';
import MediaSection from './MediaSection';
import PreviewSection from './PreviewSection';
import NotificationProvider from './Notification';
import { BlogPostFormData, blogPostSchema } from '../types/blog-post';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// 함수: 블로그 포스트 폼
// - 의미: 전체 폼 UI와 저장 로직 관리
// - 사용 이유: 사용자 입력과 저장 기능 통합
function BlogPostForm() {
  // 폼 상태
  // - 의미: 폼 데이터 및 유효성 검사 관리
  // - 사용 이유: react-hook-form으로 선언적 폼 관리
  // - Fallback: 기본값 설정으로 초기화
  const methods = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      markdown: '',
      searchTerm: '',
      category: '',
      tags: [],
      coverImage: [],
      publishDate: undefined,
      isDraft: false,
      isPublic: true,
    },
  });

  // 상태: 현재 탭
  // - 의미: 활성 탭 추적
  // - 사용 이유: UI 상태 관리
  // - Fallback: 기본값 'basic'
  const [currentTab, setCurrentTab] = React.useState('basic');

  // 상태: 자동저장 활성화 여부
  // - 의미: 자동저장 설정 관리
  // - 사용 이유: 주기적 저장 제어
  // - Fallback: 기본값 false
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = React.useState(false);

  // 폼 데이터 접근
  // - 의미: 현재 폼 데이터 추적
  // - 사용 이유: 저장 로직에 사용
  const { watch, handleSubmit } = methods;

  // 효과: 자동저장
  // - 의미: 활성화 시 10초마다 폼 데이터 저장
  // - 사용 이유: 데이터 손실 방지
  // - 비유: 노트를 쓰다가 주기적으로 저장 버튼 누르기
  React.useEffect(() => {
    if (isAutoSaveEnabled) {
      const interval = setInterval(() => {
        const formData = watch();
        localStorage.setItem(
          `autosave_all_${Date.now()}`,
          JSON.stringify(formData)
        );
        toast.success('포스트가 자동 저장되었습니다.', { duration: 3000 });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAutoSaveEnabled, watch]);

  // 핸들러: 자동저장 토글
  // - 의미: 자동저장 설정 전환
  // - 사용 이유: 사용자 선택 반영
  const handleAutoSaveToggle = () => {
    setIsAutoSaveEnabled((prev) => {
      const newState = !prev;
      toast.success(
        newState
          ? '자동 저장이 설정되었습니다.'
          : '자동 저장이 해제되었습니다.',
        { duration: 3000 }
      );
      return newState;
    });
  };

  // 핸들러: 임시저장
  // - 의미: 현재 폼 데이터 수동 저장
  // - 사용 이유: 사용자 요청 시 데이터 백업
  const handleTempSave = () => {
    const formData = watch();
    localStorage.setItem(
      `tempsave_all_${Date.now()}`,
      JSON.stringify(formData)
    );
    toast.success('포스트가 임시 저장되었습니다.', { duration: 3000 });
  };

  // 제출 핸들러
  // - 의미: 폼 데이터 제출
  // - 사용 이유: 사용자 입력 저장 및 피드백
  const onSubmit = (data: BlogPostFormData) => {
    console.log('Form submitted:', data);
    toast.success('포스트가 성공적으로 제출되었습니다.', { duration: 3000 });
  };

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    <NotificationProvider>
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 md:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">새 블로그 포스트 작성</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 저장 설정 */}
            {/* - 의미: 자동저장 및 임시저장 UI */}
            {/* - 사용 이유: 모든 탭의 데이터를 통합 관리 */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col items-start justify-between p-4 border rounded-lg sm:flex-row sm:items-center">
                <div className="space-y-0.5 mb-2 sm:mb-0">
                  <h4 className="text-sm font-medium">
                    {isAutoSaveEnabled ? '자동 저장 설정' : '자동 저장 해제'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    자동 저장을 활성화하면 주기적으로 포스트가 저장됩니다.
                  </p>
                </div>
                <Switch
                  checked={isAutoSaveEnabled}
                  onCheckedChange={handleAutoSaveToggle}
                  aria-label="자동저장 설정"
                />
              </div>
              <div className="flex flex-col items-start justify-between p-4 border rounded-lg sm:flex-row sm:items-center">
                <div className="space-y-0.5 mb-2 sm:mb-0">
                  <h4 className="text-sm font-medium">임시 저장</h4>
                  <p className="text-sm text-gray-500">
                    임시 저장을 실행하면 현재 작성 중인 포스트를 저장합니다.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTempSave}
                  disabled={isAutoSaveEnabled}
                  aria-label="임시 저장"
                >
                  임시 저장
                </Button>
              </div>
            </div>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs
                  defaultValue="basic"
                  className="w-full"
                  onValueChange={setCurrentTab}
                >
                  <TabsList className="flex w-full h-auto gap-6 p-1 mb-6 bg-gray-100 rounded-lg">
                    {['basic', 'content', 'media', 'preview'].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="w-full text-sm font-medium rounded-md sm:text-base data-[state=active]:text-blue-600 data-[state=active]:font-semibold"
                      >
                        {tab === 'basic' && '기본 정보'}
                        {tab === 'content' && '본문 작성'}
                        {tab === 'media' && '미디어'}
                        {tab === 'preview' && '미리보기'}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent value="basic" className="mt-0">
                    <BasicInfoSection />
                  </TabsContent>
                  <TabsContent value="content" className="mt-0">
                    <ContentSection />
                  </TabsContent>
                  <TabsContent value="media" className="mt-0">
                    <MediaSection />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <PreviewSection />
                    {/* 게시 버튼 */}
                    {/* - 의미: 폼 제출 트리거 */}
                    {/* - 사용 이유: 최종 데이터 게시 */}
                    <div className="flex justify-end mt-6">
                      <Button
                        type="submit"
                        disabled={methods.formState.isSubmitting}
                        aria-label="게시"
                        className="w-full sm:w-auto"
                      >
                        <Icon icon="lucide:send" className="w-4 h-4 mr-2" />
                        게시
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </NotificationProvider>
  );
}

export default BlogPostForm;
