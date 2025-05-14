// ErrorBoundary.tsx: 컴포넌트 에러 처리
// - 의미: 하위 컴포넌트에서 발생한 렌더링 에러를 캐치하여 대체 UI 렌더링
// - 사용 이유: 앱 크래시 방지, 사용자 친화적 에러 메시지 제공, 디버깅 지원
// - 비유: 놀이공원의 안전망, 롤러코스터(컴포넌트) 고장 시 안내판(대체 UI) 표시
// - 작동 메커니즘:
//   1. 하위 컴포넌트에서 에러 발생 시 getDerivedStateFromError 호출
//   2. 상태(hasError)를 true로 업데이트
//   3. componentDidCatch로 에러 로깅
//   4. hasError=true면 대체 UI, false면 원본 컴포넌트 렌더링
// - 관련 키워드: React Error Boundary, componentDidCatch, class component
// - 추가 학습: react-error-boundary, Sentry React integration

import React from 'react';

// 인터페이스: 컴포넌트 props
// - 타입: { children: React.ReactNode }
// - 의미: 에러를 감지할 하위 컴포넌트 전달
// - 사용 이유: React의 props로 하위 트리 정의
// - 비유: 안전망이 보호할 놀이기구 목록
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// 인터페이스: 컴포넌트 상태
// - 타입: { hasError: boolean }
// - 의미: 에러 발생 여부를 추적
// - 사용 이유: 에러 발생 시 UI 전환 결정
// - Fallback: 초기값 false로 정상 렌더링 보장
interface ErrorBoundaryState {
  hasError: boolean;
}

// 클래스: 에러 바운더리
// - 의미: 렌더링 에러를 캐치하고 처리하는 컴포넌트
// - 사용 이유: 앱 안정성 강화, 에러 격리
// - 비유: 놀이공원 관리자가 사고를 감지하고 안내판 설치
// - 왜 클래스 컴포넌트인가: React는 getDerivedStateFromError, componentDidCatch를 클래스에서만 지원
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  // 초기 상태
  // - 의미: 에러 발생 전 기본 상태 설정
  // - 사용 이유: 정상 렌더링을 위해 초기값 제공
  // - Fallback: hasError=false로 초기화
  // - 작동: 컴포넌트 마운트 시 실행
  state: ErrorBoundaryState = { hasError: false };

  // 정적 메서드: 에러 감지
  // - 의미: 하위 컴포넌트에서 에러 발생 시 상태 업데이트
  // - 사용 이유: 에러 발생을 상태로 기록, 대체 UI 렌더링 트리거
  // - Fallback: 에러 없으면 상태 변경 없음
  // - 작동: React가 렌더링 중 에러 감지 시 자동 호출
  static getDerivedStateFromError(): ErrorBoundaryState {
    // 상태 반환
    // - 의미: hasError를 true로 설정
    // - 사용 이유: 렌더링 시 대체 UI로 전환
    // - 비유: 사고 감지 후 경고등 켜기
    return { hasError: true };
  }

  // 메서드: 에러 로깅
  // - 의미: 캐치된 에러와 스택 트레이스 기록
  // - 사용 이유: 개발자 디버깅 지원, 에러 추적
  // - 비유: 사고 보고서 작성, 원인 분석 자료 제공
  // - 작동: 에러 발생 후 React가 호출, 콘솔에 출력
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 콘솔 로깅
    // - 의미: 에러 메시지와 컴포넌트 스택 출력
    // - 사용 이유: 개발자 도구에서 에러 원인 파악
    // - 예: "TypeError: Cannot destructure property 'getFieldState'..."
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  // 렌더링
  // - 의미: 에러 여부에 따라 UI 전환
  // - 사용 이유: 사용자에게 에러 알림 또는 정상 UI 제공
  // - 비유: 사고 시 안내판 표시, 정상 시 놀이기구 운영
  // - 작동: state.hasError 기반으로 조건부 렌더링
  render() {
    // 에러 발생 시
    // - 의미: 대체 UI 렌더링
    // - 사용 이유: 사용자에게 문제 알림, 앱 크래시 방지
    if (this.state.hasError) {
      return (
        // 대체 UI 컨테이너
        // - 의미: 에러 메시지를 중앙에 표시
        // - 사용 이유: 사용자 친화적 피드백, flex로 반응형 레이아웃
        // - 스타일: flex-col로 세로 정렬, 중앙 배치
        <div className="flex flex-col items-center justify-center p-4 text-red-500">
          {/* 제목 */}
          {/* - 의미: 에러 발생 알림 */}
          {/* - 사용 이유: 사용자에게 문제 명확히 전달 */}
          <h2 className="text-lg font-medium">오류가 발생했습니다.</h2>
          {/* 설명 */}
          {/* - 의미: 사용자 행동 유도 */}
          {/* - 사용 이유: 복구 옵션 제안 */}
          <p className="text-sm">다시 시도하거나 관리자에게 문의해주세요.</p>
        </div>
      );
    }
    // 정상 렌더링
    // - 의미: 하위 컴포넌트 그대로 렌더링
    // - 사용 이유: 에러 없을 시 기존 UI 유지
    // - 비유: 놀이기구 정상 운영
    return this.props.children;
  }
}

export default ErrorBoundary;
