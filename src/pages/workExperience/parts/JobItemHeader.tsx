import DeleteButtonMotion from './partsFunc/DeleteButtonMotion';
import { Trash } from 'lucide-react';

// 코드의 의미: 직업 항목 헤더와 삭제 버튼 컴포넌트
// 왜 사용했는지: 직업 항목 번호와 삭제 기능 제공
function JobItemHeader({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-neutral-100">
        직업 #{index + 1}
      </h3>
      <DeleteButtonMotion onClick={onRemove}>
        <span className="sr-only">이 직업 경험 삭제</span>
        <Trash className="h-4 w-4" />
      </DeleteButtonMotion>
    </div>
  );
}

export default JobItemHeader;
