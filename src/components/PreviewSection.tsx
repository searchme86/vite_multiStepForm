//====여기부터 수정됨====
// PreviewSection.tsx: 블로그 포스트 작성 데이터 미리보기 섹션
// - 의미: 모든 탭의 입력 데이터를 렌더링
// - 사용 이유: 작성 내용 최종 확인, 게시 전 검토
// - 비유: 책을 출판 전에 전체 내용을 훑어보는 것
// - 작동 메커니즘:
//   1. useFormContext로 폼 데이터 접근
//   2. 제목, 요약, 내용, 마크다운, 태그, 이미지 등 렌더링
//   3. ReactMarkdown으로 마크다운 콘텐츠 표시
//   4. flex 레이아웃으로 반응형 UI 구성
// - 관련 키워드: react-hook-form, react-markdown, tailwindcss, flexbox, shadcn/ui

import { useFormContext } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import PostGuidelines from './PostGuidelines';

// 타입: 이미지 아이템
// - 의미: 업로드된 이미지 정보 구조
// - 사용 이유: 타입 안전성 보장
type ImageItem = {
  preview?: string;
  name?: string;
  size?: number;
};

// PreviewSection: 미리보기 섹션
// - 의미: 작성된 데이터 렌더링
// - 사용 이유: 최종 포스트 확인
function PreviewSection() {
  // FormProvider로부터 폼 메서드들을 가져옴
  // - 의미: 상위 컴포넌트에서 전달된 폼 컨텍스트 사용
  // - 사용 이유: props drilling 없이 폼 상태에 접근
  const { watch, setValue } = useFormContext();

  // 값: 폼 데이터 - 타입 안전한 처리
  // - 의미: 각 필드 값 추적
  // - 사용 이유: 미리보기 렌더링
  // - Fallback: 빈 문자열 또는 배열
  const title = watch('title') || '제목 없음';
  const summary = watch('summary') || '요약 없음';
  const content = watch('content') || '내용 없음';
  const markdown = watch('markdown') || '';
  const category = watch('category') || '카테고리 없음';
  const tags: string[] = watch('tags') || [];
  const coverImage: ImageItem[] = watch('coverImage') || [];

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 작성 가이드 표시 */}
      <PostGuidelines tab="preview" setValue={setValue} />
      {/* 날짜 및 내용 컨테이너 */}
      {/* - 의미: 날짜와 미리보기 데이터 배치 */}
      <div className="flex flex-col gap-6">
        {/* 날짜 표시 */}
        {/* - 의미: 현재 작성 날짜 표시 */}
        {/* - 사용 이유: 작성 시점 제공 */}
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {new Date().toLocaleDateString('ko-KR')}
        </span>
        {/* 미리보기 컨테이너 */}
        {/* - 의미: 데이터 렌더링 */}
        <div className="flex flex-col gap-6">
          {/* 제목 */}
          <div>
            <h3 className="text-lg font-medium">제목</h3>
            <p className="text-gray-800">{title}</p>
          </div>
          {/* 요약 */}
          <div>
            <h3 className="text-lg font-medium">요약</h3>
            <p className="text-gray-800">{summary}</p>
          </div>
          {/* 내용 */}
          <div>
            <h3 className="text-lg font-medium">내용</h3>
            <p className="text-gray-800">{content}</p>
          </div>
          {/* 마크다운 */}
          <div>
            <h3 className="text-lg font-medium">마크다운</h3>
            <div className="prose-sm prose max-w-none">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
          {/* 카테고리 */}
          <div>
            <h3 className="text-lg font-medium">카테고리</h3>
            <p className="text-gray-800">{category}</p>
          </div>
          {/* 태그 - 타입 안전한 처리 */}
          <div>
            <h3 className="text-lg font-medium">태그</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag: string, index: number) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-3 py-1 text-sm bg-gray-200 rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">태그 없음</p>
              )}
            </div>
          </div>
          {/* 이미지 - 타입 안전한 처리 */}
          <div>
            <h3 className="text-lg font-medium">이미지</h3>
            <div className="flex flex-wrap gap-4">
              {coverImage.length > 0 ? (
                coverImage.map((img: ImageItem, index: number) => (
                  <img
                    key={`image-${index}`}
                    src={img.preview || ''}
                    alt={`이미지 ${index + 1}`}
                    className="object-cover w-32 h-32 rounded"
                    onError={(e) => {
                      // 이미지 로드 실패 시 대체 처리
                      // - 의미: 깨진 이미지 방지
                      // - 사용 이유: 사용자 경험 개선
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ))
              ) : (
                <p className="text-gray-500">이미지 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewSection;
//====여기까지 수정됨====
