import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { Textarea } from '../../../../components/ui/textarea';
import { FormItem, FormMessage } from '../../../../components/ui/form';
import { X } from 'lucide-react';
import { useStepFieldsStateStore } from '../../../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';
import type { BlogPostFormData } from '../../schema/blogPostSchema';
import { Button } from '../../../../components/ui/button';

function BlogSummary() {
  const formContext = useFormContext<BlogPostFormData>();
  const { summary: storedSummary, setSummary } = useStepFieldsStateStore();
  if (!formContext) {
    return (
      <div className="text-red-500">
        BlogSummary에서 오류: 폼 컨텍스트를 찾을 수 없습니다.
      </div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  const summaryValue = watch('summary') || '';

  useEffect(() => {
    if (storedSummary && storedSummary.trim() !== '') {
      setValue('summary', storedSummary, { shouldValidate: true });
    }
  }, [storedSummary, setValue]);

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const userValue = e.target.value;
    setValue('summary', userValue, { shouldValidate: true });
    setSummary(userValue);
  };

  const hasSummary = summaryValue.trim().length > 0;

  const handleClearSummary = () => {
    setValue('summary', '', { shouldValidate: true });
  };

  return (
    <div>
      <FormItem>
        <label className="text-sm font-medium">요약</label>
        {hasSummary && (
          <Button
            type="button" // 폼 제출 방지
            variant="ghost"
            size="sm"
            onClick={handleClearSummary}
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
        <Textarea
          placeholder="블로그 포스트 요약을 입력하세요 (최소 10자)"
          className="min-h-[100px] h-[100px] resize-none"
          value={summaryValue}
          onChange={handleSummaryChange}
          aria-invalid={!!errors.summary}
          aria-label="블로그 포스트 요약"
        />
        {hasSummary && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {summaryValue.length}자 입력됨
            </span>
          </div>
        )}

        {errors.summary && <FormMessage>{errors.summary.message}</FormMessage>}
      </FormItem>
    </div>
  );
}

export default BlogSummary;
