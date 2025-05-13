import React from 'react';
import BlogPostForm from './components/BlogPostForm';

// 함수: 앱 컴포넌트
// - 의미: 애플리케이션의 루트 컴포넌트
function App() {
  return (
    // 컨테이너: 메인 레이아웃
    // - 의미: 블로그 포스트 폼 표시
    <main className="min-h-screen bg-gray-100">
      <BlogPostForm />
    </main>
  );
}

export default App;
