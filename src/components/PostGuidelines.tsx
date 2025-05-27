//====여기부터 수정됨====
// PostGuidelines.tsx: 포스트 작성 가이드와 자동저장 불러오기 UI
// - 의미: 탭별 작성 유의사항과 Zustand 상태 불러오기 관리
// - 사용 이유: 사용자 지침 제공 및 탭별 데이터 복원
// - 비유: 블로그 작성 규칙과 저장된 메모를 확인하는 메모지
// - 작동 메커니즘:
//   1. 탭별 가이드라인 표시
//   2. Button으로 Zustand 상태 불러오기 트리거
//   3. Zustand에서 탭별 데이터 복원
// - 관련 키워드: react-hook-form, zustand, shadcn/ui, tailwindcss

import { Button } from './ui/button';
import type { blogPostSchemaType } from '../pages/write/schema/blogPostSchema';
import toast from 'react-hot-toast';
import { useStepFieldsStateStore } from '../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';

// 인터페이스: 컴포넌트 props
// - 의미: 탭 식별자와 setValue 메서드 전달
// - 사용 이유: 탭별 가이드와 데이터 복원 처리
interface PostGuidelinesProps {
  tab: 'basic' | 'tags' | 'media' | 'preview';
  setValue: (name: keyof blogPostSchemaType, value: any, options?: any) => void;
}

// 상수: 탭별 작성 유의사항
// - 의미: 각 탭의 가이드라인 텍스트
// - 사용 이유: 사용자 지침 제공
const guidelinesByTab: Record<string, string[]> = {
  basic: [
    '제목은 5자 이상 100자 이하로 작성해주세요.',
    '요약은 10자 이상 작성해주세요.',
    '카테고리를 반드시 선택해주세요.',
  ],
  tags: [
    '최소 1개 이상의 태그를 추가해주세요.',
    '태그는 최대 5개까지 입력 가능합니다.',
    '마크다운으로 본문을 작성해주세요.',
  ],
  media: [
    '대표 이미지는 최소 1개 이상 업로드해주세요.',
    '이미지는 최대 10개까지 업로드 가능합니다.',
    '지원 형식: JPG, PNG, SVG (각 10MB 이하).',
  ],
  preview: [
    '모든 입력 데이터를 확인해주세요.',
    '게시 전 최종 검토를 진행하세요.',
  ],
};

// PostGuidelines: 가이드와 Zustand 상태 불러오기
// - 의미: 탭별 가이드라인 표시 및 자동저장 데이터 복원
// - 사용 이유: 사용자 지침 제공, Zustand 상태 활용
function PostGuidelines({ tab, setValue }: PostGuidelinesProps) {
  // Zustand 상태
  // - 의미: 저장된 폼 데이터 접근
  // - 사용 이유: 자동저장 데이터 복원
  const { state } = useStepFieldsStateStore();

  // 핸들러: 자동저장 불러오기
  // - 의미: 탭별 저장된 데이터 로드
  // - 사용 이유: 사용자 요청 시 데이터 복원
  // - 작동 매커니즘: Zustand state에서 탭별 필드 복원
  const handleLoadAutoSave = () => {
    const fieldsByTab: Record<string, (keyof blogPostSchemaType)[]> = {
      basic: ['title', 'summary', 'content', 'category'],
      tags: ['tags', 'markdown', 'searchTerm'],
      media: ['coverImage'],
      preview: [
        'title',
        'summary',
        'content',
        'markdown',
        'searchTerm',
        'category',
        'tags',
        'coverImage',
      ],
    };
    let hasData = false;
    fieldsByTab[tab].forEach((field) => {
      if (state[field] !== undefined) {
        setValue(field, state[field], { shouldValidate: true });
        hasData = true;
      }
    });
    if (hasData) {
      toast.success(`${tab} 탭의 자동저장 데이터가 불러와졌습니다.`, {
        duration: 3000,
      });
    } else {
      toast.error('저장된 데이터가 없습니다.', { duration: 3000 });
    }
  };

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    <div className="p-4 space-y-6 rounded-lg sm:p-6 bg-gray-50">
      {/* 가이드라인 */}
      {/* - 의미: 탭별 작성 유의사항 표시 */}
      <div>
        <h3 className="mb-4 text-lg font-medium">포스트 작성 유의사항</h3>
        <ul className="pl-5 space-y-2 text-gray-600 list-disc">
          {guidelinesByTab[tab].map((guideline, index) => (
            <li key={index}>{guideline}</li>
          ))}
        </ul>
      </div>
      {/* 자동저장 불러오기 */}
      {/* - 의미: 저장된 데이터 복원 UI */}
      <div className="flex flex-col items-start justify-between p-4 border rounded-lg sm:flex-row sm:items-center">
        <div className="space-y-0.5 mb-2 sm:mb-0">
          <h4 className="text-sm font-medium">자동저장 불러오기</h4>
          <p className="text-sm text-gray-500">
            저장된 데이터를 불러와 현재 탭에 적용합니다.
          </p>
        </div>
        <Button
          type="button" // 웹 접근성: 버튼 타입 명시
          variant="outline"
          onClick={handleLoadAutoSave}
          aria-label="자동저장 불러오기"
        >
          자동저장 불러오기
        </Button>
      </div>
    </div>
  );
}

export default PostGuidelines;
//====여기까지 수정됨====
