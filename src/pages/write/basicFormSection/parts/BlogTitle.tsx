import { useFormContext } from 'react-hook-form';
import type { BlogPostFormData } from '../../schema/blogPostSchema';
import { FormItem, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';

function BlogTitle() {
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      // 오류 메시지
      // - 의미: 폼 컨텍스트 오류 표시
      // - 사용 이유: 사용자에게 문제 알림
      <div className="text-red-500">
        BlogTitle에서 폼 컨텍스트를 찾을 수 없습니다.
      </div>
    );
  }

  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // setValue 호출
    // - 의미: 제목 필드 업데이트
    // - 사용 이유: 입력값 저장 및 유효성 검사
    setValue('title', e.target.value, { shouldValidate: true });
  };

  const titleValue = watch('title') || '';

  return (
    <div>
      {/* 제목 필드 */}
      {/* - 의미: 제목 입력 UI */}
      {/* - 사용 이유: 포스트 제목 입력 */}
      <FormItem>
        <label className="text-sm font-medium">제목</label>
        <Input
          placeholder="블로그 포스트 제목을 입력하세요"
          value={titleValue}
          onChange={handleTitleChange}
          aria-invalid={!!errors.title}
          aria-label="블로그 포스트 제목"
        />
        {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
      </FormItem>
    </div>
  );
}

export default BlogTitle;
