//====여기부터 수정됨====
// PublishSection.tsx: 블로그 포스트 초안 및 공개 설정 섹션
// - 의미: 초안 저장 및 공개 여부 설정 관리
// - 사용 이유: 포스트 게시 옵션 제공, Zustand로 상태 지속성 보장
// - 비유: 책 출판 전 초안 여부와 배포 범위 결정
// - 작동 메커니즘:
//   1. control로 폼 상태 관리
//   2. Switch로 isDraft와 isPublic 설정
//   3. setValue로 폼 업데이트, Zustand setter로 동기화
// - 관련 키워드: react-hook-form, zustand, shadcn/ui, tailwindcss, flexbox

import { Controller } from 'react-hook-form';
import { Switch } from '../ui/switch';
import type { blogPostSchemaType } from '../../pages/write/schema/blogPostSchema';
import { useStepFieldsStateStore } from '../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';

// PublishSection: 초안 및 공개 설정 UI
// - 의미: 초안 저장과 공개 여부 설정
// - 사용 이유: 게시 옵션 관리, Zustand 동기화
function PublishSection({ control, setValue }: any) {
  // Zustand setter
  // - 의미: isDraft와 isPublic 상태 동기화
  // - 사용 이유: Zustand로 지속성 보장
  const { setIsDraft, setIsPublic } = useStepFieldsStateStore();

  return (
    // 컨테이너: 설정 레이아웃
    // - 의미: 초안 및 공개 설정 UI 배치
    // - 사용 이유: 사용자 친화적 인터페이스
    <div className="space-y-6">
      <Controller
        name="isDraft"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-medium">초안으로 저장</h3>
              <p className="text-sm text-gray-500">
                포스트를 초안으로 저장하여 나중에 편집할 수 있습니다.
              </p>
            </div>
            <Switch
              checked={field.value}
              onCheckedChange={(value) => {
                field.onChange(value);
                setValue('isDraft', value, { shouldValidate: true });
                setIsDraft(value); // Zustand 동기화
              }}
              aria-label="초안으로 저장 설정" // 웹 접근성
            />
          </div>
        )}
      />
      <Controller
        name="isPublic"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-medium">공개 포스트</h3>
              <p className="text-sm text-gray-500">
                포스트를 모두에게 공개합니다.
              </p>
            </div>
            <Switch
              checked={field.value}
              onCheckedChange={(value) => {
                field.onChange(value);
                setValue('isPublic', value, { shouldValidate: true });
                setIsPublic(value); // Zustand 동기화
              }}
              aria-label="공개 포스트 설정" // 웹 접근성
            />
          </div>
        )}
      />
    </div>
  );
}

export default PublishSection;
//====여기까지 수정됨====
