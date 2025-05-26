import { useFormContext } from 'react-hook-form';
import { Textarea } from '../../../../components/ui/textarea';
import { FormItem, FormMessage } from '../../../../components/ui/form';
import type { BlogPostFormData } from '../../schema/blogPostSchema';

function BlogSummary() {
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      // 오류 메시지
      // - 의미: 폼 컨텍스트 오류 표시
      // - 사용 이유: 사용자에게 문제 알림
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

  // 핸들러: 요약 변경
  // - 의미: 요약 입력 처리
  // - 사용 이유: 사용자 입력을 폼 상태에 반영
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // setValue 호출
    // - 의미: 요약 필드 업데이트
    // - 사용 이유: 입력값 저장 및 유효성 검사
    setValue('summary', e.target.value, { shouldValidate: true });
  };

  return (
    <div>
      {/* 요약 필드 */}
      {/* - 의미: 요약 입력 UI */}
      {/* - 사용 이유: 포스트 요약 입력, 최소 10자 */}
      <FormItem>
        <label className="text-sm font-medium">요약</label>
        <Textarea
          placeholder="블로그 포스트 요약을 입력하세요 (최소 10자)"
          className="min-h-[100px] h-[100px] resize-none"
          value={summaryValue}
          onChange={handleSummaryChange}
          aria-invalid={!!errors.summary}
          aria-label="블로그 포스트 요약"
        />
        {errors.summary && <FormMessage>{errors.summary.message}</FormMessage>}
      </FormItem>
    </div>
  );
}

export default BlogSummary;
