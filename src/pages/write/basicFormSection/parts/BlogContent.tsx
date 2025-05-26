import { useFormContext } from 'react-hook-form';
import type { BlogPostFormData } from '../../schema/blogPostSchema';
import { FormItem, FormMessage } from '../../../../components/ui/form';
import { Textarea } from '../../../../components/ui/textarea';

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

  return (
    <div>
      <FormItem>
        <label className="text-sm font-medium">내용</label>
        <Textarea
          placeholder="블로그 포스트 내용을 입력하세요 (선택 사항)"
          className="min-h-[200px] h-[200px] resize-none"
          value={contentValue}
          onChange={handleContentChange}
          aria-invalid={!!errors.content}
          aria-label="블로그 포스트 내용"
        />
        {errors.content && <FormMessage>{errors.content.message}</FormMessage>}
      </FormItem>
    </div>
  );
}

export default BlogContent;
