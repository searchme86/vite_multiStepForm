//====여기부터 수정됨====
// BlogPostForm.tsx: 블로그 포스트 작성 폼
// - 의미: 블로그 포스트의 기본 정보, 미디어, 게시 옵션을 관리하는 메인 폼
// - 사용 이유: 단일 폼으로 모든 입력 관리, 사용자 친화적 인터페이스 제공
// - 비유: 블로그 포스트를 작성하는 노트북, 각 탭은 페이지(기본 정보, 미디어, 게시 옵션)
// - 작동 메커니즘:
//   1. useForm으로 폼 상태 초기화
//   2. FormProvider로 하위 컴포넌트에 폼 컨텍스트 제공
//   3. Tabs로 BasicInfoSection, MediaSection, PublishingOptions 전환
// - 관련 키워드: react-hook-form, shadcn/ui, Tabs, FormProvider, zod
import React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from './ui/form';
import { Switch } from './ui/switch';
import { Icon } from '@iconify/react';
import BasicInfoSection from './BasicInfoSection';
import MediaSection from './MediaSection';
import { BlogPostFormData, blogPostSchema } from '../types/blog-post';
import { zodResolver } from '@hookform/resolvers/zod';

// 함수: 게시 옵션 섹션
// - 의미: 초안 저장과 공개 여부 설정 UI
// - 사용 이유: 게시 옵션 관리 분리
function PublishingOptions() {
  // 폼 컨텍스트: react-hook-form 훅
  // - 타입: UseFormReturn<BlogPostFormData>
  // - 의미: 폼 상태 및 메서드 접근
  // - 사용 이유: 중앙화된 폼 관리
  // - Fallback: 컨텍스트 없음 처리 (BasicInfoSection에서 구현)
  const { control } = useFormContext<BlogPostFormData>();

  return (
    // 컨테이너: 게시 옵션 UI
    // - 의미: 토글 스위치 포함
    <div className="space-y-6">
      {/* 초안 저장 토글 */}
      <FormField
        control={control}
        name="isDraft"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel>Save as Draft</FormLabel>
              <p className="text-sm text-gray-500">
                초안으로 저장하면 나중에 수정할 수 있습니다.
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="초안으로 저장"
              />
            </FormControl>
            {field.value && (
              <FormMessage>
                초안으로 저장됩니다. 공개하려면 토글을 끄세요.
              </FormMessage>
            )}
          </FormItem>
        )}
      />
      {/* 공개 여부 토글 */}
      <FormField
        control={control}
        name="isPublic"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel>Public Visibility</FormLabel>
              <p className="text-sm text-gray-500">
                공개로 설정하면 모든 사용자가 볼 수 있습니다.
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="공개 여부"
              />
            </FormControl>
            {!field.value && (
              <FormMessage>
                비공개로 설정됩니다. 초안과 함께 사용할 수 있습니다.
              </FormMessage>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}

// 함수: 블로그 포스트 폼 컴포넌트
// - 의미: 폼 UI와 로직 통합
function BlogPostForm() {
  // 폼 상태: react-hook-form 훅
  // - 타입: UseFormReturn<BlogPostFormData>
  // - 의미: 폼 데이터, 유효성 검사, 제출 로직 관리
  // - 사용 이유: 선언적 폼 관리
  // - Fallback: 기본값으로 빈 폼 데이터 제공
  const methods = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema), // zod 스키마로 유효성 검사
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

  // 함수: 폼 제출 핸들러
  // - 의미: 폼 데이터를 서버로 전송(시뮬레이션)
  // - 사용 이유: 사용자 입력 저장
  const onSubmit = (data: BlogPostFormData) => {
    console.log('Form submitted:', data);
    // 실제 구현에서는 API 호출
  };

  return (
    // 컨테이너: 폼 전체 UI
    // - 의미: 탭과 제출 버튼 포함
    <div className="max-w-4xl py-8 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>새 블로그 포스트 작성</CardTitle>
        </CardHeader>
        <CardContent>
          {/* FormProvider: 폼 컨텍스트 제공 */}
          {/* - 의미: 하위 컴포넌트에 폼 상태 전달 */}
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              {/* 탭: 섹션 전환 */}
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">기본 정보</TabsTrigger>
                  <TabsTrigger value="media">미디어</TabsTrigger>
                  <TabsTrigger value="publishing">게시 옵션</TabsTrigger>
                </TabsList>
                <TabsContent value="basic">
                  <BasicInfoSection />
                </TabsContent>
                <TabsContent value="media">
                  <MediaSection />
                </TabsContent>
                <TabsContent value="publishing">
                  <PublishingOptions />
                </TabsContent>
              </Tabs>
              {/* 제출 버튼 */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => methods.setValue('isDraft', true)}
                  disabled={methods.formState.isSubmitting}
                >
                  <Icon icon="lucide:save" className="w-4 h-4 mr-2" />
                  초안으로 저장
                </Button>
                <Button type="submit" disabled={methods.formState.isSubmitting}>
                  <Icon icon="lucide:send" className="w-4 h-4 mr-2" />
                  게시
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}

export default BlogPostForm;
//====여기까지 수정됨====
