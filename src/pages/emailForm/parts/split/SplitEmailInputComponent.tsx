import EmailSplitInputFields from './EmailSplitInputFields';
import SplitEmailErrorMessages from './SplitEmailErrorMessages';

function SplitEmailInputComponent({
  handleDomainChange,
  selectedDomain,
}: {
  handleDomainChange: (value: string) => void;
  selectedDomain: string;
}) {
  return (
    <div className="space-y-2">
      <EmailSplitInputFields
        handleDomainChange={handleDomainChange}
        selectedDomain={selectedDomain}
      />
      <SplitEmailErrorMessages />
    </div>
  );
}

export default SplitEmailInputComponent;
