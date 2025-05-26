import { Link } from 'lucide-react';
import AnimatedWrapper from '@/components/motion/AnimatedWrapper';
import ImageMotion from '@/components/motion/ImageMotion';
import TextMotion from '@/components/motion/TextMotion';

// 코드의 의미: 포트폴리오 미리보기 서브 컴포넌트
// 왜 사용했는지: 포트폴리오 링크 정보를 시각적으로 표시
function PortfolioPreviewComponent({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <AnimatedWrapper>
      <div className="space-y-4">
        {image && (
          <ImageMotion className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={image}
              alt="포트폴리오 미리보기"
              className="object-cover"
            />
          </ImageMotion>
        )}

        <TextMotion className="space-y-2">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </TextMotion>
      </div>
    </AnimatedWrapper>
  );
}

export default PortfolioPreviewComponent;
