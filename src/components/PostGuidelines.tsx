//====여기부터 수정됨====
// PostGuidelines.tsx: 포스트 작성 가이드와 설정 UI
// - 의미: 작성 유의사항, 자동저장, 임시저장, 자동저장 불러오기 관리
// - 사용 이유: 가이드 제공 및 저장 관련 기능 통합
// - 비유: 블로그 작성 규칙과 저장 버튼이 담긴 메모지
// - 작동 메커니즘:
//   1. ul/li로 작성 가이드 제공
//   2. Switch로 자동저장 토글, 동적 텍스트 변경
//   3. Button으로 임시저장 및 자동저장 불러오기 트리거
//   4. react-hot-toast로 사용자 피드백
// - 관련 키워드: react-hook-form, shadcn/ui, Switch, Button, react-hot-toast
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { FormLabel } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import toast from 'react-hot-toast';

// 인터페이스: 컴포넌트 props
// - 타입: { tab: string }
// - 의미: 현재 탭 식별자로, 자동저장 데이터 구분
interface PostGuidelinesProps {
  tab: string; // 예: 'basic', 'tags', 'media'
}

// 함수: 포스트 가이드 컴포넌트
function PostGuidelines({ tab }: PostGuidelinesProps) {
  // 상태: 자동저장 활성화 여부
  // - 의미: 자동저장 설정 관리
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(false);

  // 폼 컨텍스트
  // - 의미: 폼 상태 접근
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const { watch, setValue } = formContext;

  // 핸들러: 자동저장 토글
  // - 의미: 자동저장 상태 전환
  const handleAutoSaveToggle = () => {
    setIsAutoSaveEnabled((prev) => {
      const newState = !prev;
      toast.success(
        newState
          ? '자동 저장이 설정됐습니다.'
          : '자동저장 설정이 종료됐습니다.',
        { duration: 3000 }
      );
      return newState;
    });
  };

  // 핸들러: 임시저장
  // - 의미: 현재 폼 데이터 저장
  const handleTempSave = () => {
    const formData = watch();
    localStorage.setItem(
      `tempsave_${tab}_${Date.now()}`,
      JSON.stringify(formData)
    );
    toast.success('해당 포스트가 현재까지 임시저장이 되었습니다.', {
      duration: 3000,
    });
  };

  // 핸들러: 자동저장 불러오기
  // - 의미: 탭별 저장된 데이터 로드
  const handleLoadAutoSave = () => {
    const savedData = localStorage.getItem(`autosave_${tab}_${Date.now()}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const fieldsByTab: Record<string, (keyof BlogPostFormData)[]> = {
        basic: ['title', 'content', 'category', 'isDraft', 'isPublic'],
        tags: ['tags'],
        media: ['coverImage'],
      };
      fieldsByTab[tab].forEach((field) => {
        if (parsedData[field]) {
          setValue(field, parsedData[field], { shouldValidate: true });
        }
      });
      toast.success(`${tab} 탭의 자동저장 데이터가 불러와졌습니다.`, {
        duration: 3000,
      });
    } else {
      toast.error('저장된 데이터가 없습니다.', { duration: 3000 });
    }
  };

  return (
    // 컨테이너: 반응형 레이아웃
    <div className="p-4 space-y-6 rounded-lg sm:p-6 bg-gray-50">
      <div>
        <h3 className="mb-4 text-lg font-medium">포스트 작성 유의사항</h3>
        <ul className="pl-5 space-y-2 text-gray-600 list-disc">
          <li>* 제목은 5자 이상 100자 이하로 작성해주세요.</li>
          <li>* 내용은 100자 이상 작성해주세요.</li>
          <li>* 카테고리를 반드시 선택해주세요.</li>
          <li>* 최소 1개 이상의 태그를 추가해주세요. (최대 5개)</li>
          <li>* 대표 이미지는 최소 1개 이상 업로드해주세요. (최대 10개)</li>
          <li>임시저장은 자동저장이 해제된 경우만 실행됩니다.</li>
        </ul>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col items-start justify-between p-4 border rounded-lg sm:flex-row sm:items-center">
          <div className="space-y-0.5 mb-2 sm:mb-0">
            <FormLabel>
              {isAutoSaveEnabled ? '자동 저장 설정' : '자동 저장 해제'}
            </FormLabel>
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
            <FormLabel>임시 저장</FormLabel>
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
        <div className="flex flex-col items-start justify-between p-4 border rounded-lg sm:flex-row sm:items-center">
          <div className="space-y-0.5 mb-2 sm:mb-0">
            <FormLabel>자동저장 불러오기</FormLabel>
            <p className="text-sm text-gray-500">
              저장된 데이터를 불러와 현재 탭에 적용합니다.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleLoadAutoSave}
            aria-label="자동저장 불러오기"
          >
            자동저장 불러오기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PostGuidelines;
//====여기까지 수정됨====
