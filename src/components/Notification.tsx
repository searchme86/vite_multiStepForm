// Notification.tsx: 사용자 알림(토스트) 관리 컴포넌트
// - 의미: 토글 변경 등 이벤트 발생 시 사용자에게 알림 표시
// - 사용 이유: 사용자 피드백 제공, 작업 결과 확인
// - 비유: 작업이 완료되었을 때 깜빡이는 알림등
// - 작동 메커니즘:
//   1. useToast 훅으로 토스트 메시지 트리거
//   2. ToastProvider로 앱 전역에서 토스트 렌더링
//   3. 이벤트(토글 변경 등)에 따라 적절한 메시지 표시
// - 관련 키워드: shadcn/ui, Toast, useToast, react-hook-form
import React from 'react';
import { ToastProvider, ToastViewport } from './ui/toast';
import { useToast } from '../hooks/use-toast';

// 함수: 토스트 호출 훅
// - 의미: 재사용 가능한 토스트 트리거 함수 제공
// - 사용 이유: 컴포넌트 간 일관된 알림 처리
export { useToast };

// 컴포넌트: 알림 프로바이더
// - 의미: 앱 전역에서 토스트를 렌더링할 컨텍스트 제공
// - 사용 이유: 토스트 위치와 스타일 관리
function NotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      {/* 뷰포트: 토스트 표시 위치 */}
      {/* - 의미: 화면 오른쪽 상단에 토스트 고정 */}
      <ToastViewport />
    </ToastProvider>
  );
}

export default NotificationProvider;
