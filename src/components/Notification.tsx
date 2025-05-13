// //====여기부터 수정됨====
// // Notification.tsx: 사용자에게 알림 메시지 표시
// // - 의미: 성공, 오류, 정보 메시지를 애니메이션과 함께 표시
// // - 사용 이유: 사용자 경험 향상을 위한 피드백 제공
// // - 비유: 친구에게 쪽지 보내기
// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface NotificationProps {
//   message: string;
//   isVisible: boolean;
//   type?: 'success' | 'error' | 'info';
// }

// function Notification({
//   message,
//   isVisible,
//   type = 'success',
// }: NotificationProps) {
//   return (
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           transition={{ duration: 0.3 }}
//           className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-md ${
//             type === 'success'
//               ? 'bg-green-100 text-green-600'
//               : type === 'error'
//               ? 'bg-red-100 text-red-600'
//               : 'bg-blue-100 text-blue-600'
//           }`}
//           role="alert"
//           aria-live="assertive"
//         >
//           <p className="text-sm font-medium">{message}</p>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// export default Notification;
// //====여기까지 수정됨====

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
