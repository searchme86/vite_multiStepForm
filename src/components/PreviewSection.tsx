import { useMemo, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useStepFieldsStateStore } from '../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';
import DOMPurify from 'dompurify';

type ImageItem = {
  preview?: string;
  name?: string;
  size?: number;
};

const isValidImageSource = (src: string): boolean => {
  try {
    const allowedPatterns = [/^https?:\/\//, /^data:image\//, /^\//, /^\.\//];
    return allowedPatterns.some((pattern) => pattern.test(src));
  } catch (error) {
    return false;
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img) {
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIExvYWQgRXJyb3I8L3RleHQ+PC9zdmc+';
    img.alt = '이미지 로드 실패';
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.border = '2px dashed #ccc';
    img.style.borderRadius = '4px';
  }
};

function PreviewSection() {
  const { watch } = useFormContext();
  const zustandStore = useStepFieldsStateStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const savedRichText = useMemo(() => {
    try {
      if (
        zustandStore &&
        typeof zustandStore.getRichTextContent === 'function'
      ) {
        return zustandStore.getRichTextContent();
      }
      if (
        zustandStore &&
        zustandStore.state &&
        zustandStore.state.richTextContent
      ) {
        return zustandStore.state.richTextContent;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [zustandStore]);

  const title = watch('title') || '제목 없음';
  const summary = watch('summary') || '요약 없음';
  const category = watch('category') || '카테고리 없음';
  const tags: string[] = watch('tags') || [];
  const coverImage: ImageItem[] = watch('coverImage') || [];

  const processedHTML = useMemo(() => {
    if (!savedRichText || savedRichText.trim() === '') {
      return '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(savedRichText, 'text/html');

    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
      const imgSrc = img.getAttribute('src');
      if (imgSrc && !isValidImageSource(imgSrc)) {
        img.src =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmNjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJsb2NrZWQgVW5zYWZlIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        img.alt = '차단된 안전하지 않은 이미지';
      }
    });

    const sanitized = DOMPurify.sanitize(doc.body.innerHTML, {
      ALLOWED_TAGS: [
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'li',
        'ul',
        'ol',
        'blockquote',
        'strong',
        'em',
        'u',
        's',
        'sub',
        'sup',
        'br',
        'hr',
        'div',
        'span',
        'pre',
        'code',
        'img',
        'a',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ],
      ALLOWED_ATTR: [
        'style',
        'class',
        'id',
        'src',
        'alt',
        'width',
        'height',
        'href',
        'target',
        'rel',
        'colspan',
        'rowspan',
        'data-*',
      ],
      ALLOW_DATA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });

    return sanitized;
  }, [savedRichText]);

  useEffect(() => {
    if (!contentRef.current || !processedHTML) return;

    const images = contentRef.current.querySelectorAll('img');
    images.forEach((img) => {
      img.addEventListener('error', handleImageError);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '4px';
      img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('error', handleImageError);
      });
    };
  }, [processedHTML]);

  return (
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      <div className="flex flex-col gap-6">
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {new Date().toLocaleDateString('ko-KR')}
        </span>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-medium">제목</h3>
            <p className="text-gray-800">{title}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium">요약</h3>
            <p className="text-gray-800">{summary}</p>
          </div>

          {processedHTML ? (
            <div>
              <h3 className="text-lg font-medium">콘텐츠</h3>
              <div
                ref={contentRef}
                className="border rounded-md p-4 bg-white min-h-[300px] overflow-auto prose prose-sm max-w-none
                           [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:shadow-sm
                           [&_img]:border [&_img]:border-gray-200 [&_img]:mx-auto [&_img]:block [&_img]:my-2
                           [&_p]:mb-3 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-2
                           [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1
                           [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic
                           [&_strong]:font-bold [&_em]:italic [&_u]:underline"
                style={{ lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: processedHTML }}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium">콘텐츠</h3>
              <div className="p-6 border border-gray-300 border-dashed rounded-md bg-gray-50">
                <p className="text-center text-gray-500">
                  아직 작성된 콘텐츠가 없습니다.
                  <br />
                  마크다운 편집기에서 콘텐츠를 작성해보세요.
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium">카테고리</h3>
            <p className="text-gray-800">{category}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium">태그</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag: string, index: number) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">태그 없음</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">커버 이미지</h3>
            <div className="flex flex-wrap gap-4">
              {coverImage.length > 0 ? (
                coverImage.map((img: ImageItem, index: number) => (
                  <div key={`cover-image-${index}`} className="relative">
                    <img
                      src={img.preview || ''}
                      alt={`커버 이미지 ${index + 1}`}
                      className="object-cover w-32 h-32 border rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {img.name && (
                      <p className="w-32 mt-1 text-xs text-gray-500 truncate">
                        {img.name}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">커버 이미지 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewSection;
