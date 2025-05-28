//====여기부터 수정됨====
// PreviewSection.tsx: 블로그 포스트 작성 데이터 미리보기 섹션
// - 의미: 모든 탭의 입력 데이터를 렌더링 (Zustand 리치텍스트 포함)
// - 사용 이유: 작성 내용 최종 확인, 게시 전 검토, 영구 저장된 콘텐츠 표시
// - 비유: 책을 출판 전에 전체 내용을 훑어보는 것 (임시 초안이 아닌 완성본)
// - 작동 메커니즘:
//   1. useFormContext로 폼 데이터 접근
//   2. useStepFieldsStateStore로 Zustand 영구 저장 콘텐츠 접근
//   3. HTML 태그 제거 함수로 일반 텍스트 변환
//   4. ReactQuill readOnly 모드로 스타일링된 리치텍스트 표시
//   5. flex 레이아웃으로 반응형 UI 구성
// - 관련 키워드: react-hook-form, zustand, react-quill, html-to-text, tailwindcss, flexbox

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import ReactQuill from 'react-quill';
import { useStepFieldsStateStore } from '../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';

// CSS 스타일시트를 조건부로 import
// - 의미: ReactQuill 읽기 전용 테마 스타일 적용
// - 사용 이유: 미리보기에서 스타일링된 리치텍스트 표시
try {
  // @ts-ignore - CSS 모듈 타입 에러 무시
  await import('react-quill/dist/quill.snow.css');
} catch (error) {
  // CSS 파일이 없어도 컴포넌트는 정상 작동
  // - 의미: 스타일 없이도 기능적으로 동작
  // - 사용 이유: 의존성 누락 시에도 앱이 깨지지 않도록 방어
  console.warn('ReactQuill CSS not found, using default styles for preview');
}

// 타입: 이미지 아이템
// - 의미: 업로드된 이미지 정보 구조
// - 사용 이유: 타입 안전성 보장
type ImageItem = {
  preview?: string;
  name?: string;
  size?: number;
};

// 함수: HTML 태그 제거
// - 의미: HTML 마크업을 일반 텍스트로 변환
// - 사용 이유: 리치텍스트를 읽기 쉬운 형태로 표시
// - 작동 매커니즘: DOM 파싱 후 textContent 추출
const stripHtmlTags = (html: string): string => {
  if (!html) return '';

  try {
    // DOM 파서를 사용하여 HTML을 파싱
    // - 의미: 브라우저 내장 파서로 안전한 HTML 처리
    // - 사용 이유: 정확한 텍스트 추출
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // textContent로 순수 텍스트만 추출
    // - 의미: HTML 태그 제거 후 텍스트만 반환
    // - 사용 이유: 사용자가 작성한 내용만 표시
    const textContent = doc.body.textContent || doc.body.innerText || '';

    // 연속된 공백과 줄바꿈 정리
    // - 의미: 가독성 향상을 위한 텍스트 정규화
    // - 사용 이유: 깔끔한 텍스트 표시
    return textContent
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .replace(/\n\s*\n/g, '\n\n') // 연속된 줄바꿈을 두 개로 제한
      .trim(); // 앞뒤 공백 제거
  } catch (error) {
    // HTML 파싱 실패 시 원본 반환
    // - 의미: 에러 발생 시 fallback 처리
    // - 사용 이유: 앱 크래시 방지
    console.warn('Failed to strip HTML tags:', error);
    return html;
  }
};

// 함수: 텍스트 미리보기 생성
// - 의미: 긴 텍스트를 요약 형태로 표시
// - 사용 이유: 미리보기에서 적절한 길이로 제한
const createTextPreview = (text: string, maxLength: number = 200): string => {
  if (!text) return '내용 없음';

  const cleanText = stripHtmlTags(text);

  if (cleanText.length <= maxLength) return cleanText;

  // 단어 경계에서 자르기
  // - 의미: 단어 중간에서 잘리지 않도록 처리
  // - 사용 이유: 자연스러운 텍스트 표시
  const truncated = cleanText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  return lastSpaceIndex > maxLength * 0.8
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
};

// PreviewSection: 미리보기 섹션
// - 의미: 작성된 데이터 렌더링 (Zustand + 폼 데이터)
// - 사용 이유: 최종 포스트 확인, 영구 저장된 리치텍스트 표시
function PreviewSection() {
  // 개발 환경 로그
  // - 의미: 렌더링 확인
  // - 사용 이유: 디버깅
  if (process.env.NODE_ENV === 'development') {
    console.log('PreviewSection: Rendering with Zustand integration');
  }

  // FormProvider로부터 폼 메서드들을 가져옴
  // - 의미: 상위 컴포넌트에서 전달된 폼 컨텍스트 사용
  // - 사용 이유: props drilling 없이 폼 상태에 접근
  const { watch } = useFormContext();

  // Zustand 스토어에서 영구 저장된 리치텍스트 가져오기 (안전한 접근)
  // - 의미: 마크다운 편집기에서 작성된 content 필드 접근
  // - 사용 이유: 멀티스텝폼에서 이전 단계 데이터 표시
  // - 수정: TypeScript 에러 방지를 위한 안전한 접근
  const zustandStore = useStepFieldsStateStore();
  const savedRichText = useMemo(() => {
    try {
      // getContent 메서드가 존재하는지 확인 후 호출
      // - 의미: undefined 체크로 안전한 메서드 호출
      // - 사용 이유: TypeScript 에러 방지 및 런타임 안정성
      if (zustandStore && typeof zustandStore.getContent === 'function') {
        const content = zustandStore.getContent();
        if (process.env.NODE_ENV === 'development') {
          console.log('PreviewSection: Zustand content retrieved safely', {
            contentLength: content?.length || 0,
            contentType: typeof content,
            hasContent: !!content,
          });
        }
        return content;
      }

      // 메서드가 없는 경우 state에서 직접 접근 시도
      // - 의미: fallback으로 직접 상태 접근
      // - 사용 이유: 메서드 생성 전에도 데이터 접근 가능
      if (zustandStore && zustandStore.state && zustandStore.state.content) {
        if (process.env.NODE_ENV === 'development') {
          console.log('PreviewSection: Fallback to direct state access');
        }
        return zustandStore.state.content;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('PreviewSection: No Zustand content available', {
          storeExists: !!zustandStore,
          hasGetContent: !!(zustandStore && zustandStore.getContent),
          stateExists: !!(zustandStore && zustandStore.state),
        });
      }

      return null;
    } catch (error) {
      // Zustand 접근 에러 시 로그 출력
      // - 의미: 에러 발생 시 디버깅 정보 제공
      // - 사용 이유: 개발 중 문제 파악
      console.error('PreviewSection: Error accessing Zustand store:', error);
      return null;
    }
  }, [zustandStore]);

  // 값: 폼 데이터 - 타입 안전한 처리
  // - 의미: 각 필드 값 추적
  // - 사용 이유: 미리보기 렌더링
  // - Fallback: 빈 문자열 또는 배열
  // - 수정: savedRichText null 체크 추가
  const title = watch('title') || '제목 없음';
  const summary = watch('summary') || '요약 없음';
  const content = watch('content') || savedRichText || '내용 없음'; // null 체크 포함
  const markdown = watch('markdown') || '';
  const category = watch('category') || '카테고리 없음';
  const tags: string[] = watch('tags') || [];
  const coverImage: ImageItem[] = watch('coverImage') || [];

  // 메모이제이션: 리치텍스트 처리
  // - 의미: 성능 최적화된 텍스트 변환
  // - 사용 이유: 불필요한 재계산 방지
  const processedContent = useMemo(() => {
    if (!content || content === '내용 없음') {
      return {
        plainText: '내용 없음',
        preview: '내용 없음',
        hasRichContent: false,
      };
    }

    const plainText = stripHtmlTags(content);
    const preview = createTextPreview(content);
    const hasRichContent = content !== plainText; // HTML 태그 포함 여부 확인

    if (process.env.NODE_ENV === 'development') {
      console.log('PreviewSection: Content processing', {
        originalLength: content.length,
        plainTextLength: plainText.length,
        hasRichContent,
        previewLength: preview.length,
      });
    }

    console.log('preview', preview);

    return { plainText, preview, hasRichContent };
  }, [content]);

  if (process.env.NODE_ENV === 'development') {
    console.log('PreviewSection: Final content analysis', {
      savedRichTextLength: savedRichText?.length || 0,
      finalContentLength: typeof content === 'string' ? content.length : 0,
      contentSource: savedRichText ? 'Zustand' : 'Form',
      contentPreview:
        typeof content === 'string'
          ? content.substring(0, 50) + '...'
          : 'No content',
    });
  }

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
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

          {/* 리치텍스트 콘텐츠 - 3단계 목표 모두 구현 */}
          <div>
            <h3 className="text-lg font-medium">
              리치텍스트 콘텐츠
              {processedContent.hasRichContent && (
                <span className="ml-2 text-sm text-blue-600">
                  (스타일링 적용됨)
                </span>
              )}
            </h3>

            {/* 목표 1: Zustand에서 데이터 가져오기 ✅ */}
            {/* 목표 2: HTML 태그 제거한 일반 텍스트 표시 ✅ */}
            <div className="space-y-4">
              {/* 일반 텍스트 미리보기 */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-600">
                  텍스트 미리보기
                </h4>
                <p className="p-3 text-gray-800 border rounded bg-gray-50">
                  {processedContent.preview}
                </p>
              </div>

              {/* 목표 3: 스타일링된 리치텍스트 표시 ✅ */}
              {processedContent.hasRichContent && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-600">
                    스타일링된 콘텐츠
                  </h4>
                  <div className="bg-white border rounded">
                    <ReactQuill
                      value={content}
                      readOnly={true}
                      theme="snow"
                      modules={{
                        toolbar: false, // 툴바 숨김
                      }}
                      className="[&_.ql-editor]:border-0 [&_.ql-container]:border-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 마크다운 (기존 유지) */}
          {markdown && (
            <div>
              <h3 className="text-lg font-medium">마크다운</h3>
              <div className="p-3 prose-sm prose border rounded max-w-none bg-gray-50">
                <pre className="text-sm whitespace-pre-wrap">{markdown}</pre>
              </div>
            </div>
          )}

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
                    className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full"
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
                  <div key={`image-${index}`} className="relative">
                    <img
                      src={img.preview || ''}
                      alt={`이미지 ${index + 1}`}
                      className="object-cover w-32 h-32 border rounded"
                      onError={(e) => {
                        // 이미지 로드 실패 시 대체 처리
                        // - 의미: 깨진 이미지 방지
                        // - 사용 이유: 사용자 경험 개선
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {img.name && (
                      <p className="w-32 mt-1 text-xs text-gray-500 truncate">
                        {img.name}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">이미지 없음</p>
              )}
            </div>
          </div>

          {/* 데이터 소스 정보 (개발 환경에서만) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 mt-8 border border-yellow-200 rounded bg-yellow-50">
              <h3 className="mb-2 text-sm font-medium text-yellow-800">
                개발자 정보
              </h3>
              <div className="space-y-1 text-xs text-yellow-700">
                <p>
                  • 리치텍스트 소스:{' '}
                  {savedRichText ? 'Zustand (영구 저장)' : 'Form (임시)'}
                </p>
                <p>
                  • 원본 길이:{' '}
                  {typeof content === 'string' ? content.length : 0}자
                </p>
                <p>• 일반 텍스트 길이: {processedContent.plainText.length}자</p>
                <p>
                  • 스타일링 포함:{' '}
                  {processedContent.hasRichContent ? '예' : '아니오'}
                </p>
                <p>
                  • Zustand 스토어 상태: {zustandStore ? '연결됨' : '연결 안됨'}
                </p>
                <p>
                  • getContent 메서드:{' '}
                  {zustandStore && zustandStore.getContent
                    ? '사용 가능'
                    : '사용 불가'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewSection;
//====여기까지 수정됨====
