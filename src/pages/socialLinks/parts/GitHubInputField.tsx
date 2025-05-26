import { useSocialLinks } from '../hooks/useSocialLinks';
import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Input } from '@/components/ui/input'; // shadcn/ui 제공
import { AnimatePresence } from 'framer-motion';
import GitHubPreviewComponent from './GitHubPreviewComponent';

// 코드의 의미: GitHub 프로필 입력 필드와 미리보기 서브 컴포넌트
// 왜 사용했는지: GitHub 링크 입력 UI와 미리보기 제공
function GitHubInputField() {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const { control, getValues } = useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: 소셜 링크 관련 상태와 로직 가져오기
  // 왜 사용했는지: 상태와 비즈니스 로직을 외부 훅에서 관리
  const { githubData, handleGitHubChange } = useSocialLinks(getValues);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="github" className="flex items-center">
        GitHub 프로필
      </label>
      <Input
        type="text"
        placeholder="GitHub 프로필 링크"
        id="github"
        {...control.register('github')}
        onChange={(e) => handleGitHubChange(e)}
      />
      <AnimatePresence>
        {githubData && <GitHubPreviewComponent {...githubData} />}
      </AnimatePresence>
    </div>
  );
}

export default GitHubInputField;
