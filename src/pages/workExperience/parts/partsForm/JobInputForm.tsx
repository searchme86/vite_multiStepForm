import TitleInputField from './TitleInputField';
import CompanyInputField from './CompanyInputField';
import StartDateInputField from './StartDateInputField';
import EndDateInputField from './EndDateInputField';
import DescriptionInputField from './DescriptionInputField';

// 코드의 의미: 직업 입력 폼 컴포넌트
// 왜 사용했는지: 직업 세부 정보 입력 UI 제공
function JobInputForm({
  field,
  index,
}: {
  field: { from: Date; to: Date };
  index: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <TitleInputField index={index} />
      <CompanyInputField index={index} />
      <StartDateInputField field={field} index={index} />
      <EndDateInputField field={field} index={index} />
      <DescriptionInputField index={index} />
    </div>
  );
}

export default JobInputForm;
