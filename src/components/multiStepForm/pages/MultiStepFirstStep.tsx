// MultiStepFirstStep.tsx: 블로그 포스트의 기본 정보 입력 섹션
// - 의미: 제목, 요약, 내용, 카테고리 입력 관리
// - 사용 이유: 핵심 정보 입력을 위한 UI 제공
// - 비유: 블로그 포스트의 표지(제목), 소개글(요약), 본문(내용), 라벨(카테고리)
// - 작동 메커니즘:
//   1. useFormContext로 폼 상태 관리
//   2. FormItem으로 입력 필드 구성
//   3. PostGuidelines로 가이드라인 표시
//   4. Textarea 크기 고정(resize: none, 고정 height)
//   5. 날짜 표시 추가 (우측 상단)
//   6. 요약 필드 추가, 내용 필드 optional 처리
// - 관련 키워드: react-hook-form, shadcn/ui, flexbox, Textarea, Zod

import { useFormContext } from 'react-hook-form';
import PostGuidelines from '../../../pages/write/common/PostGuidelines';
import BlogTitle from '../../../pages/write/basicFormSection/parts/BlogTitle';
import BlogSummary from '../../../pages/write/basicFormSection/parts/BlogSummary';
import BlogCategorySection from '../../../pages/write/basicFormSection/parts/BlogCategorySection';
import BlogContent from '../../../pages/write/basicFormSection/parts/BlogContent';
import TocEditorContainer from '../../../pages/write/basicFormSection/parts/tocEditor/TocEditorContainer';
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

function MultiStepFirstStep() {
  // React Hook Form의 FormProvider로부터 폼 메서드들을 가져옴
  // - 의미: 상위 컴포넌트에서 전달된 폼 컨텍스트 사용
  // - 사용 이유: props drilling 없이 폼 상태에 접근
  // - 작동 매커니즘: FormProvider > useFormContext로 상태 공유
  const { setValue } = useFormContext<blogPostSchemaType>();

  return (
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      {/* PostGuidelines에 필요한 setValue prop 전달 */}
      {/* - 의미: 가이드라인 컴포넌트에서 폼 값 설정이 필요할 때 사용 */}
      {/* - 사용 이유: PostGuidelines에서 setValue가 필수 prop으로 요구됨 */}
      <PostGuidelines tab="basic" setValue={setValue} />
      <div className="flex flex-col gap-6">
        <BlogTitle />
        <BlogSummary />
        <BlogContent />
        <BlogCategorySection />
        <TocEditorContainer />
        <div className="flex flex-col gap-6"></div>
      </div>
    </div>
  );
}

export default MultiStepFirstStep;
