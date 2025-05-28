//====여기부터 수정됨====
// BlogContent.tsx: 블로그 포스트 내용 입력 컴포넌트
// - 의미: 기본 텍스트 콘텐츠 입력 (마크다운 편집기와 별개)
// - 사용 이유: 단순 텍스트 입력, 선택적 사용
// - 비유: 간단한 메모장 (리치텍스트 편집기와 구분)
// - 작동 메커니즘:
//   1. react-hook-form으로 폼 상태 관리
//   2. Textarea로 기본 텍스트 입력
//   3. 전체 삭제 버튼으로 사용자 편의성 제공
//   4. 마크다운 편집기와 독립적으로 작동
// - 관련 키워드: react-hook-form, textarea, clear button, user experience

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { X } from 'lucide-react'; // 아이콘 라이브러리
import type { BlogPostFormData } from '../../schema/blogPostSchema';
import { FormItem, FormMessage } from '../../../../components/ui/form';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';

// BlogContent: 기본 텍스트 콘텐츠 입력
// - 의미: 마크다운 편집기와 별개의 단순 텍스트 입력
// - 사용 이유: 선택적 텍스트 입력, 사용자 편의성
function BlogContent() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 및 유효성 검사 관리
  // - 사용 이유: react-hook-form으로 선언적 폼 관리
  // - Fallback: 컨텍스트 없으면 오류 메시지 표시
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      // 오류 메시지
      // - 의미: 폼 컨텍스트 오류 표시
      // - 사용 이유: 사용자에게 문제 알림
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  // 현재 콘텐츠 값 추적
  // - 의미: 기존 content 필드 사용 (마크다운과 구분)
  // - 사용 이유: 기존 스키마 호환성 유지
  const contentValue = watch('content') || '';

  // 핸들러: 내용 변경
  // - 의미: 내용 입력 처리
  // - 사용 이유: 사용자 입력을 폼 상태에 반영
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // setValue 호출
    // - 의미: 내용 필드 업데이트
    // - 사용 이유: 입력값 저장 및 유효성 검사
    setValue('content', e.target.value, { shouldValidate: true });
  };

  // 핸들러: 전체 내용 삭제
  // - 의미: 텍스트 영역의 모든 내용 제거
  // - 사용 이유: 사용자 편의성, 빠른 내용 초기화
  const handleClearContent = () => {
    // 확인 다이얼로그
    // - 의미: 실수로 삭제하는 것을 방지
    // - 사용 이유: 사용자 경험 개선
    const shouldClear = window.confirm('모든 내용을 삭제하시겠습니까?');

    if (shouldClear) {
      // 폼 필드 초기화
      // - 의미: content 필드를 빈 문자열로 설정
      // - 사용 이유: 완전한 내용 제거
      setValue('content', '', { shouldValidate: true });

      if (process.env.NODE_ENV === 'development') {
        console.log('BlogContent: Content cleared by user');
      }
    }
  };

  // 텍스트 존재 여부 확인
  // - 의미: 삭제 버튼 표시 조건
  // - 사용 이유: 빈 내용일 때 버튼 숨김
  const hasContent = contentValue.trim().length > 0;

  return (
    <div>
      <FormItem>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">내용</label>
          {/* 전체 삭제 버튼 - 내용이 있을 때만 표시 */}
          {/* - 의미: 조건부 렌더링으로 UX 개선 */}
          {/* - 사용 이유: 불필요한 UI 요소 제거 */}
          {hasContent && (
            <Button
              type="button" // 폼 제출 방지
              variant="ghost"
              size="sm"
              onClick={handleClearContent}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label="모든 내용 삭제"
            >
              {/* X 아이콘이 포함된 원형 버튼 스타일 */}
              {/* - 의미: 직관적인 삭제 아이콘 */}
              {/* - 사용 이유: 사용자 인식 개선 */}
              <div className="flex items-center justify-center w-4 h-4 bg-red-100 rounded-full">
                <X size={10} />
              </div>
              <span className="text-xs">전체 삭제</span>
            </Button>
          )}
        </div>

        {/* 텍스트 영역 컨테이너 */}
        {/* - 의미: 상대적 위치 설정으로 버튼 배치 */}
        <div className="relative">
          <Textarea
            placeholder="블로그 포스트 내용을 입력하세요 (선택 사항)"
            className="min-h-[200px] h-[200px] resize-none pr-12" // 오른쪽 패딩으로 버튼 공간 확보
            value={contentValue}
            onChange={handleContentChange}
            aria-invalid={!!errors.content}
            aria-label="블로그 포스트 내용"
          />

          {/* 텍스트 영역 내부 삭제 버튼 (추가 옵션) */}
          {/* - 의미: 텍스트 영역 내부에 위치한 삭제 버튼 */}
          {/* - 사용 이유: 더 직관적인 위치 */}
          {hasContent && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearContent}
              className="absolute w-8 h-8 p-0 border border-gray-200 rounded-full shadow-sm top-2 right-2 bg-white/80 hover:bg-red-50"
              aria-label="텍스트 전체 삭제"
            >
              <X size={14} className="text-red-500 hover:text-red-700" />
            </Button>
          )}
        </div>

        {/* 문자 수 표시 */}
        {/* - 의미: 입력된 텍스트 길이 정보 제공 */}
        {/* - 사용 이유: 사용자 피드백 개선 */}
        {hasContent && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {contentValue.length}자 입력됨
            </span>
            <span className="text-xs text-gray-400">
              ※ 마크다운 편집기와는 별개의 텍스트입니다
            </span>
          </div>
        )}

        {/* 에러 메시지 */}
        {errors.content && <FormMessage>{errors.content.message}</FormMessage>}
      </FormItem>
    </div>
  );
}

export default BlogContent;
//====여기까지 수정됨====
