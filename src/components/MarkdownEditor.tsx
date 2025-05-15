import React, { useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BlogPostFormData } from '../types/blog-post';
import debounce from 'lodash/debounce';

// 타입: 에러 메시지
// - 의미: 에러 메시지의 종류와 텍스트를 포함
// - 값: 'empty', 'multi-block', 'mapping-failed' 중 하나와 메시지 문자열
// - 왜: 사용자에게 구체적인 에러 피드백 제공
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 타입: 컴포넌트 속성
// - 의미: 부모로부터 받은 선택된 블록 텍스트, 오프셋, 길이, 선택 텍스트, 에러 설정 함수
// - 값: 문자열 또는 null, 숫자 또는 null, 에러 메시지 설정 콜백
// - 왜: 타입 안전성과 명확한 데이터 전달 보장
interface MarkdownEditorProps {
  selectedBlockText: string | null;
  selectedOffset: number | null;
  selectedLength: number | null;
  selectedText: string | null;
  setErrorMessage: (message: ErrorMessage | null) => void;
}

// Quill 모듈 설정
// - 의미: Quill 에디터의 툴바와 히스토리 설정
// - 사용 이유: 사용자 입력을 위한 UI 제공
// - 값: 툴바 옵션(헤더, 볼드, 이탤릭, 리스트, 이미지)과 히스토리 설정
// - 왜: 사용자 친화적 편집 환경 제공
const modules = {
  toolbar: [
    [{ header: [2, 3, false] }], // 헤더 옵션 제공
    ['bold', 'italic'], // 볼드, 이탤릭 스타일링
    [{ list: 'ordered' }, { list: 'bullet' }], // 순서/비순서 리스트
    ['image'], // 이미지 삽입
    ['clean'], // 포맷 제거
  ],
  history: {
    delay: 2000, // 변경 지연 시간
    maxStack: 500, // 최대 실행 취소 스택
    userOnly: true, // 사용자 변경만 기록
  },
};

// Quill 포맷
// - 의미: 지원하는 포맷 목록
// - 사용 이유: 에디터에서 허용할 스타일 정의
// - 값: 헤더, 볼드, 이탤릭, 리스트, 이미지, 배경색
// - 왜: 배경색 포맷 추가로 하이라이트 기능 활성화
const formats = [
  'header', // 헤더 스타일
  'bold', // 볼드 스타일
  'italic', // 이탤릭 스타일
  'list', // 리스트 스타일
  'bullet', // 비순서 리스트
  'image', // 이미지 삽입
  'background', // 배경색 하이라이트
];

// 함수: 마크다운 에디터
// - 의미: 마크다운 입력 및 커서 이동, 하이라이트 처리 컴포넌트
// - 사용 이유: 사용자 입력과 미리보기 선택 반영, 시각적 피드백 제공
// - 작동 매커니즘:
//   1. Quill 에디터 초기화 및 마크다운 상태 감시
//   2. 미리보기 선택 정보 수신
//   3. 텍스트 정규화 후 매핑
//   4. 하이라이트 적용 및 커서 이동
//   5. 에러 발생 시 사용자 피드백
function MarkdownEditor({
  selectedBlockText,
  selectedOffset,
  selectedLength,
  selectedText,
  setErrorMessage,
}: MarkdownEditorProps) {
  // 컴포넌트 렌더링 로그, 개발 환경에서만 출력
  // - 의미: 렌더링 추적
  // - 왜: 프로덕션 환경에서 불필요한 로그 제거
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownEditor: Rendering'); // 렌더링 시작 로그 출력
    // - 의미: 컴포넌트 렌더링 확인
    // - 왜: 디버깅 용이성
  }
  const formContext = useFormContext<BlogPostFormData>(); // 폼 컨텍스트 가져오기
  // - 의미: react-hook-form으로 폼 상태 접근
  // - 왜: 마크다운 데이터 동기화
  // 폼 컨텍스트 없으면 에러 UI 표시
  // - 의미: 폼 데이터 접근 실패 시 사용자 피드백
  // - 왜: 사용자 경험 개선
  if (!formContext || !formContext.watch || !formContext.setValue) {
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        {/* - 의미: 에러 메시지 제목 표시 */}
        {/* - 왜: 사용자에게 오류 상황 명확히 전달 */}
        <p className="text-sm">에디터를 로드할 수 없습니다.</p>
        {/* - 의미: 에러 상세 메시지 표시 */}
        {/* - 왜: 오류 원인 설명 */}
      </div>
    ); // 폼 컨텍스트 오류 시 에러 메시지 렌더링
    // - 의미: 사용자에게 오류 알림
    // - 왜: 오류 상황 처리
  }
  const { watch, setValue } = formContext; // 폼 상태 관리 함수와 데이터 추출
  // - 의미: watch로 상태 감시, setValue로 상태 업데이트
  // - 왜: 폼 데이터 동기화

  const quillRef = useRef<ReactQuill>(null); // Quill 에디터 참조
  // - 의미: ReactQuill 인스턴스 참조 저장
  // - 왜: Quill API 호출용
  const markdown = watch('markdown') || ''; // 마크다운 상태 감시, 기본값 빈 문자열
  // - 의미: 현재 마크다운 콘텐츠 가져오기
  // - 왜: 에디터 콘텐츠 동기화
  const isUserTyping = useRef(false); // 사용자 입력 플래그
  // - 의미: 사용자 입력 여부 추적
  // - 왜: 입력 중 하이라이트 간섭 방지
  const highlightedRangeRef = useRef<{ index: number; length: number } | null>(
    null
  ); // 현재 하이라이트된 범위 저장
  // - 의미: 하이라이트 범위 저장
  // - 왜: 이전 하이라이트 제거 시 사용

  // 디바운스된 setValue
  // - 의미: 입력 지연 업데이트
  // - 사용 이유: 렌더링 최소화, 성능 개선
  // - 왜: 빈번한 상태 업데이트로 인한 성능 저하 방지
  const debouncedSetValue = useCallback(
    debounce((value: string) => {
      setValue('markdown', value, { shouldValidate: true }); // 폼 상태 업데이트
      // - 의미: 마크다운 값 폼에 반영
      // - 왜: 성능 최적화
      // 디버깅 로그, 개발 환경에서만 출력
      // - 의미: 폼 필드 값 확인
      // - 왜: 입력값 추적
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Debounced form field value', value); // 디바운스된 값 로그
        // - 의미: 입력값 확인
        // - 왜: 디버깅 용이성
      }
    }, 300),
    [setValue] // setValue 의존성
    // - 의미: setValue 변경 시 함수 재생성
    // - 왜: 최신 setValue 사용 보장
  );

  // 효과: 커서 이동 및 하이라이트
  // - 의미: 미리보기 선택 반영, 선택된 텍스트 하이라이트
  // - 사용 이유: 사용자 인터랙션, 시각적 피드백 제공
  // - 작동 매커니즘:
  //   1. Quill 에디터 인스턴스 확인
  //   2. 선택 정보 유효성 검사
  //   3. 텍스트 정규화 및 매핑
  //   4. 하이라이트 적용 및 커서 이동
  //   5. 에러 처리
  useEffect(() => {
    if (!quillRef.current) return; // Quill 인스턴스 없으면 종료
    // - 의미: 초기화 전 조기 종료
    // - 왜: 에러 방지
    const quill = quillRef.current.getEditor(); // Quill 에디터 인스턴스 가져오기
    // - 의미: Quill API 접근
    // - 왜: 텍스트 조작 및 포맷팅

    if (
      selectedBlockText == null ||
      selectedOffset == null ||
      selectedLength == null ||
      selectedText == null
    ) {
      // 기존 하이라이트 제거
      // - 의미: 선택 해제 시 하이라이트 제거
      // - 왜: 사용자 경험 개선, 불필요한 하이라이트 방지
      if (highlightedRangeRef.current) {
        quill.formatText(
          highlightedRangeRef.current.index,
          highlightedRangeRef.current.length,
          'background',
          false
        ); // 이전 하이라이트 제거
        // - 의미: 이전 범위의 배경색 제거
        // - 왜: 새로운 하이라이트와 충돌 방지
        highlightedRangeRef.current = null; // 하이라이트 범위 초기화
        // - 의미: 참조 제거
        // - 왜: 메모리 관리 및 다음 하이라이트 준비
      }
      return; // 선택 정보 없으면 종료
      // - 의미: 불필요한 처리 방지
      // - 왜: 성능 최적화
    }

    const fullText = quill.getText(); // 에디터의 전체 텍스트 가져오기
    // - 의미: 매핑에 사용할 원본 텍스트
    // - 왜: 선택된 텍스트 위치 찾기
    const blockText = selectedBlockText.replace(/\s+/g, ' ').trim(); // 블록 텍스트 정규화
    // - 의미: 공백 정규화 및 양쪽 공백 제거
    // - 왜: 미리보기와 일관된 비교
    const searchTextNormalized = selectedText.replace(/\s+/g, ' ').trim(); // 선택 텍스트 정규화
    // - 의미: 공백 정규화 및 양쪽 공백 제거
    // - 왜: 에디터 텍스트와 정확한 매칭

    const indices = []; // 블록 텍스트의 시작 인덱스 배열
    // - 의미: 블록 텍스트의 모든 발생 위치 저장
    // - 왜: 다중 발생 처리
    let index = fullText.indexOf(blockText); // 첫 번째 블록 텍스트 위치 찾기
    // - 의미: 블록 텍스트의 시작 인덱스
    // - 왜: 위치 매핑 시작점
    while (index !== -1) {
      indices.push(index); // 인덱스 추가
      // - 의미: 발생 위치 저장
      // - 왜: 모든 가능성 탐색
      index = fullText.indexOf(blockText, index + 1); // 다음 위치 찾기
      // - 의미: 다음 발생 위치 탐색
      // - 왜: 중복 블록 처리
    }

    for (const start of indices) {
      const position = start + selectedOffset; // 선택 텍스트의 절대 위치 계산
      // - 의미: 블록 시작점에 오프셋 더하기
      // - 왜: 정확한 텍스트 위치 특정
      if (position < 0 || position + selectedLength > fullText.length) continue; // 범위 유효성 검사
      // - 의미: 유효하지 않은 위치 제외
      // - 왜: 에러 방지
      const editorText = fullText
        .substring(position, position + selectedLength)
        .replace(/\s+/g, ' ')
        .trim(); // 에디터 텍스트 추출 및 정규화
      // - 의미: 선택 범위 텍스트 정규화
      // - 왜: 선택 텍스트와 비교
      if (editorText === searchTextNormalized) {
        // 기존 하이라이트 제거
        // - 의미: 이전 하이라이트 제거
        // - 왜: 중복 방지
        if (highlightedRangeRef.current) {
          quill.formatText(
            highlightedRangeRef.current.index,
            highlightedRangeRef.current.length,
            'background',
            false
          ); // 이전 하이라이트 제거
          // - 의미: 이전 범위의 배경색 제거
          // - 왜: 새로운 하이라이트와 충돌 방지
        }
        // 새 하이라이트 적용
        // - 의미: 선택된 텍스트에 파란색 배경 적용
        // - 왜: 사용자에게 선택 영역 시각적 피드백 제공, 가독성 향상
        quill.formatText(position, selectedLength, 'background', '#ADD8E6'); // 변경: 노란색에서 파란색 계열로
        // - 의미: 선택된 텍스트에 연한 파란색 배경 적용
        // - 왜: 가독성 개선 및 시각적 피로 감소
        // 포맷 적용 확인
        // - 의미: 하이라이트 적용 여부 디버깅
        // - 왜: 포맷 문제 추적
        const appliedFormats = quill.getFormat(position, selectedLength); // 적용된 포맷 확인
        // - 의미: 포맷 적용 상태 확인
        // - 왜: 디버깅 및 포맷 적용 보장
        console.log('Applied formats:', appliedFormats); // 포맷 로그 출력
        // - 의미: 적용된 포맷 디버깅
        // - 왜: 문제 추적 용이성
        // 하이라이트 범위 업데이트
        // - 의미: 현재 하이라이트 범위 저장
        // - 왜: 다음 제거 시 사용
        highlightedRangeRef.current = {
          index: position,
          length: selectedLength,
        }; // 하이라이트 범위 저장
        // - 의미: 현재 하이라이트 범위 업데이트
        // - 왜: 다음 하이라이트 제거 시 참조
        // 커서를 시작 지점에 위치, 포커스
        // - 의미: 사용자가 즉시 편집 시작 가능
        // - 왜: 사용자 경험 개선
        setTimeout(() => {
          quill.setSelection(position, 0); // 커서 이동
          // - 의미: 선택 시작 지점으로 커서 설정
          // - 왜: 즉시 편집 가능
          quill.focus(); // 에디터 포커스
          // - 의미: 에디터 활성화
          // - 왜: 사용자 입력 준비
        }, 0); // 비동기 실행
        // - 의미: 렌더링 후 실행 보장
        // - 왜: 포커스 및 선택 안정성
        // 디버깅 로그, 개발 환경에서만 출력
        // - 의미: 하이라이트 및 커서 이동 확인
        // - 왜: 디버깅 용이성
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'MarkdownEditor: Highlighted from',
            position,
            'to',
            position + selectedLength,
            'and moved cursor to',
            position
          ); // 하이라이트 및 커서 이동 로그
          // - 의미: 하이라이트 및 커서 이동 확인
          // - 왜: 디버깅 용이성
        }
        return; // 매핑 성공 시 종료
        // - 의미: 추가 탐색 방지
        // - 왜: 성능 최적화
      }
    }

    // 매핑 실패 시 에러 처리
    // - 의미: 사용자 피드백
    // - 사용 이유: 오류 알림
    setErrorMessage({
      type: 'mapping-failed',
      text: '선택한 텍스트를 찾을 수 없습니다.',
    }); // 매핑 실패 에러 설정
    // - 의미: 사용자에게 매핑 실패 알림
    // - 왜: 사용자 경험 개선
    // 디버깅 로그, 개발 환경에서만 출력
    // - 의미: 매핑 실패 디버깅
    // - 왜: 문제 추적
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownEditor: Selected text not found in any block', {
        fullText,
        blockText,
        searchText: selectedText,
      }); // 매핑 실패 로그
      // - 의미: 매핑 실패 상세 정보 출력
      // - 왜: 디버깅 용이성
    }
  }, [
    selectedBlockText,
    selectedOffset,
    selectedLength,
    selectedText,
    setErrorMessage,
  ]); // 의존성 배열
  // - 의미: 선택 정보 및 에러 설정 함수 변경 시 효과 재실행
  // - 왜: 최신 데이터 반영

  // 핸들러: 텍스트 변경
  // - 의미: 사용자 입력 처리
  // - 사용 이유: 폼 상태 업데이트
  // - 작동 매커니즘:
  //   1. 사용자 입력 여부 확인
  //   2. 커서 위치 저장
  //   3. 폼 상태 업데이트
  //   4. 커서 위치 복원
  //   5. 입력 플래그 리셋
  const handleTextChange = (
    value: string,
    _delta: unknown,
    source: string,
    editor: unknown
  ) => {
    if (source !== 'user') {
      // 사용자 입력이 아니면 무시
      // - 의미: 비사용자 변경 무시
      // - 왜: 성능 최적화
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Non-user change, source:', source); // 비사용자 변경 로그
        // - 의미: 변경 소스 확인
        // - 왜: 디버깅 용이성
      }
      return;
    }

    isUserTyping.current = true; // 입력 플래그 설정
    // - 의미: 사용자 입력 시작 표시
    // - 왜: 하이라이트 간섭 방지
    // 디버깅 로그, 개발 환경에서만 출력
    // - 의미: 입력 시작 로그
    // - 왜: 입력 추적
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownEditor: Text changed, source:', source); // 텍스트 변경 로그
      // - 의미: 입력 이벤트 확인
      // - 왜: 디버깅 용이성
    }

    // 커서 위치 저장
    let selection: { index: number; length: number } | null = null;
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      try {
        selection = quill.getSelection(); // 현재 커서 위치 가져오기
        // - 의미: 입력 전 커서 상태 저장
        // - 왜: 입력 후 복원
        // 디버깅 로그, 개발 환경에서만 출력
        // - 의미: 커서 위치 로그
        // - 왜: 디버깅 용이성
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownEditor: Cursor position', selection); // 커서 위치 로그
          // - 의미: 커서 위치 확인
          // - 왜: 디버깅 용이성
        }
      } catch (e) {
        console.warn('MarkdownEditor: Failed to get selection', e); // 커서 가져오기 실패 로그
        // - 의미: 커서 가져오기 실패 기록
        // - 왜: 디버깅 및 안정성
      }
    }

    // 폼 상태 업데이트
    debouncedSetValue(value); // 디바운스된 상태 업데이트 호출
    // - 의미: 마크다운 값 폼에 반영
    // - 왜: 성능 최적화

    // 커서 위치 복원
    if (selection && quillRef.current) {
      const quill = quillRef.current.getEditor();
      try {
        quill.setSelection(selection.index, selection.length); // 커서 복원
        // - 의미: 입력 전 커서 위치로 복귀
        // - 왜: 사용자 경험 유지
      } catch (e) {
        console.warn('MarkdownEditor: Failed to restore selection', e); // 커서 복원 실패 로그
        // - 의미: 커서 복원 실패 기록
        // - 왜: 디버깅 및 안정성
      }
    }

    // 입력 플래그 리셋
    setTimeout(() => {
      isUserTyping.current = false; // 입력 플래그 초기화
      // - 의미: 입력 완료 표시
      // - 왜: 다음 하이라이트 준비
    }, 100); // 짧은 지연
    // - 의미: 입력 완료 후 플래그 리셋
    // - 왜: 안정적 상태 전환
  };

  return (
    <div
      className="flex flex-col flex-1 gap-2"
      role="region"
      aria-label="마크다운 에디터"
    >
      {/* 콘텐츠 라벨 */}
      <label className="text-sm font-medium">콘텐츠</label>
      {/* - 의미: 에디터 입력 필드의 라벨 */}
      {/* - 왜: 사용자에게 입력 필드 목적 전달 */}
      <div className="">
        <ReactQuill
          ref={quillRef}
          value={markdown}
          onChange={handleTextChange}
          modules={modules}
          formats={formats}
          theme="snow"
          preserveWhitespace
          className="bg-white border rounded-md"
          aria-label="마크다운 입력"
        />
        {/* - 의미: Quill 에디터 렌더링 */}
        {/* - 왜: 마크다운 입력 및 편집 인터페이스 제공 */}
      </div>
    </div>
  ); // 에디터 컨테이너 반환
  // - 의미: 마크다운 에디터 UI 렌더링
  // - 왜: 사용자 입력 및 선택 동기화 인터페이스 제공
}

export default MarkdownEditor;
//====여기까지 수정됨====
