//====여기부터 수정됨====
// main.tsx: 애플리케이션의 엔트리 포인트
// - 의미: React 애플리케이션 렌더링
// - 사용 이유: 앱을 DOM에 마운트
// - 비유: 블로그 노트북을 책상에 펼치기
// - 작동 메커니즘:
//   1. ReactDOM으로 앱 렌더링
//   2. Toaster로 react-hot-toast 팝업 지원
// - 관련 키워드: react, react-dom, react-hot-toast
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';

// 앱 렌더링
// - 의미: 애플리케이션을 DOM에 마운트
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {/* Toaster: react-hot-toast 팝업 렌더링 */}
    {/* - 의미: 토스트 팝업 표시 */}
    {/* - 사용 이유: 전역 알림 지원 */}
    <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
  </React.StrictMode>
);
//====여기까지 수정됨====
