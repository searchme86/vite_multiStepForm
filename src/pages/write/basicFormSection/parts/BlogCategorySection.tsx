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
import { useStepFieldsStateStore } from '../../../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';
import { useEffect } from 'react';

function BlogCategorySection() {
  const formContext = useFormContext<BlogPostFormData>();
  const { category: storedCategory, setCategory } = useStepFieldsStateStore();

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

  // ====여기부터 수정됨====
  // 더 풍성하고 안전한 useEffect 조건문
  useEffect(() => {
    if (!storedCategory || storedCategory.trim() === '') {
      return; // 조기 리턴으로 가독성 향상
    }
    const isValidAndAvailableCategory =
      storedCategory &&
      storedCategory.trim() !== '' &&
      categoryOptions.some((option) => option.value === storedCategory) &&
      BLOG_CATEGORIES.includes(storedCategory as BlogCategory);

    if (isValidAndAvailableCategory) {
      setValue('category', storedCategory, { shouldValidate: true });
    }
  }, [setValue, storedCategory, setCategory]);

  const categoryValue = watch('category') || '';

  const handleCategoryChange = (value: string) => {
    // 선택된 값이 유효한 카테고리인지 검증
    if (BLOG_CATEGORIES.includes(value as BlogCategory)) {
      setValue('category', value as BlogCategory, { shouldValidate: true });
      setCategory(value as BlogCategory);

      if (process.env.NODE_ENV === 'development') {
        console.log(`BlogCategory: 카테고리 변경됨 - ${value}`);
      }
    } else {
      console.error(
        `BlogCategory: 유효하지 않은 카테고리 선택 시도 - ${value}`
      );
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <FormItem className="flex-1">
        <label className="text-sm font-medium" htmlFor="blog-category-select">
          카테고리
        </label>
        <Select
          onValueChange={handleCategoryChange}
          value={categoryValue}
          aria-label="카테고리 선택"
        >
          <SelectTrigger id="blog-category-select">
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
          <FormMessage className="text-red-500">
            {errors.category.message}
          </FormMessage>
        )}
      </FormItem>
    </div>
  );
}

export default BlogCategorySection;
