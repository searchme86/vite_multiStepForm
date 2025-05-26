import PersonalInputComponent from './parts/PersonalInputComponent';
import EmailForm from '../emailForm/EmailForm';

function PersonalForm() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-4xl font-bold tracking-tight leading-relaxed">
          개인 정보
        </h2>
        <p className="text-sm text-foreground/70">개인 정보를 입력해주세요</p>
      </div>
      <div className="flex flex-col gap-4">
        <PersonalInputComponent />
        <EmailForm />
      </div>
    </div>
  );
}

export default PersonalForm;
