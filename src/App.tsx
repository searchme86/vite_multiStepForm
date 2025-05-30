import BlogPostForm from './components/BlogPostForm';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import Write from './pages/write/Write';

// 함수: 앱 컴포넌트
// - 의미: 애플리케이션의 루트 컴포넌트
function App() {
  return (
    // <div className="container p-4 mx-auto">
    //   <ErrorBoundary>
    //     <BlogPostForm />
    //     <Toaster />
    //   </ErrorBoundary>
    // </div>
    <div className="container p-4 mx-auto">
      <ErrorBoundary>
        {/* <BlogPostForm /> */}
        <Write />
        <Toaster />
      </ErrorBoundary>
    </div>
  );
}

export default App;
