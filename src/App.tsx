import React from 'react';
import BlogPostForm from './components/BlogPostForm';
import ErrorBoundary from './components/ErrorBoundary';
import StepFormContainer from './components/multiStepForm/StepFormContainer';
import { Toaster } from './components/ui/sonner';

// 함수: 앱 컴포넌트
// - 의미: 애플리케이션의 루트 컴포넌트
function App() {
  return (
    // 컨테이너: 메인 레이아웃
    // - 의미: 블로그 포스트 폼 표시
    // <main className="min-h-screen bg-gray-100">
    //   {/* ErrorBoundary로 앱 감싸기 */}
    //   {/* - 의미: 전체 앱에서 에러 캐치 */}
    //   {/* - 사용 이유: 앱 크래시 방지 */}
    //   {/* - 비유: 놀이공원 전체에 안전망 설치 */}
    //   <ErrorBoundary>
    //     <BlogPostForm />
    //   </ErrorBoundary>
    // </main>
    <div className="container p-4 mx-auto">
      <StepFormContainer />
      <Toaster />
    </div>
  );
}

export default App;
