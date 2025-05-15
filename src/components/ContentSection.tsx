import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from './ui/button';
import { FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';
import TagAutoComplete from './TagAutoComplete';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';

// 타입: 에러 메시지
// - 의미: 에러 메시지의 종류와 텍스트를 포함
// - 값: 'empty', 'multi-block', 'mapping-failed' 중 하나와 메시지 문자열
// - 왜: 사용자에게 구체적인 에러 피드백 제공
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 함수: 현재 날짜 포맷팅
// - 의미: 오늘 날짜를 "YYYY-MM-DD" 형식으로 변환
// - 값: 문자열, 예: "2025-05-15"
// - 왜: 작성 날짜를 사용자에게 표시하여 피드백 제공
const formatCurrentDate = (): string => {
  const today = new Date(); // 오늘 날짜 객체 생성
  // - 의미: 현재 날짜와 시간을 가져옴
  // - 왜: 날짜 포맷팅의 시작점
  const year = today.getFullYear(); // 연도 추출
  // - 의미: 현재 연도를 숫자로 가져옴
  // - 왜: 날짜 문자열의 연도 부분 구성
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월 추출, 2자리로 패딩
  // - 의미: 월을 1~12로 변환하고, 두 자리로 패딩
  // - 왜: "MM" 형식으로 월 표시
  const day = String(today.getDate()).padStart(2, '0'); // 일 추출, 2자리로 패딩
  // - 의미: 일을 두 자리로 패딩
  // - 왜: "DD" 형식으로 일 표시
  return `${year}-${month}-${day}`; // 형식화된 날짜 반환
  // - 의미: "YYYY-MM-DD" 형식의 문자열 생성
  // - 왜: 표준화된 날짜 형식 제공
};

// 함수: 본문 작성 섹션
// - 의미: 태그 입력, 에디터, 미리보기 통합 UI 제공
// - 사용 이유: 블로그 포스트 작성 인터페이스
function ContentSection() {
  // 컴포넌트 렌더링 로그, 개발 환경에서만 출력
  // - 의미: 렌더링 추적
  // - 왜: 프로덕션 환경에서 불필요한 로그 제거
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentSection: Rendering'); // 렌더링 시작 로그 출력
    // - 의미: 컴포넌트 렌더링 확인
    // - 왜: 디버깅 용이성
  }
  const formContext = useFormContext<BlogPostFormData>(); // 폼 컨텍스트 가져오기
  // - 의미: react-hook-form으로 폼 상태 접근
  // - 왜: 마크다운 및 태그 데이터 동기화
  // 폼 컨텍스트 없으면 에러 UI 표시
  // - 의미: 폼 데이터 접근 실패 시 사용자 피드백
  // - 왜: 사용자 경험 개선
  if (!formContext) {
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        {/* - 의미: 에러 메시지 제목 표시 */}
        {/* - 왜: 사용자에게 오류 상황 명확히 전달 */}
        <p className="text-sm">콘텐츠 섹션을 로드할 수 없습니다.</p>
        {/* - 의미: 에러 상세 메시지 표시 */}
        {/* - 왜: 오류 원인 설명 */}
      </div>
    ); // 폼 컨텍스트 오류 시 에러 메시지 렌더링
    // - 의미: 사용자에게 오류 알림
    // - 왜: 오류 상황 처리
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext; // 폼 상태 관리 함수와 데이터 추출
  // - 의미: watch로 상태 감시, setValue로 상태 업데이트, errors로 유효성 검사 결과 가져옴
  // - 왜: 폼 데이터 동기화 및 유효성 검사

  const tags = watch('tags') || []; // 태그 상태 감시, 기본값 빈 배열
  // - 의미: 폼의 tags 필드 값을 감시
  // - 왜: 태그 목록 동적 렌더링
  // 선택된 블록 텍스트, 오프셋, 길이, 선택 텍스트 상태
  // - 의미: 드래그 선택 위치 매핑 위해
  // - 왜: 정확한 커서 위치를 위해 상태 관리
  const [selectedBlockText, setSelectedBlockText] = useState<string | null>(
    null
  ); // 선택된 블록 텍스트 상태
  // - 의미: 미리보기에서 선택된 블록 텍스트 저장
  // - 왜: 에디터와 동기화
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null); // 선택 오프셋 상태
  // - 의미: 선택 시작 위치 저장
  // - 왜: 텍스트 매핑 정확도
  const [selectedLength, setSelectedLength] = useState<number | null>(null); // 선택 길이 상태
  // - 의미: 선택된 텍스트 길이 저장
  // - 왜: 하이라이트 범위 지정
  const [selectedText, setSelectedText] = useState<string | null>(null); // 선택된 텍스트 상태
  // - 의미: 선택된 텍스트 내용 저장
  // - 왜: 에디터와 동기화
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null); // 에러 메시지 상태
  // - 의미: 선택 실패 시 에러 메시지 저장
  // - 왜: 사용자 피드백 제공

  // 태그 추가 핸들러
  // - 의미: 새로운 태그 추가
  // - 사용 이유: 사용자 입력 처리
  const handleAddTag = (tag: string) => {
    if (!tag.trim() || tags.includes(tag)) return; // 태그 비어있거나 중복 시 무시
    // - 의미: 빈 태그나 중복 태그 방지
    // - 왜: 데이터 무결성 유지
    setValue('tags', [...tags, tag], { shouldValidate: true }); // 태그 배열에 추가, 유효성 검사
    // - 의미: 새로운 태그를 폼 상태에 추가
    // - 왜: 폼 데이터 동기화 및 유효성 검사
  };

  // 태그 제거 핸들러
  // - 의미: 기존 태그 제거
  // - 사용 이유: 사용자 입력 처리
  const handleRemoveTag = (tag: string) => {
    setValue(
      'tags',
      tags.filter((t: string) => t !== tag),
      { shouldValidate: true }
    ); // 태그 배열에서 제거, 유효성 검사
    // - 의미: 지정된 태그를 폼 상태에서 제거
    // - 왜: 폼 데이터 동기화 및 유효성 검사
  };

  // 렌더링: 태그 입력, 에디터, 미리보기 UI
  // - 작동 매커니즘: flex 레이아웃으로 배치, 각 컴포넌트 렌더링
  // - 의미: 사용자 인터페이스 제공
  // - 왜: 사용자 경험 개선
  return (
    <div
      className="flex flex-col gap-6 px-4 space-y-6 sm:px-6 md:px-8"
      role="region"
      aria-label="콘텐츠 작성 섹션"
    >
      {/* - 의미: 전체 콘텐츠 섹션 컨테이너 */}
      {/* - 왜: 접근성 및 레이아웃 구조 제공 */}
      <PostGuidelines tab="tags" />
      {/* - 의미: 태그 작성 가이드라인 렌더링 */}
      {/* - 왜: 사용자에게 태그 입력 지침 제공 */}
      <div className="flex flex-col gap-6">
        {/* - 의미: 내부 콘텐츠 컨테이너 */}
        {/* - 왜: 세로 레이아웃 구성 */}
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {formatCurrentDate()}
        </span>
        {/* - 의미: 현재 날짜 표시 */}
        {/* - 왜: 사용자에게 작성 시점 정보 제공 */}
        <div className="flex flex-col gap-6">
          {/* - 의미: 태그 및 에디터/미리보기 컨테이너 */}
          {/* - 왜: 하위 컴포넌트 그룹화 */}
          <TagAutoComplete onAddTag={handleAddTag} />
          {/* - 의미: 태그 자동완성 컴포넌트 렌더링 */}
          {/* - 왜: 태그 입력 인터페이스 제공 */}
          <div className="flex flex-wrap w-full gap-2" role="list">
            {/* - 의미: 태그 목록 컨테이너 */}
            {/* - 왜: 태그 동적 렌더링 및 접근성 */}
            {tags.map((tag: string) => (
              <div
                key={tag}
                className="flex items-center px-3 py-1 text-sm bg-gray-200 rounded-full"
                role="listitem"
              >
                {/* - 의미: 개별 태그 렌더링 */}
                {/* - 왜: 태그 표시 및 삭제 인터페이스 */}
                <span>{tag}</span>
                {/* - 의미: 태그 이름 표시 */}
                {/* - 왜: 사용자에게 태그 내용 전달 */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`태그 ${tag} 삭제`}
                  className="ml-2"
                >
                  ×
                </Button>
                {/* - 의미: 태그 삭제 버튼 */}
                {/* - 왜: 태그 제거 기능 제공 */}
              </div>
            ))}
            {errors.tags && <FormMessage>{errors.tags.message}</FormMessage>}
            {/* - 의미: 태그 유효성 검사 에러 메시지 */}
            {/* - 왜: 사용자에게 입력 오류 피드백 */}
          </div>
          <div className="flex flex-col gap-6 min-h-[400px] md:flex-row">
            {/* - 의미: 에디터 및 미리보기 컨테이너 */}
            {/* - 왜: 반응형 레이아웃 제공 */}
            <MarkdownEditor
              selectedBlockText={selectedBlockText}
              selectedOffset={selectedOffset}
              selectedLength={selectedLength}
              selectedText={selectedText}
              setErrorMessage={setErrorMessage}
            />
            {/* - 의미: 마크다운 에디터 컴포넌트 렌더링 */}
            {/* - 왜: 마크다운 입력 및 선택 동기화 */}
            <MarkdownPreview
              setSelectedBlockText={setSelectedBlockText}
              setSelectedOffset={setSelectedOffset}
              setSelectedLength={setSelectedLength}
              setSelectedText={setSelectedText}
              setErrorMessage={setErrorMessage}
            />
            {/* - 의미: 미리보기 컴포넌트 렌더링 */}
            {/* - 왜: 마크다운 미리보기 및 텍스트 선택 */}
          </div>
          {errorMessage && (
            <p
              className="text-sm text-red-500"
              role="alert"
              aria-live="assertive"
            >
              {errorMessage.text}
            </p>
          )}
          {/* - 의미: 에러 메시지 렌더링 */}
          {/* - 왜: 선택 실패 시 사용자 피드백 */}
        </div>
      </div>
    </div>
  );
}

export default ContentSection;
