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
import {
  BLOG_CATEGORIES,
  type BlogCategory,
} from '../../schema/blogBasePathSchema';

function BlogCategorySection() {
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
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

  const categoryOptions = [
    { value: 'tech' as const, label: '기술' },
    { value: 'lifestyle' as const, label: '생활' },
    { value: 'travel' as const, label: '여행' },
    { value: 'food' as const, label: '음식' },
  ];

  const categoryValue = watch('category') || '';

  const handleCategoryChange = (value: string) => {
    if (BLOG_CATEGORIES.includes(value as BlogCategory)) {
      setValue('category', value as BlogCategory, { shouldValidate: true });
    }
  };

  return (
    <div>
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

export default BlogCategorySection;
