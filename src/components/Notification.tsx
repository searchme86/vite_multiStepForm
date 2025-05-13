//====여기부터 수정됨====
// Notification.tsx: 사용자에게 알림 메시지 표시
// - 의미: 성공, 오류, 정보 메시지를 애니메이션과 함께 표시
// - 사용 이유: 사용자 경험 향상을 위한 피드백 제공
// - 비유: 친구에게 쪽지 보내기
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error' | 'info';
}

function Notification({
  message,
  isVisible,
  type = 'success',
}: NotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-md ${
            type === 'success'
              ? 'bg-green-100 text-green-600'
              : type === 'error'
              ? 'bg-red-100 text-red-600'
              : 'bg-blue-100 text-blue-600'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Notification;
//====여기까지 수정됨====
