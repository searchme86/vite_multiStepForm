import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormItem, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { useStepFieldsStateStore } from '../../../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';
import type { BlogPostFormData } from '../../schema/blogPostSchema';

function BlogTitle() {
  const formContext = useFormContext<BlogPostFormData>();

  // 평면화된 구조에서 title과 setTitle을 직접 구조분해할당으로 가져오기
  // 기존 { state, setTitle } 접근 방식에서 { title, setTitle } 직접 접근 방식으로 변경
  const { title: storedTitle, setTitle } = useStepFieldsStateStore();

  if (!formContext) {
    return (
      <div className="text-red-500">
        BlogTitle에서 폼 컨텍스트를 찾을 수 없습니다.
      </div>
    );
  }

  const {
    setValue, // 폼 필드 값을 프로그래밍적으로 설정하는 함수
    watch, // 폼 필드 값의 변화를 실시간으로 감시하는 함수
    formState: { errors }, // 폼 유효성 검사 에러 정보
  } = formContext;

  // 컴포넌트 마운트시 zustand에 저장된 값을 리액트 훅 폼에 복원
  // 브라우저 리프레시 후에도 사용자가 입력한 내용을 유지하기 위함
  useEffect(() => {
    // storedTitle이 존재하고 의미있는 값(공백이 아닌)일 때만 복원
    // 빈 문자열이나 공백만 있는 경우 불필요한 setValue 호출 방지
    if (storedTitle && storedTitle.trim() !== '') {
      // 리액트 훅 폼에 zustand에서 가져온 값을 설정
      // shouldValidate: true로 설정하여 값 설정과 동시에 유효성 검사 실행
      setValue('title', storedTitle, { shouldValidate: true });
    }
  }, [setValue, storedTitle]); // 의존성 배열: setValue 함수나 storedTitle이 변경될 때만 실행

  // 사용자가 인풋에 타이핑할 때마다 실행되는 이벤트 핸들러
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value; // 사용자가 입력한 새로운 값

    // 1. 리액트 훅 폼의 title 필드 값을 즉시 업데이트
    // shouldValidate: true로 설정하여 입력과 동시에 유효성 검사 실행
    setValue('title', newValue, { shouldValidate: true });

    // 2. zustand store에도 동일한 값을 저장
    // persist 미들웨어를 통해 로컬스토리지에 자동으로 저장됨
    setTitle(newValue);
  };

  // 리액트 훅 폼의 title 필드를 실시간으로 감시
  // 폼 필드 값이 변경될 때마다 컴포넌트 리렌더링을 트리거하여 UI 업데이트
  // || ''는 값이 없을 때 빈 문자열로 대체하여 controlled input 유지
  const titleValue = watch('title') || '';

  return (
    <div className="flex flex-col space-y-2">
      <FormItem>
        <label className="text-sm font-medium" htmlFor="blog-title-input">
          제목
        </label>
        <Input
          id="blog-title-input"
          placeholder="블로그 포스트 제목을 입력하세요"
          value={titleValue}
          onChange={handleTitleChange}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className="w-full"
        />
        {errors.title && (
          <FormMessage id="title-error" className="text-red-500">
            {errors.title.message}
          </FormMessage>
        )}
      </FormItem>
    </div>
  );
}

export default BlogTitle;
