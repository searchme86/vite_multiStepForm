import React from 'react';
import { Switch } from '../../../components/ui/switch';
import { Button } from '../../../components/ui/button';

function PostIntroduction() {
  // // 상태: 자동저장 활성화 여부
  // // - 의미: 자동저장 설정 관리
  // // - 사용 이유: 주기적 저장 제어
  // const [isAutoSaveEnabled, setIsAutoSaveEnabled] = React.useState(false);

  // // 효과: 자동저장
  // // - 의미: 활성화 시 10초마다 폼 데이터를 Zustand에 저장
  // // - 사용 이유: 데이터 손실 방지
  // // - 작동 매커니즘: watch로 폼 데이터 가져와 setFormData로 Zustand에 저장
  // React.useEffect(() => {
  //   if (isAutoSaveEnabled) {
  //     const interval = setInterval(() => {
  //       const formData = watch();
  //       setFormData(formData);
  //       toast.success('포스트가 자동 저장되었습니다.', { duration: 3000 });
  //     }, 10000);
  //     return () => clearInterval(interval);
  //   }
  // }, [isAutoSaveEnabled, watch, setFormData]);

  return (
    <div className="mb-6 space-y-4">
      {/* <div className="flex flex-col items-start justify-between p-4 border rounded-lg sm:flex-row sm:items-center">
        <div className="space-y-0.5 mb-2 sm:mb-0">
          <h4 className="text-sm font-medium">
            {isAutoSaveEnabled ? '자동 저장 설정' : '자동 저장 해제'}
          </h4>
          <p className="text-sm text-gray-500">
            자동 저장을 활성화하면 주기적으로 포스트가 저장됩니다.
          </p>
        </div>
        <Switch
          checked={isAutoSaveEnabled}
          onCheckedChange={handleAutoSaveToggle}
          aria-label="자동저장 설정"
        />
      </div>
      <div className="flex flex-col items-start justify-between p-4 border rounded-lg sm:flex-row sm:items-center">
        <div className="space-y-0.5 mb-2 sm:mb-0">
          <h4 className="text-sm font-medium">임시 저장</h4>
          <p className="text-sm text-gray-500">
            임시 저장을 실행하면 현재 작성 중인 포스트를 저장합니다.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleTempSave}
          disabled={isAutoSaveEnabled}
          aria-label="임시 저장"
        >
          임시 저장
        </Button>
      </div> */}
    </div>
  );
}

export default PostIntroduction;
