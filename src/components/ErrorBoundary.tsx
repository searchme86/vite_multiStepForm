// ErrorBoundary.tsx: 컴포넌트 에러 처리
// - 의미: 하위 컴포넌트 에러를 캐치하여 대체 UI 표시
// - 사용 이유: 앱 크래시 방지, 사용자 경험 개선
// - 비유: 안전망이 컴포넌트 사고를 잡아줌
// - 작동 메커니즘:
//   1. componentDidCatch로 에러 캐치
//   2. 에러 발생 시 대체 UI 렌더링
// - 관련 키워드: React Error Boundary, componentDidCatch
import React from 'react';

// 인터페이스: 컴포넌트 props
// - 타입: { children: React.ReactNode }
// - 의미: 하위 컴포넌트 전달
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// 인터페이스: 컴포넌트 상태
// - 타입: { hasError: boolean }
// - 의미: 에러 발생 여부 추적
interface ErrorBoundaryState {
  hasError: boolean;
}

// 클래스: 에러 바운더리
// - 의미: 에러 처리 컴포넌트
// - 사용 이유: 안정적 렌더링 보장
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  // 초기 상태
  // - 의미: 에러 발생 전 기본 상태
  // - 사용 이유: 초기 렌더링
  state: ErrorBoundaryState = { hasError: false };

  // 정적 메서드: 에러 캐치
  // - 의미: 하위 컴포넌트 에러 감지
  // - 사용 이유: 에러 상태 업데이트
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  // 메서드: 에러 로깅
  // - 의미: 에러 정보 기록
  // - 사용 이유: 디버깅 지원
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  // 렌더링
  // - 의미: 에러 여부에 따라 UI 전환
  // - 사용 이유: 사용자 피드백 제공
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          오류가 발생했습니다. 다시 시도해주세요.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
//====여기까지 수정됨====
