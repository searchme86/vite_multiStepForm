// import React from "react";
// import { BlogPostForm } from "./components/blog-post-form";

// export default function App() {
//   return (
//     <main className="min-h-screen bg-background">
//       <BlogPostForm />
//     </main>
//   );
// }

import React from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import BlogPostForm from './components/BlogPostForm';

function App() {
  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gray-50">
        <BlogPostForm />
      </main>
    </TooltipProvider>
  );
}

export default App;
