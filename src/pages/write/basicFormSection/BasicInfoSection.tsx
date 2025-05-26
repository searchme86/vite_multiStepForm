// BasicInfoSection.tsx: 블로그 포스트의 기본 정보 입력 섹션
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

import PostGuidelines from '../../../components/PostGuidelines';
import BlogTitle from './parts/BlogTitle';
import BlogSummary from './parts/BlogSummary';
import BlogCategory from './parts/BlogCategory';
import BlogContent from './parts/BlogContent';

function BasicInfoSection() {
  return (
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      <PostGuidelines tab="basic" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <BlogTitle />
          <BlogSummary />
          <BlogContent />
          <BlogCategory />
        </div>
      </div>
    </div>
  );
}

export default BasicInfoSection;
