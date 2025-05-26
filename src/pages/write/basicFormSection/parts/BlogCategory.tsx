import { useFormContext } from 'react-hook-form';
import type { BlogPostFormData } from '../../schema/blogPostSchema';
import { FormItem, FormMessage } from '../../../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

function BlogCategory() {
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      // 오류 메시지
      // - 의미: 폼 컨텍스트 오류 표시
      // - 사용 이유: 사용자에게 문제 알림
      <div className="text-red-500">
        BlogCategory 오류: 폼 컨텍스트를 찾을 수 없습니다.
      </div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  // 상수: 카테고리 옵션
  // - 의미: 카테고리 선택지 정의
  // - 사용 이유: 드롭다운 메뉴에 표시
  // - Fallback: 빈 배열로 초기화
  const categoryOptions = [
    { value: 'tech', label: '기술' },
    { value: 'lifestyle', label: '생활' },
    { value: 'travel', label: '여행' },
    { value: 'food', label: '음식' },
  ];

  const categoryValue = watch('category') || '';

  // 핸들러: 카테고리 변경
  // - 의미: 카테고리 선택 처리
  // - 사용 이유: 사용자 선택을 폼 상태에 반영
  const handleCategoryChange = (value: string) => {
    // setValue 호출
    // - 의미: 카테고리 필드 업데이트
    // - 사용 이유: 선택값 저장 및 유효성 검사
    setValue('category', value, { shouldValidate: true });
  };

  return (
    <div>
      {/* 카테고리 필드 */}
      {/* - 의미: 카테고리 선택 UI */}
      {/* - 사용 이유: 포스트 분류 선택 */}
      <FormItem className="flex-1">
        <label className="text-sm font-medium">카테고리</label>
        <Select
          onValueChange={handleCategoryChange}
          value={categoryValue}
          aria-label="카테고리 선택"
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <FormMessage>{errors.category.message}</FormMessage>
        )}
      </FormItem>
    </div>
  );
}

export default BlogCategory;
