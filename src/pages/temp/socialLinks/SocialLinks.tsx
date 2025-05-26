import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import GitHubInputField from './parts/GitHubInputField';
import PortfolioInputField from './parts/PortfolioInputField';

// 코드의 의미: 소셜 링크 입력 컴포넌트
// 왜 사용했는지: 소셜 링크 입력 섹션의 뷰와 로직을 통합 관리
function SocialLinks() {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const {
    formState: { errors },
  } = useFormContextWrapper<FormSchemaType>();

  return (
    <div className="space-y-2">
      {/* 코드의 의미: 섹션 제목 표시 */}
      {/* 왜 사용했는지: 사용자에게 소셜 링크 입력 섹션임을 알림 */}
      <h2 className="text-lg font-semibold">소셜 링크</h2>

      {/* 코드의 의미: GitHub 프로필 입력 필드와 미리보기 렌더링 */}
      {/* 왜 사용했는지: GitHub 링크 입력 UI와 미리보기 제공 */}
      <GitHubInputField />

      {/* 코드의 의미: 포트폴리오 링크 입력 필드와 미리보기 렌더링 */}
      {/* 왜 사용했는지: 포트폴리오 링크 입력 UI와 미리보기 제공 */}
      <PortfolioInputField />

      {/* 코드의 의미: GitHub URL 에러 메시지 표시 */}
      {/* 왜 사용했는지: 유효성 검사 실패 시 사용자 피드백 제공 */}
      {errors.github && (
        <p className="text-red-500 text-sm">
          {errors.github.message as string}
        </p>
      )}

      {/* 코드의 의미: 포트폴리오 URL 에러 메시지 표시 */}
      {/* 왜 사용했는지: 유효성 검사 실패 시 사용자 피드백 제공 */}
      {errors.portfolio && (
        <p className="text-red-500 text-sm">
          {errors.portfolio.message as string}
        </p>
      )}
    </div>
  );
}

export default SocialLinks;
