import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { X } from 'lucide-react'; // 아이콘 라이브러리
import type { BlogPostFormData } from '../../schema/blogPostSchema';
import { FormItem, FormMessage } from '../../../../components/ui/form';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import { useStepFieldsStateStore } from '../../../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';

function BlogContent() {
  const formContext = useFormContext<BlogPostFormData>();
  const { content: storedCotent, setContent } = useStepFieldsStateStore();
  if (!formContext) {
    return (
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  useEffect(() => {
    if (storedCotent && storedCotent.trim() !== '') {
      setValue('content', storedCotent, { shouldValidate: true });
    }
  }, [setValue, storedCotent]);

  const contentValue = watch('content') || '';

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const userValue = e.target.value;
    setValue('content', e.target.value, { shouldValidate: true });
    if (setContent) {
      setContent(userValue);
    }
  };

  const handleClearContent = () => {
    setValue('content', '', { shouldValidate: true });
  };

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
        </div>

        {/* 문자 수 표시 */}
        {/* - 의미: 입력된 텍스트 길이 정보 제공 */}
        {/* - 사용 이유: 사용자 피드백 개선 */}
        {hasContent && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {contentValue.length}자 입력됨
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
