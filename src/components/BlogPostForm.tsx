//====여기부터 수정됨====
// BlogPostForm.tsx: 블로그 포스트 작성 폼
// - 의미: 기본 정보, 태그, 미디어 입력 관리
// - 사용 이유: 통합 폼으로 사용자 입력 처리
// - 비유: 블로그 작성 노트북, 각 탭은 페이지
// - 작동 메커니즘:
//   1. useForm으로 폼 초기화
//   2. Tabs로 섹션 전환
//   3. Framer Motion으로 탭 메뉴에 플로팅 및 슬라이드 애니메이션
// - 관련 키워드: react-hook-form, shadcn/ui, Framer Motion
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import BasicInfoSection from './BasicInfoSection';
import ContentSection from './ContentSection';
import MediaSection from './MediaSection';
import NotificationProvider from './Notification';
import { BlogPostFormData, blogPostSchema } from '../types/blog-post';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// 함수: 블로그 포스트 폼
function BlogPostForm() {
  // 폼 상태
  // - 의미: 폼 데이터 및 유효성 검사 관리
  // - 사용 이유: react-hook-form으로 선언적 폼 관리
  const methods = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
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
  // - 사용 이유: methods.watch('tab') 대신 UI 상태 관리
  // - Fallback: 기본값 'basic'
  const [currentTab, setCurrentTab] = React.useState('basic');

  // 제출 핸들러
  // - 의미: 폼 데이터 제출
  // - 사용 이유: 사용자 입력 저장 및 피드백
  const onSubmit = (data: BlogPostFormData) => {
    console.log('Form submitted:', data);
    toast.success('포스트가 성공적으로 제출되었습니다.', { duration: 3000 });
  };

  // 탭 애니메이션
  // - 의미: 탭 메뉴에 플로팅 및 호버 효과
  const tabVariants = {
    inactive: { y: 0, opacity: 0.7, scale: 1 },
    active: { y: -2, opacity: 1, scale: 1.05 },
  };

  // 슬라이더 애니메이션
  // - 의미: 활성 탭 아래 슬라이딩 배경
  const sliderVariants = {
    slide: (index: number) => ({
      x: `${index * 100}%`,
      transition: { duration: 0.3, ease: 'easeOut' },
    }),
  };

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    <NotificationProvider>
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 md:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">새 블로그 포스트 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Tabs
                  defaultValue="basic"
                  className="w-full"
                  onValueChange={setCurrentTab}
                >
                  <TabsList className="relative grid w-full grid-cols-3 p-1 mb-6 bg-gray-100 rounded-lg">
                    {/* 슬라이더: 활성 탭 표시 */}
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-white rounded-md shadow-sm"
                      style={{ width: '33.33%' }}
                      variants={sliderVariants}
                      custom={['basic', 'tags', 'media'].indexOf(currentTab)}
                      animate="slide"
                    />
                    {['basic', 'tags', 'media'].map((tab) => (
                      <motion.div
                        key={tab}
                        variants={tabVariants}
                        initial="inactive"
                        animate={currentTab === tab ? 'active' : 'inactive'}
                        whileHover={{ scale: 1.1, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10"
                      >
                        <TabsTrigger
                          value={tab}
                          className="w-full py-2 text-sm font-medium rounded-md sm:text-base data-[state=active]:text-blue-600 data-[state=active]:font-semibold"
                        >
                          {tab === 'basic' && '기본 정보'}
                          {tab === 'tags' && '태그'}
                          {tab === 'media' && '미디어'}
                        </TabsTrigger>
                      </motion.div>
                    ))}
                  </TabsList>
                  <TabsContent value="basic" className="mt-0">
                    <BasicInfoSection />
                  </TabsContent>
                  <TabsContent value="tags" className="mt-0">
                    <ContentSection />
                  </TabsContent>
                  <TabsContent value="media" className="mt-0">
                    <MediaSection />
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
//====여기까지 수정됨====
